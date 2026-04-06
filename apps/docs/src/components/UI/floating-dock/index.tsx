import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
    Reorder,
    type MotionValue,
} from "framer-motion";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../../utils/cn";
import { useIsMobile } from "./use-mobile";

const dockVariants = cva("flex mx-auto w-fit", {
    variants: {
        variant: {
            solid: "bg-dock-solid shadow-2xl shadow-black/40",
            outlined: "border-2 border-dock-outlined-border bg-transparent",
            glass:
                "bg-dock-glass backdrop-blur-xl border border-dock-outlined-border/40 shadow-2xl shadow-black/20",
            neon: "bg-dock-neon-bg border border-dock-neon-glow/30 shadow-[0_0_30px_-5px_hsl(var(--dock-neon-glow)/0.4),inset_0_1px_0_0_hsl(var(--dock-neon-glow)/0.1)]",
        },
        orientation: {
            horizontal: "flex-row items-end gap-3 px-5 pb-3 pt-4 rounded-2xl",
            vertical: "flex-col items-center gap-3 py-5 pl-3 pr-4 rounded-2xl",
        },
    },
    defaultVariants: { variant: "solid", orientation: "horizontal" },
});

const iconVariants = cva(
    "flex items-center justify-center rounded-xl cursor-pointer transition-colors duration-150 relative",
    {
        variants: {
            variant: {
                solid:
                    "bg-dock-icon-bg hover:bg-dock-icon-hover text-dock-solid-foreground",
                outlined:
                    "border border-dock-outlined-border text-foreground hover:bg-dock-icon-bg/20",
                glass:
                    "bg-dock-icon-bg/50 backdrop-blur-sm hover:bg-dock-icon-hover/60 text-dock-solid-foreground",
                neon: "bg-dock-neon-bg text-[hsl(var(--dock-neon-glow))] border border-dock-neon-glow/20 [filter:drop-shadow(0_0_5px_hsl(var(--dock-neon-glow)/0.3))] hover:border-dock-neon-glow/60 hover:shadow-[0_0_12px_-2px_hsl(var(--dock-neon-glow)/0.5)]",
            },
        },
        defaultVariants: { variant: "solid" },
    }
);

export interface DockItem {
    id?: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    separator?: boolean;
    active?: boolean;
    badge?: number;
    color?: string;
}

type Variant = "solid" | "outlined" | "glass" | "neon";
type Orientation = "horizontal" | "vertical";

interface FloatingDockProps extends VariantProps<typeof dockVariants> {
    items: DockItem[];
    className?: string;
    reorderable?: boolean;
    onReorder?: (items: DockItem[]) => void;
}

// DockSeparator
function DockSeparator({
    orientation,
    variant,
}: {
    orientation: Orientation;
    variant: Variant;
}) {
    const colourClass =
        variant === "neon" ? "bg-dock-outlined-border shadow-[0_0_8px_hsl(var(--dock-neon-glow)/0.8)]" : "bg-dock-separator/60";

    return orientation === "horizontal" ? (
        <div
            className={cn("w-px self-stretch my-2 shrink-0 rounded-full", colourClass)}
            role="separator"
            aria-orientation="vertical"
        />
    ) : (
        <div
            className={cn("h-px self-stretch mx-2 shrink-0 rounded-full", colourClass)}
            role="separator"
            aria-orientation="horizontal"
        />
    );
}

// DockTooltip
function DockTooltip({
    label,
    orientation,
    children,
}: {
    label: string;
    orientation: Orientation;
    children: React.ReactNode;
}) {
    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={orientation === "horizontal" ? "top" : "right"}
                        sideOffset={40}
                        className={cn(
                            "z-50 flex items-center rounded-md px-2.5 py-1 text-xs font-medium shadow-lg",
                            "bg-dock-icon-bg text-dock-solid-foreground",
                            "animate-in fade-in-0 zoom-in-95",
                            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                            "data-[side=top]:slide-in-from-bottom-2",
                            "data-[side=right]:slide-in-from-left-2"
                        )}
                    >
                        {label}
                        <TooltipPrimitive.Arrow className="fill-dock-icon-bg" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}

// DockBadge
function DockBadge({ count }: { count: number }) {
    const display = count > 99 ? "99+" : String(count);
    return (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none px-1 pointer-events-none z-10">
            {display}
        </span>
    );
}

// ActiveDot
function ActiveDot({
    orientation,
    variant,
    iconScale,
}: {
    orientation: Orientation;
    variant: Variant;
    iconScale: MotionValue<number>;
}) {
    const dotStyles = {
        solid: "bg-dock-solid-foreground/70",
        glass: "bg-dock-icon-hover shadow-[0_0_8px_rgba(255,255,255,0.4)]",
        outlined: "bg-dock-icon-hover",
        neon: "bg-dock-outlined-border shadow-[0_0_8px_hsl(var(--dock-neon-glow)/0.8)]",
    };

    const dotColor = dotStyles[variant];

    const dynamicOffset = useTransform(iconScale, (s: number) => {
        if (orientation === "horizontal") return 0;
        const halfWidth = 24 * s;
        return (halfWidth + 32);
    });

    return (
        <motion.span
            style={{
                left: orientation === "horizontal" ? "50%" : dynamicOffset,
                x: orientation === "horizontal" ? "-50%" : 0,
            }}
            className={cn(
                "absolute rounded-full w-1.5 h-1.5 pointer-events-none",
                dotColor,
                orientation === "horizontal" ? "-bottom-3" : "top-1/2 -translate-y-1/2"
            )}
        />
    );
}

