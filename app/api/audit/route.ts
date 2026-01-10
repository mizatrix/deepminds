import { NextRequest, NextResponse } from 'next/server';

interface LocationInfo {
    city: string;
    country: string;
    ip: string;
}

/**
 * Look up location from IP address using free ip-api.com service
 */
async function getLocationFromIP(ip: string): Promise<LocationInfo> {
    // Skip for localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { city: 'Local', country: 'Development', ip: ip || 'localhost' };
    }

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,query`, {
            // Add timeout
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            return { city: 'Unknown', country: 'Unknown', ip };
        }

        const data = await response.json();

        if (data.status === 'success') {
            return {
                city: data.city || 'Unknown',
                country: data.country || 'Unknown',
                ip: data.query || ip
            };
        }
    } catch (error) {
        console.error('Failed to get location from IP:', error);
    }

    return { city: 'Unknown', country: 'Unknown', ip };
}

/**
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string {
    // Check various headers that might contain the real IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare

    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwardedFor.split(',')[0].trim();
    }

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;

    // Fallback - try to get from connection (won't work in serverless)
    return '127.0.0.1';
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userAgent = request.headers.get('user-agent') || '';
        const clientIP = getClientIP(request);

        // Get location from IP
        const location = await getLocationFromIP(clientIP);

        // Build response with device and location info
        const auditData = {
            ...body,
            ipAddress: location.ip,
            city: location.city,
            country: location.country,
            userAgent: userAgent,
            timestamp: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: auditData
        });
    } catch (error) {
        console.error('Audit API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process audit log' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // Return client info for testing
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const location = await getLocationFromIP(clientIP);

    return NextResponse.json({
        ip: location.ip,
        city: location.city,
        country: location.country,
        userAgent: userAgent
    });
}
