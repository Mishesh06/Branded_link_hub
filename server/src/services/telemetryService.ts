import { ClickEvent, DeviceType } from '../models/ClickEvent';
import { Link } from '../models/Link';
import { hashIpAddress } from '../utils/ipHash';
import { detectDeviceType } from '../utils/deviceDetector';

export interface ClickMetadata {
  ip: string;
  referrer?: string;
  userAgent?: string;
}

export class TelemetryService {
  /**
   * Logs a click event asynchronously and increments the link click count.
   * This is executed as a non-blocking operation following a 302 redirect.
   */
  static async recordClick(linkId: string, metadata: ClickMetadata): Promise<void> {
    try {
      const ipHash = hashIpAddress(metadata.ip || '127.0.0.1');
      const deviceType: DeviceType = detectDeviceType(metadata.userAgent);

      let cleanReferrer = 'Direct';
      if (metadata.referrer && metadata.referrer.trim()) {
        try {
          const refUrl = new URL(metadata.referrer.trim());
          cleanReferrer = refUrl.hostname.replace(/^www\./, '');
        } catch {
          cleanReferrer = metadata.referrer.slice(0, 50);
        }
      }

      await Promise.all([
        ClickEvent.create({
          linkId,
          timestamp: new Date(),
          referrer: cleanReferrer,
          deviceType,
          ipHash
        }),
        Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } })
      ]);
    } catch (error) {
      console.error('[TelemetryService] Error recording click telemetry:', error);
    }
  }
}
