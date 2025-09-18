import dbClient from '../../utils/dbClient.js';

/* =========================
   Helpers
   ========================= */

const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return undefined;
  if (startDate && endDate) return { gte: startDate, lt: endDate };
  if (startDate) return { gte: startDate };
  return { lt: endDate };
};

const buildBookingWhere = ({ resourceId, startDate, endDate }) => {
  const createdAt = buildDateFilter(startDate, endDate);
  const where = {};
  if (resourceId) where.resourceId = resourceId;
  if (createdAt) where.createdAt = createdAt;
  return where;
};

const buildPaymentWhere = ({ resourceId, startDate, endDate }) => {
  const createdAt = buildDateFilter(startDate, endDate);
  const where = { status: 'CAPTURED' }; // revenue = captured payments
  if (createdAt) where.createdAt = createdAt;
  // link payments to bookings for resource-scoping if provided
  if (resourceId) where.booking = { resourceId };
  return where;
};

/* =========================
   Booking Summary (KPIs)
   - totals by status
   - utilization (fill rate) = confirmed / total
   - revenue (sum captured payments)
   ========================= */

export const findBookingSummaryReport = async ({ resourceId, startDate, endDate }) => {
  // Bookings totals and status breakdown
  const whereBookings = buildBookingWhere({ resourceId, startDate, endDate });

  const [groupedByStatus, totalBookingsAgg] = await Promise.all([
    dbClient.booking.groupBy({
      by: ['status'],
      where: whereBookings,
      _count: { _all: true },
    }),
    dbClient.booking.aggregate({
      where: whereBookings,
      _count: { _all: true },
    }),
  ]);

  const totalsByStatus = groupedByStatus.reduce((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  const totalBookings = totalBookingsAgg?._count?._all ?? 0;
  const confirmedCount = totalsByStatus.CONFIRMED ?? 0;

  // Simple utilization proxy (fill rate)
  const utilization = totalBookings > 0 ? confirmedCount / totalBookings : 0;

  // Revenue via captured payments (optionally scoped by resource)
  const wherePayments = buildPaymentWhere({ resourceId, startDate, endDate });
  const revenueAgg = await dbClient.payment.aggregate({
    where: wherePayments,
    _sum: { amount: true },
  });
  const totalRevenue = Number(revenueAgg?._sum?.amount ?? 0);

  const foundReport = {
    scope: { resourceId, startDate, endDate },
    totals: {
      total: totalBookings,
      byStatus: totalsByStatus,
      confirmed: confirmedCount,
    },
    kpis: {
      utilization,     // 0..1
      revenue: totalRevenue,
    },
  };

  return foundReport;
};

/* =========================
   Availability Health
   - gaps: dates with no availability windows
   - overbook risk: overlapping confirmed bookings
   - rule coverage: count of weekly rules
   ========================= */

export const findAvailabilityHealthReport = async ({ resourceId, startDate, endDate }) => {
  // fetch rules & dated windows for coverage
  const [foundRules, foundWindows] = await Promise.all([
    dbClient.resourceRule.findMany({
      where: { resourceId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    }),
    dbClient.datedWindow.findMany({
      where: {
        resourceId,
        date: buildDateFilter(startDate, endDate),
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    }),
  ]);

  // fetch confirmed bookings within range for overlap checks
  const foundBookings = await dbClient.booking.findMany({
    where: {
      resourceId,
      status: 'CONFIRMED',
      startAt: buildDateFilter(startDate, endDate),
    },
    select: { id: true, startAt: true, endAt: true },
    orderBy: [{ startAt: 'asc' }],
  });

  // compute overbook overlaps (simple 1-resource concurrency check)
  let overlaps = 0;
  for (let i = 1; i < foundBookings.length; i += 1) {
    const prev = foundBookings[i - 1];
    const curr = foundBookings[i];
    if (prev.endAt > curr.startAt) overlaps += 1;
  }

  // compute gap days (days in range without any dated window)
  const dayMs = 24 * 60 * 60 * 1000;
  const gapDates = [];
  if (startDate && endDate) {
    const setWithWindows = new Set(
      foundWindows.map((w) => new Date(w.date).toISOString().slice(0, 10))
    );
    for (
      let t = new Date(startDate).setHours(0, 0, 0, 0);
      t < new Date(endDate).setHours(0, 0, 0, 0);
      t += dayMs
    ) {
      const d = new Date(t).toISOString().slice(0, 10);
      if (!setWithWindows.has(d)) gapDates.push(d);
    }
  }

  // rule coverage = how many weekly rules exist (simple indicator)
  const ruleCoverage = foundRules.length;

  const foundReport = {
    scope: { resourceId, startDate, endDate },
    health: {
      gaps: {
        totalGapDays: gapDates.length,
        gapDates,
      },
      overbookRisk: {
        overlappingPairs: overlaps,
      },
      ruleCoverage,
      signals: {
        hasGaps: gapDates.length > 0,
        hasOverlaps: overlaps > 0,
        hasRules: ruleCoverage > 0,
      },
    },
    context: {
      windows: foundWindows.length,
      confirmedBookings: foundBookings.length,
    },
  };

  return foundReport;
};
