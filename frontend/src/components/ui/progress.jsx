import * as React from "react";
import PropTypes from "prop-types";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/utils";

const Progress = React.forwardRef(({ className, value, max = 100, variant = "default", ...props }, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-[var(--color-success)]";
      case "warning":
        return "bg-[var(--color-warning)]";
      case "error":
        return "bg-[var(--color-error)]";
      case "default":
      default:
        return "bg-[var(--color-primary)]";
    }
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-muted)]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          getVariantStyles()
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

Progress.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  max: PropTypes.number,
  variant: PropTypes.oneOf(["default", "success", "warning", "error"]),
};

export { Progress };