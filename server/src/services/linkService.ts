import { Link, ILink } from '../models/Link';
import { ClickEvent } from '../models/ClickEvent';
import { BioProfile } from '../models/BioProfile';
import { generateShortCode } from '../utils/shortCodeGenerator';
import { AppError } from '../middleware/errorHandler';
import { CreateLinkInput, LinkQueryInput, isSelfReferencingRedirect } from '../validators/linkValidator';

export interface PaginatedLinks {
  links: ILink[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class LinkService {
  static async createLink(userId: string, input: CreateLinkInput): Promise<ILink> {
    let shortCode: string;
    let isCustomSlug = false;

    if (input.customSlug) {
      const slugCandidate = input.customSlug.trim();
      const existing = await Link.findOne({ shortCode: slugCandidate });
      if (existing) {
        throw new AppError(
          `The custom slug "${slugCandidate}" is already in use. Please choose another.`,
          409
        );
      }
      shortCode = slugCandidate;
      isCustomSlug = true;
    } else {
      // retry up to 5 times on collision (very rare)
      let candidate = generateShortCode(6);
      let attempts = 0;
      while ((await Link.findOne({ shortCode: candidate })) && attempts < 5) {
        candidate = generateShortCode(6);
        attempts++;
      }
      shortCode = candidate;
    }

    if (isSelfReferencingRedirect(input.originalUrl, shortCode)) {
      throw new AppError(
        'Self-referencing redirect loops are not permitted. Original URL cannot point to the /r/ redirect engine.',
        400
      );
    }

    // fall back to hostname if no title given
    let title = input.title?.trim();
    if (!title) {
      try {
        const urlObj = new URL(input.originalUrl);
        title = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname.slice(0, 20) : '');
      } catch {
        title = input.originalUrl.slice(0, 30);
      }
    }

    try {
      const link = await Link.create({
        userId,
        originalUrl: input.originalUrl.trim(),
        shortCode,
        title,
        isCustomSlug,
        clickCount: 0,
        status: 'active'
      });
      return link;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new AppError(
          `The short code "${shortCode}" already exists. Please choose another slug.`,
          409
        );
      }
      throw err;
    }
  }

  static async getLinks(userId: string, query: LinkQueryInput): Promise<PaginatedLinks> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: any = { userId, status: 'active' };

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { shortCode: searchRegex },
        { originalUrl: searchRegex }
      ];
    }

    const [links, total] = await Promise.all([
      Link.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Link.countDocuments(filter)
    ]);

    return {
      links: links as unknown as ILink[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  static async getLinkById(userId: string, linkId: string): Promise<ILink> {
    const link = await Link.findOne({ _id: linkId, userId });
    if (!link) {
      throw new AppError('Link not found or unauthorized access.', 404);
    }
    return link;
  }

  static async deleteLink(userId: string, linkId: string): Promise<void> {
    const link = await Link.findOneAndDelete({ _id: linkId, userId });
    if (!link) {
      throw new AppError('Link not found or unauthorized access.', 404);
    }

    // clean up clicks too
    await ClickEvent.deleteMany({ linkId: link._id });

    // remove from bio showcase if it was pinned there
    await BioProfile.updateOne(
      { userId },
      { $pull: { showcaseLinkIds: link._id } }
    );
  }

  static async findActiveByShortCode(shortCode: string): Promise<ILink | null> {
    return Link.findOne({ shortCode, status: 'active' }).select('_id originalUrl shortCode');
  }
}
