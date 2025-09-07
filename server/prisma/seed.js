import bcrypt from 'bcrypt';
import dbClient from '../src/utils/dbClient.js';
// Data
import { PERMISSION_NAMES, userSeedArray } from './seed/users.js';
import { reviewsSeedArray } from './seed/reviews.js';
import { eventsSeedArray } from './seed/events.js';
import { bookingSeedItem, openingTimesSeedArray } from './seed/booking.js';
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
      if (!process.env[key])
        throw new Error(`Environment variable ${key} is required`);
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
        console.log(`   ↳ granted all permissions to ${created.email}`);
      }
    }

    // Reviews
    for (const review of reviewsSeedArray) {
      await dbClient.review.create({ data: review });
      console.log(`✅ Review seeded: ${review.title || review.id}`);
    }

    // Events
    for (const event of eventsSeedArray) {
      await dbClient.event.create({ data: event });
      console.log(`✅ Event seeded: ${event.title || event.id}`);
    }

    // Booking
    await dbClient.bookingItem.create({ data: bookingSeedItem });
    console.log(`✅ Booking item seeded`);

    // Opening times
    for (const time of openingTimesSeedArray) {
      await dbClient.openingTime.upsert({
        where: { dayOfWeek: time.dayOfWeek },
        update: {},
        create: time,
      });
      console.log(`✅ Opening time seeded: ${time.dayOfWeek}`);
    }

    // Contact forms
    for (const contact of contactFormsSeedArray) {
      await dbClient.contactForm.create({ data: contact });
      console.log(`✅ Contact form seeded: ${contact.email || contact.id}`);
    }

    // Newsletter subscribers
    for (const sub of newsletterSubsSeedArray) {
      await dbClient.newsletterSubscriber.create({ data: sub });
      console.log(`✅ Newsletter subscriber seeded: ${sub.email}`);
    }

    // Newsletter publications
    for (const pub of newsletterPublicationsSeedArray) {
      await dbClient.newsletterPublication.create({ data: pub });
      console.log(`✅ Newsletter publication seeded: ${pub.title || pub.id}`);
    }

    // Callback forms
    for (const callback of callbackFormsSeedArray) {
      await dbClient.callbackForm.create({ data: callback });
      console.log(`✅ Callback form seeded: ${callback.phone || callback.id}`);
    }

    // Random day offs
    const currentYear = 2025;
    for (let month = 0; month < 12; month++) {
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const date = new Date(currentYear, month, randomDay);

      await dbClient.dayClosed.upsert({
        where: { date },
        update: {},
        create: { date, reason: 'Scheduled Day Off' },
      });
      console.log(`✅ Day closed seeded: ${date.toDateString()}`);
    }

    for (const post of tempBlogPostSeedArray) {
      const {
        id: _ignore, // array has an incrementing id; model uses uuid -> ignore it
        tags = [], // string[] of tag names
        publishedAt,
        ...rest
      } = post;

      const created = await dbClient.blogPost.create({
        data: {
          ...rest,
          ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
          tags: tags.length
            ? { connect: tags.map((name) => ({ name })) } // connect by unique BlogTag.name
            : undefined,
        },
        include: { tags: true },
      });

      console.log(
        `✅ Blog seeded: ${created.title} (${created.slug}) with ${created.tags.length} tag(s)`
      );
    }

    console.log('🌱 All seeds completed.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    await dbClient.$disconnect();
  }
}

seed().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
