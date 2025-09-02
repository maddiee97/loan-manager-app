// client/src/components/ui/icon-input.jsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

const IconInput = React.forwardRef(({ className, type, icon: Icon, ...props }, ref) => {
  const Comp = Icon ? Slot : "input";
  return (
    <div className="relative flex items-center">
      {Icon && (
        <span className="absolute left-3 flex items-center justify-center pointer-events-none">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-9", // Add left padding if icon is present
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
IconInput.displayName = "IconInput";

export { IconInput };