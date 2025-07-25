import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Base styling for input fields, including dark mode variants.
        "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
        "border-gray-400 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }