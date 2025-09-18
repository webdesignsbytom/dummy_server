import dbClient from '../../utils/dbClient.js';

// list available calendar days between optional from/to (inclusive)
// Normalize yyyy-mm-dd or ISO -> UTC midnight
function normalizeDateOnly(d) {
  const s = typeof d === 'string' ? d.slice(0, 10) : d.toISOString().slice(0, 10);
  return new Date(`${s}T00:00:00.000Z`);
}

function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Compute available calendar dates from weekly rules + dated windows − exceptions.
 * No per-day rows required.
 */
export async function findAvailableDays(resourceId, startInput, endInput) {
  if (!resourceId) throw new Error('resourceId is required');

  // Defaults: 30-day window starting today (UTC date boundary)
  const start = startInput ? normalizeDateOnly(startInput) : normalizeDateOnly(new Date());
  const end   = endInput   ? normalizeDateOnly(endInput)   : addDays(start, 30);

  if (end < start) throw new Error('end must be >= start');

  // Pull ingredients
  const [rules, dated, exceptions] = await Promise.all([
    dbClient.availabilityRule.findMany({
      where: { resourceId },
      select: { weekday: true, validFrom: true, validTo: true },
    }),
    dbClient.availabilityDateWindow.findMany({
      where: { resourceId, date: { gte: start, lte: end } },
      select: { date: true },
    }),
    dbClient.availabilityException.findMany({
      where: {
        resourceId,
        OR: [
          { startAt: { gte: start, lt: addDays(end, 1) } },
          { endAt:   {  gt: start,  lte: addDays(end, 1) } },
          { startAt: { lt: start }, endAt: { gt: start } },
        ],
      },
      select: { startAt: true, endAt: true },
    }),
  ]);

  // Lookups
  const customDates = new Set(dated.map((w) => isoDate(w.date)));

  // Full-day blackouts (exception spans midnight→midnight in UTC)
  const fullDayBlackout = new Set();
  for (const ex of exceptions) {
    const endIso = isoDate(addDays(ex.endAt, -1)); // endAt is exclusive midnight
    let d = normalizeDateOnly(ex.startAt);
    const last = normalizeDateOnly(endIso);
    while (d <= last) {
      if (
        ex.startAt.getUTCHours() === 0 && ex.startAt.getUTCMinutes() === 0 &&
        ex.endAt.getUTCHours()   === 0 && ex.endAt.getUTCMinutes()   === 0
      ) {
        fullDayBlackout.add(isoDate(d));
      }
      d = addDays(d, 1);
    }
  }

  // Index rules by weekday with optional validity windows
  const rulesByWeekday = new Map();
  for (const r of rules) {
    const arr = rulesByWeekday.get(r.weekday) ?? [];
    arr.push({
      validFrom: r.validFrom ? normalizeDateOnly(r.validFrom) : undefined,
      validTo:   r.validTo   ? normalizeDateOnly(r.validTo)   : undefined,
    });
    rulesByWeekday.set(r.weekday, arr);
  }

  // Generate results
  const results = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const dIso = isoDate(d);
    if (fullDayBlackout.has(dIso)) continue;

    // 1) Dated window wins
    if (customDates.has(dIso)) {
      results.push({ date: `${dIso}T00:00:00.000Z` });
      continue;
    }

    // 2) Otherwise weekly rules
    const weekday = d.getUTCDay(); // 0..6
    const dayRules = rulesByWeekday.get(weekday);
    if (!dayRules || dayRules.length === 0) continue;

    const active = dayRules.some((r) => {
      const afterFrom = !r.validFrom || d >= r.validFrom;
      const beforeTo  = !r.validTo   || d <= r.validTo;
      return afterFrom && beforeTo;
    });

    if (active) results.push({ date: `${dIso}T00:00:00.000Z` });
  }

  return results;
}
/* ---------- tiny time utils (UTC date math) ---------- */
const pad = (n) => String(n).padStart(2, '0');
const dayStartUtc = (yyyyMmDd) => new Date(`${yyyyMmDd}T00:00:00.000Z`);
const addMin = (d, m) => new Date(d.getTime() + m * 60000);

/* interval helpers */
function merge(intervals){
  if(!intervals.length) return [];
  const a = intervals.slice().sort((x,y)=>x.start - y.start);
  const out=[a[0]];
  for(let i=1;i<a.length;i++){
    const p=out[out.length-1], c=a[i];
    if(c.start <= p.end) p.end = new Date(Math.max(p.end, c.end));
    else out.push({...c});
  }
  return out;
}
function subtract(base, blocks){
  if(!blocks.length) return base.slice();
  const blks = merge(blocks);
  const out = [];
  for(const b of base){
    let segs=[{...b}];
    for(const k of blks){
      const next=[];
      for(const s of segs){
        if(k.end <= s.start || k.start >= s.end){ next.push(s); continue; }
        if(k.start > s.start) next.push({ start:s.start, end:k.start });
        if(k.end   < s.end)   next.push({ start:k.end,   end:s.end });
      }
      segs = next; if(!segs.length) break;
    }
    out.push(...segs);
  }
  return out;
}