// DockIconInner
const BASE_ICON_SIZE = 48;
const MAX_ICON_SIZE = 90;

function DockIconInner({
    item,
    variant,
    orientation,
    mousePos,
    isDragging,
}: {
    item: DockItem;
    variant: Variant;
    orientation: Orientation;
    mousePos: ReturnType<typeof useMotionValue<number>>;
    isDragging: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mousePos, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        return orientation === "horizontal"
            ? val - bounds.x - bounds.width / 2
            : val - bounds.y - bounds.height / 2;
    });

    const slotSize = useSpring(
        useTransform(distance, [-150, 0, 150], [BASE_ICON_SIZE, MAX_ICON_SIZE, BASE_ICON_SIZE]),
        { mass: 0.15, stiffness: 150, damping: 25 }
    );

    const iconScale = useTransform(slotSize, (s) => s / BASE_ICON_SIZE);

    const colorStyle: React.CSSProperties | undefined = item.color
        ? {
            backgroundColor: `color-mix(in srgb, ${item.color}, transparent 0%)`,
            borderColor: `color-mix(in srgb, ${item.color}, transparent 10%)`,
        }
        : undefined;

    const activeRingClass = item.active
        ? variant === "neon"
            ? "ring-3 ring-dock-neon-glow/50 bg-dock-neon-bg shadow-[0_0_8px_hsl(var(--dock-neon-glow)/0.4)]"
            : "ring-1 ring-dock-solid-foreground/10 bg-dock-icon-hover"
        : "";

    const iconEl = (
        <motion.div
            ref={ref}
            style={{
                width: orientation === "horizontal" ? slotSize : BASE_ICON_SIZE,
                height: orientation === "vertical" ? slotSize : BASE_ICON_SIZE,
            }}
            className={cn(
                "relative flex justify-center outline-none focus-visible:ring-2 focus-visible:ring-dock-neon-glow/60",
                orientation === "horizontal" ? "items-end" : "items-center",
                isDragging && "z-50"
            )}
            onClick={item.onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    item.onClick?.();
                }
            }}
            tabIndex={0}
            role="button"
            aria-label={item.label}
            aria-current={item.active ? "true" : undefined}
            aria-pressed={item.active}
        >
            <motion.div
                style={{
                    width: BASE_ICON_SIZE,
                    height: BASE_ICON_SIZE,
                    scale: iconScale,
                    transformOrigin: orientation === "horizontal" ? "bottom" : "center",
                    ...colorStyle,
                }}
                className={cn(iconVariants({ variant }), activeRingClass)}
            >
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                    <DockBadge count={item.badge} />
                )}
            </motion.div>

            {item.active && (
                <ActiveDot
                    orientation={orientation}
                    variant={variant}
                    iconScale={iconScale}
                />
            )}
        </motion.div>
    );

    if (isDragging) return iconEl;

    return (
        <DockTooltip label={item.label} orientation={orientation}>
            {iconEl}
        </DockTooltip>
    );
}

// ReorderableItem

