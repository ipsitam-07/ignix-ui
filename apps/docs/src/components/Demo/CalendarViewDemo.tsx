"use client";

import React, { useState } from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import { CalendarView, addDays, cloneDate } from "@site/src/components/UI/calendar-view-page";
import type { CalendarEvent } from "@site/src/components/UI/calendar-view-page";

// ─── Sample data generator ────────────────────────────────────────────────────

function withHoursMinutes(d: Date, h: number, m: number): Date {
    const r = cloneDate(d);
    r.setHours(h, m, 0, 0);
    return r;
}

function generateSampleEvents(): CalendarEvent[] {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), 1);
    return [
        {
            id: "1",
            title: "Q2 Planning Sync",
            date: withHoursMinutes(addDays(base, 1), 10, 30),
            endDate: withHoursMinutes(addDays(base, 1), 12, 0),
            type: "meeting",
            description:
                "Discussing roadmaps and OKRs for the upcoming quarter with the entire product org.",
            location: "Zoom",
            attendees: ["Sarah J.", "Mike T.", "Alex K."],
            tags: ["Planning", "Q2", "Product"],
        },
        {
            id: "2",
            title: "Launch v2.0",
            date: withHoursMinutes(addDays(base, 4), 14, 0),
            type: "deadline",
            description: "Final rollout for the v2.0 redesign.",
            tags: ["Launch", "Important"],
        },
        {
            id: "3",
            title: "Design Review",
            date: withHoursMinutes(addDays(base, 4), 15, 0),
            endDate: withHoursMinutes(addDays(base, 4), 16, 0),
            type: "review",
            description: "Reviewing the new dashboard mockups with engineering.",
            location: "Conference Room B",
            attendees: ["Design Team", "Frontend Leads"],
            tags: ["Design", "Dashboard"],
        },
        {
            id: "4",
            title: "Dentist Appointment",
            date: withHoursMinutes(addDays(base, 8), 9, 0),
            endDate: withHoursMinutes(addDays(base, 8), 10, 0),
            type: "personal",
            location: "Dr. Smith Clinic",
            tags: ["Health"],
        },
        {
            id: "5",
            title: "Weekly Standup",
            date: withHoursMinutes(addDays(base, 13), 11, 0),
            endDate: withHoursMinutes(addDays(base, 13), 11, 30),
            type: "meeting",
            tags: ["Sync"],
        },
        {
            id: "6",
            title: "Marketing Campaign Due",
            date: withHoursMinutes(addDays(base, 14), 17, 0),
            type: "deadline",
            description: "Submit all final assets for the summer campaign.",
            tags: ["Marketing", "Assets"],
        },
        {
            id: "7",
            title: "1:1 with Alex",
            date: withHoursMinutes(addDays(base, 14), 13, 30),
            endDate: withHoursMinutes(addDays(base, 14), 14, 0),
            type: "meeting",
            tags: ["1:1", "Management"],
        },
        {
            id: "8",
            title: "Quick Catchup",
            date: withHoursMinutes(addDays(base, 14), 10, 0),
            endDate: withHoursMinutes(addDays(base, 14), 10, 30),
            type: "meeting",
            tags: ["Sync"],
        },
        {
            id: "9",
            title: "Product Review",
            date: withHoursMinutes(addDays(base, 14), 15, 0),
            endDate: withHoursMinutes(addDays(base, 14), 16, 0),
            type: "review",
            tags: ["Product"],
        },
        {
            id: "10",
            title: "Code Freeze",
            date: withHoursMinutes(addDays(base, 19), 12, 0),
            type: "deadline",
            tags: ["Engineering"],
        },
        {
            id: "11",
            title: "Team Offsite",
            date: withHoursMinutes(addDays(base, 23), 9, 0),
            endDate: withHoursMinutes(addDays(base, 23), 17, 0),
            type: "personal",
            location: "Golden Gate Park",
            description: "Annual team picnic and offsite event.",
            tags: ["Team Building", "Fun"],
        },
        {
            id: "12",
            title: "Performance Reviews",
            date: withHoursMinutes(addDays(base, 27), 10, 0),
            endDate: withHoursMinutes(addDays(base, 27), 12, 0),
            type: "review",
            tags: ["HR", "Management"],
        },
        {
            id: "13",
            title: "Investor Update",
            date: withHoursMinutes(addDays(base, 29), 14, 0),
            endDate: withHoursMinutes(addDays(base, 29), 15, 0),
            type: "meeting",
            location: "Boardroom",
            tags: ["Investors", "High Priority"],
        },
    ];
}

// ─── Code samples ─────────────────────────────────────────────────────────────

const BASIC_CODE = `import { CalendarView } from "@ignix-ui/calendar-view-page";

const events = [
  {
    id: "1",
    title: "Team Standup",
    date: new Date(2026, 3, 15, 10, 0),
    endDate: new Date(2026, 3, 15, 10, 30),
    type: "meeting",
    description: "Daily sync",
    location: "Zoom",
    attendees: ["Alice", "Bob"],
    tags: ["Engineering"],
  },
  // ... more events
];

export default function MyCalendar() {
  return (
    <CalendarView
      events={events}
      defaultView="month"
      onEventAdd={(date) => console.log("Add event on", date)}
      onEventEdit={(event) => console.log("Edit", event)}
      onEventDelete={(event) => console.log("Delete", event)}
    />
  );
}`;

