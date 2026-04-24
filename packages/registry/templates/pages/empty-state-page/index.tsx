import * as React from "react";
import { motion, type HTMLMotionProps, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../../utils/cn";
import { Button } from "../../../components/button";
import { Typography } from "../../../components/typography";
import { PlusIcon, QuestionMarkCircledIcon, UploadIcon, FileTextIcon } from "@radix-ui/react-icons";

// Interfaces 

export interface EmptyStateProps
    extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof emptyStateVariants> {
    children?: React.ReactNode;
    tilt?: boolean;
}

export interface EmptyStateIllustrationProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    icon?: React.ElementType;
    illustration?: React.ReactNode | string;
    iconSize?: number;
    accent?: "primary" | "teal" | "amber";
}

export interface EmptyStateHeadingProps
    extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color"> {
    title?: string;
}

export interface EmptyStateDescProps
    extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color"> {
    description?: string;
}

export interface EmptyStateActionsProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    children?: React.ReactNode;
}

export interface EmptyStateBadgeProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    label: string;
    dot?: boolean;
}

export interface EmptyStateHelpProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    linkText?: string;
    href?: string;
    icon?: React.ElementType;
}

// CVA Variants 

const emptyStateVariants = cva(
    [
        "relative flex flex-col items-center justify-center w-full min-h-[380px] p-8 text-center",
        "rounded-2xl border overflow-hidden",
        "transform-style-3d",
    ].join(" "),
    {
        variants: {
            variant: {
                default:
                    "bg-background border-dashed border-border/60 " +
                    "before:absolute before:inset-0 before:rounded-[inherit] " +
                    "before:bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.08),transparent_70%)] " +
                    "before:pointer-events-none",
                card:
                    "bg-card border-none shadow-[0_8px_32px_hsl(0_0%_0%/0.15)] " +
                    "before:absolute before:inset-0 before:rounded-[inherit] " +
                    "before:bg-[radial-gradient(ellipse_50%_30%_at_50%_0%,hsl(var(--primary)/0.06),transparent)] " +
                    "before:pointer-events-none",
                minimal:
                    "border-dashed border-border/40 bg-transparent min-h-[300px]",
                gradient:
                    "bg-gradient-to-b from-primary/[0.07] to-background " +
                    "border-primary/[0.12]",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

//  Animation configs 

const containerVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
};

const itemVariants = {
    initial: { opacity: 0, y: 18 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
    },
} as const;

const iconVariants = {
    initial: { scale: 0.75, opacity: 0, rotateX: 20 },
    animate: {
        scale: 1,
        opacity: 1,
        rotateX: 0,
        transition: { type: "spring", stiffness: 220, damping: 18, delay: 0.06 },
    },
} as const;

//  Particle system 

interface Particle { id: number; x: number; y: number; tx: number; ty: number; dur: number; del: number; size: number; }

function useParticles(count = 12): Particle[] {
    return React.useMemo<Particle[]>(
        () =>
            Array.from({ length: count }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: 30 + Math.random() * 55,
                tx: (Math.random() - 0.5) * 44,
                ty: -(28 + Math.random() * 52),
                dur: 3.2 + Math.random() * 3.8,
                del: Math.random() * 5,
                size: Math.random() > 0.5 ? 2 : 3,
            })),
        [count]
    );
}

//  Components 

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({ className, variant, children, tilt = true, style, ...props }, ref) => {
        const wrapRef = React.useRef<HTMLDivElement>(null);

        const rawX = useMotionValue(0);
        const rawY = useMotionValue(0);
        const springConfig = { stiffness: 180, damping: 22 };
        const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), springConfig);
        const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), springConfig);
        const translateZ = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

        const handleMouseMove = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (!tilt || !wrapRef.current) return;
                const r = wrapRef.current.getBoundingClientRect();
                rawX.set((e.clientX - r.left) / r.width - 0.5);
                rawY.set((e.clientY - r.top) / r.height - 0.5);
                translateZ.set(6);
            },
            [tilt, rawX, rawY, translateZ]
        );

        const handleMouseLeave = React.useCallback(() => {
            rawX.set(0);
            rawY.set(0);
            translateZ.set(0);
        }, [rawX, rawY, translateZ]);

        return (
            <div
                ref={wrapRef}
                style={{ perspective: "900px" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <motion.div
                    ref={ref}
                    className={cn(emptyStateVariants({ variant }), className)}
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    style={{
                        rotateX: tilt ? rotateX : 0,
                        rotateY: tilt ? rotateY : 0,
                        translateZ: tilt ? translateZ : 0,
                        transformStyle: "preserve-3d",
                        ...style,
                    }}
                    {...props}
                >
                    {/* Subtle grid texture */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px)," +
                                "linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    <div className="relative z-10 flex flex-col items-center max-w-xs w-full">
                        {children}
                    </div>
                </motion.div>
            </div>
        );
    }
);
EmptyState.displayName = "EmptyState";

