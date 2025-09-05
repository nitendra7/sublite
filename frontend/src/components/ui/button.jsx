import * as React from "react"
import PropTypes from "prop-types"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { TRANSITIONS } from "../../lib/animation"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-250 ease-in-out hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Default button styling using CSS variables
        default: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)] dark:text-[var(--color-card-foreground)] dark:hover:bg-[var(--color-primary-hover)]",
        // Destructive button styling using CSS variables
        destructive:
          "bg-[var(--color-error)] text-white hover:bg-[var(--color-error-hover)] dark:bg-[var(--color-error)] dark:text-[var(--color-card-foreground)] dark:hover:bg-[var(--color-error-hover)]",
        // Outline button styling using CSS variables
        outline:
          "border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] dark:border-[var(--color-border)] dark:bg-[var(--color-card)] dark:hover:bg-[var(--color-muted)] dark:text-[var(--color-card-foreground)] dark:hover:text-[var(--color-card-foreground)]",
        // Secondary button styling using CSS variables
        secondary:
          "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted-foreground)] dark:bg-[var(--color-muted)] dark:text-[var(--color-card-foreground)] dark:hover:bg-[var(--color-muted-foreground)]",
        // Ghost button styling using CSS variables
        ghost: "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] dark:hover:bg-[var(--color-muted)] dark:hover:text-[var(--color-card-foreground)]",
        // Link button styling using CSS variables
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline dark:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-hover)]",
      },
      size: {
        default: "h-9 sm:h-10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm",
        sm: "h-8 sm:h-9 rounded-md px-2 sm:px-3 text-xs sm:text-sm",
        lg: "h-10 sm:h-11 rounded-md px-6 sm:px-8 text-sm",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  // If className contains a custom bg-*, do not apply the variant's background color
  const hasCustomBg = className && /bg-\w|bg-\[.*\]/.test(className);
  const mergedClassName = hasCustomBg
    ? cn(
        // Remove bg-* from variant
        buttonVariants({ variant: undefined, size, className: undefined }),
        className
      )
    : cn(buttonVariants({ variant, size, className }));
  return (
    <Comp
      className={mergedClassName}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
  asChild: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string,
  form: PropTypes.string,
  value: PropTypes.string,
  tabIndex: PropTypes.number,
  'aria-label': PropTypes.string,
  'aria-describedby': PropTypes.string,
  'aria-pressed': PropTypes.bool
};

Button.defaultProps = {
  variant: 'default',
  size: 'default',
  asChild: false,
  type: 'button'
};

export { Button, buttonVariants }
