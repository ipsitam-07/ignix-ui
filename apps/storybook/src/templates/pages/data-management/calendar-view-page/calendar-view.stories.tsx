import { useState } from "react";
import { addDays, CalendarView, cloneDate } from ".";
import type { CalendarViewProps, CalendarViewType, CalendarEvent } from ".";

export type Meta<T> = {
    title: string;
    component: T;
    tags?: string[];
    parameters?: Record<string, unknown>;
    argTypes?: Record<string, unknown>;
};

export type StoryObj<T> = {
    component?: T;
    name: string;
    render: (args: Partial<CalendarViewProps>) => React.ReactElement;
    args?: Partial<CalendarViewProps>;
};

type Story = StoryObj<typeof CalendarView>;

const MOCK_TODAY = new Date(2026, 3, 15);
const SAMPLE_EVENTS = generateSampleEvents(2026, 3);

const meta: Meta<typeof CalendarView> = {
    title: "Templates/Pages/DataManagement/CalendarView",
    component: CalendarView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "A full-featured Calendar View with Month, Week, and Day layouts. " +
                    "Supports controlled and uncontrolled state. No external date library.",
            },
        },
    },
    argTypes: {
        defaultView: { control: "select", options: ["month", "week", "day"] },
        loading: { control: "boolean" },
        theme: { control: "select", options: ["light", "dark"] },
    },
};

export default meta;

// ─── Sample events generator ──────────────────────────────────────────────────

function withHoursMinutes(d: Date, h: number, m: number): Date {
    const r = cloneDate(d);
    r.setHours(h, m, 0, 0);
    return r;
}

function generateSampleEvents(baseYear = 2026, baseMonth = 3): CalendarEvent[] {
    const base = new Date(baseYear, baseMonth, 1);
    return [
        { id: "1", title: "Q2 Planning Sync", date: withHoursMinutes(addDays(base, 1), 10, 30), endDate: withHoursMinutes(addDays(base, 1), 12, 0), type: "meeting", description: "Discussing roadmaps and OKRs for the upcoming quarter with the entire product org.", location: "Zoom", attendees: ["Sarah J.", "Mike T.", "Alex K."], tags: ["Planning", "Q2", "Product"] },
        { id: "2", title: "Launch v2.0", date: withHoursMinutes(addDays(base, 4), 14, 0), type: "deadline", description: "Final rollout for the v2.0 redesign.", tags: ["Launch", "Important"] },
        { id: "3", title: "Design Review: Dashboard", date: withHoursMinutes(addDays(base, 4), 15, 0), endDate: withHoursMinutes(addDays(base, 4), 16, 0), type: "review", description: "Reviewing the new dashboard mockups with engineering.", location: "Conference Room B", attendees: ["Design Team", "Frontend Leads"], tags: ["Design", "Dashboard"] },
        { id: "4", title: "Dentist Appointment", date: withHoursMinutes(addDays(base, 8), 9, 0), endDate: withHoursMinutes(addDays(base, 8), 10, 0), type: "personal", location: "Dr. Smith Clinic", tags: ["Health"] },
        { id: "5", title: "Weekly Sync", date: withHoursMinutes(addDays(base, 13), 11, 0), endDate: withHoursMinutes(addDays(base, 13), 11, 30), type: "meeting", tags: ["Sync"] },
        { id: "6", title: "Marketing Campaign Due", date: withHoursMinutes(addDays(base, 14), 17, 0), type: "deadline", description: "Submit all final assets for the summer campaign.", tags: ["Marketing", "Assets"] },
        { id: "7", title: "1:1 with Alex", date: withHoursMinutes(addDays(base, 14), 13, 30), endDate: withHoursMinutes(addDays(base, 14), 14, 0), type: "meeting", tags: ["1:1", "Management"] },
        { id: "8", title: "Quick Catchup", date: withHoursMinutes(addDays(base, 14), 10, 0), endDate: withHoursMinutes(addDays(base, 14), 10, 30), type: "meeting", tags: ["Sync"] },
        { id: "9", title: "Product Review", date: withHoursMinutes(addDays(base, 14), 15, 0), endDate: withHoursMinutes(addDays(base, 14), 16, 0), type: "review", tags: ["Product"] },
        { id: "10", title: "Code Freeze", date: withHoursMinutes(addDays(base, 19), 12, 0), type: "deadline", tags: ["Engineering"] },
        { id: "11", title: "Team Offsite", date: withHoursMinutes(addDays(base, 23), 9, 0), endDate: withHoursMinutes(addDays(base, 23), 17, 0), type: "personal", location: "Golden Gate Park", description: "Annual team picnic and offsite event.", tags: ["Team Building", "Fun"] },
        { id: "12", title: "Performance Reviews", date: withHoursMinutes(addDays(base, 27), 10, 0), endDate: withHoursMinutes(addDays(base, 27), 12, 0), type: "review", tags: ["HR", "Management"] },
        { id: "13", title: "Investor Update", date: withHoursMinutes(addDays(base, 29), 14, 0), endDate: withHoursMinutes(addDays(base, 29), 15, 0), type: "meeting", location: "Boardroom", tags: ["Investors", "High Priority"] },
    ];
}