// Illustration / Icon 

const accentTokens = {
    primary: {
        ring: "border-primary/30",
        ringInner: "border-primary/15",
        dot: "bg-primary shadow-[0_0_8px_var(--primary)]",
        core: "bg-primary/10 border-primary/20",
        float: "drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]",
        iconColor: "text-primary",
    },
    teal: {
        ring: "border-teal-400/30",
        ringInner: "border-teal-400/15",
        dot: "bg-teal-400 shadow-[0_0_8px_theme(colors.teal.400)]",
        core: "bg-teal-400/10 border-teal-400/20",
        float: "drop-shadow-[0_0_12px_theme(colors.teal.400/0.5)]",
        iconColor: "text-teal-400",
    },
    amber: {
        ring: "border-amber-400/30",
        ringInner: "border-amber-400/15",
        dot: "bg-amber-400 shadow-[0_0_8px_theme(colors.amber.400)]",
        core: "bg-amber-400/10 border-amber-400/20",
        float: "drop-shadow-[0_0_12px_theme(colors.amber.400/0.5)]",
        iconColor: "text-amber-400",
    },
} as const;

const EmptyStateIllustration = React.forwardRef<HTMLDivElement, EmptyStateIllustrationProps>(
    ({ className, icon: Icon, illustration, iconSize = 22, accent = "primary", ...props }, ref) => {
        const tk = accentTokens[accent];
        const particles = useParticles(10);

        return (
            <motion.div
                ref={ref}
                variants={iconVariants}
                className={cn("relative mb-6 flex items-center justify-center", className)}
                {...props}
            >
                {illustration ? (
                    typeof illustration === "string" ? (
                        <img src={illustration} alt="Empty state illustration" className="max-w-[140px]" />
                    ) : (
                        <div className="max-w-[140px]">{illustration}</div>
                    )
                ) : (
                    <div className="relative w-[88px] h-[88px]" style={{ transformStyle: "preserve-3d" }}>

                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full" aria-hidden>
                            {particles.map(p => (
                                <motion.div
                                    key={p.id}
                                    className={cn("absolute rounded-full opacity-0", tk.dot.split(" ")[0])}
                                    style={{
                                        width: p.size, height: p.size,
                                        left: `${p.x}%`, top: `${p.y}%`,
                                    }}
                                    animate={{
                                        y: [0, p.ty],
                                        x: [0, p.tx],
                                        opacity: [0, 0.55, 0.3, 0],
                                        scale: [0.5, 1, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: p.dur,
                                        delay: p.del,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Outer spinning ring */}
                        <motion.div
                            aria-hidden
                            className={cn("absolute inset-0 rounded-full border", tk.ring)}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                        >
                            {/* Orbiting dot */}
                            <div className={cn("absolute -top-[3px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full", tk.dot)} />
                        </motion.div>

                        {/* Inner counter-rotating dashed ring */}
                        <motion.div
                            aria-hidden
                            className={cn("absolute inset-[10px] rounded-full border border-dashed", tk.ringInner)}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Icon core — floats in Z */}
                        <motion.div
                            className={cn(
                                "absolute inset-[18px] rounded-full border flex items-center justify-center",
                                tk.core, tk.float
                            )}
                            animate={{ y: [0, -4, 0], rotateY: [0, 8, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {Icon ? (
                                <Icon width={iconSize} height={iconSize} className={tk.iconColor} />
                            ) : (
                                <FileTextIcon width={iconSize} height={iconSize} className="text-muted-foreground/50" />
                            )}
                        </motion.div>
                    </div>
                )}
            </motion.div>
        );
    }
);
EmptyStateIllustration.displayName = "EmptyStateIllustration";

const EmptyStateBadge = React.forwardRef<HTMLDivElement, EmptyStateBadgeProps>(
    ({ className, label, dot = true, ...props }, ref) => (
        <motion.div
            ref={ref}
            variants={itemVariants}
            className={cn(
                "mb-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border",
                "text-[11px] font-mono tracking-wide",
                "bg-primary/10 border-primary/20 text-primary",
                className
            )}
            {...props}
        >
            {dot && (
                <span className="w-[5px] h-[5px] rounded-full bg-primary shadow-[0_0_5px_hsl(var(--primary))]" />
            )}
            {label}
        </motion.div>
    )
);
EmptyStateBadge.displayName = "EmptyStateBadge";


const EmptyStateHeading = React.forwardRef<HTMLHeadingElement, EmptyStateHeadingProps>(
    ({ className, title, children, ...props }, ref) => (
        <motion.div variants={itemVariants} className="w-full">
            <Typography
                ref={ref}
                variant="h3"
                className={cn("mb-2 font-semibold tracking-tight text-foreground", className)}
                {...props}
            >
                {children || title || "No data available"}
            </Typography>
        </motion.div>
    )
);
EmptyStateHeading.displayName = "EmptyStateHeading";

//  Description 

const EmptyStateDesc = React.forwardRef<HTMLParagraphElement, EmptyStateDescProps>(
    ({ className, description, children, ...props }, ref) => (
        <motion.div variants={itemVariants} className="w-full">
            <Typography
                ref={ref}
                variant="body"
                color="muted"
                className={cn("mb-8 max-w-[280px] mx-auto", className)}
                {...props}
            >
                {children || description || "There is no data to show right now."}
            </Typography>
        </motion.div>
    )
);
EmptyStateDesc.displayName = "EmptyStateDesc";

//  Actions 

const EmptyStateActions = React.forwardRef<HTMLDivElement, EmptyStateActionsProps>(
    ({ className, children, ...props }, ref) => (
        <motion.div
            ref={ref}
            variants={itemVariants}
            className={cn("flex flex-col sm:flex-row items-center justify-center gap-3 w-full", className)}
            {...props}
        >
            {children}
        </motion.div>
    )
);
EmptyStateActions.displayName = "EmptyStateActions";

//  Help 

const EmptyStateHelp = React.forwardRef<HTMLDivElement, EmptyStateHelpProps>(
    (
        {
            className,
            linkText = "Learn more",
            href = "#",
            icon: Icon = QuestionMarkCircledIcon,
            ...props
        },
        ref
    ) => (
        <motion.div
            ref={ref}
            variants={itemVariants}
            className={cn(
                "mt-8 pt-5 border-t border-border/60 w-full flex items-center justify-center text-sm",
                className
            )}
            {...props}
        >
            <Typography variant="muted" className="flex items-center gap-1.5">
                <Icon width={14} height={14} />
                <span>Need help?</span>{" "}
                <a
                    href={href}
                    className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                    {linkText}
                </a>
            </Typography>
        </motion.div>
    )
);
EmptyStateHelp.displayName = "EmptyStateHelp";

//  Preset compositions 

const EmptyStateDefault = (): React.JSX.Element => (
    <EmptyState>
        <EmptyStateIllustration icon={FileTextIcon} accent="primary" />
        <EmptyStateHeading>No projects yet</EmptyStateHeading>
        <EmptyStateDesc>
            Get started by creating a new project. You can also import an existing one.
        </EmptyStateDesc>
        <EmptyStateActions>
            <Button variant="default" animationVariant="pulse">
                <PlusIcon className="mr-2" /> Create project
            </Button>
            <Button variant="outline">
                <UploadIcon className="mr-2" /> Import
            </Button>
        </EmptyStateActions>
        <EmptyStateHelp linkText="Read our documentation" />
    </EmptyState>
);

const EmptyStateMinimal = (): React.JSX.Element => (
    <EmptyState variant="minimal" tilt={false}>
        <EmptyStateIllustration icon={FileTextIcon} accent="teal" />
        <EmptyStateBadge label="0 results" />
        <EmptyStateHeading title="Nothing found" />
        <EmptyStateDesc description="We couldn't find anything matching your search. Try adjusting your filters." />
        <EmptyStateActions>
            <Button variant="outline">Clear filters</Button>
        </EmptyStateActions>
    </EmptyState>
);

export {
    EmptyState,
    EmptyStateIllustration,
    EmptyStateBadge,
    EmptyStateHeading,
    EmptyStateDesc,
    EmptyStateActions,
    EmptyStateHelp,
    EmptyStateDefault,
    EmptyStateMinimal
};