const DRAG_DROP_CODE = `import { useState } from "react";
import { CalendarView } from "@ignix-ui/calendar-view-page";
import type { CalendarEvent } from "@ignix-ui/calendar-view-page";

export default function DragDropCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(myEvents);

  const handleEventDrop = (
    event: CalendarEvent,
    newDate: Date,
    newEndDate?: Date,
  ) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? { ...e, date: newDate, endDate: newEndDate ?? e.endDate }
          : e,
      ),
    );
  };

  return (
    <CalendarView
      events={events}
      onEventDrop={handleEventDrop}
      onEventAdd={(date) => console.log("Add event on", date)}
      onEventEdit={(event) => console.log("Edit", event)}
      onEventDelete={(event) => console.log("Delete", event)}
    />
  );
}`;

import { ToastProvider, useToast } from "@site/src/components/UI/toast";
import { useColorMode } from "@docusaurus/theme-common";

const INITIAL_EVENTS = generateSampleEvents();

const CalendarDemoInner = () => {
    const { success, error } = useToast();
    const { colorMode } = useColorMode();
    const [loading, setLoading] = useState(false);
    const [emptyState, setEmptyState] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    React.useEffect(() => {
        setTheme(colorMode === "dark" ? "dark" : "light");
    }, [colorMode]);

    const handleEventDrop = (event: CalendarEvent, newDate: Date, newEndDate?: Date) => {
        setEvents((prev) =>
            prev.map((e) =>
                e.id === event.id
                    ? { ...e, date: newDate, endDate: newEndDate ?? e.endDate }
                    : e,
            ),
        );
        success(`Rescheduled: "${event.title}" to ${newDate.toLocaleDateString()}`, {
            position: "bottom-right",
            duration: 3000,
        });
    };

    const handleEventAdd = (date: Date) => {
        setEditingEvent({
            id: Math.random().toString(36).substring(2, 9),
            title: "",
            date: date,
            type: "meeting",
        });
        setIsEditing(true);
    };

    const handleEventEdit = (event: CalendarEvent) => {
        setEditingEvent(event);
        setIsEditing(true);
    };

    const handleEventDelete = (event: CalendarEvent) => {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
        error(`Deleted: "${event.title}"`, {
            position: "bottom-right",
            duration: 3000,
        });
    };

    // Handle Escape key to close modal
    React.useEffect(() => {
        if (!isEditing) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsEditing(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditing]);

    const codeToDisplay = loading || emptyState ? BASIC_CODE : DRAG_DROP_CODE;

    const renderPreview = () => {
        return (
            <div className={`rounded-xl overflow-hidden border border-border shadow-lg relative h-[1000px] ${theme === "dark" ? "dark" : ""}`}>
                <CalendarView
                    className="h-full min-h-0 absolute inset-0"
                    events={loading || emptyState ? [] : events}
                    theme={theme}
                    loading={loading}
                    defaultView={emptyState ? "day" : "month"}
                    labels={
                        emptyState
                            ? { emptyTitle: "Nothing scheduled", emptyDescription: "Your calendar is clear for today." }
                            : undefined
                    }
                    onEventDrop={handleEventDrop}
                    onEventAdd={handleEventAdd}
                    onEventEdit={handleEventEdit}
                    onEventDelete={handleEventDelete}
                />

                {isEditing && editingEvent && (
                    <div 
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm p-4"
                        onClick={() => setIsEditing(false)}
                    >
                        <div 
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="edit-modal-title"
                            className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-border bg-muted/30">
                                <h3 id="edit-modal-title" className="text-lg font-semibold text-foreground">
                                    {events.some(e => e.id === editingEvent.id) ? "Edit Event" : "New Event"}
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Title</label>
                                    <input
                                        type="text"
                                        value={editingEvent.title || ""}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="e.g. Team Sync"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Type</label>
                                    <select
                                        value={editingEvent.type || "meeting"}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as any })}
                                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="meeting">Meeting</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="personal">Personal</option>
                                        <option value="review">Review</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</label>
                                    <div className="px-3 py-2 bg-muted/50 border border-border rounded-md text-sm text-muted-foreground">
                                        {editingEvent.date ? editingEvent.date.toLocaleDateString() : ""}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/30">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border rounded-md hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!editingEvent.title) return;

                                        const isExisting = events.some(e => e.id === editingEvent.id);
                                        if (isExisting) {
                                            setEvents(prev => prev.map(e => e.id === editingEvent.id ? editingEvent as CalendarEvent : e));
                                            success(`Updated "${editingEvent.title}"`, { position: "bottom-right", duration: 3000 });
                                        } else {
                                            setEvents(prev => [...prev, editingEvent as CalendarEvent]);
                                            success(`Added "${editingEvent.title}"`, { position: "bottom-right", duration: 3000 });
                                        }
                                        setIsEditing(false);
                                    }}
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors"
                                >
                                    Save Event
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Feature toggles */}
            <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={loading}
                            onChange={(e) => setLoading(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm">Loading State</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={emptyState}
                            onChange={(e) => setEmptyState(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm">Empty State</span>
                    </label>
                </div>
            </div>

            {/* Tabs */}
            <Tabs>
                <TabItem value="preview" label="Preview">
                    {renderPreview()}
                </TabItem>
                <TabItem value="code" label="Code">
                    <CodeBlock language="tsx" className="whitespace-pre-wrap max-h-[500px] overflow-y-scroll">
                        {codeToDisplay}
                    </CodeBlock>
                </TabItem>
            </Tabs>
        </div>
    );
};

export const CalendarViewDemo = () => {
    return (
        <ToastProvider maxToasts={3} defaultPosition="bottom-right">
            <CalendarDemoInner />
        </ToastProvider>
    );
};

export default CalendarViewDemo;
