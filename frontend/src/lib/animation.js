/**
 * Animation utilities for consistent transitions and animations across components
 */

// Duration constants (in ms)
export const DURATIONS = {
  fast: 150,
  medium: 250,
  slow: 350,
  extraSlow: 500,
};

// Timing functions for animations
export const EASINGS = {
  // Standard easings
  default: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design standard easing
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',    // Material Design ease-in
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',    // Material Design ease-out
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design ease-in-out
  
  // Custom easings
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// CSS transition strings for common properties
export const TRANSITIONS = {
  default: `all ${DURATIONS.medium}ms ${EASINGS.default}`,
  fast: `all ${DURATIONS.fast}ms ${EASINGS.default}`,
  slow: `all ${DURATIONS.slow}ms ${EASINGS.default}`,
  
  // Property-specific transitions
  transform: `transform ${DURATIONS.medium}ms ${EASINGS.default}`,
  opacity: `opacity ${DURATIONS.medium}ms ${EASINGS.easeInOut}`,
  color: `color ${DURATIONS.fast}ms ${EASINGS.default}`,
  background: `background ${DURATIONS.fast}ms ${EASINGS.default}`,
  border: `border ${DURATIONS.fast}ms ${EASINGS.default}`,
  shadow: `box-shadow ${DURATIONS.medium}ms ${EASINGS.easeOut}`,
  
  // Combined property transitions
  button: `background ${DURATIONS.fast}ms ${EASINGS.default}, color ${DURATIONS.fast}ms ${EASINGS.default}, border-color ${DURATIONS.fast}ms ${EASINGS.default}, box-shadow ${DURATIONS.fast}ms ${EASINGS.easeOut}`,
  scale: `transform ${DURATIONS.medium}ms ${EASINGS.bounce}`,
  fadeIn: `opacity ${DURATIONS.medium}ms ${EASINGS.easeIn}`,
  fadeOut: `opacity ${DURATIONS.medium}ms ${EASINGS.easeOut}`,
};

// Tailwind animation class utilities
export const ANIMATIONS = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideInFromTop: 'animate-slideInFromTop',
  slideOutToTop: 'animate-slideOutToTop',
  slideInFromBottom: 'animate-slideInFromBottom',
  slideOutToBottom: 'animate-slideOutToBottom',
  zoomIn: 'animate-zoomIn',
  zoomOut: 'animate-zoomOut',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};

// Helper function to create transition string for specific properties
export function createTransition(properties = ['all'], duration = DURATIONS.medium, easing = EASINGS.default) {
  if (Array.isArray(properties)) {
    return properties.map(prop => `${prop} ${duration}ms ${easing}`).join(', ');
  }
  return `${properties} ${duration}ms ${easing}`;
}

// Helper function to create animation delay
export function createDelay(delayInMs) {
  return `${delayInMs}ms`;
}