function ReorderableItem({
    item,
    variant,
    orientation,
    mousePos,
}: {
    item: DockItem;
    variant: Variant;
    orientation: Orientation;
    mousePos: ReturnType<typeof useMotionValue<number>>;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const itemId = item.id ?? item.label;

    return (
        <>
            {item.separator && (
                <DockSeparator orientation={orientation} variant={variant} />
            )}
            <Reorder.Item
                value={itemId}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                style={{ listStyle: "none" }}
                className={cn("relative", isDragging && "z-50 scale-110")}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                layout
            >
                <DockIconInner
                    item={item}
                    variant={variant}
                    orientation={orientation}
                    mousePos={mousePos}
                    isDragging={isDragging}
                />
            </Reorder.Item>
        </>
    );
}

// StaticItem
function StaticItem({
    item,
    variant,
    orientation,
    mousePos,
}: {
    item: DockItem;
    variant: Variant;
    orientation: Orientation;
    mousePos: ReturnType<typeof useMotionValue<number>>;
}) {
    return (
        <>
            {item.separator && (
                <DockSeparator orientation={orientation} variant={variant} />
            )}
            <li style={{ listStyle: "none" }} className="relative">
                <DockIconInner
                    item={item}
                    variant={variant}
                    orientation={orientation}
                    mousePos={mousePos}
                    isDragging={false}
                />
            </li>
        </>
    );
}

// MobileDock

function MobileDock({
    items: initialItems,
    variant,
    reorderable,
    className,
    onReorder,
}: {
    items: DockItem[];
    variant: Variant;
    reorderable: boolean;
    className?: string;
    onReorder?: (items: DockItem[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const mousePos = useMotionValue(Infinity);

    const itemMap = useMemo(
        () => new Map(initialItems.map((it) => [it.id ?? it.label, it])),
        [initialItems]
    );

    const [orderedIds, setOrderedIds] = useState(() =>
        initialItems.map((it) => it.id ?? it.label)
    );

    useEffect(() => {
        setOrderedIds(initialItems.map((it) => it.id ?? it.label));
    }, [initialItems]);

    const handleReorder = (newIds: string[]) => {
        setOrderedIds(newIds);
        const reordered = newIds.map((id) => itemMap.get(id)!).filter(Boolean);
        onReorder?.(reordered);
    };

    const dockClass = cn(
        dockVariants({ variant, orientation: "vertical" }),
        "list-none p-0 m-0"
    );

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3",
                className
            )}
        >
            <AnimatePresence>
                {open && (
                    <>
                        {reorderable ? (
                            <Reorder.Group
                                axis="y"
                                values={orderedIds}
                                onReorder={handleReorder}
                                as="ul"
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                className={dockClass}
                                role="toolbar"
                                aria-label="Dock"
                            >
                                {orderedIds.map((id) => {
                                    const item = itemMap.get(id);
                                    if (!item) return null;
                                    return (
                                        <ReorderableItem
                                            key={id}
                                            item={item}
                                            variant={variant}
                                            orientation="vertical"
                                            mousePos={mousePos}
                                        />
                                    );
                                })}
                            </Reorder.Group>
                        ) : (
                            <motion.ul
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                className={dockClass}
                                role="toolbar"
                                aria-label="Dock"
                            >
                                {initialItems.map((item) => (
                                    <StaticItem
                                        key={item.id ?? item.label}
                                        item={item}
                                        variant={variant}
                                        orientation="vertical"
                                        mousePos={mousePos}
                                    />
                                ))}
                            </motion.ul>
                        )}
                    </>
                )}
            </AnimatePresence>

            <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={open ? "Close dock" : "Open dock"}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200",
                    open && "rotate-45",
                    variant === "neon"
                        ? "bg-dock-neon-bg border border-dock-neon-glow/40 text-[hsl(var(--dock-neon-glow))]"
                        : "bg-dock-solid text-dock-solid-foreground"
                )}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        </div>
    );
}

// Main export

export function FloatingDock({
    items: initialItems,
    variant = "solid",
    orientation = "horizontal",
    reorderable = false,
    className,
    onReorder,
}: FloatingDockProps) {
    const isMobile = useIsMobile();

    const v = variant!;
    const o = orientation!;

    const mousePos = useMotionValue(Infinity);

    const itemMap = useMemo(
        () => new Map(initialItems.map((it) => [it.id ?? it.label, it])),
        [initialItems]
    );

    const [orderedIds, setOrderedIds] = useState(() =>
        initialItems.map((it) => it.id ?? it.label)
    );

    useEffect(() => {
        setOrderedIds(initialItems.map((it) => it.id ?? it.label));
    }, [initialItems]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            mousePos.set(o === "horizontal" ? e.clientX : e.clientY);
        },
        [mousePos, o]
    );

    const handleReorder = (newIds: string[]) => {
        setOrderedIds(newIds);
        const reordered = newIds.map((id) => itemMap.get(id)!).filter(Boolean);
        onReorder?.(reordered);
    };

    if (isMobile) {
        return (
            <MobileDock
                items={initialItems}
                variant={v}
                reorderable={reorderable}
                className={className}
                onReorder={onReorder}
            />
        );
    }

    const listClass = cn(
        dockVariants({ variant: v, orientation: o }),
        "list-none m-0",
        className
    );

    const handleMouseLeave = () => mousePos.set(Infinity);

    if (!reorderable) {
        return (
            <ul
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={listClass}
                role="toolbar"
                aria-label="Dock"
                aria-orientation={o}
            >
                {initialItems.map((item) => (
                    <StaticItem
                        key={item.id ?? item.label}
                        item={item}
                        variant={v}
                        orientation={o}
                        mousePos={mousePos}
                    />
                ))}
            </ul>
        );
    }

    return (
        <Reorder.Group
            axis={o === "horizontal" ? "x" : "y"}
            values={orderedIds}
            onReorder={handleReorder}
            as="ul"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={listClass}
            role="toolbar"
            aria-label="Dock"
            aria-orientation={o}
        >
            {orderedIds.map((id) => {
                const item = itemMap.get(id);
                if (!item) return null;
                return (
                    <ReorderableItem
                        key={id}
                        item={item}
                        variant={v}
                        orientation={o}
                        mousePos={mousePos}
                    />
                );
            })}
        </Reorder.Group>
    );
}