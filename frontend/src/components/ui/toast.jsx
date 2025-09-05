import * as React from "react";
import PropTypes from "prop-types";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-[var(--color-border)] p-6 pr-8 shadow-lg transition-all duration-350 ease-out data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-slideInFromRight data-[state=closed]:animate-slideOutToRight",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-card)] text-[var(--color-card-foreground)]",
        destructive:
          "destructive group border-[var(--color-error)] bg-[var(--color-error)] text-white",
        success:
          "success group border-[var(--color-success)] bg-[var(--color-success)] text-white",
        warning:
          "warning group border-[var(--color-warning)] bg-[var(--color-warning)] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm font-medium ring-offset-[var(--color-background)] transition-all duration-250 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-[var(--color-error)]/30 group-[.destructive]:hover:border-[var(--color-error)]/30 group-[.destructive]:hover:bg-[var(--color-error)] group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-[var(--color-error)] group-[.success]:border-[var(--color-success)]/30 group-[.success]:hover:border-[var(--color-success)]/30 group-[.success]:hover:bg-[var(--color-success)] group-[.success]:hover:text-white group-[.success]:focus:ring-[var(--color-success)] group-[.warning]:border-[var(--color-warning)]/30 group-[.warning]:hover:border-[var(--color-warning)]/30 group-[.warning]:hover:bg-[var(--color-warning)] group-[.warning]:hover:text-white group-[.warning]:focus:ring-[var(--color-warning)]",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-[var(--color-foreground)]/50 opacity-0 transition-all duration-250 ease-in-out hover:scale-[1.1] hover:text-[var(--color-foreground)] focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 group-[.success]:text-green-300 group-[.success]:hover:text-green-50 group-[.success]:focus:ring-green-400 group-[.success]:focus:ring-offset-green-600 group-[.warning]:text-yellow-300 group-[.warning]:hover:text-yellow-50 group-[.warning]:focus:ring-yellow-400 group-[.warning]:focus:ring-offset-yellow-600",
      className
    )}
    {...props}
  >
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
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// PropTypes
ToastViewport.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  hotkey: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string
};

Toast.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "destructive", "success", "warning"]),
  children: PropTypes.node,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  defaultOpen: PropTypes.bool,
  forceMount: PropTypes.bool
};

ToastAction.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  altText: PropTypes.string.isRequired,
  asChild: PropTypes.bool
};

ToastClose.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  asChild: PropTypes.bool
};

ToastTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  asChild: PropTypes.bool
};

ToastDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  asChild: PropTypes.bool
};

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};