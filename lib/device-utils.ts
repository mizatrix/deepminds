// Device detection utilities for audit logging

export interface DeviceInfo {
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    browserVersion: string;
    os: string;
    userAgent: string;
}

/**
 * Parse user agent string to extract device information
 */
export function getDeviceInfo(userAgent?: string): DeviceInfo {
    const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

    return {
        deviceType: detectDeviceType(ua),
        browser: detectBrowser(ua),
        browserVersion: detectBrowserVersion(ua),
        os: detectOS(ua),
        userAgent: ua
    };
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(ua: string): DeviceInfo['deviceType'] {
    const lowerUA = ua.toLowerCase();

    // Check for tablets first (they often contain 'mobile' too)
    if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
        return 'tablet';
    }

    // Check for mobile devices
    if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/i.test(lowerUA)) {
        return 'mobile';
    }

    // Check for desktop indicators
    if (/windows|macintosh|linux|ubuntu/i.test(lowerUA)) {
        return 'desktop';
    }

    return 'unknown';
}

/**
 * Detect browser name from user agent
 */
function detectBrowser(ua: string): string {
    // Order matters - check more specific browsers first
    if (/edg/i.test(ua)) return 'Edge';
    if (/opr|opera/i.test(ua)) return 'Opera';
    if (/brave/i.test(ua)) return 'Brave';
    if (/chrome|crios/i.test(ua)) return 'Chrome';
    if (/firefox|fxios/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
    if (/msie|trident/i.test(ua)) return 'Internet Explorer';
    if (/samsung/i.test(ua)) return 'Samsung Browser';

    return 'Unknown';
}

/**
 * Detect browser version from user agent
 */
function detectBrowserVersion(ua: string): string {
    let match;

    // Edge
    if ((match = ua.match(/edg\/(\d+(\.\d+)?)/i))) return match[1];

    // Opera
    if ((match = ua.match(/opr\/(\d+(\.\d+)?)/i))) return match[1];

    // Chrome
    if ((match = ua.match(/chrome\/(\d+(\.\d+)?)/i))) return match[1];

    // Firefox
    if ((match = ua.match(/firefox\/(\d+(\.\d+)?)/i))) return match[1];

    // Safari
    if ((match = ua.match(/version\/(\d+(\.\d+)?)/i))) return match[1];

    // IE
    if ((match = ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/i))) return match[1];

    return 'Unknown';
}

/**
 * Detect operating system from user agent
 */
function detectOS(ua: string): string {
    if (/windows nt 10/i.test(ua)) return 'Windows 10/11';
    if (/windows nt 6\.3/i.test(ua)) return 'Windows 8.1';
    if (/windows nt 6\.2/i.test(ua)) return 'Windows 8';
    if (/windows nt 6\.1/i.test(ua)) return 'Windows 7';
    if (/windows/i.test(ua)) return 'Windows';

    if (/iphone os (\d+)/i.test(ua)) {
        const match = ua.match(/iphone os (\d+)/i);
        return `iOS ${match ? match[1] : ''}`;
    }
    if (/ipad.*os (\d+)/i.test(ua)) {
        const match = ua.match(/os (\d+)/i);
        return `iPadOS ${match ? match[1] : ''}`;
    }
    if (/mac os x/i.test(ua)) return 'macOS';

    if (/android (\d+(\.\d+)?)/i.test(ua)) {
        const match = ua.match(/android (\d+(\.\d+)?)/i);
        return `Android ${match ? match[1] : ''}`;
    }

    if (/ubuntu/i.test(ua)) return 'Ubuntu';
    if (/linux/i.test(ua)) return 'Linux';
    if (/cros/i.test(ua)) return 'Chrome OS';

    return 'Unknown';
}

/**
 * Get client IP - needs to be called from server-side
 * This is a placeholder that returns empty on client
 */
export function getClientIP(request?: Request): string {
    if (!request) return '';

    // Check various headers that might contain the real IP
    const headers = request.headers;
    const forwardedFor = headers.get('x-forwarded-for');
    const realIP = headers.get('x-real-ip');
    const cfConnectingIP = headers.get('cf-connecting-ip'); // Cloudflare

    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwardedFor.split(',')[0].trim();
    }

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;

    return '';
}
