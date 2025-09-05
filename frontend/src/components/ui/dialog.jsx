import * as React from "react";
import PropTypes from "prop-types";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut transition-opacity duration-250 ease-in-out",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-h-[85vh] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-lg transition-all duration-350 ease-out data-[state=open]:animate-zoomIn data-[state=closed]:animate-zoomOut data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut sm:p-6 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-[var(--color-background)] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-[var(--color-muted)] data-[state=open]:text-[var(--color-muted-foreground)]">
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
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-[var(--color-foreground)]",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--color-muted-foreground)]", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// PropTypes
DialogOverlay.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  forceMount: PropTypes.bool
};

DialogContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  forceMount: PropTypes.bool,
  onEscapeKeyDown: PropTypes.func,
  onPointerDownOutside: PropTypes.func,
  onInteractOutside: PropTypes.func
};

DialogHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

DialogFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

DialogTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

DialogDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

Dialog.propTypes = {
  children: PropTypes.node.isRequired,
  open: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  onOpenChange: PropTypes.func,
  modal: PropTypes.bool
};

DialogTrigger.propTypes = {
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

DialogClose.propTypes = {
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};