/* =======================================================
   PUBLIC: findAvailableSlots(resourceId, yyyy-mm-dd [, serviceId])
   Computes slots from:
   + AvailabilityRule / AvailabilityDateWindow
   − AvailabilityException / Booking
   No per-day rows required.
   Returns: ["09:00","09:15",...]
   ======================================================= */
export async function findAvailableSlots(resourceId, date, serviceId) {
  const dayStart = dayStartUtc(date);
  const nextDay  = dayStartUtc(date); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const weekday  = dayStart.getUTCDay(); // 0..6

  const resource = await dbClient.resource.findUnique({
    where:{ id: resourceId }, select:{ id:true, timeZone:true }
  });
  if(!resource) return [];

  const service = serviceId
    ? await dbClient.service.findUnique({ where:{ id: serviceId } })
    : await dbClient.service.findFirst({ where:{ active:true } });

  // default fallbacks
  const dur       = (service && service.defaultDuration) || 60;     // minutes
  const bufBefore = (service && service.bufferBefore)    || 0;
  const bufAfter  = (service && service.bufferAfter)     || 0;
  const minLead   = (service && service.minLeadMin)      || 0;
  const cutoff    = service && service.sameDayCutoff ? {
    hh: service.sameDayCutoff.getUTCHours(),
    mm: service.sameDayCutoff.getUTCMinutes()
  } : null;

  // Fetch ingredients
  const [rules, windows, exceptions, bookings] = await Promise.all([
    dbClient.availabilityRule.findMany({
      where:{ resourceId, weekday },
      select:{ startTime:true, endTime:true, validFrom:true, validTo:true },
    }),
    dbClient.availabilityDateWindow.findMany({
      where:{ resourceId, date: dayStart },
      select:{ startTime:true, endTime:true },
    }),
    dbClient.availabilityException.findMany({
      where:{
        resourceId,
        OR:[
          { startAt:{ gte:dayStart, lt:nextDay } },
          { endAt:{   gt:dayStart, lte:nextDay } },
          { startAt:{ lt:dayStart }, endAt:{ gt:dayStart } },
        ],
      },
      select:{ startAt:true, endAt:true },
    }),
    dbClient.booking.findMany({
      where:{
        resourceId,
        status:{ in:['PENDING','CONFIRMED'] },
        OR:[
          { startAt:{ gte:dayStart, lt:nextDay } },
          { endAt:{   gt:dayStart, lte:nextDay } },
          { startAt:{ lt:dayStart }, endAt:{ gt:dayStart } },
        ],
      },
      select:{ startAt:true, endAt:true },
    }),
  ]);

  // Build "open" intervals — dated windows override weekly rules
  let open = [];
  if (windows.length){
    open = windows.map(w => {
      const s = new Date(`${isoDate(dayStart)}T${pad(w.startTime.getUTCHours())}:${pad(w.startTime.getUTCMinutes())}:00.000Z`);
      const e = new Date(`${isoDate(dayStart)}T${pad(w.endTime.getUTCHours())}:${pad(w.endTime.getUTCMinutes())}:00.000Z`);
      return { start: s < dayStart ? dayStart : s, end: e > nextDay ? nextDay : e };
    }).filter(x=>x.end>x.start);
  } else {
    for (const r of rules){
      const vf = r.validFrom ? dayStartUtc(isoDate(r.validFrom)) : null;
      const vt = r.validTo   ? dayStartUtc(isoDate(r.validTo))   : null;
      const ok = (!vf || dayStart>=vf) && (!vt || dayStart<=vt);
      if(!ok) continue;
      const s = new Date(`${isoDate(dayStart)}T${pad(r.startTime.getUTCHours())}:${pad(r.startTime.getUTCMinutes())}:00.000Z`);
      const e = new Date(`${isoDate(dayStart)}T${pad(r.endTime.getUTCHours())}:${pad(r.endTime.getUTCMinutes())}:00.000Z`);
      if (e > s) open.push({ start:s, end:e });
    }
    open = merge(open).map(x=>({
      start: x.start < dayStart ? dayStart : x.start,
      end:   x.end   > nextDay  ? nextDay  : x.end,
    })).filter(x=>x.end>x.start);
  }

  // Blocks = exceptions + bookings + same-day constraints
  const blocks = [
    ...exceptions.map(ex => ({
      start: ex.startAt < dayStart ? dayStart : ex.startAt,
      end:   ex.endAt   > nextDay  ? nextDay  : ex.endAt,
    })),
    ...bookings.map(b => ({
      start: b.startAt < dayStart ? dayStart : b.startAt,
      end:   b.endAt   > nextDay  ? nextDay  : b.endAt,
    })),
  ];

  // Same-day cutoff & min-lead (simple UTC version)
  const now = new Date();
  if (isoDate(now) === isoDate(dayStart)) {
    if (cutoff) {
      const cut = new Date(`${isoDate(dayStart)}T${pad(cutoff.hh)}:${pad(cutoff.mm)}:00.000Z`);
      blocks.push({ start: dayStart, end: cut });
    }
    if (minLead > 0) {
      const lead = addMin(now, minLead);
      if (lead < nextDay) blocks.push({ start: dayStart, end: lead });
    }
  }

  // Available = open − blocks
  open = subtract(open, blocks).filter(x=>x.end>x.start);
  if (!open.length) return [];

  // Apply buffers, then generate a 15-min grid of start times within each interval
  const stepMin = 15;
  const buffered = open.map(x => ({
    start: addMin(x.start, bufBefore),
    end:   addMin(x.end, -bufAfter),
  })).filter(x => addMin(x.start, dur) <= x.end);

  const slots = [];
  for (const { start, end } of buffered) {
    for (let t = new Date(start); addMin(t, dur) <= end; t = addMin(t, stepMin)) {
      slots.push(`${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`);
    }
  }
  return slots;
}

