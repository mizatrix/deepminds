"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    delay?: number;
}

/**
 * Animated wrapper for page content with fade-in-up animation
 */
export function AnimatedPage({ children, className = "", delay = 0, ...props }: AnimatedContainerProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeInUp}
            transition={{ delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface StaggeredContainerProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
}

/**
 * Container for staggered children animations
 */
export function StaggeredContainer({ children, className = "", ...props }: StaggeredContainerProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface StaggeredItemProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
}

/**
 * Animated item for use inside StaggeredContainer
 */
export function StaggeredItem({ children, className = "", ...props }: StaggeredItemProps) {
    return (
        <motion.div
            variants={staggerItem}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface HoverCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
}

/**
 * Card with hover lift animation
 */
export function HoverCard({ children, className = "", ...props }: HoverCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface FadeInProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    duration?: number;
}

/**
 * Versatile fade-in animation with directional support
 */
export function FadeIn({
    children,
    className = "",
    direction = "up",
    delay = 0,
    duration = 0.4,
    ...props
}: FadeInProps) {
    const directionOffset = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directionOffset[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
