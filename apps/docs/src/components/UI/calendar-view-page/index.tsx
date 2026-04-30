import {
    useState,
    useCallback,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    DrawingPinIcon,
    TextAlignLeftIcon,
    PersonIcon,
    VideoIcon,
    Pencil2Icon,
    TrashIcon,
    PlusIcon,
    CalendarIcon,
} from "@radix-ui/react-icons";
import { cn } from "../../../utils/cn";
import { Button } from "../button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CalendarViewType = "month" | "week" | "day";
export type EventType = "meeting" | "deadline" | "review" | "personal";

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    endDate?: Date;
    type: EventType;
    description?: string;
    location?: string;
    attendees?: string[];
    tags?: string[];
}

export interface CalendarViewLabels {
    addEventText?: string;
    todayText?: string;
    monthLabel?: string;
    weekLabel?: string;
    dayLabel?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    deleteText?: string;
    editText?: string;
    cancelText?: string;
}

export interface CalendarViewProps {
    events?: CalendarEvent[];
    loading?: boolean;
    currentDate?: Date;
    defaultDate?: Date;
    onNavigate?: (date: Date) => void;
    selectedDate?: Date;
    defaultSelectedDate?: Date;
    onDateSelect?: (date: Date) => void;
    view?: CalendarViewType;
    defaultView?: CalendarViewType;
    onViewChange?: (view: CalendarViewType) => void;
    selectedEvent?: CalendarEvent | null;
    onEventClick?: (event: CalendarEvent) => void;
    onEventClose?: () => void;
    onEventAdd?: (date: Date) => void;
    onEventEdit?: (event: CalendarEvent) => void;
    onEventDelete?: (event: CalendarEvent) => void;
    onEventDrop?: (event: CalendarEvent, newDate: Date, newEndDate?: Date) => void;
    today?: Date;
    theme?: "light" | "dark";
    labels?: CalendarViewLabels;
    className?: string;
    modalContainer?: HTMLElement | null;
}

// ─── Color map ────────────────────────────────────────────────────────────────

export const EVENT_COLORS: Record<
    EventType,
    { bg: string; text: string; border: string; accent: string }
> = {
    meeting: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        accent: "bg-blue-500",
    },
    deadline: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-200",
        accent: "bg-orange-500",
    },
    review: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        accent: "bg-purple-500",
    },
    personal: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        accent: "bg-green-500",
    },
};

const DEFAULT_LABELS: Required<CalendarViewLabels> = {
    addEventText: "New Event",
    todayText: "Today",
    monthLabel: "Month",
    weekLabel: "Week",
    dayLabel: "Day",
    emptyTitle: "No events this day",
    emptyDescription: "Click a date to explore or add a new event.",
    deleteText: "Delete",
    editText: "Edit",
    cancelText: "Cancel",
};

// ─── Native date helpers ──────────────────────────────────────────────────────

export function cloneDate(d: Date): Date {
    return new Date(d.getTime());
}

export function addDays(d: Date, n: number): Date {
    const r = cloneDate(d);
    r.setDate(r.getDate() + n);
    return r;
}

function addMonths(d: Date, n: number): Date {
    const r = cloneDate(d);
    r.setMonth(r.getMonth() + n);
    return r;
}

function subMonths(d: Date, n: number): Date {
    return addMonths(d, -n);
}

function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfWeek(d: Date): Date {
    const r = cloneDate(d);
    r.setDate(r.getDate() - r.getDay());
    r.setHours(0, 0, 0, 0);
    return r;
}

