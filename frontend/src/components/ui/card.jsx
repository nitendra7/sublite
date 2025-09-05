import * as React from "react";
import PropTypes from "prop-types";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Using CSS variables for consistent styling
    className={cn(
      "rounded-xl border bg-[var(--color-card)] text-[var(--color-card-foreground)] shadow border-[var(--color-border)] transition-all duration-250 ease-in-out hover:shadow-md",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Standard flex/spacing with responsive adjustments for smaller screens
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    // Using CSS variables for consistent styling
    className={cn(
      "font-semibold leading-none tracking-tight text-[var(--color-card-foreground)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    // Using CSS variables for consistent styling
    className={cn("text-sm text-[var(--color-muted-foreground)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Standard padding with responsive adjustments for smaller screens
    className={cn("p-4 pt-0 sm:p-6 sm:pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Standard flex/padding with responsive adjustments for smaller screens
    className={cn("flex flex-col sm:flex-row items-center gap-3 p-4 pt-0 sm:p-6 sm:pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
