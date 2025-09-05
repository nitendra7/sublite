import * as React from "react"
import PropTypes from "prop-types"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "../../lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      // Default: light background, dark text. Dark Mode: dark background, light text.
      "z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-gray-900 shadow-md transition-all duration-200 ease-in-out data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut data-[state=open]:animate-zoomIn data-[state=closed]:animate-zoomOut",
      "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600", // Added dark mode styling
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

TooltipContent.propTypes = {
  className: PropTypes.string,
  sideOffset: PropTypes.number
};

TooltipContent.defaultProps = {
  sideOffset: 4
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  delayDuration: PropTypes.number
};

TooltipTrigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

TooltipProvider.propTypes = {
  children: PropTypes.node.isRequired,
  delayDuration: PropTypes.number,
  skipDelayDuration: PropTypes.number,
  disableHoverableContent: PropTypes.bool
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
