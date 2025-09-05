import * as React from "react"
import PropTypes from "prop-types"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Base styling for input fields using CSS variables with responsive adjustments
        "flex h-9 sm:h-10 w-full rounded-md border px-2 sm:px-3 py-1 sm:py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-250 ease-in-out focus:shadow-sm",
        "border-[var(--color-input)] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Input.defaultProps = {
  type: "text",
};

export { Input }
