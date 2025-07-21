import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default button styling with dark mode variants.
        default: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:text-gray-100 dark:hover:bg-blue-800",
        // Destructive button styling with dark mode variants.
        destructive:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-gray-100 dark:hover:bg-red-800",
        // Outline button styling with dark mode variants.
        outline:
          "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-gray-100",
        // Secondary button styling with dark mode variants.
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
        // Ghost button styling with dark mode variants.
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100",
        // Link button styling with dark mode variants.
        link: "text-blue-500 underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }