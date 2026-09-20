import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, clearTestDB, disconnectTestDB, getCookies } from './setup';
import { Link } from '../src/models/Link';
import { User } from '../src/models/User';

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

describe('P1 Security & Edge-Case Hardening Suite', () => {
  // A. Unauthorized API Access
  describe('A. Unauthorized API Access', () => {
    it('should reject unauthenticated requests to protected endpoints with 401', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/links' },
        { method: 'post', path: '/api/v1/links', body: { originalUrl: 'https://example.com' } },
        { method: 'get', path: '/api/v1/analytics/overview' },
        { method: 'get', path: '/api/v1/analytics/link/507f1f77bcf86cd799439011' },
        { method: 'get', path: '/api/v1/bio/me' },
        { method: 'put', path: '/api/v1/bio/me', body: { displayName: 'Hacker' } }
      ];

      for (const ep of endpoints) {
        const req = (request(app) as any)[ep.method](ep.path);
        if (ep.body) req.send(ep.body);
        const res = await req;
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      }
    });
  });

  // B. Cross-User Analytics Access
  describe('B. Cross-User Analytics Access', () => {
    it('should prevent User B from accessing User A link analytics', async () => {
      // 1. Signup User A
      const resA = await request(app).post('/api/v1/auth/signup').send({
        name: 'User A',
        email: 'usera@example.com',
        password: 'Password123'
      });
      const cookieA = getCookies(resA).find((c: string) => c.includes('access_token='));

      // 2. User A creates a link
      const linkRes = await request(app)
        .post('/api/v1/links')
        .set('Cookie', [cookieA!])
        .send({ originalUrl: 'https://example.com/user-a-secret', title: 'Secret Link' });
      const linkIdA = linkRes.body.data.link._id;

      // 3. Signup User B
      const resB = await request(app).post('/api/v1/auth/signup').send({
        name: 'User B',
        email: 'userb@example.com',
        password: 'Password123'
      });
      const cookieB = getCookies(resB).find((c: string) => c.includes('access_token='));

      // 4. User B attempts to access analytics for User A's link
      const analyticsRes = await request(app)
        .get(`/api/v1/analytics/link/${linkIdA}`)
        .set('Cookie', [cookieB!]);

      // Access must be rejected and not expose User A's analytics data
      expect(analyticsRes.status).toBe(404);
      expect(analyticsRes.body.success).toBe(false);
      expect(analyticsRes.body.message).toContain('not found or unauthorized');
      expect(analyticsRes.body.data).toBeUndefined();
    });
  });

  // C. Showcase-Link Ownership Tampering
  describe('C. Showcase-Link Ownership Tampering', () => {
    it('should reject User B attempting to add User A links to showcaseLinkIds', async () => {
      // 1. User A creates link
      const resA = await request(app).post('/api/v1/auth/signup').send({
        name: 'User A',
        email: 'usera_showcase@example.com',
        password: 'Password123'
      });
      const cookieA = getCookies(resA).find((c: string) => c.includes('access_token='));

      const linkResA = await request(app)
        .post('/api/v1/links')
        .set('Cookie', [cookieA!])
        .send({ originalUrl: 'https://usera.com', title: 'User A Link' });
      const userALinkId = linkResA.body.data.link._id;

      // 2. User B signs up and creates their own link
      const resB = await request(app).post('/api/v1/auth/signup').send({
        name: 'User B',
        email: 'userb_showcase@example.com',
        password: 'Password123'
      });
      const cookieB = getCookies(resB).find((c: string) => c.includes('access_token='));

      const linkResB = await request(app)
        .post('/api/v1/links')
        .set('Cookie', [cookieB!])
        .send({ originalUrl: 'https://userb.com', title: 'User B Link' });
      const userBLinkId = linkResB.body.data.link._id;

      // 3. User B attempts to showcase User A's link ID
      const tamperRes = await request(app)
        .put('/api/v1/bio/me')
        .set('Cookie', [cookieB!])
        .send({
          displayName: 'User B Profile',
          theme: 'minimal-light',
          showcaseLinkIds: [userALinkId]
        });

      // Must be rejected with 403 Forbidden
      expect(tamperRes.status).toBe(403);
      expect(tamperRes.body.success).toBe(false);

      // 4. User B can showcase their own link
      const legitRes = await request(app)
        .put('/api/v1/bio/me')
        .set('Cookie', [cookieB!])
        .send({
          displayName: 'User B Profile',
          theme: 'minimal-light',
          showcaseLinkIds: [userBLinkId]
        });

      expect(legitRes.status).toBe(200);
      expect(legitRes.body.success).toBe(true);
      expect(legitRes.body.data.profile.showcaseLinkIds.map(String)).toContain(userBLinkId.toString());
      expect(legitRes.body.data.profile.showcaseLinkIds.map(String)).not.toContain(userALinkId.toString());
    });
  });

  // D. Rate-Limit Enforcement
  describe('D. Rate-Limit Enforcement', () => {
    it('should return HTTP 429 with rate-limit headers when threshold exceeded', async () => {
      // Use an isolated IP to prevent polluting rate limit counters for subsequent test cases
      const rateLimitIp = '198.51.100.77';
      let lastRes: any;
      for (let i = 0; i < 26; i++) {
        lastRes = await request(app)
          .post('/api/v1/auth/login')
          .set('X-Forwarded-For', rateLimitIp)
          .send({
            email: 'nonexistent@example.com',
            password: 'WrongPassword123'
          });
        if (lastRes.status === 429) break;
      }

      expect(lastRes.status).toBe(429);
      expect(lastRes.body.success).toBe(false);
      expect(lastRes.body.message).toContain('Too many');
      // Verify rate-limit headers are present
      expect(lastRes.headers).toHaveProperty('ratelimit-limit');
      expect(lastRes.headers).toHaveProperty('ratelimit-remaining');
    });
  });

  // E. Reserved Slug Rejection
  describe('E. Reserved Slug Rejection', () => {
    it('should reject reserved slugs with 400 Bad Request', async () => {
      const resUser = await request(app).post('/api/v1/auth/signup').send({
        name: 'Reserved Tester',
        email: 'reserved@example.com',
        password: 'Password123'
      });
      const cookie = getCookies(resUser).find((c: string) => c.includes('access_token='));

      const reservedWords = ['admin', 'api', 'dashboard', 'settings', 'r', 'bio', 'login', 'signup'];

      for (const slug of reservedWords) {
        const res = await request(app)
          .post('/api/v1/links')
          .set('Cookie', [cookie!])
          .send({
            originalUrl: 'https://example.com/test',
            customSlug: slug
          });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(JSON.stringify(res.body)).toContain('reserved');
      }
    });
  });

  // F. Inactive / Deleted Link Redirect
  describe('F. Inactive / Deleted Link Redirect', () => {
    it('should not redirect inactive or archived link and return 404', async () => {
      const resUser = await request(app).post('/api/v1/auth/signup').send({
        name: 'Inactive Tester',
        email: 'inactive@example.com',
        password: 'Password123'
      });
      const cookie = getCookies(resUser).find((c: string) => c.includes('access_token='));

      // Create link
      const linkRes = await request(app)
        .post('/api/v1/links')
        .set('Cookie', [cookie!])
        .send({
          originalUrl: 'https://example.com/destination',
          customSlug: 'test-archived'
        });
      expect(linkRes.status).toBe(201);

      // Set link to archived in database
      await Link.updateOne({ shortCode: 'test-archived' }, { status: 'archived' });

      // Request redirect endpoint
      const redirectRes = await request(app).get('/r/test-archived');
      expect(redirectRes.status).toBe(404);
      expect(redirectRes.header.location).toBeUndefined();

      // Delete link completely
      await Link.deleteOne({ shortCode: 'test-archived' });
      const deletedRedirectRes = await request(app).get('/r/test-archived');
      expect(deletedRedirectRes.status).toBe(404);
      expect(deletedRedirectRes.header.location).toBeUndefined();
    });
  });

  // G. Invalid ObjectId Handling Regression
  describe('G. Invalid ObjectId Handling Regression', () => {
    it('should return HTTP 400 instead of 500 for malformed ObjectIds', async () => {
      const resUser = await request(app).post('/api/v1/auth/signup').send({
        name: 'ObjectId Tester',
        email: 'objectid@example.com',
        password: 'Password123'
      });
      const cookie = getCookies(resUser).find((c: string) => c.includes('access_token='));

      const malformedIds = [
        'not-a-valid-object-id',
        '12345',
        'undefined',
        'null',
        'zzzzzzzzzzzzzzzzzzzzzzzz'
      ];

      for (const id of malformedIds) {
        const res = await request(app)
          .get(`/api/v1/analytics/link/${id}`)
          .set('Cookie', [cookie!]);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Invalid');
      }
    });
  });

  // H. Self-Referencing Redirect Protection Regression
  describe('H. Self-Referencing Redirect Protection Regression', () => {
    it('should reject links pointing back to /r/ redirect engine with 400 Bad Request', async () => {
      const resUser = await request(app).post('/api/v1/auth/signup').send({
        name: 'Loop Tester',
        email: 'loop@example.com',
        password: 'Password123'
      });
      const cookie = getCookies(resUser).find((c: string) => c.includes('access_token='));

      const loopUrls = [
        'http://localhost:5001/r/loop123',
        'http://127.0.0.1:5001/r/my-slug',
        'http://localhost:5173/r/client-loop'
      ];

      for (const originalUrl of loopUrls) {
        const res = await request(app)
          .post('/api/v1/links')
          .set('Cookie', [cookie!])
          .send({ originalUrl });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(JSON.stringify(res.body)).toContain('redirect loop');
      }
    });
  });

  // I. Password Hash Protection
  describe('I. Password Hash Protection', () => {
    it('should not expose passwordHash by default in Mongoose queries', async () => {
      const resUser = await request(app).post('/api/v1/auth/signup').send({
        name: 'Hash Protection Tester',
        email: 'hashprotect@example.com',
        password: 'Password123'
      });
      expect(resUser.body.data.user.passwordHash).toBeUndefined();

      // Direct database query without select('+passwordHash')
      const userDoc = await User.findOne({ email: 'hashprotect@example.com' });
      expect(userDoc).not.toBeNull();
      expect(userDoc!.passwordHash).toBeUndefined();
      expect(userDoc!.toObject().passwordHash).toBeUndefined();
    });
  });
});
