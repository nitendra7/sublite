import * as React from "react";
import PropTypes from "prop-types";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[var(--color-foreground)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-background)] text-[var(--color-foreground)] border-[var(--color-border)]",
        destructive:
          "border-[var(--color-error)] text-[var(--color-error)] dark:border-[var(--color-error)]",
        success:
          "border-[var(--color-success)] text-[var(--color-success)] dark:border-[var(--color-success)]",
        warning:
          "border-[var(--color-warning)] text-[var(--color-warning)] dark:border-[var(--color-warning)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "destructive", "success", "warning"]),
};

AlertTitle.propTypes = {
  className: PropTypes.string,
};

AlertDescription.propTypes = {
  className: PropTypes.string,
};

export { Alert, AlertTitle, AlertDescription };