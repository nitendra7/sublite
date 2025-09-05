import React from "react";
import PropTypes from "prop-types";
import { cn } from "../../lib/utils";

/**
 * ResponsiveContainer - A wrapper component that provides responsive behavior
 * for its children based on screen size.
 */
const ResponsiveContainer = ({
  children,
  className,
  breakpoint = "md",
  scrollable = true,
  ...props
}) => {
  // Determine the appropriate classes based on props
  const containerClasses = cn(
    "w-full",
    scrollable && "overflow-auto",
    breakpoint === "sm" && "sm:overflow-visible",
    breakpoint === "md" && "md:overflow-visible",
    breakpoint === "lg" && "lg:overflow-visible",
    breakpoint === "xl" && "xl:overflow-visible",
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  breakpoint: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  scrollable: PropTypes.bool,
};

export { ResponsiveContainer };