import { BioProfile, IBioProfile } from '../models/BioProfile';
import { Link, ILink } from '../models/Link';
import { AppError } from '../middleware/errorHandler';
import { UpdateBioInput } from '../validators/bioValidator';

export interface PublicBioResult {
  profile: IBioProfile;
  links: ILink[];
}

// TODO: maybe auto-create on signup instead of lazily here
export class BioService {
  static async getProfileByUserId(userId: string): Promise<IBioProfile> {
    let profile = await BioProfile.findOne({ userId });
    if (!profile) {
      // first time hitting the bio page — spin up a default
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
      // make sure they can't pin other people's links
      const validLinks = await Link.find({
        _id: { $in: input.showcaseLinkIds },
        userId,
        status: 'active'
      }).select('_id');

      if (validLinks.length !== input.showcaseLinkIds.length) {
        throw new AppError(
          'Unauthorized: You can only showcase active links that you own.',
          403
        );
      }

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

    // if they've curated links, use those; otherwise fall back to their top 10
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