function endOfWeek(d: Date): Date {
    return addDays(startOfWeek(d), 6);
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isSameMonth(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth()
    );
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtMonthYear(d: Date): string {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtMonthDayYear(d: Date): string {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function fmtMonthDayShort(d: Date): string {
    return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function fmtWeekdayLong(d: Date): string {
    return DAY_NAMES[d.getDay()];
}

function fmtWeekdayShort(d: Date): string {
    return DAY_SHORT[d.getDay()];
}

function fmtFullDate(d: Date): string {
    return `${fmtWeekdayLong(d)}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function fmtTime(d: Date): string {
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    const min = m.toString().padStart(2, "0");
    return `${hour}:${min} ${ampm}`;
}

function fmtTimeCompact(d: Date): string {
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "pm" : "am";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return m === 0
        ? `${hour}${ampm}`
        : `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

function fmtHourLabel(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

/** Returns true when an event should be treated as all-day. */
function isAllDayEvent(event: CalendarEvent): boolean {
    return (
        event.date.getHours() === 0 &&
        event.date.getMinutes() === 0 &&
        !event.endDate
    );
}

function useControlled<T>(
    controlled: T | undefined,
    defaultValue: T,
    onChange?: (next: T) => void,
): [T, (next: T) => void] {
    const isControlled = controlled !== undefined;
    const [internal, setInternal] = useState<T>(defaultValue);
    const value = isControlled ? (controlled as T) : internal;

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    });

    const setValue = useCallback(
        (next: T) => {
            if (!isControlled) setInternal(next);
            onChangeRef.current?.(next);
        },
        [isControlled],
    );

    return [value, setValue];
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────

interface DragState {
    event: CalendarEvent;
    offsetX: number;
    offsetY: number;
    ghostX: number;
    ghostY: number;
    dropDate: Date | null;
    dropMinutes: number | null;
}

const SNAP_MINUTES = 15;
const PX_PER_MINUTE = 1;

function snapMinutes(m: number): number {
    return Math.round(m / SNAP_MINUTES) * SNAP_MINUTES;
}

function useEventDrag(
    onEventDrop?: CalendarViewProps["onEventDrop"],
) {
    const [drag, setDrag] = useState<DragState | null>(null);
    const dragRef = useRef<DragState | null>(null);

    const startDrag = useCallback(
        (event: CalendarEvent, e: React.PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const state: DragState = {
                event,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
                ghostX: e.clientX,
                ghostY: e.clientY,
                dropDate: null,
                dropMinutes: null,
            };
            dragRef.current = state;
            setDrag(state);
        },
        [],
    );

    useEffect(() => {
        if (!drag) return;

        const onMove = (e: PointerEvent) => {
            const prev = dragRef.current;
            if (!prev) return;
            const els = document.elementsFromPoint(e.clientX, e.clientY);
            let dropDate: Date | null = null;
            let dropMinutes: number | null = null;
            for (const el of els) {
                const dateAttr = (el as HTMLElement).dataset?.dragDate;
                if (dateAttr) {
                    dropDate = new Date(dateAttr);
                    const gridAttr = (el as HTMLElement).dataset?.dragGrid;
                    if (gridAttr === "time") {
                        const rect = el.getBoundingClientRect();
                        const yInGrid = e.clientY - rect.top;
                        dropMinutes = snapMinutes(Math.max(0, Math.min(1439, Math.round(yInGrid / PX_PER_MINUTE))));
                    }
                    break;
                }
            }
            const next: DragState = {
                ...prev,
                ghostX: e.clientX,
                ghostY: e.clientY,
                dropDate,
                dropMinutes,
            };
            dragRef.current = next;
            setDrag(next);
        };

        const onUp = () => {
            const final = dragRef.current;
            if (final?.dropDate && onEventDrop) {
                const evt = final.event;
                const duration = evt.endDate
                    ? evt.endDate.getTime() - evt.date.getTime()
                    : 0;
                const newDate = cloneDate(final.dropDate);
                if (final.dropMinutes !== null) {
                    newDate.setHours(Math.floor(final.dropMinutes / 60), final.dropMinutes % 60, 0, 0);
                } else {
                    newDate.setHours(evt.date.getHours(), evt.date.getMinutes(), 0, 0);
                }
                const newEnd = duration > 0 ? new Date(newDate.getTime() + duration) : undefined;
                if (!isSameDay(newDate, evt.date) || (final.dropMinutes !== null && (newDate.getHours() !== evt.date.getHours() || newDate.getMinutes() !== evt.date.getMinutes()))) {
                    onEventDrop(evt, newDate, newEnd);
                }
            }
            dragRef.current = null;
            setDrag(null);
        };

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        return () => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
        };
    }, [drag !== null, onEventDrop]);

    return { drag, startDrag };
}

function DragGhost({ drag }: { drag: DragState }) {
    const colors = EVENT_COLORS[drag.event.type];
    return ReactDOM.createPortal(
        <div
            className="fixed z-[200] pointer-events-none select-none"
            style={{
                left: drag.ghostX - drag.offsetX,
                top: drag.ghostY - drag.offsetY,
                width: 180,
            }}
        >
            <div
                className={cn(
                    "rounded-md px-2.5 py-1.5 text-[11px] font-semibold shadow-xl border-2 opacity-90",
                    colors.bg, colors.text, colors.border,
                )}
            >
                {drag.event.title}
                {drag.dropMinutes !== null && (
                    <span className="block text-[9px] opacity-70 mt-0.5">
                        {fmtHourLabel(Math.floor(drag.dropMinutes / 60))}
                    </span>
                )}
            </div>
        </div>,
        document.body,
    );
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    container?: HTMLElement | null;
}

function Modal({ open, onClose, children, container }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const target =
        container ?? (typeof document !== "undefined" ? document.body : null);

    if (!target) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />
                    <motion.div
                        key="modal-panel"
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
                    >
                        <div
                            className="pointer-events-auto w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        target,
    );
}

// ─── Event detail modal content ───────────────────────────────────────────────

interface EventModalProps {
    event: CalendarEvent;
    labels: Required<CalendarViewLabels>;
    onClose: () => void;
    onEdit?: (e: CalendarEvent) => void;
    onDelete?: (e: CalendarEvent) => void;
}

function EventModal({ event, labels, onClose, onEdit, onDelete }: EventModalProps) {
    const colors = EVENT_COLORS[event.type];
    const allDay = isAllDayEvent(event);
    return (
        <>
            <div className={cn("h-1.5 w-full", colors.accent)} />
            <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                    <div className="min-w-0 pr-3">
                        <div role="heading" aria-level={2} className="text-lg font-semibold tracking-tight text-foreground leading-snug m-0">
                            {event.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>
                                {fmtFullDate(event.date)}
                                {!allDay && (
                                    <>
                                        <span className="mx-1">·</span>
                                        {fmtTime(event.date)}
                                        {event.endDate && ` – ${fmtTime(event.endDate)}`}
                                    </>
                                )}
                                {allDay && (
                                    <span className="ml-1.5 text-[11px] uppercase tracking-wide font-medium text-muted-foreground/70">
                                        All day
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    <span
                        className={cn(
                            "capitalize border shrink-0 text-[11px] rounded-md px-2 py-1",
                            colors.bg, colors.text, colors.border,
                        )}
                    >
                        {event.type}
                    </span>
                </div>

                <div className="space-y-3.5">
                    {event.description && (
                        <DetailRow icon={<TextAlignLeftIcon className="h-4 w-4" />}>
                            <p className="leading-relaxed">{event.description}</p>
                        </DetailRow>
                    )}
                    {event.location && (
                        <DetailRow
                            icon={
                                event.location.toLowerCase().includes("zoom")
                                    ? <VideoIcon className="h-4 w-4" />
                                    : <DrawingPinIcon className="h-4 w-4" />
                            }
                        >
                            {event.location}
                        </DetailRow>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                        <DetailRow icon={<PersonIcon className="h-4 w-4" />}>
                            {event.attendees.join(", ")}
                        </DetailRow>
                    )}
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {event.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-muted text-muted-foreground text-[11px] font-medium rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8"
                    onClick={() => { onDelete?.(event); onClose(); }}
                >
                    <TrashIcon className="h-3.5 w-3.5" />
                    {labels.deleteText}
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8" onClick={onClose}>
                        {labels.cancelText}
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => { onEdit?.(event); onClose(); }}
                    >
                        <Pencil2Icon className="h-3.5 w-3.5" />
                        {labels.editText}
                    </Button>
                </div>
            </div>
        </>
    );
}

function DetailRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <div className="flex gap-3 text-sm text-foreground/90">
            <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
            <span className="leading-relaxed">{children}</span>
        </div>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="absolute inset-0 p-4 flex flex-col gap-3">
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-8 rounded-md bg-muted animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-1 flex-1">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="rounded-md bg-muted animate-pulse" />
                ))}
            </div>
        </div>
    );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
    currentDate, events, selectedDate, today, onSelectDate, onEventClick,
    drag, onDragStart,
}: {
    currentDate: Date;
    events: CalendarEvent[];
    selectedDate: Date;
    today: Date;
    onSelectDate: (d: Date) => void;
    onEventClick: (e: CalendarEvent) => void;
    drag: DragState | null;
    onDragStart: (event: CalendarEvent, e: React.PointerEvent) => void;
}) {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(endOfMonth(monthStart));
    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }
    const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const MAX_VISIBLE = 3;

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="grid grid-cols-7 border-b border-border bg-muted/20 shrink-0">
                {WEEK_DAYS.map((d) => (
                    <div
                        key={d}
                        className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                        {d}
                    </div>
                ))}
            </div>
            <div
                className="flex-1 grid grid-cols-7 overflow-hidden bg-border gap-[1px]"
                style={{
                    gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(100px, 1fr))`,
                }}
            >
                {days.map((d) => {
                    const isCurrentMonth = isSameMonth(d, monthStart);
                    const isToday = isSameDay(d, today);
                    const isSelected = isSameDay(d, selectedDate);
                    const isDragOver = drag !== null && drag.dropDate !== null && isSameDay(d, drag.dropDate);
                    const dayEvents = events.filter((e) => isSameDay(e.date, d));
                    const displayed = dayEvents.slice(0, MAX_VISIBLE);
                    const overflow = dayEvents.length - MAX_VISIBLE;
                    return (
                        <div
                            key={d.toISOString()}
                            data-drag-date={d.toISOString()}
                            onClick={() => onSelectDate(d)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Select ${fmtMonthDayYear(d)}`}
                            aria-current={isToday ? "date" : undefined}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelectDate(d);
                                }
                            }}
                            className={cn(
                                "bg-card relative flex flex-col p-1.5 cursor-pointer transition-colors overflow-hidden hover:bg-primary/[0.03] min-h-0",
                                !isCurrentMonth && "bg-muted/25",
                                isSelected && "ring-1 ring-inset ring-primary z-10",
                                isDragOver && "bg-primary/10 ring-2 ring-inset ring-primary/40",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                            )}
                        >
                            <div className="mb-1 shrink-0">
                                <span
                                    className={cn(
                                        "text-sm font-medium w-7 h-7 inline-flex items-center justify-center rounded-full transition-colors",
                                        isToday
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : isCurrentMonth
                                                ? "text-foreground"
                                                : "text-muted-foreground/40",
                                    )}
                                >
                                    {d.getDate()}
                                </span>
                            </div>
                            <div className="flex-1 flex flex-col gap-0.5 overflow-hidden w-full min-h-0">
                                {displayed.map((event) => {
                                    const isDragging = drag !== null && drag.event.id === event.id;
                                    return (
                                        <motion.div
                                            key={event.id}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`View event: ${event.title}`}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    onEventClick(event);
                                                }
                                            }}
                                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                            onPointerDown={(e) => onDragStart(event, e)}
                                            whileHover={!drag ? { scale: 1.02 } : undefined}
                                            transition={{ duration: 0.1 }}
                                            className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded-[4px] truncate font-medium touch-none select-none",
                                                isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab",
                                                EVENT_COLORS[event.type].bg,
                                                EVENT_COLORS[event.type].text,
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                                            )}
                                        >
                                            {!isAllDayEvent(event)
                                                ? `${fmtTimeCompact(event.date)} `
                                                : ""}
                                            {event.title}
                                        </motion.div>
                                    );
                                })}
                                {overflow > 0 && (
                                    <div className="text-[10px] font-medium text-muted-foreground px-1 hover:text-foreground transition-colors cursor-pointer">
                                        +{overflow} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface PositionedEvent {
    event: CalendarEvent;
    column: number;
    totalColumns: number;
    top: number;
    height: number;
}

function layoutTimedEvents(events: CalendarEvent[]): PositionedEvent[] {
    const sorted = [...events].sort(
        (a, b) =>
            a.date.getHours() * 60 + a.date.getMinutes() -
            (b.date.getHours() * 60 + b.date.getMinutes()),
    );

    const columnEnds: number[] = [];

    const assignments: { event: CalendarEvent; column: number; top: number; height: number }[] =
        sorted.map((event) => {
            const startMin = event.date.getHours() * 60 + event.date.getMinutes();
            const endMin = event.endDate
                ? event.endDate.getHours() * 60 + event.endDate.getMinutes()
                : startMin + 45;

            let col = columnEnds.findIndex((end) => end <= startMin);
            if (col === -1) {
                col = columnEnds.length;
                columnEnds.push(endMin);
            } else {
                columnEnds[col] = endMin;
            }

            return {
                event,
                column: col,
                top: startMin,
                height: Math.max(endMin - startMin, 24),
            };
        });

    const totalColumns = columnEnds.length || 1;

    return assignments.map((a) => ({ ...a, totalColumns }));
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
    currentDate, events, today, onEventClick, onSelectDate,
    drag, onDragStart,
}: {
    currentDate: Date;
    events: CalendarEvent[];
    today: Date;
    onEventClick: (e: CalendarEvent) => void;
    onSelectDate: (d: Date) => void;
    drag: DragState | null;
    onDragStart: (event: CalendarEvent, e: React.PointerEvent) => void;
}) {
    const startDate = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const todayMinutes = today.getHours() * 60 + today.getMinutes();

    return (
        <div className="flex flex-col h-full bg-card overflow-hidden">
            <div className="flex border-b border-border bg-muted/20 shrink-0">
                <div className="w-16 border-r border-border shrink-0" />
                <div className="flex-1 grid grid-cols-7">
                    {days.map((d) => {
                        const isToday = isSameDay(d, today);
                        return (
                            <button
                                key={d.toISOString()}
                                type="button"
                                onClick={() => onSelectDate(d)}
                                aria-label={`Select ${fmtMonthDayYear(d)}`}
                                aria-current={isToday ? "date" : undefined}
                                className={cn(
                                    "py-3 text-center border-r border-border last:border-0 w-full",
                                    "hover:bg-primary/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                                    isToday && "bg-primary/5",
                                )}
                            >
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    {fmtWeekdayShort(d)}
                                </div>
                                <div
                                    className={cn(
                                        "text-lg font-semibold w-9 h-9 mx-auto inline-flex items-center justify-center rounded-full",
                                        isToday
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-foreground",
                                    )}
                                >
                                    {d.getDate()}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            <AllDayStrip days={days} events={events} onEventClick={onEventClick} />

            <div className="flex-1 overflow-y-auto">
                <div className="flex min-h-[1440px]">
                    <div className="w-16 border-r border-border shrink-0 bg-card z-10">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] border-b border-border/40 text-right pr-2.5 py-1"
                            >
                                <span className="text-[10px] font-medium text-muted-foreground/70">
                                    {fmtHourLabel(hour)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 relative">
                        {/* Hour grid lines */}
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {hours.map((hour) => (
                                <div key={hour} className="h-[60px] border-b border-border/40 w-full" />
                            ))}
                        </div>

                        {days.map((d) => {
                            const isToday = isSameDay(d, today);
                            const timedEvts = events.filter(
                                (e) => isSameDay(e.date, d) && !isAllDayEvent(e),
                            );
                            const positioned = layoutTimedEvents(timedEvts);
                            const showDropPreview = drag !== null && drag.dropDate !== null && drag.dropMinutes !== null && isSameDay(d, drag.dropDate);

                            return (
                                <div
                                    key={d.toISOString()}
                                    data-drag-date={d.toISOString()}
                                    data-drag-grid="time"
                                    className="border-r border-border/40 last:border-0 relative"
                                >
                                    {isToday && (
                                        <motion.div
                                            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                            style={{ top: `${todayMinutes}px` }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <div className="h-[2px] bg-destructive flex-1 relative">
                                                <div className="absolute w-2.5 h-2.5 rounded-full bg-destructive -left-1 -top-[4px]" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Drop preview indicator */}
                                    {showDropPreview && (
                                        <div
                                            className="absolute left-1 right-1 rounded-md border-2 border-dashed border-primary/50 bg-primary/10 z-30 pointer-events-none flex items-center px-2"
                                            style={{
                                                top: `${drag!.dropMinutes!}px`,
                                                height: `${Math.max(drag!.event.endDate ? (drag!.event.endDate.getTime() - drag!.event.date.getTime()) / 60000 : 45, 24)}px`,
                                            }}
                                        >
                                            <span className="text-[10px] font-semibold text-primary/70">
                                                {fmtHourLabel(Math.floor(drag!.dropMinutes! / 60))}
                                            </span>
                                        </div>
                                    )}

                                    {positioned.map(({ event, column, totalColumns, top, height }) => {
                                        const widthPct = 100 / totalColumns;
                                        const leftPct = column * widthPct;
                                        const isDragging = drag !== null && drag.event.id === event.id;
                                        return (
                                            <motion.div
                                                key={event.id}
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: `calc(${leftPct}% + 2px)`,
                                                    width: `calc(${widthPct}% - 4px)`,
                                                    position: "absolute",
                                                }}
                                                onClick={() => onEventClick(event)}
                                                onPointerDown={(e) => onDragStart(event, e)}
                                                whileHover={!drag ? { scale: 1.02, zIndex: 10 } : undefined}
                                                transition={{ duration: 0.1 }}
                                                className={cn(
                                                    "rounded-[5px] px-1.5 py-1 overflow-hidden border touch-none select-none",
                                                    isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab",
                                                    EVENT_COLORS[event.type].bg,
                                                    EVENT_COLORS[event.type].text,
                                                    EVENT_COLORS[event.type].border,
                                                )}
                                            >
                                                <div className="text-[10px] font-semibold truncate leading-tight">
                                                    {event.title}
                                                </div>
                                                <div className="text-[9px] opacity-75 truncate">
                                                    {fmtTime(event.date)}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}


function AllDayStrip({
    days,
    events,
    onEventClick,
}: {
    days: Date[];
    events: CalendarEvent[];
    onEventClick: (e: CalendarEvent) => void;
}) {
    const hasAnyAllDay = days.some((d) =>
        events.some((e) => isSameDay(e.date, d) && isAllDayEvent(e)),
    );

    if (!hasAnyAllDay) return null;

    return (
        <div className="flex border-b border-border shrink-0 bg-muted/10">
            <div className="w-16 border-r border-border shrink-0 flex items-center justify-end pr-2.5">
                <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider leading-tight text-right">
                    All day
                </span>
            </div>
            <div
                className="flex-1 grid py-1 gap-y-0.5"
                style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
                {days.map((d) => {
                    const allDayEvts = events.filter(
                        (e) => isSameDay(e.date, d) && isAllDayEvent(e),
                    );
                    return (
                        <div
                            key={d.toISOString()}
                            className="px-0.5 flex flex-col gap-0.5 min-h-[24px]"
                        >
                            {allDayEvts.map((event) => (
                                <motion.div
                                    key={event.id}
                                    onClick={() => onEventClick(event)}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.1 }}
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-[4px] truncate cursor-pointer font-medium border",
                                        EVENT_COLORS[event.type].bg,
                                        EVENT_COLORS[event.type].text,
                                        EVENT_COLORS[event.type].border,
                                    )}
                                >
                                    {event.title}
                                </motion.div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DayView({
    currentDate, events, today, onEventClick,
    drag, onDragStart,
}: {
    currentDate: Date;
    events: CalendarEvent[];
    today: Date;
    onEventClick: (e: CalendarEvent) => void;
    drag: DragState | null;
    onDragStart: (event: CalendarEvent, e: React.PointerEvent) => void;
}) {
    const allDayEvts = events.filter(
        (e) => isSameDay(e.date, currentDate) && isAllDayEvent(e),
    );
    const timedEvts = events.filter(
        (e) => isSameDay(e.date, currentDate) && !isAllDayEvent(e),
    );
    const positioned = layoutTimedEvents(timedEvts);

    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const todayMinutes = today.getHours() * 60 + today.getMinutes();
    const isToday = isSameDay(currentDate, today);
    const totalEventCount = allDayEvts.length + timedEvts.length;
    const showDropPreview = drag !== null && drag.dropDate !== null && drag.dropMinutes !== null && isSameDay(currentDate, drag.dropDate);

    return (
        <div className="flex flex-col h-full bg-card overflow-hidden">
            <div className="flex border-b border-border bg-muted/20 shrink-0 px-6 py-3 items-center gap-3">
                <div
                    className={cn(
                        "text-2xl font-bold w-11 h-11 inline-flex items-center justify-center rounded-full",
                        isToday
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground",
                    )}
                >
                    {currentDate.getDate()}
                </div>
                <div>
                    <div className="text-sm font-semibold text-foreground">
                        {fmtWeekdayLong(currentDate)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </div>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                    {totalEventCount === 0
                        ? "No events"
                        : `${totalEventCount} event${totalEventCount > 1 ? "s" : ""}`}
                </div>
            </div>

            <AllDayStrip
                days={[currentDate]}
                events={events}
                onEventClick={onEventClick}
            />

            <div className="flex-1 overflow-y-auto">
                <div className="flex min-h-[1440px]">
                    <div className="w-16 border-r border-border shrink-0 bg-card">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] border-b border-border/40 text-right pr-2.5 py-1"
                            >
                                <span className="text-[10px] font-medium text-muted-foreground/70">
                                    {fmtHourLabel(hour)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="flex-1 relative"
                        data-drag-date={currentDate.toISOString()}
                        data-drag-grid="time"
                    >
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {hours.map((hour) => (
                                <div key={hour} className="h-[60px] border-b border-border/40 w-full" />
                            ))}
                        </div>

                        {isToday && (
                            <motion.div
                                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                style={{ top: `${todayMinutes}px` }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="h-[2px] bg-destructive flex-1 relative">
                                    <div className="absolute w-2.5 h-2.5 rounded-full bg-destructive -left-1 -top-[4px]" />
                                </div>
                            </motion.div>
                        )}

                        {/* Drop preview indicator */}
                        {showDropPreview && (
                            <div
                                className="absolute left-2 right-2 rounded-md border-2 border-dashed border-primary/50 bg-primary/10 z-30 pointer-events-none flex items-center px-3"
                                style={{
                                    top: `${drag!.dropMinutes!}px`,
                                    height: `${Math.max(drag!.event.endDate ? (drag!.event.endDate.getTime() - drag!.event.date.getTime()) / 60000 : 45, 24)}px`,
                                }}
                            >
                                <span className="text-[10px] font-semibold text-primary/70">
                                    {fmtHourLabel(Math.floor(drag!.dropMinutes! / 60))}
                                </span>
                            </div>
                        )}

                        {timedEvts.length === 0 && allDayEvts.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
                                <CalendarIcon className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium text-muted-foreground/50">
                                    No events scheduled
                                </p>
                            </div>
                        ) : (
                            positioned.map(({ event, column, totalColumns, top, height }) => {
                                const widthPct = 100 / totalColumns;
                                const leftPct = column * widthPct;
                                const isDragging = drag !== null && drag.event.id === event.id;
                                return (
                                    <motion.div
                                        key={event.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View event: ${event.title}`}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                onEventClick(event);
                                            }
                                        }}
                                        style={{
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            left: `calc(${leftPct}% + 8px)`,
                                            width: `calc(${widthPct}% - 20px)`,
                                            position: "absolute",
                                        }}
                                        onClick={() => onEventClick(event)}
                                        onPointerDown={(e) => onDragStart(event, e)}
                                        whileHover={!drag ? { scale: 1.01, zIndex: 10 } : undefined}
                                        transition={{ duration: 0.1 }}
                                        className={cn(
                                            "rounded-lg px-3 py-1.5 overflow-hidden border touch-none select-none",
                                            isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab",
                                            EVENT_COLORS[event.type].bg,
                                            EVENT_COLORS[event.type].text,
                                            EVENT_COLORS[event.type].border,
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                                        )}
                                    >
                                        <div className="text-[11px] font-semibold truncate">
                                            {event.title}
                                        </div>
                                        <div className="text-[10px] opacity-70 truncate">
                                            {fmtTime(event.date)}
                                            {event.endDate && ` – ${fmtTime(event.endDate)}`}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main CalendarView ────────────────────────────────────────────────────────

export function CalendarView(props: CalendarViewProps) {
    const {
        events = [],
        loading = false,
        currentDate: currentDateProp,
        defaultDate,
        onNavigate,
        selectedDate: selectedDateProp,
        defaultSelectedDate,
        onDateSelect,
        view: viewProp,
        defaultView = "month",
        onViewChange,
        selectedEvent: selectedEventProp,
        onEventClick,
        onEventClose,
        onEventAdd,
        onEventEdit,
        onEventDelete,
        onEventDrop,
        today = new Date(),
        theme,
        labels: labelsProp,
        className,
        modalContainer,
    } = props;

    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const [currentDate, setCurrentDate] = useControlled(currentDateProp, defaultDate ?? today, onNavigate);
    const [selectedDate, setSelectedDate] = useControlled(selectedDateProp, defaultSelectedDate ?? today, onDateSelect);
    const [view, setView] = useControlled(viewProp, defaultView, onViewChange);
    const { drag, startDrag } = useEventDrag(onEventDrop);

    const isEventControlled = selectedEventProp !== undefined;
    const [internalSelectedEvent, setInternalSelectedEvent] = useState<CalendarEvent | null>(null);
    const selectedEvent = isEventControlled ? selectedEventProp : internalSelectedEvent;

    const handleEventClick = (event: CalendarEvent) => {
        if (!isEventControlled) setInternalSelectedEvent(event);
        onEventClick?.(event);
    };
    const handleEventClose = () => {
        if (!isEventControlled) setInternalSelectedEvent(null);
        onEventClose?.();
    };
    const handlePrev = () => {
        if (view === "month") setCurrentDate(subMonths(currentDate, 1));
        else if (view === "week") setCurrentDate(addDays(currentDate, -7));
        else setCurrentDate(addDays(currentDate, -1));
    };
    const handleNext = () => {
        if (view === "month") setCurrentDate(addMonths(currentDate, 1));
        else if (view === "week") setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };
    const handleToday = () => {
        setCurrentDate(today);
        setSelectedDate(today);
    };
    const handleDayDrillDown = (d: Date) => {
        setSelectedDate(d);
        setCurrentDate(d);
        setView("day");
    };

    const headerLabel = () => {
        if (view === "month") return fmtMonthYear(currentDate);
        if (view === "week") {
            const start = startOfWeek(currentDate);
            const end = endOfWeek(currentDate);
            return `${fmtMonthDayShort(start)} – ${fmtMonthDayShort(end)}, ${end.getFullYear()}`;
        }
        return fmtMonthDayYear(currentDate);
    };

    return (
        <div
            className={cn(
                theme === "dark" && "dark",
                "min-h-screen flex flex-col font-sans bg-background text-foreground overflow-hidden",
                className,
            )}
        >
            <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div role="heading" aria-level={1} className="text-xl font-semibold tracking-tight min-w-[200px] m-0">
                        {headerLabel()}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline" size="icon"
                            onClick={handlePrev}
                            aria-label="Previous date range"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            onClick={handleToday}
                            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                            {labels.todayText}
                        </Button>
                        <Button
                            variant="outline" size="icon"
                            onClick={handleNext}
                            aria-label="Next date range"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-muted rounded-md">
                        {(["month", "week", "day"] as CalendarViewType[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                aria-label={`${v} view`}
                                aria-pressed={view === v}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-sm transition-all capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    view === v
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {v === "month"
                                    ? labels.monthLabel
                                    : v === "week"
                                        ? labels.weekLabel
                                        : labels.dayLabel}
                            </button>
                        ))}
                    </div>
                    <Button
                        size="sm"
                        className="h-8 gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => onEventAdd?.(selectedDate)}
                    >
                        <PlusIcon className="h-3.5 w-3.5" />
                        {labels.addEventText}
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative flex flex-col">
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view + currentDate.toISOString()}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="flex-1 overflow-hidden flex flex-col h-full"
                        >
                            {view === "month" && (
                                <MonthView
                                    currentDate={currentDate}
                                    events={events}
                                    selectedDate={selectedDate}
                                    today={today}
                                    onSelectDate={handleDayDrillDown}
                                    onEventClick={handleEventClick}
                                    drag={drag}
                                    onDragStart={startDrag}
                                />
                            )}
                            {view === "week" && (
                                <WeekView
                                    currentDate={currentDate}
                                    events={events}
                                    today={today}
                                    onEventClick={handleEventClick}
                                    onSelectDate={handleDayDrillDown}
                                    drag={drag}
                                    onDragStart={startDrag}
                                />
                            )}
                            {view === "day" && (
                                <DayView
                                    currentDate={currentDate}
                                    events={events}
                                    today={today}
                                    onEventClick={handleEventClick}
                                    drag={drag}
                                    onDragStart={startDrag}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </main>

            {drag && <DragGhost drag={drag} />}

            <Modal
                open={!!selectedEvent}
                onClose={handleEventClose}
                container={modalContainer}
            >
                {selectedEvent && (
                    <EventModal
                        event={selectedEvent}
                        labels={labels}
                        onClose={handleEventClose}
                        onEdit={onEventEdit}
                        onDelete={onEventDelete}
                    />
                )}
            </Modal>
        </div>
    );
}