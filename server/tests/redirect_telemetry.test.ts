import request from 'supertest';
import { createApp } from '../src/app';
import { Link } from '../src/models/Link';
import { ClickEvent } from '../src/models/ClickEvent';
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

describe('302 Redirect & Telemetry Engine Suite', () => {
  let userCookie: string;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Redirect Tester',
      email: 'redirect@example.com',
      password: 'Password123'
    });
    userCookie = getCookies(signupRes).find((c: string) => c.includes('access_token=')) || '';
  });

  it('should return 302 Found and redirect to original URL with cache prevention headers', async () => {
    const createRes = await request(app)
      .post('/api/v1/links')
      .set('Cookie', [userCookie])
      .send({
        originalUrl: 'https://docs.coss.com',
        customSlug: 'coss-docs'
      });

    const redirectRes = await request(app)
      .get('/r/coss-docs')
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
      .set('Referer', 'https://twitter.com/feed');

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe('https://docs.coss.com');
    expect(redirectRes.headers['cache-control']).toContain('no-store');

    // Wait a brief tick for async telemetry persistence
    await new Promise((r) => setTimeout(r, 100));

    // Verify click event recorded in database
    const link = await Link.findOne({ shortCode: 'coss-docs' });
    expect(link?.clickCount).toBe(1);

    const click = await ClickEvent.findOne({ linkId: link?._id });
    expect(click).toBeDefined();
    expect(click?.deviceType).toBe('Mobile');
    expect(click?.referrer).toBe('twitter.com');
    expect(click?.ipHash).toBeDefined();
    // Verify raw IP was NOT stored
    expect(click?.ipHash).not.toBe('127.0.0.1');
  });

  it('should return 404 for unknown short codes', async () => {
    const res = await request(app).get('/r/non-existent-code-99');
    expect(res.status).toBe(404);
  });
});
