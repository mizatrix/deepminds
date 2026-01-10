/**
 * Framer Motion animation variants for consistent animations across the app
 */

import { Variants } from "framer-motion";

/**
 * Fade in from bottom animation - standard page/card entry
 */
export const fadeInUp: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
        },
    },
};

/**
 * Stagger container - apply to parent elements with staggered children
 */
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

/**
 * Stagger item - apply to children of stagger container
 */
export const staggerItem: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

/**
 * Card hover effect - subtle lift and shadow
 */
export const cardHover: Variants = {
    initial: {
        scale: 1,
        y: 0,
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: 0.2,
            ease: "easeOut",
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
};

/**
 * Slide in from right - for side panels and drawers
 */
export const slideInRight: Variants = {
    initial: {
        x: "100%",
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        x: "100%",
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

/**
 * Slide in from left - for mobile menus
 */
export const slideInLeft: Variants = {
    initial: {
        x: "-100%",
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        x: "-100%",
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

/**
 * Scale in animation - for modals and popovers
 */
export const scaleIn: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: {
            duration: 0.15,
        },
    },
};

/**
 * Backdrop fade - for modal overlays
 */
export const backdropFade: Variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.2,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.15,
        },
    },
};

/**
 * List item animation - for dynamic lists
 */
export const listItem: Variants = {
    initial: {
        opacity: 0,
        x: -10,
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
        },
    },
    exit: {
        opacity: 0,
        x: 10,
        transition: {
            duration: 0.2,
        },
    },
};

/**
 * Pulse animation for notifications
 */
export const pulse: Variants = {
    initial: {
        scale: 1,
    },
    animate: {
        scale: [1, 1.1, 1],
        transition: {
            duration: 0.3,
            ease: "easeInOut",
        },
    },
};

/**
 * Shake animation for errors
 */
export const shake: Variants = {
    initial: {
        x: 0,
    },
    animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.5,
            ease: "easeInOut",
        },
    },
};
