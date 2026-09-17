import { BioProfile, IBioProfile } from '../models/BioProfile';
import { Link, ILink } from '../models/Link';
import { AppError } from '../middleware/errorHandler';
import { UpdateBioInput } from '../validators/bioValidator';

export interface PublicBioResult {
  profile: IBioProfile;
  links: ILink[];
}

export class BioService {
  static async getProfileByUserId(userId: string): Promise<IBioProfile> {
    let profile = await BioProfile.findOne({ userId });
    if (!profile) {
      // Create fallback profile if missing
      profile = await BioProfile.create({
        userId,
        username: `user_${userId.slice(-6)}`,
        displayName: 'My Profile',
        bio: 'Welcome to my links page.',
        theme: 'minimal-light',
        socialLinks: []
      });
    }
    return profile;
  }

  static async updateProfile(userId: string, input: UpdateBioInput): Promise<IBioProfile> {
    const profile = await BioProfile.findOne({ userId });
    if (!profile) {
      throw new AppError('Bio profile not found.', 404);
    }

    if (input.displayName !== undefined) profile.displayName = input.displayName;
    if (input.avatarUrl !== undefined) profile.avatarUrl = input.avatarUrl;
    if (input.bio !== undefined) profile.bio = input.bio;
    if (input.theme !== undefined) profile.theme = input.theme;
    if (input.socialLinks !== undefined) profile.socialLinks = input.socialLinks;
    if (input.showcaseLinkIds !== undefined) {
      // Validate that showcase links belong to this user
      const validLinks = await Link.find({
        _id: { $in: input.showcaseLinkIds },
        userId,
        status: 'active'
      }).select('_id');
      profile.showcaseLinkIds = validLinks.map((l) => l._id as any);
    }

    await profile.save();
    return profile;
  }

  static async getPublicProfile(username: string): Promise<PublicBioResult> {
    const cleanUsername = username.toLowerCase().trim();
    const profile = await BioProfile.findOne({ username: cleanUsername });

    if (!profile) {
      throw new AppError(`Bio profile @${cleanUsername} was not found.`, 404);
    }

    let links: ILink[] = [];

    // If showcase links are selected, retrieve those; otherwise retrieve user's top active links
    if (profile.showcaseLinkIds && profile.showcaseLinkIds.length > 0) {
      links = await Link.find({
        _id: { $in: profile.showcaseLinkIds },
        status: 'active'
      }).select('title shortCode originalUrl clickCount');
    } else {
      links = await Link.find({
        userId: profile.userId,
        status: 'active'
      })
        .sort({ clickCount: -1, createdAt: -1 })
        .limit(10)
        .select('title shortCode originalUrl clickCount');
    }

    return {
      profile,
      links
    };
  }
}
