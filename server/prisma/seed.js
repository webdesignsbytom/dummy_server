import bcrypt from 'bcrypt';
import dbClient from '../src/utils/dbClient.js';
// Data
import { PERMISSION_NAMES, userSeedArray } from './seed/users.js';
import { reviewsSeedArray } from './seed/reviews.js';
import { eventsSeedArray } from './seed/events.js';
import {
  RESOURCE_TZ,
  locationSeed,
  tagNames,
  resourceSeed,
  serviceSeed,
  availabilityRulesSeedArray,
  availabilityDateWindowsSeedArray,
  availabilityExceptionsSeedArray,
  bookingsSeedArray,
  bookingHistoriesSeedArray,
  paymentsSeedArray,
  notificationsSeedArray,
  waitlistsSeedArray,
  screeningSeedArray,
  externalCalendarsSeedArray,
  RANDOM_DAY_OFFS_YEAR,
} from './seed/booking.js';
import { contactFormsSeedArray } from './seed/contact.js';
import {
  newsletterPublicationsSeedArray,
  newsletterSubsSeedArray,
} from './seed/newsletter.js';
import { callbackFormsSeedArray } from './seed/callback.js';
import { tempBlogPostSeedArray } from './seed/blog.js';

async function seed() {
  try {
    // Required envs only (no defaults)
    const requiredEnv = [
      'SALT_ROUNDS',
      'SEED_PASSWORD',
      'SEED_PASSWORD_ADMIN',
      'SEED_PASSWORD_DEV',
    ];
    for (const key of requiredEnv) {
      if (!process.env[key]) throw new Error(`Environment variable ${key} is required`);
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);

    // Upsert permissions (idempotent for reruns)
    for (const name of PERMISSION_NAMES) {
      await dbClient.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    const allPermissions = await dbClient.permission.findMany();
    const allPermissionIds = allPermissions.map((p) => p.id);

    // Hash role-based passwords (strict envs)
    const passwordMap = {
      USER: await bcrypt.hash(process.env.SEED_PASSWORD, saltRounds),
      ADMIN: await bcrypt.hash(process.env.SEED_PASSWORD_ADMIN, saltRounds),
      DEVELOPER: await bcrypt.hash(process.env.SEED_PASSWORD_DEV, saltRounds),
    };

    // Helper: grant all permissions to a user
    async function grantAllPermissionsToUser(userId) {
      if (!allPermissionIds.length) return;
      await dbClient.userPermission.createMany({
        data: allPermissionIds.map((permissionId) => ({
          userId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    // Users
    for (const user of userSeedArray) {
      const role = user.role || 'USER';
      const password = passwordMap[role] || passwordMap.USER;

      // Create user as verified
      const created = await dbClient.user.create({
        data: {
          id: user.id,
          email: user.email,
          password,
          role,
          isVerified: true,
        },
      });
      console.log(`✅ User seeded: ${created.email} (${role})`);

      // AccountStatus per user (active)
      await dbClient.accountStatus.create({
        data: {
          userId: created.id,
          isActive: true,
          isBanned: false,
        },
      });

      // Give ADMIN and DEVELOPER all permissions
      if (role === 'ADMIN' || role === 'DEVELOPER') {
        await grantAllPermissionsToUser(created.id);
      }
    }
    console.log(`🔐 Granted all permissions to appropriate users`);

    // Reviews
    for (const review of reviewsSeedArray) {
      await dbClient.review.create({ data: review });
    }
    console.log(`✅ Reviews seeded`);

    // Events
    for (const event of eventsSeedArray) {
      await dbClient.event.create({ data: event });
    }
    console.log(`✅ Events seeded`);

    // Contact forms
    for (const contact of contactFormsSeedArray) {
      await dbClient.contactForm.create({ data: contact });
    }
    console.log(`✅ Contact forms seeded`);

    // Newsletter subscribers
    for (const sub of newsletterSubsSeedArray) {
      await dbClient.newsletterSubscriber.create({ data: sub });
    }
    console.log(`✅ Newsletter subscribers seeded`);

    // Newsletter publications
    for (const pub of newsletterPublicationsSeedArray) {
      await dbClient.newsletterPublication.create({ data: pub });
    }
    console.log(`✅ Newsletter publications seeded`);

    // Callback forms
    for (const callback of callbackFormsSeedArray) {
      await dbClient.callbackForm.create({ data: callback });
    }
    console.log(`✅ Callback forms seeded`);

    // -------------------------------
    // BOOKING ENGINE SEEDING (NEW)
    // -------------------------------

    // 1) Location
    const location = await dbClient.location.upsert({
      where: { name: locationSeed.name },
      update: { address: locationSeed.address, timeZone: locationSeed.timeZone, active: true },
      create: locationSeed,
    });

    // 2) Tags
    const createdTags = [];
    for (const name of tagNames) {
      const tag = await dbClient.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      createdTags.push(tag);
    }

    // 3) Resource (Mistress D)
    const resource = await dbClient.resource.upsert({
      where: { name: resourceSeed.name },
      update: {
        timeZone: RESOURCE_TZ,
        capacity: resourceSeed.capacity,
        active: true,
        locationId: location.id,
      },
      create: {
        ...resourceSeed,
        locationId: location.id,
      },
    });

    // Link tags to resource
    for (const tag of createdTags) {
      await dbClient.resourceTag.upsert({
        where: {
          resourceId_tagId: {
            resourceId: resource.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: { resourceId: resource.id, tagId: tag.id },
      });
    }

    // 4) Service
    const service = await dbClient.service.upsert({
      where: { name: serviceSeed.name },
      update: {
        defaultDuration: serviceSeed.defaultDuration,
        bufferBefore: serviceSeed.bufferBefore,
        bufferAfter: serviceSeed.bufferAfter,
        minLeadMin: serviceSeed.minLeadMin,
        maxAdvanceDays: serviceSeed.maxAdvanceDays,
        sameDayCutoff: serviceSeed.sameDayCutoff,
        active: true,
      },
      create: serviceSeed,
    });

    // 5) Weekly Availability Rules (Mon–Fri 9–5)
    for (const r of availabilityRulesSeedArray) {
      await dbClient.availabilityRule.create({
        data: { ...r, resourceId: resource.id },
      });
    }
    console.log(`✅ Availability rules seeded (Mon–Fri 9–5)`);

    // 6) Dated Windows (custom hours per date)
    for (const w of availabilityDateWindowsSeedArray) {
      await dbClient.availabilityDateWindow.create({
        data: { ...w, resourceId: resource.id },
      });
    }
    console.log(`✅ Dated availability windows seeded`);

    // 7) Exceptions (full/partial blackouts)
    //    plus: random monthly day-offs for the given year
    for (const ex of availabilityExceptionsSeedArray) {
      await dbClient.availabilityException.create({
        data: { ...ex, resourceId: resource.id },
      });
    }

    // Random day offs (one per month) — normalized to full day UTC
    const year = RANDOM_DAY_OFFS_YEAR;
    for (let month = 0; month < 12; month++) {
      const day = Math.floor(Math.random() * 28) + 1; // 1..28
      const startAt = new Date(Date.UTC(year, month, day, 0, 0, 0));
      const endAt = new Date(Date.UTC(year, month, day + 1, 0, 0, 0));
      await dbClient.availabilityException.create({
        data: {
          resourceId: resource.id,
          startAt,
          endAt,
          reason: 'Random monthly day off',
        },
      });
    }
    console.log(`✅ Exceptions seeded (fixed + random monthly days off)`);

    // 8) Bookings (+ histories, payments, notifications, screening)
    for (const b of bookingsSeedArray) {
      const created = await dbClient.booking.create({
        data: {
          ...b,
          resourceId: resource.id,
          serviceId: service.id,
        },
      });

      // History records for this booking (if any)
      const histories = bookingHistoriesSeedArray.filter((h) => h.bookingId === b.id);
      for (const h of histories) {
        await dbClient.bookingHistory.create({
          data: {
            bookingId: created.id,
            fromStatus: h.fromStatus ?? null,
            toStatus: h.toStatus ?? null,
            note: h.note ?? null,
            actor: h.actor ?? null,
          },
        });
      }

      // Payments for this booking (if any)
      const pays = paymentsSeedArray.filter((p) => p.bookingId === b.id);
      for (const p of pays) {
        await dbClient.payment.create({
          data: {
            bookingId: created.id,
            provider: p.provider,
            providerRef: p.providerRef ?? null,
            amountCents: p.amountCents,
            currency: p.currency ?? 'GBP',
            status: p.status,
            capturedAt: p.capturedAt ?? null,
            refundedAt: p.refundedAt ?? null,
            payload: p.payload ?? null,
          },
        });
      }

      // Notifications for this booking (if any)
      const notifs = notificationsSeedArray.filter((n) => n.bookingId === b.id);
      for (const n of notifs) {
        await dbClient.notification.create({
          data: {
            bookingId: created.id,
            channel: n.channel,
            status: n.status,
            toAddress: n.toAddress ?? null,
            sendAt: n.sendAt ?? null,
            sentAt: n.sentAt ?? null,
            templateKey: n.templateKey ?? null,
            payload: n.payload ?? null,
          },
        });
      }

      // Screening (if any; 1:1)
      const screen = screeningSeedArray.find((s) => s.bookingId === b.id);
      if (screen) {
        await dbClient.screeningResponse.create({
          data: {
            bookingId: created.id,
            answers: screen.answers,
          },
        });
      }
    }
    console.log(`✅ Bookings + histories + payments + notifications + screening seeded`);

    // 9) Waitlist
    for (const w of waitlistsSeedArray) {
      await dbClient.waitlist.create({
        data: {
          ...w,
          resourceId: resource.id,
          serviceId: service.id,
        },
      });
    }
    console.log(`✅ Waitlist seeded`);

    // 10) External calendars (sync)
    for (const cal of externalCalendarsSeedArray) {
      await dbClient.externalCalendar.upsert({
        where: { provider_externalId: { provider: cal.provider, externalId: cal.externalId } },
        update: { lastSyncedAt: cal.lastSyncedAt ?? null, syncToken: cal.syncToken ?? null, resourceId: resource.id },
        create: { ...cal, resourceId: resource.id },
      });
    }
    console.log(`✅ External calendars seeded`);

    // -------------------------------
    // BLOG / MEDIA (unchanged from your flow)
    // -------------------------------

    for (const post of tempBlogPostSeedArray) {
      const { id: _ignore, tags = [], publishedAt, ...rest } = post;

      await dbClient.blogPost.create({
        data: {
          ...rest,
          ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
          tags: tags.length
            ? {
                connectOrCreate: tags.map((name) => ({
                  where: { name }, // connect by unique name
                  create: { name }, // create if missing
                })),
              }
            : undefined,
        },
        include: { tags: true },
      });
    }
    console.log(`✅ Blogs seeded`);

    console.log('🌱 All seeds completed.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await dbClient.$disconnect();
  }
}

seed().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
