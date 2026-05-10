/**
 * Converts a direct R2 public URL to a proxied URL through our API.
 * This avoids CORS issues when previewing files in the browser.
 */
export function getProxiedEvidenceUrl(url: string | null | undefined): string | null {
    if (!url || url === 'No evidence uploaded') return null;
    
    // If it's already a proxied URL or a relative URL, return as-is
    if (url.startsWith('/api/evidence')) return url;
    
    // Proxy R2 URLs through our API
    if (url.includes('.r2.dev') || url.includes('r2.cloudflarestorage.com')) {
        return `/api/evidence?url=${encodeURIComponent(url)}`;
    }
    
    // Return other URLs as-is
    return url;
}
