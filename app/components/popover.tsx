import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ReactNode } from "react";

type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function Popover({
  trigger,
  children,
  open,
  onOpenChange,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="  data-open:animate-fadeIn data-closed:animate-fadeOut"
          sideOffset={5}
          collisionPadding={8}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
