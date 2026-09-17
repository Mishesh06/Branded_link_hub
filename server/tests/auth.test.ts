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

describe('Authentication & Token Rotation Suite', () => {
  const testUser = {
    name: 'Alex Engineer',
    email: 'alex@example.com',
    password: 'SuperSecretPassword123'
  };

  it('should sign up a new user with email verification simulation and set httpOnly cookies', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.isEmailVerified).toBe(false);
    expect(res.body.data.simulatedVerificationToken).toBeDefined();

    // Check cookies
    const cookies = getCookies(res);
    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies.some((c: string) => c.includes('access_token='))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refresh_token='))).toBe(true);
    expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBe(true);
  });

  it('should simulate verifying email with verification token', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send(testUser);
    const token = signupRes.body.data.simulatedVerificationToken;

    const verifyRes = await request(app).get(`/api/v1/auth/verify-email/${token}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.user.isEmailVerified).toBe(true);
  });

  it('should login an existing user and return fresh tokens', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe(testUser.email);

    const cookies = getCookies(loginRes);
    expect(cookies.some((c: string) => c.includes('access_token='))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refresh_token='))).toBe(true);
  });

  it('should rotate refresh token and issue new token pair', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send(testUser);
    const cookies = getCookies(signupRes);
    const refreshTokenCookie = cookies.find((c: string) => c.includes('refresh_token=')) || '';

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [refreshTokenCookie]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);

    const newCookies = getCookies(refreshRes);
    expect(newCookies.some((c: string) => c.includes('access_token='))).toBe(true);
    expect(newCookies.some((c: string) => c.includes('refresh_token='))).toBe(true);

    // Old refresh token reuse should be rejected
    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [refreshTokenCookie]);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.message).toContain('Refresh token reuse detected');
  });

  it('should support forgot password and reset password flow', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);

    const forgotRes = await request(app).post('/api/v1/auth/forgot-password').send({
      email: testUser.email
    });

    expect(forgotRes.status).toBe(200);
    const resetToken = forgotRes.body.data.simulatedResetToken;
    expect(resetToken).toBeDefined();

    const newPassword = 'NewSuperPassword456!';
    const resetRes = await request(app).post('/api/v1/auth/reset-password').send({
      token: resetToken,
      newPassword
    });

    expect(resetRes.status).toBe(200);

    // Verify login with new password
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: newPassword
    });

    expect(loginRes.status).toBe(200);
  });
});
