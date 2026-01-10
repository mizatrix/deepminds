import { useState, useCallback } from "react";

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
    const [announcement, setAnnouncement] = useState("");

    const announce = useCallback((message: string) => {
        setAnnouncement(message);
        // Clear after a delay to allow re-announcing the same message if needed
        setTimeout(() => setAnnouncement(""), 1000);
    }, []);

    return {
        announce,
        // Add this component to your layout or root to render the live region
        Announcer: () => (
            <div
                role="status"
                aria-live="polite"
                className="sr-only"
                aria-atomic="true"
            >
                {announcement}
            </div>
        )
    };
}
