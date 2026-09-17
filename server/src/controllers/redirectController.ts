import { Request, Response, NextFunction } from 'express';
import { LinkService } from '../services/linkService';
import { TelemetryService } from '../services/telemetryService';

export class RedirectController {
  static async handleRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const { shortCode } = req.params;

      if (!shortCode) {
        return res.status(404).json({
          success: false,
          message: 'Short code is required.'
        });
      }

      // Fast-path lookup
      const link = await LinkService.findActiveByShortCode(shortCode);

      if (!link) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Link Not Found</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #18181b; border: 1px solid #27272a; padding: 2.5rem; border-radius: 0.75rem; max-width: 420px; text-align: center; }
              h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
              p { color: #a1a1aa; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
              a { display: inline-block; background: #fafafa; color: #18181b; text-decoration: none; padding: 0.6rem 1.25rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.9rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Not Found</h1>
              <p>The short link <code>/r/${shortCode}</code> does not exist, has expired, or has been archived.</p>
              <a href="/">Go to Hub Homepage</a>
            </div>
          </body>
          </html>
        `);
      }

      // Extract client telemetry metadata
      const rawIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1';

      const referrer = req.get('referrer') || req.get('referer') || 'Direct';
      const userAgent = req.get('user-agent') || '';

      // Asynchronous non-blocking fire-and-forget telemetry logging
      setImmediate(() => {
        TelemetryService.recordClick(link._id.toString(), {
          ip: rawIp,
          referrer,
          userAgent
        }).catch((err) => {
          console.error('[RedirectController] Background telemetry error:', err);
        });
      });

      // Strictly 302 Found redirect (disabling browser client cache to ensure telemetry accuracy)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return res.redirect(302, link.originalUrl);
    } catch (error) {
      next(error);
    }
  }
}
