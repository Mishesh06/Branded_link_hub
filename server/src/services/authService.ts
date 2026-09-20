import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { BioProfile } from '../models/BioProfile';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateRandomToken,
  verifyRefreshToken
} from '../utils/tokens';
import { AppError } from '../middleware/errorHandler';
import { SignupInput, LoginInput, ResetPasswordInput } from '../validators/authValidator';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
  simulatedVerificationToken?: string;
}

export class AuthService {
  static async signup(input: SignupInput): Promise<AuthResponse> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const rawVerificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(rawVerificationToken);

    const user = new User({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      refreshTokenHashes: []
    });

    await user.save();

    // auto-gen a username from their name
    let baseUsername = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
    if (!baseUsername) baseUsername = 'user';
    let candidateUsername = baseUsername;
    let count = 1;
    while (await BioProfile.findOne({ username: candidateUsername })) {
      candidateUsername = `${baseUsername}${count++}`;
    }

    await BioProfile.create({
      userId: user._id,
      username: candidateUsername,
      displayName: input.name,
      bio: `Welcome to my curated links hub!`,
      theme: 'minimal-light',
      socialLinks: []
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    const hashedRefresh = hashToken(refreshToken);

    user.refreshTokenHashes.push(hashedRefresh);
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken,
      simulatedVerificationToken: rawVerificationToken
    };
  }

  static async verifyEmail(token: string): Promise<IUser> {
    const hashed = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashed
    }).select('+emailVerificationToken');

    if (!user) {
      throw new AppError('Invalid or expired email verification token.', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    return user;
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const user = await User.findOne({ email: input.email.toLowerCase() })
      .select('+passwordHash +refreshTokenHashes');

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    const hashedRefresh = hashToken(refreshToken);

    // cap at 5 active sessions, drop oldest
    const activeTokens = user.refreshTokenHashes || [];
    user.refreshTokenHashes = [...activeTokens.slice(-4), hashedRefresh];
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    };
  }

  static async refresh(oldRefreshToken: string): Promise<AuthResponse> {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }

    const user = await User.findById(payload.userId).select('+refreshTokenHashes');
    if (!user) {
      throw new AppError('User not found.', 401);
    }

    const oldHash = hashToken(oldRefreshToken);
    const tokenIndex = user.refreshTokenHashes.indexOf(oldHash);

    // reuse detected — nuke all sessions for this user
      user.refreshTokenHashes = [];
      await user.save();
      throw new AppError(
        'Security Alert: Refresh token reuse detected. All active sessions have been terminated. Please log in again.',
        401
      );
    }

    // rotate: drop old, issue fresh pair
    user.refreshTokenHashes.splice(tokenIndex, 1);

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    const newHash = hashToken(refreshToken);

    user.refreshTokenHashes.push(newHash);
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    };
  }

  static async logout(userId: string, currentRefreshToken?: string): Promise<void> {
    const user = await User.findById(userId).select('+refreshTokenHashes');
    if (user && currentRefreshToken) {
      const hash = hashToken(currentRefreshToken);
      user.refreshTokenHashes = user.refreshTokenHashes.filter((h) => h !== hash);
      await user.save();
    }
  }

  static async forgotPassword(email: string): Promise<{ simulatedResetToken?: string }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordResetToken +passwordResetExpires'
    );

    if (!user) {
      // don't leak whether the email exists
      return {};
    }

    const rawToken = generateRandomToken();
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour TTL
    await user.save();

    return { simulatedResetToken: rawToken };
  }

  static async resetPassword(input: ResetPasswordInput): Promise<void> {
    const hashed = hashToken(input.token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetToken +passwordResetExpires +refreshTokenHashes');

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(input.newPassword, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenHashes = []; // log everyone out on pw reset
    await user.save();
  }
}