export const Default: Story = {
    name: "Month View",
    render: () => <CalendarShell defaultView="month" />,
};

export const WeekViewStory: Story = {
    name: "Week View",
    render: () => <CalendarShell defaultView="week" />,
};

export const DayViewStory: Story = {
    name: "Day View",
    render: () => <CalendarShell defaultView="day" />,
};

export const Loading: Story = {
    name: "Loading (skeleton)",
    render: () => <CalendarView events={[]} loading defaultDate={MOCK_TODAY} today={MOCK_TODAY} />,
};

export const Empty: Story = {
    name: "Empty (no events)",
    render: () => (
        <CalendarView events={[]} defaultDate={MOCK_TODAY} defaultView="day" today={MOCK_TODAY}
            labels={{ emptyTitle: "Nothing scheduled", emptyDescription: "Your calendar is clear for today." }} />
    ),
};

export const Controlled: Story = {
    name: "Controlled state",
    render: () => <ControlledCalendarShell />,
};

export const CustomLabels: Story = {
    name: "Custom labels",
    render: () => (
        <CalendarView events={SAMPLE_EVENTS} defaultDate={MOCK_TODAY} today={MOCK_TODAY}
            labels={{ addEventText: "Schedule", todayText: "Now", monthLabel: "Monthly", weekLabel: "Weekly", dayLabel: "Daily", deleteText: "Remove", editText: "Update", cancelText: "Dismiss" }}
            onEventAdd={(date) => console.log("Add event on", date)}
            onEventEdit={(event) => console.log("Edit", event)}
            onEventDelete={(event) => console.log("Delete", event)} />
    ),
};

export const DarkTheme: Story = {
    name: "Dark theme",
    render: () => (
        <div className="dark">
            <CalendarView events={SAMPLE_EVENTS} defaultDate={MOCK_TODAY} today={MOCK_TODAY} theme="dark"
                onEventAdd={(date) => console.log("Add event on", date)}
                onEventEdit={(event) => console.log("Edit", event)}
                onEventDelete={(event) => console.log("Delete", event)} />
        </div>
    ),
};


function CalendarShell({ defaultView }: { defaultView: CalendarViewType }) {
    const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);

    const handleEventDrop = (event: CalendarEvent, newDate: Date, newEndDate?: Date) => {
        setEvents((prev) =>
            prev.map((e) =>
                e.id === event.id
                    ? { ...e, date: newDate, endDate: newEndDate ?? e.endDate }
                    : e,
            ),
        );
    };

    return (
        <CalendarView events={events} defaultDate={MOCK_TODAY} defaultSelectedDate={MOCK_TODAY}
            defaultView={defaultView} today={MOCK_TODAY}
            onEventDrop={handleEventDrop}
            onEventAdd={(date) => console.log("Add event on", date)}
            onEventEdit={(event) => console.log("Edit", event)}
            onEventDelete={(event) => console.log("Delete", event)} />
    );
}

function ControlledCalendarShell() {
    const [view, setView] = useState<CalendarViewType>("month");
    const [currentDate, setCurrentDate] = useState(MOCK_TODAY);
    const [selectedDate, setSelectedDate] = useState(MOCK_TODAY);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);

    const handleEventDrop = (event: CalendarEvent, newDate: Date, newEndDate?: Date) => {
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
            view={view}
            onViewChange={setView}
            currentDate={currentDate}
            onNavigate={setCurrentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            selectedEvent={selectedEvent}
            onEventClick={setSelectedEvent}
            onEventClose={() => setSelectedEvent(null)}
            today={MOCK_TODAY}
            onEventDrop={handleEventDrop}
            onEventAdd={(date) => console.log("Add event on", date)}
            onEventEdit={(event) => { console.log("Edit", event); setSelectedEvent(null); }}
            onEventDelete={(event) => { console.log("Delete", event); setSelectedEvent(null); }}
        />
    );
}