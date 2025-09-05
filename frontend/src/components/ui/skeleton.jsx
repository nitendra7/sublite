import PropTypes from "prop-types";
import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-muted)] dark:bg-[var(--color-muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string,
  role: PropTypes.string,
  'aria-label': PropTypes.string
};

export { Skeleton };