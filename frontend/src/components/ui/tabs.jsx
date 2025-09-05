import * as React from "react"
import PropTypes from "prop-types"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-muted)] p-1 text-[var(--color-foreground)] dark:bg-[var(--color-muted)] dark:text-[var(--color-card-foreground)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-250 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]",
      "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--color-primary)] dark:data-[state=active]:bg-[var(--color-card)] dark:data-[state=active]:text-[var(--color-primary-light)]",
      "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted-hover)] dark:text-[var(--color-muted-foreground)] dark:hover:bg-[var(--color-muted-hover)]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-250 ease-in-out data-[state=active]:animate-fadeIn",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

TabsList.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

TabsTrigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  asChild: PropTypes.bool
};

TabsContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  value: PropTypes.string.isRequired,
  forceMount: PropTypes.bool,
  asChild: PropTypes.bool
};

Tabs.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  dir: PropTypes.oneOf(['ltr', 'rtl']),
  activationMode: PropTypes.oneOf(['automatic', 'manual']),
  children: PropTypes.node.isRequired
};

export { Tabs, TabsList, TabsTrigger, TabsContent }
