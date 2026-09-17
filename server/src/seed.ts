import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './config/db';
import { User } from './models/User';
import { Link } from './models/Link';
import { ClickEvent, DeviceType } from './models/ClickEvent';
import { BioProfile } from './models/BioProfile';
import { hashIpAddress } from './utils/ipHash';

const seedDatabase = async () => {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  console.log('[Seed] Clearing existing demo data...');
  const demoEmail = 'demo@brandedhub.dev';
  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    const userLinks = await Link.find({ userId: existingUser._id });
    const linkIds = userLinks.map((l) => l._id);
    await ClickEvent.deleteMany({ linkId: { $in: linkIds } });
    await Link.deleteMany({ userId: existingUser._id });
    await BioProfile.deleteOne({ userId: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
  }

  console.log('[Seed] Creating demo user...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('DemoPassword123!', salt);

  const demoUser = await User.create({
    email: demoEmail,
    name: 'Sarah Chen (Demo)',
    passwordHash,
    isEmailVerified: true,
    refreshTokenHashes: []
  });

  console.log('[Seed] Creating demo links...');
  const sampleLinks = [
    {
      originalUrl: 'https://github.com/cosscom/coss',
      title: 'COSS UI Open Source Repository',
      shortCode: 'coss-ui',
      isCustomSlug: true,
      clicks: 42
    },
    {
      originalUrl: 'https://cal.com/product',
      title: 'Cal.com Scheduling Infrastructure',
      shortCode: 'cal-prod',
      isCustomSlug: true,
      clicks: 28
    },
    {
      originalUrl: 'https://news.ycombinator.com',
      title: 'Hacker News Front Page',
      shortCode: 'hn-feed',
      isCustomSlug: true,
      clicks: 65
    },
    {
      originalUrl: 'https://tailwindcss.com/docs',
      title: 'Tailwind CSS Documentation',
      shortCode: 'tailwind',
      isCustomSlug: true,
      clicks: 19
    },
    {
      originalUrl: 'https://react.dev/learn',
      title: 'React 18 Official Tutorial',
      shortCode: 'rk82s1',
      isCustomSlug: false,
      clicks: 34
    }
  ];

  const createdLinks = [];
  for (const item of sampleLinks) {
    const link = await Link.create({
      userId: demoUser._id,
      title: item.title,
      originalUrl: item.originalUrl,
      shortCode: item.shortCode,
      isCustomSlug: item.isCustomSlug,
      clickCount: item.clicks,
      status: 'active'
    });
    createdLinks.push(link);
  }

  console.log('[Seed] Generating telemetry click events across past 14 days...');
  const referrers = [
    'google.com',
    'twitter.com',
    'linkedin.com',
    'github.com',
    'reddit.com',
    'Direct'
  ];
  const devices: DeviceType[] = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Tablet'];

  const clickEvents = [];
  const now = new Date();

  for (const link of createdLinks) {
    for (let i = 0; i < link.clickCount; i++) {
      // Random days ago between 0 and 13
      const daysAgo = Math.floor(Math.random() * 14);
      const hoursAgo = Math.floor(Math.random() * 24);
      const eventTime = new Date(now);
      eventTime.setDate(eventTime.getDate() - daysAgo);
      eventTime.setHours(eventTime.getHours() - hoursAgo);

      const device = devices[Math.floor(Math.random() * devices.length)];
      const ref = referrers[Math.floor(Math.random() * referrers.length)];
      const mockIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      clickEvents.push({
        linkId: link._id,
        timestamp: eventTime,
        referrer: ref,
        deviceType: device,
        ipHash: hashIpAddress(mockIp)
      });
    }
  }

  await ClickEvent.insertMany(clickEvents);

  console.log('[Seed] Creating demo BioProfile...');
  await BioProfile.create({
    userId: demoUser._id,
    username: 'sarahchen',
    displayName: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Product Engineer & Open-Source Contributor. Building Developer Tooling & Curated Hubs.',
    theme: 'dark-slate',
    socialLinks: [
      {
        platform: 'github',
        url: 'https://github.com',
        title: 'GitHub @sarahchen',
        isEnabled: true
      },
      {
        platform: 'twitter',
        url: 'https://x.com',
        title: 'X @sarahchen_dev',
        isEnabled: true
      },
      {
        platform: 'linkedin',
        url: 'https://linkedin.com',
        title: 'LinkedIn',
        isEnabled: true
      },
      {
        platform: 'website',
        url: 'https://chen.dev',
        title: 'Personal Portfolio',
        isEnabled: true
      }
    ],
    showcaseLinkIds: createdLinks.slice(0, 3).map((l) => l._id)
  });

  console.log('----------------------------------------------------');
  console.log('✅ Demo Seed Data Populated Successfully!');
  console.log(`Demo Account: ${demoEmail}`);
  console.log(`Demo Password: DemoPassword123!`);
  console.log(`Demo Bio URL: /bio/sarahchen`);
  console.log(`Links Created: ${createdLinks.length}`);
  console.log(`Telemetry Events Generated: ${clickEvents.length}`);
  console.log('----------------------------------------------------');

  await disconnectDB();
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('[Seed] Error seeding database:', err);
  process.exit(1);
});
