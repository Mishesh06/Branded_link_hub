import { DeviceType } from '../models/ClickEvent';

/**
 * Classifies device type from the User-Agent HTTP header.
 */
export const detectDeviceType = (userAgent = ''): DeviceType => {
  const ua = userAgent.toLowerCase();

  if (!ua) {
    return 'Unknown';
  }

  // Tablet regex detection
  if (
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(
      ua
    )
  ) {
    return 'Tablet';
  }

  // Mobile regex detection
  if (
    /(mobi|ipod|iphone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos)/i.test(
      ua
    )
  ) {
    return 'Mobile';
  }

  // Desktop detection
  if (/(windows|macintosh|linux|cros)/i.test(ua)) {
    return 'Desktop';
  }

  return 'Unknown';
};
