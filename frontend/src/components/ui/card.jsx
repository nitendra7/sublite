import * as React from "react";
import PropTypes from "prop-types";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Minimal classes: default background, text, and shadow, with explicit dark mode variants.
    className={cn(
      "rounded-xl border bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Standard flex/spacing. Text colors handled by children.
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    // Basic text styling for titles, with explicit dark mode colors.
    className={cn(
      "font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    // Basic text styling for descriptions, with explicit dark mode colors.
    className={cn("text-sm text-gray-500 dark:text-gray-300", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Standard padding. Inherits text/background from parent Card.
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Standard flex/padding. Inherits text/background from parent Card.
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

Card.propTypes = {
  className: PropTypes.string
};

CardHeader.propTypes = {
  className: PropTypes.string
};

CardTitle.propTypes = {
  className: PropTypes.string
};

CardDescription.propTypes = {
  className: PropTypes.string
};

CardContent.propTypes = {
  className: PropTypes.string
};

CardFooter.propTypes = {
  className: PropTypes.string
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
