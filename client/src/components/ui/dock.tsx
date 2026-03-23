import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
 
interface DockProps {
  /** Distance threshold for magnification effect */
  magnification?: number;
  /** Maximum scale factor when hovered */
  maxScale?: number;
  /** Base size of dock items in pixels */
  iconSize?: number;
  /** Distance from mouse to apply magnification */
  distance?: number;
  /** Orientation of the dock */
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
}
 
const DockContext = React.createContext<{
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  magnification: number;
  maxScale: number;
  iconSize: number;
  distance: number;
  orientation: "horizontal" | "vertical";
} | null>(null);
 
const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      magnification = 60,
      maxScale = 1.5,
      iconSize = 48,
      distance = 140,
      orientation = "horizontal",
    },
    ref,
  ) => {
    const mouseX = useMotionValue(Infinity);
    const mouseY = useMotionValue(Infinity);
 
    const isVertical = orientation === "vertical";

    return (
      <DockContext.Provider
        value={{ mouseX, mouseY, magnification, maxScale, iconSize, distance, orientation }}
      >
        <motion.div
          ref={ref}
          onMouseMove={(e) => {
            if (isVertical) {
              mouseY.set(e.pageY);
            } else {
              mouseX.set(e.pageX);
            }
          }}
          onMouseLeave={() => {
            mouseX.set(Infinity);
            mouseY.set(Infinity);
          }}
          className={cn(
            "dock flex gap-2 rounded-full border border-white/10 backdrop-blur-md overflow-visible",
            "shadow-lg shadow-black/20",
            isVertical
              ? "flex-col items-center py-3 px-2 w-16"
              : "mx-auto flex-row h-16 items-end px-3 pb-2",
            className,
          )}
        >
          {children}
        </motion.div>
      </DockContext.Provider>
    );
  },
);
Dock.displayName = "Dock";
 
interface DockItemProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}
 
const DockItemContext = React.createContext<{ isHovered: boolean }>({ isHovered: false });

const DockItem = React.forwardRef<HTMLDivElement, DockItemProps>(
  ({ className, children, onClick }, _ref) => {
    const context = React.useContext(DockContext);
    const itemRef = React.useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = React.useState(false);
 
    if (!context) {
      throw new Error("DockItem must be used within a Dock");
    }
 
    const { mouseX, mouseY, maxScale, iconSize, distance, orientation } = context;
    const isVertical = orientation === "vertical";

    const distanceCalc = useTransform(
      isVertical ? mouseY : mouseX,
      (val: number) => {
        const bounds = itemRef.current?.getBoundingClientRect() ?? {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        };
        if (isVertical) {
          return val - bounds.y - bounds.height / 2;
        }
        return val - bounds.x - bounds.width / 2;
      },
    );
 
    const sizeSync = useTransform(
      distanceCalc,
      [-distance, 0, distance],
      [iconSize, iconSize * maxScale, iconSize],
    );
 
    const size = useSpring(sizeSync, {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    });
 
    return (
      <DockItemContext.Provider value={{ isHovered }}>
        <motion.div
          ref={itemRef}
          style={{ width: size, height: size }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "dock-item group relative flex aspect-square cursor-pointer items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80 overflow-visible",
            className,
          )}
        >
          {children}
        </motion.div>
      </DockItemContext.Provider>
    );
  },
);
DockItem.displayName = "DockItem";
 
interface DockIconProps {
  className?: string;
  children?: React.ReactNode;
}
 
const DockIcon = React.forwardRef<HTMLDivElement, DockIconProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "dock-icon flex h-full w-full items-center justify-center text-foreground",
          "[&>svg]:h-1/2 [&>svg]:w-1/2",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
DockIcon.displayName = "DockIcon";
 
interface DockLabelProps {
  className?: string;
  children?: React.ReactNode;
}
 
const DockLabel = React.forwardRef<HTMLDivElement, DockLabelProps>(
  ({ className, children }, ref) => {
    const context = React.useContext(DockContext);
    const { isHovered } = React.useContext(DockItemContext);
    const isVertical = context?.orientation === "vertical";

    return (
      <AnimatePresence>
        {isHovered && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.8, x: isVertical ? -4 : 0, y: isVertical ? 0 : 4 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: isVertical ? -4 : 0, y: isVertical ? 0 : 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "dock-label pointer-events-none absolute whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-background text-xs font-medium z-50",
              isVertical
                ? "left-full ml-4 top-1/2 -translate-y-1/2"
                : "-top-10 left-1/2 -translate-x-1/2",
              className,
            )}
          >
            {children}
            <div
              className={cn(
                "absolute h-2 w-2 rotate-45 bg-foreground",
                isVertical
                  ? "-left-1 top-1/2 -translate-y-1/2"
                  : "-bottom-1 left-1/2 -translate-x-1/2",
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
DockLabel.displayName = "DockLabel";
 
interface DockSeparatorProps {
  className?: string;
}
 
const DockSeparator = React.forwardRef<HTMLDivElement, DockSeparatorProps>(
  ({ className }, ref) => {
    const context = React.useContext(DockContext);
    const isVertical = context?.orientation === "vertical";

    return (
      <div
        ref={ref}
        className={cn(
          "dock-separator self-center bg-border",
          isVertical ? "my-1 h-px w-10" : "mx-1 h-10 w-px",
          className,
        )}
      />
    );
  },
);
DockSeparator.displayName = "DockSeparator";
 
export {
  Dock,
  DockIcon,
  DockItem,
  DockLabel,
  DockSeparator,
  type DockIconProps,
  type DockItemProps,
  type DockLabelProps,
  type DockProps,
  type DockSeparatorProps,
};