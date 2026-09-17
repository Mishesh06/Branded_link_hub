import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, clearTestDB, disconnectTestDB, getCookies } from './setup';

const app = createApp();

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('Analytics Aggregation & Bio Hub Suite', () => {
  let userCookie: string;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Bio Pro',
      email: 'biopro@example.com',
      password: 'Password123'
    });
    userCookie = getCookies(signupRes).find((c: string) => c.includes('access_token=')) || '';
  });

  it('should aggregate overview analytics including clicks, devices, and referrers', async () => {
    // Create a link
    const linkRes = await request(app)
      .post('/api/v1/links')
      .set('Cookie', [userCookie])
      .send({
        originalUrl: 'https://example.com/item',
        customSlug: 'item-deal'
      });

    const linkId = linkRes.body.data.link._id;

    // Simulate redirects
    await request(app)
      .get('/r/item-deal')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
      .set('Referer', 'https://linkedin.com');

    await request(app)
      .get('/r/item-deal')
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)');

    await new Promise((r) => setTimeout(r, 100));

    // Fetch Overview Analytics
    const analyticsRes = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Cookie', [userCookie]);

    expect(analyticsRes.status).toBe(200);
    expect(analyticsRes.body.data.summary.totalLinks).toBe(1);
    expect(analyticsRes.body.data.summary.totalClicks).toBe(2);
    expect(analyticsRes.body.data.deviceDistribution.length).toBeGreaterThan(0);
    expect(analyticsRes.body.data.topReferrers.length).toBeGreaterThan(0);

    // Fetch Link-specific Analytics
    const singleLinkAnalytics = await request(app)
      .get(`/api/v1/analytics/link/${linkId}`)
      .set('Cookie', [userCookie]);

    expect(singleLinkAnalytics.status).toBe(200);
    expect(singleLinkAnalytics.body.data.recentClicks).toHaveLength(2);
  });

  it('should allow user to update bio profile and fetch publicly', async () => {
    // Fetch initial profile
    const myProfileRes = await request(app)
      .get('/api/v1/bio/me')
      .set('Cookie', [userCookie]);

    expect(myProfileRes.status).toBe(200);
    const username = myProfileRes.body.data.profile.username;

    // Update bio profile
    const updateRes = await request(app)
      .put('/api/v1/bio/me')
      .set('Cookie', [userCookie])
      .send({
        displayName: 'Alex Developer',
        bio: 'Full-stack engineer passionate about clean code and UI.',
        theme: 'dark-slate',
        socialLinks: [
          {
            platform: 'github',
            url: 'https://github.com/developer',
            title: 'GitHub',
            isEnabled: true
          },
          {
            platform: 'twitter',
            url: 'https://x.com/developer',
            title: 'X / Twitter',
            isEnabled: true
          }
        ]
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.profile.displayName).toBe('Alex Developer');
    expect(updateRes.body.data.profile.theme).toBe('dark-slate');
    expect(updateRes.body.data.profile.socialLinks).toHaveLength(2);

    // Fetch public profile unauthenticated
    const publicRes = await request(app).get(`/api/v1/bio/public/${username}`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.profile.displayName).toBe('Alex Developer');
    expect(publicRes.body.data.profile.theme).toBe('dark-slate');
  });
});
