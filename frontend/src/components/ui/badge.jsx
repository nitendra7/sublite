import * as React from "react";
import PropTypes from "prop-types";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold transition-all duration-250 ease-in-out hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
        secondary:
          "border-transparent bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-hover)]",
        destructive:
          "border-transparent bg-[var(--color-error)] text-white hover:bg-[var(--color-error-hover)]",
        outline: "text-[var(--color-foreground)] border-[var(--color-border)]",
        success: "border-transparent bg-[var(--color-success)] text-white",
        warning: "border-transparent bg-[var(--color-warning)] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = ({ className, variant, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    "default",
    "secondary",
    "destructive",
    "outline",
    "success",
    "warning",
  ]),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  id: PropTypes.string,
  style: PropTypes.object,
  title: PropTypes.string
};

export { Badge, badgeVariants };