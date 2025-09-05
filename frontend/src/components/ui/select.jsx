import * as React from "react";
import PropTypes from "prop-types";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "../../lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-[var(--color-background)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-250 ease-in-out hover:border-[var(--color-ring)]",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-card-foreground)] shadow-md transition-all duration-250 ease-in-out data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut data-[state=open]:animate-zoomIn data-[state=closed]:animate-zoomOut",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-[var(--color-muted)] focus:text-[var(--color-foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-all duration-150 ease-in-out hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M5 12l5 5 9-9" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[var(--color-border)]", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// PropTypes
Select.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  name: PropTypes.string
};

SelectGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

SelectValue.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  children: PropTypes.node
};

SelectTrigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool,
  disabled: PropTypes.bool
};

SelectContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(["popper", "item-aligned"]),
  side: PropTypes.oneOf(["top", "right", "bottom", "left"]),
  sideOffset: PropTypes.number,
  align: PropTypes.oneOf(["start", "center", "end"]),
  alignOffset: PropTypes.number,
  avoidCollisions: PropTypes.bool,
  forceMount: PropTypes.bool
};

SelectLabel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

SelectItem.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  textValue: PropTypes.string,
  asChild: PropTypes.bool
};

SelectSeparator.propTypes = {
  className: PropTypes.string
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};