/* =======================================================
   RULES (match schema)
   ======================================================= */
export const findRulesByResourceId = (resourceId) =>
  dbClient.availabilityRule.findMany({
    where: { resourceId },
    orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
  });

// expects: { weekday, startTime, endTime, validFrom?, validTo? } as ISO strings or Date
export const createNewWeeklyRule = (resourceId, data) =>
  dbClient.availabilityRule.create({
    data: {
      resourceId,
      weekday: data.weekday,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validTo:   data.validTo   ? new Date(data.validTo)   : null,
    },
  });

export const updateExistingWeeklyRule = (ruleId, updates) =>
  dbClient.availabilityRule.update({
    where: { id: Number(ruleId) },
    data: {
      weekday:   updates.weekday   ?? undefined,
      startTime: updates.startTime ? new Date(updates.startTime) : undefined,
      endTime:   updates.endTime   ? new Date(updates.endTime)   : undefined,
      validFrom: updates.validFrom === null ? null
               : updates.validFrom ? new Date(updates.validFrom) : undefined,
      validTo:   updates.validTo   === null ? null
               : updates.validTo   ? new Date(updates.validTo)   : undefined,
    },
  });

export const deleteExistingWeeklyRule = (ruleId) =>
  dbClient.availabilityRule.delete({ where: { id: Number(ruleId) } });

/* =======================================================
   DATED WINDOWS (match schema)
   ======================================================= */
export const findDatedWindowsByResourceId = (resourceId) =>
  dbClient.availabilityDateWindow.findMany({
    where: { resourceId },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

// expects: { date: 'YYYY-MM-DD', startTime, endTime, note? }
export const createNewDatedWindow = (resourceId, { date, startTime, endTime, note }) =>
  dbClient.availabilityDateWindow.create({
    data: {
      resourceId,
      date: dayStartUtc(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      note: note ?? null,
    },
  });

export const updateExistingDatedWindow = (windowId, updates) =>
  dbClient.availabilityDateWindow.update({
    where: { id: Number(windowId) },
    data: {
      date:      updates.date      ? dayStartUtc(updates.date)      : undefined,
      startTime: updates.startTime ? new Date(updates.startTime)    : undefined,
      endTime:   updates.endTime   ? new Date(updates.endTime)      : undefined,
      note:      updates.note      ?? undefined,
    },
  });

export const deleteExistingDatedWindow = (windowId) =>
  dbClient.availabilityDateWindow.delete({ where: { id: Number(windowId) } });

/* =======================================================
   EXCEPTIONS (match schema)
   ======================================================= */
export const findExceptionsByResourceId = (resourceId) =>
  dbClient.availabilityException.findMany({
    where: { resourceId },
    orderBy: [{ startAt: 'asc' }],
  });

// expects: { startAt, endAt, reason? } ISO/Date
export const createNewException = (resourceId, { startAt, endAt, reason }) =>
  dbClient.availabilityException.create({
    data: {
      resourceId,
      startAt: new Date(startAt),
      endAt:   new Date(endAt),
      reason:  reason ?? null,
    },
  });

export const updateExistingException = (exceptionId, { startAt, endAt, reason }) =>
  dbClient.availabilityException.update({
    where: { id: Number(exceptionId) },
    data: {
      startAt: startAt ? new Date(startAt) : undefined,
      endAt:   endAt   ? new Date(endAt)   : undefined,
      reason:  reason  ?? undefined,
    },
  });

export const deleteExistingException = (exceptionId) =>
  dbClient.availabilityException.delete({ where: { id: Number(exceptionId) } });

/* Delete a full-day exception for a given local date (midnight→midnight UTC) */
export const deleteExceptionByDate = (resourceId, yyyyMmDd) => {
  const start = dayStartUtc(yyyyMmDd);
  const end   = dayStartUtc(yyyyMmDd); end.setUTCDate(end.getUTCDate()+1);
  return dbClient.availabilityException.deleteMany({
    where: {
      resourceId,
      startAt: start,
      endAt: end,
    },
  });
};