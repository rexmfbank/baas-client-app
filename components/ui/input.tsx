import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] shadow-xs ring-offset-background transition-colors duration-200 ease-luxury",
          "placeholder:text-muted-foreground/70 file:border-0 file:bg-transparent file:text-[12px] file:font-medium file:text-foreground",
          "hover:border-border-strong",
          "focus-visible:outline-none focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-accent/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
