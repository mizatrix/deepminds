/**
 * UI Animation utilities and components for enhanced UX
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

// Fade in animation variants
export const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};

// Scale animation for buttons/cards
export const scaleIn = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 }
};

// Slide animations
export const slideInLeft = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 }
};

export const slideInRight = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
};

export const slideInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
};

// Stagger children animation
export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

export const staggerItem = {
    initial: { opacity: 0, y: 15 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

// Button press animation
export const buttonPress = {
    scale: 0.97,
    transition: { duration: 0.1 }
};

export const buttonHover = {
    scale: 1.02,
    transition: { duration: 0.2 }
};

// Card hover animation
export const cardHover = {
    y: -4,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.2 }
};

// Pulse animation for notifications/badges
export const pulse = {
    scale: [1, 1.05, 1],
    transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
    }
};

// Shake animation for errors
export const shake = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 }
};

// Default transition settings
export const defaultTransition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] // Tailwind's default easing
};

// Motion component wrappers for cleaner usage
interface AnimatedDivProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
}

export function FadeInDiv({ children, ...props }: AnimatedDivProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={defaultTransition}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function ScaleInDiv({ children, ...props }: AnimatedDivProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={scaleIn}
            transition={defaultTransition}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({ children, className, ...props }: AnimatedDivProps & { className?: string }) {
    return (
        <motion.div
            className={className}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, ...props }: AnimatedDivProps) {
    return (
        <motion.div
            variants={staggerItem}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Animated button component
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
    children: React.ReactNode;
}

export function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
    return (
        <motion.button
            whileHover={buttonHover}
            whileTap={buttonPress}
            {...props}
        >
            {children}
        </motion.button>
    );
}

// Animated card component
export function AnimatedCard({ children, className, ...props }: AnimatedDivProps & { className?: string }) {
    return (
        <motion.div
            className={className}
            whileHover={cardHover}
            initial="initial"
            animate="animate"
            variants={fadeIn}
            transition={defaultTransition}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Page transition wrapper
export function PageTransition({ children, ...props }: AnimatedDivProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// List transition wrapper (for items that come in successively)
export function ListTransition({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.ul
            className={className}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            {children}
        </motion.ul>
    );
}

export function ListItem({ children, ...props }: Omit<HTMLMotionProps<'li'>, 'children'> & { children: React.ReactNode }) {
    return (
        <motion.li
            variants={staggerItem}
            {...props}
        >
            {children}
        </motion.li>
    );
}
