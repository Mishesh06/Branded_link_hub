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

describe('Link Management & Validation Suite', () => {
  let userCookie: string;
  let otherUserCookie: string;

  beforeEach(async () => {
    // User A
    const resA = await request(app).post('/api/v1/auth/signup').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123'
    });
    userCookie = getCookies(resA).find((c: string) => c.includes('access_token=')) || '';

    // User B
    const resB = await request(app).post('/api/v1/auth/signup').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123'
    });
    otherUserCookie = getCookies(resB).find((c: string) => c.includes('access_token=')) || '';
  });

  it('should auto-generate a 6-character short code if vanity slug is not provided', async () => {
    const res = await request(app)
      .post('/api/v1/links')
      .set('Cookie', [userCookie])
      .send({
        originalUrl: 'https://github.com/cosscom/coss',
        title: 'Coss UI Repository'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.link.shortCode).toHaveLength(6);
    expect(res.body.data.link.isCustomSlug).toBe(false);
  });

  it('should accept and store a valid custom vanity slug', async () => {
    const res = await request(app)
      .post('/api/v1/links')
      .set('Cookie', [userCookie])
      .send({
        originalUrl: 'https://news.ycombinator.com',
        customSlug: 'hn-frontpage'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.link.shortCode).toBe('hn-frontpage');
    expect(res.body.data.link.isCustomSlug).toBe(true);
  });

  it('should reject invalid URL formats', async () => {
    const res = await request(app)
      .post('/api/v1/links')
      .set('Cookie', [userCookie])
      .send({
        originalUrl: 'ftp://invalid-protocol.com'
      });

    expect(res.status).toBe(400);
  });

  it('should detect and reject duplicate slug collision with 409 Conflict', async () => {
    await request(app)
      .post('/api/v1/links')
      .set('Cookie', [userCookie])
      .send({
        originalUrl: 'https://example.com/one',
        customSlug: 'exclusive-deal'
      });

    // Attempt second creation with same slug
    const conflictRes = await request(app)
      .post('/api/v1/links')
      .set('Cookie', [otherUserCookie])
      .send({
        originalUrl: 'https://example.com/two',
        customSlug: 'exclusive-deal'
      });

    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.message).toContain('already in use');
  });

  it('should strictly enforce ownership security on deletion', async () => {
    const createRes = await request(app)
      .post('/api/v1/links')
      .set('Cookie', [userCookie])
      .send({
        originalUrl: 'https://example.com/owned-by-a'
      });

    const linkId = createRes.body.data.link._id;

    // User B attempts to delete User A's link
    const forbiddenRes = await request(app)
      .delete(`/api/v1/links/${linkId}`)
      .set('Cookie', [otherUserCookie]);

    expect(forbiddenRes.status).toBe(404);

    // User A successfully deletes their link
    const deleteRes = await request(app)
      .delete(`/api/v1/links/${linkId}`)
      .set('Cookie', [userCookie]);

    expect(deleteRes.status).toBe(200);
  });

  it('should support search and pagination in the link library', async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/api/v1/links')
        .set('Cookie', [userCookie])
        .send({
          originalUrl: `https://example.com/page-${i}`,
          title: i === 3 ? 'Target Alpha Link' : `Regular Link ${i}`
        });
    }

    // Pagination limit test
    const pageRes = await request(app)
      .get('/api/v1/links?page=1&limit=2')
      .set('Cookie', [userCookie]);

    expect(pageRes.status).toBe(200);
    expect(pageRes.body.data.links).toHaveLength(2);
    expect(pageRes.body.data.pagination.total).toBe(5);
    expect(pageRes.body.data.pagination.totalPages).toBe(3);

    // Search query test
    const searchRes = await request(app)
      .get('/api/v1/links?search=Alpha')
      .set('Cookie', [userCookie]);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.links).toHaveLength(1);
    expect(searchRes.body.data.links[0].title).toBe('Target Alpha Link');
  });
});
