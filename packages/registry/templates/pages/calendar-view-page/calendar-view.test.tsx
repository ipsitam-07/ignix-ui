import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarView } from ".";
import type { CalendarEvent } from ".";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FEB_2026 = new Date(2026, 1, 1);

const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: "e1",
        title: "Team Standup",
        date: new Date(2026, 1, 10, 9, 0),
        endDate: new Date(2026, 1, 10, 9, 30),
        type: "meeting",
        description: "Daily sync",
        location: "Zoom",
        attendees: ["Alice", "Bob"],
        tags: ["engineering"],
    },
    {
        id: "e2",
        title: "Sprint Deadline",
        date: new Date(2026, 1, 10, 17, 0),
        endDate: new Date(2026, 1, 10, 18, 0),
        type: "deadline",
    },
    {
        id: "e3",
        title: "All-hands",
        // All-day: midnight, no endDate
        date: new Date(2026, 1, 15, 0, 0),
        type: "meeting",
    },
    {
        id: "e4",
        title: "Code Review",
        date: new Date(2026, 1, 10, 9, 15), // overlaps e1 → collision test
        endDate: new Date(2026, 1, 10, 10, 0),
        type: "review",
    },
    {
        id: "e5",
        title: "Gym",
        date: new Date(2026, 1, 20, 7, 0),
        endDate: new Date(2026, 1, 20, 8, 0),
        type: "personal",
    },
];

beforeEach(() => {
    vi.restoreAllMocks();
});

// 1. RENDERING

describe("Rendering", () => {
    it("renders without crashing with no props", () => {
        expect(() => render(<CalendarView />)).not.toThrow();
    });

    it("renders the month name and year in the header", () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        expect(screen.getByText("February 2026")).toBeInTheDocument();
    });

    it("renders all 7 day-of-week column headers", () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
            expect(screen.getByText(d)).toBeInTheDocument();
        });
    });

    it("renders the Today, New Event buttons and view toggle", () => {
        render(<CalendarView />);
        expect(screen.getByText("Today")).toBeInTheDocument();
        expect(screen.getByText("New Event")).toBeInTheDocument();
        expect(screen.getByText("Month")).toBeInTheDocument();
        expect(screen.getByText("Week")).toBeInTheDocument();
        expect(screen.getByText("Day")).toBeInTheDocument();
    });

    it("shows a loading skeleton when loading=true", () => {
        const { container } = render(<CalendarView loading={true} />);
        const pulses = container.querySelectorAll(".animate-pulse");
        expect(pulses.length).toBeGreaterThan(0);
    });

    it("does not render event chips while loading", () => {
        render(<CalendarView loading={true} events={MOCK_EVENTS} />);
        expect(screen.queryByText("Team Standup")).not.toBeInTheDocument();
    });

    it("accepts custom labels", () => {
        render(
            <CalendarView
                labels={{
                    addEventText: "Créer",
                    todayText: "Aujourd'hui",
                    monthLabel: "Mois",
                }}
            />,
        );
        expect(screen.getByText("Créer")).toBeInTheDocument();
        expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
        expect(screen.getByText("Mois")).toBeInTheDocument();
    });
});

// 2. MONTH VIEW — NAVIGATION

describe("Month navigation", () => {
    it("navigates to the previous month on chevron-left click", async () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        const [prevBtn] = screen.getAllByRole("button", { name: "" }); // ChevronLeft is first icon button
        await userEvent.click(prevBtn);
        expect(screen.getByText("January 2026")).toBeInTheDocument();
    });

    it("navigates to the next month on chevron-right click", async () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        const buttons = screen.getAllByRole("button");
        const nextBtn = buttons.find((b) => b.querySelector('[data-icon="chevron-right"]') ||
            b.innerHTML.includes("ChevronRight") ||
            b.getAttribute("aria-label") === "next") ?? buttons[2];
        await userEvent.click(nextBtn);
        expect(screen.getByText("March 2026")).toBeInTheDocument();
    });

    it("Today button resets to current month", async () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        const prevBtn = screen.getAllByRole("button")[0];
        await userEvent.click(prevBtn);
        expect(screen.getByText("January 2026")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Today"));
        const now = new Date();
        const monthName = now.toLocaleString("en-US", { month: "long" });
        expect(screen.getByText(new RegExp(`${monthName} ${now.getFullYear()}`))).toBeInTheDocument();
    });

    it("calls onNavigate with the new date when navigating", async () => {
        const onNavigate = vi.fn();
        render(<CalendarView defaultDate={FEB_2026} onNavigate={onNavigate} />);
        const prevBtn = screen.getAllByRole("button")[0];
        await userEvent.click(prevBtn);
        expect(onNavigate).toHaveBeenCalledOnce();
        const called: Date = onNavigate.mock.calls[0][0];
        expect(called.getMonth()).toBe(0); // January
        expect(called.getFullYear()).toBe(2026);
    });

    it("controlled currentDate prop overrides internal state", () => {
        render(<CalendarView currentDate={FEB_2026} onNavigate={vi.fn()} />);
        expect(screen.getByText("February 2026")).toBeInTheDocument();
    });
});

// 3. MONTH VIEW — EVENT RENDERING

describe("Month view — events", () => {
    it("renders event chips on the correct date cell", () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        expect(screen.getByText(/Team Standup/)).toBeInTheDocument();
        expect(screen.getByText(/Sprint Deadline/)).toBeInTheDocument();
    });

    it("shows +N more when a cell has more than 3 events", () => {
        const manyEvents: CalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
            id: `overflow-${i}`,
            title: `Event ${i}`,
            date: new Date(2026, 1, 10, 10 + i, 0),
            type: "meeting" as const,
        }));
        render(<CalendarView defaultDate={FEB_2026} events={manyEvents} />);
        expect(screen.getByText(/\+\d+ more/)).toBeInTheDocument();
    });

    it("does not show +N more when there are 3 or fewer events on a day", () => {
        const threeEvents = MOCK_EVENTS.slice(0, 3).map((e) => ({
            ...e,
            date: new Date(2026, 1, 10, e.date.getHours(), 0),
        }));
        render(<CalendarView defaultDate={FEB_2026} events={threeEvents} />);
        expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
    });

    it("does not render events from other months in current month cells", () => {
        const outsideEvent: CalendarEvent = {
            id: "outside",
            title: "Outside Month Event",
            date: new Date(2026, 0, 5),
            type: "personal",
        };
        render(<CalendarView defaultDate={FEB_2026} events={[outsideEvent]} />);
        expect(screen.queryByText("Outside Month Event")).not.toBeInTheDocument();
    });
});

// 4. EVENT DETAIL MODAL

describe("Event detail modal", () => {
    it("opens the modal when an event chip is clicked", async () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        await userEvent.click(screen.getByText(/Team Standup/));
        expect(screen.getByRole("heading", { name: "Team Standup" })).toBeInTheDocument();
    });

    it("renders all event fields in the modal", async () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        await userEvent.click(screen.getByText(/Team Standup/));
        expect(screen.getByText("Daily sync")).toBeInTheDocument();
        expect(screen.getByText("Zoom")).toBeInTheDocument();
        expect(screen.getByText(/Alice.*Bob|Bob.*Alice/)).toBeInTheDocument();
        expect(screen.getByText("engineering")).toBeInTheDocument();
    });

    it("renders the event type badge with correct label", async () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        await userEvent.click(screen.getByText(/Team Standup/));
        const badge = screen.getAllByText("meeting").find(
            (el) => el.tagName.toLowerCase() === "span",
        );
        expect(badge).toBeInTheDocument();
    });

    it("closes the modal when the Cancel button is clicked", async () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        await userEvent.click(screen.getByText(/Team Standup/));
        await userEvent.click(screen.getByText("Cancel"));
        expect(screen.queryByRole("heading", { name: "Team Standup" })).not.toBeInTheDocument();
    });

    it("closes the modal on Escape key press", async () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        await userEvent.click(screen.getByText(/Team Standup/));
        await userEvent.keyboard("{Escape}");
        expect(screen.queryByRole("heading", { name: "Team Standup" })).not.toBeInTheDocument();
    });

    it("calls onEventEdit with the event when Edit is clicked", async () => {
        const onEventEdit = vi.fn();
        render(
            <CalendarView
                defaultDate={FEB_2026}
                events={MOCK_EVENTS}
                onEventEdit={onEventEdit}
            />,
        );
        await userEvent.click(screen.getByText(/Team Standup/));
        await userEvent.click(screen.getByText("Edit"));
        expect(onEventEdit).toHaveBeenCalledOnce();
        expect(onEventEdit.mock.calls[0][0].id).toBe("e1");
    });

    it("calls onEventDelete with the event when Delete is clicked", async () => {
        const onEventDelete = vi.fn();
        render(
            <CalendarView
                defaultDate={FEB_2026}
                events={MOCK_EVENTS}
                onEventDelete={onEventDelete}
            />,
        );
        await userEvent.click(screen.getByText(/Team Standup/));
        await userEvent.click(screen.getByText("Delete"));
        expect(onEventDelete).toHaveBeenCalledOnce();
        expect(onEventDelete.mock.calls[0][0].id).toBe("e1");
    });

    it("closes the modal after Delete", async () => {
        render(
            <CalendarView
                defaultDate={FEB_2026}
                events={MOCK_EVENTS}
                onEventDelete={vi.fn()}
            />,
        );
        await userEvent.click(screen.getByText(/Team Standup/));
        await userEvent.click(screen.getByText("Delete"));
        expect(screen.queryByRole("heading", { name: "Team Standup" })).not.toBeInTheDocument();
    });

    it("shows 'All day' label for all-day events in the modal", async () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        await userEvent.click(screen.getByText(/All-hands/));
        expect(screen.getByText(/All day/i)).toBeInTheDocument();
    });

    it("does not show time for all-day events in modal", async () => {
        render(<CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} />);
        await userEvent.click(screen.getByText(/All-hands/));
        const modal = screen.getByRole("heading", { name: "All-hands" }).closest("div")!;
        expect(modal.textContent).not.toMatch(/\d+:\d+ (AM|PM)/);
    });

    it("calls onEventClick callback when an event chip is clicked", async () => {
        const onEventClick = vi.fn();
        render(
            <CalendarView
                defaultDate={FEB_2026}
                events={MOCK_EVENTS}
                onEventClick={onEventClick}
            />,
        );
        await userEvent.click(screen.getByText(/Team Standup/));
        expect(onEventClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: "e1" }),
        );
    });

    it("respects controlled selectedEvent prop — opens modal externally", () => {
        render(
            <CalendarView
                defaultDate={FEB_2026}
                events={MOCK_EVENTS}
                selectedEvent={MOCK_EVENTS[0]}
                onEventClose={vi.fn()}
            />,
        );
        expect(screen.getByRole("heading", { name: "Team Standup" })).toBeInTheDocument();
    });

    it("calls onEventClose when backdrop is clicked in controlled mode", async () => {
        const onEventClose = vi.fn();
        render(
            <CalendarView
                defaultDate={FEB_2026}
                events={MOCK_EVENTS}
                selectedEvent={MOCK_EVENTS[0]}
                onEventClose={onEventClose}
            />,
        );
        const overlay = document.querySelector(".fixed.inset-0.z-40");
        if (overlay) fireEvent.click(overlay);
        expect(onEventClose).toHaveBeenCalledOnce();
    });
});

// 5. ADD EVENT BUTTON

describe("Add event button", () => {
    it("calls onEventAdd when New Event is clicked", async () => {
        const onEventAdd = vi.fn();
        render(<CalendarView defaultDate={FEB_2026} onEventAdd={onEventAdd} />);
        await userEvent.click(screen.getByText("New Event"));
        expect(onEventAdd).toHaveBeenCalledOnce();
    });

    it("passes the currently selectedDate to onEventAdd", async () => {
        const onEventAdd = vi.fn();
        render(
            <CalendarView
                defaultDate={FEB_2026}
                defaultSelectedDate={new Date(2026, 1, 14)}
                onEventAdd={onEventAdd}
            />,
        );
        await userEvent.click(screen.getByText("New Event"));
        const passedDate: Date = onEventAdd.mock.calls[0][0];
        expect(passedDate.getDate()).toBe(14);
        expect(passedDate.getMonth()).toBe(1);
    });

    it("onEventAdd date updates when a day cell is clicked first", async () => {
        const onEventAdd = vi.fn();
        render(
            <CalendarView defaultDate={FEB_2026} onEventAdd={onEventAdd} />,
        );
        await userEvent.click(screen.getByText("18"));
        await userEvent.click(screen.getByText("New Event"));
        const passedDate: Date = onEventAdd.mock.calls[0][0];
        expect(passedDate.getDate()).toBe(18);
    });
});

// 6. VIEW SWITCHING

describe("View switching", () => {
    it("switches to week view when Week is clicked", async () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        await userEvent.click(screen.getByText("Week"));
        expect(screen.getByText(/–/)).toBeInTheDocument();
    });

    it("switches to day view when Day is clicked", async () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        await userEvent.click(screen.getByText("Day"));
        expect(screen.getByText(/February \d+, 2026/)).toBeInTheDocument();
    });

    it("calls onViewChange with the correct view string", async () => {
        const onViewChange = vi.fn();
        render(<CalendarView defaultDate={FEB_2026} onViewChange={onViewChange} />);
        await userEvent.click(screen.getByText("Week"));
        expect(onViewChange).toHaveBeenCalledWith("week");
        await userEvent.click(screen.getByText("Day"));
        expect(onViewChange).toHaveBeenCalledWith("day");
        await userEvent.click(screen.getByText("Month"));
        expect(onViewChange).toHaveBeenCalledWith("month");
    });

    it("defaults to month view", () => {
        render(<CalendarView defaultDate={FEB_2026} />);
        expect(screen.getByText("Sun")).toBeInTheDocument();
    });

    it("respects controlled view prop", () => {
        render(<CalendarView defaultDate={FEB_2026} view="week" onViewChange={vi.fn()} />);
        expect(screen.getByText(/–/)).toBeInTheDocument();
    });
});

// 7. WEEK VIEW

describe("Week view", () => {
    it("shows 7 day columns with date numbers", async () => {
        render(<CalendarView defaultDate={FEB_2026} defaultView="week" />);
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
    });

    it("renders timed events in the week grid", async () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="week"
                events={MOCK_EVENTS}
            />,
        );
        expect(screen.getByText("Team Standup")).toBeInTheDocument();
        expect(screen.getByText("Sprint Deadline")).toBeInTheDocument();
    });

    it("renders the all-day strip when all-day events exist", () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 15)}
                defaultView="week"
                events={MOCK_EVENTS}
            />,
        );
        expect(screen.getByText("All day")).toBeInTheDocument();
        expect(screen.getByText("All-hands")).toBeInTheDocument();
    });

    it("does not render the all-day strip when no all-day events exist", () => {
        const timedOnly = MOCK_EVENTS.filter((e) => e.date.getHours() !== 0);
        render(
            <CalendarView
                defaultDate={FEB_2026}
                defaultView="week"
                events={timedOnly}
            />,
        );
        expect(screen.queryByText(/^All$/i)).not.toBeInTheDocument();
    });

    it("clicking a day header drills down to day view", async () => {
        const onDateSelect = vi.fn();
        const onViewChange = vi.fn();
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="week"
                onDateSelect={onDateSelect}
                onViewChange={onViewChange}
            />,
        );
        const dayBtn = screen.getByRole("button", { name: /10/ });
        await userEvent.click(dayBtn);
        expect(onDateSelect).toHaveBeenCalledWith(
            expect.objectContaining({ getDate: expect.any(Function) }),
        );
        const date: Date = onDateSelect.mock.calls[0][0];
        expect(date.getDate()).toBe(10);
        expect(onViewChange).toHaveBeenCalledWith("day");
    });

    it("week view navigates by 7 days on prev/next", async () => {
        render(<CalendarView defaultDate={new Date(2026, 1, 10)} defaultView="week" />);
        expect(screen.getByText(/Feb 8 – Feb 14, 2026/)).toBeInTheDocument();
        const prevBtn = screen.getAllByRole("button")[0];
        await userEvent.click(prevBtn);
        expect(screen.getByText(/Feb 1 – Feb 7, 2026/)).toBeInTheDocument();
    });
});

// 8. DAY VIEW
describe("Day view", () => {
    it("shows the day number prominently in the header", () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
            />,
        );
        const heading = screen.getAllByText("10");
        expect(heading.length).toBeGreaterThan(0);
    });

    it("shows event count in day view header", () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
                events={MOCK_EVENTS}
            />,
        );
        expect(screen.getByText(/3 events/)).toBeInTheDocument();
    });

    it("shows 'No events' when there are no events on the day", () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 3)}
                defaultView="day"
                events={MOCK_EVENTS}
            />,
        );
        expect(screen.getByText("No events")).toBeInTheDocument();
    });

    it("renders timed events in the day grid", () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
                events={MOCK_EVENTS}
            />,
        );
        expect(screen.getByText("Team Standup")).toBeInTheDocument();
        expect(screen.getByText("Sprint Deadline")).toBeInTheDocument();
    });

    it("shows the empty-state illustration when no timed events exist", () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 3)}
                defaultView="day"
                events={[]}
            />,
        );
        expect(screen.getByText("No events scheduled")).toBeInTheDocument();
    });

    it("day view navigates by 1 day on prev/next", async () => {
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
            />,
        );
        expect(screen.getByText("February 10, 2026")).toBeInTheDocument();
        const nextBtn = screen.getAllByRole("button")[2];
        await userEvent.click(nextBtn);
        expect(screen.getByText("February 11, 2026")).toBeInTheDocument();
    });
});

// 9. ALL-DAY EVENT DETECTION

describe("All-day event detection", () => {
    it("treats hour=0, minute=0, no endDate as all-day", () => {
        const allDay: CalendarEvent = {
            id: "ad1",
            title: "Birthday",
            date: new Date(2026, 1, 5, 0, 0),
            type: "personal",
        };
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 5)}
                defaultView="week"
                events={[allDay]}
            />,
        );
        expect(screen.getByText("Birthday")).toBeInTheDocument();
        expect(screen.getByText(/All/)).toBeInTheDocument();
    });

    it("does NOT treat hour=0 with endDate as all-day (midnight timed event)", () => {
        const midnightTimed: CalendarEvent = {
            id: "mt1",
            title: "Midnight Deploy",
            date: new Date(2026, 1, 5, 0, 0),
            endDate: new Date(2026, 1, 5, 0, 30),
            type: "deadline",
        };
        const timedOnly = [midnightTimed];
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 5)}
                defaultView="week"
                events={timedOnly}
            />,
        );
        expect(screen.queryByText(/^All$/i)).not.toBeInTheDocument();
    });

    it("does NOT treat a non-midnight event as all-day", () => {
        const timed: CalendarEvent = {
            id: "t1",
            title: "Morning Call",
            date: new Date(2026, 1, 5, 8, 0),
            type: "meeting",
        };
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 5)}
                defaultView="week"
                events={[timed]}
            />,
        );
        expect(screen.queryByText(/^All$/i)).not.toBeInTheDocument();
    });
});

// 10. COLLISION LAYOUT (layoutTimedEvents)

describe("Concurrent event collision layout", () => {
    it("renders both overlapping events in week view without one hiding the other", () => {
        const overlapping = MOCK_EVENTS.filter((e) => ["e1", "e4"].includes(e.id));
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="week"
                events={overlapping}
            />,
        );
        expect(screen.getByText("Team Standup")).toBeInTheDocument();
        expect(screen.getByText("Code Review")).toBeInTheDocument();
    });

    it("renders both overlapping events in day view", () => {
        const overlapping = MOCK_EVENTS.filter((e) => ["e1", "e4"].includes(e.id));
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
                events={overlapping}
            />,
        );
        expect(screen.getByText("Team Standup")).toBeInTheDocument();
        expect(screen.getByText("Code Review")).toBeInTheDocument();
    });

    it("non-overlapping events are both visible", () => {
        const nonOverlapping = MOCK_EVENTS.filter((e) => ["e1", "e2"].includes(e.id));
        render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
                events={nonOverlapping}
            />,
        );
        expect(screen.getByText("Team Standup")).toBeInTheDocument();
        expect(screen.getByText("Sprint Deadline")).toBeInTheDocument();
    });
});

// 11. MONTH GRID ROW HEIGHT (Feb 2026 regression)

describe("Month grid row sizing", () => {
    it("renders 4 grid rows for February 2026 (4-week month)", () => {
        const { container } = render(<CalendarView defaultDate={FEB_2026} />);
        const grid = container.querySelector("[style*='grid-template-rows']") as HTMLElement;
        expect(grid).not.toBeNull();
        const rowStyle = grid.style.gridTemplateRows;
        expect(rowStyle).toMatch(/repeat\(4,/);
    });

    it("renders 5 grid rows for March 2026 (5-week month)", () => {
        const { container } = render(<CalendarView defaultDate={new Date(2026, 2, 1)} />);
        const grid = container.querySelector("[style*='grid-template-rows']") as HTMLElement;
        const rowStyle = grid.style.gridTemplateRows;
        expect(rowStyle).toMatch(/repeat\(5,/);
    });

    it("uses minmax row sizing (not fixed 120px)", () => {
        const { container } = render(<CalendarView defaultDate={FEB_2026} />);
        const grid = container.querySelector("[style*='grid-template-rows']") as HTMLElement;
        expect(grid.style.gridTemplateRows).not.toContain("120px");
        expect(grid.style.gridTemplateRows).toContain("minmax");
    });
});

// 12. TODAY HIGHLIGHTING

describe("Today highlighting", () => {
    it("highlights today's date with the primary background in month view", () => {
        const today = new Date();
        render(<CalendarView />);
        const todaySpan = screen
            .getAllByText(String(today.getDate()))
            .find((el) => el.className.includes("bg-primary"));
        expect(todaySpan).toBeTruthy();
    });

    it("accepts a custom today prop for testing", () => {
        const customToday = new Date(2026, 1, 14);
        const { container } = render(
            <CalendarView defaultDate={FEB_2026} today={customToday} />,
        );
        const primarySpans = container.querySelectorAll(".bg-primary");
        const found = Array.from(primarySpans).some((el) => el.textContent?.trim() === "14");
        expect(found).toBe(true);
    });
});

// 13. DATE SELECTION

describe("Date selection", () => {
    it("calls onDateSelect when a day cell is clicked in month view", async () => {
        const onDateSelect = vi.fn();
        render(
            <CalendarView defaultDate={FEB_2026} onDateSelect={onDateSelect} />,
        );
        await userEvent.click(screen.getByText("11"));
        expect(onDateSelect).toHaveBeenCalledOnce();
        const date: Date = onDateSelect.mock.calls[0][0];
        expect(date.getDate()).toBe(11);
        expect(date.getMonth()).toBe(1);
    });

    it("drills down to day view when a day cell is clicked in month view", async () => {
        const onViewChange = vi.fn();
        render(<CalendarView defaultDate={FEB_2026} onViewChange={onViewChange} />);
        await userEvent.click(screen.getByText("11"));
        expect(onViewChange).toHaveBeenCalledWith("day");
    });
});

// 14. DRAG & DROP

describe("Drag & drop", () => {
    it("renders event chips with cursor-grab class in month view", () => {
        const { container } = render(
            <CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} onEventDrop={vi.fn()} />,
        );
        const chips = container.querySelectorAll(".cursor-grab");
        expect(chips.length).toBeGreaterThan(0);
    });

    it("renders data-drag-date attributes on day cells in month view", () => {
        const { container } = render(
            <CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} onEventDrop={vi.fn()} />,
        );
        const dragTargets = container.querySelectorAll("[data-drag-date]");
        expect(dragTargets.length).toBeGreaterThanOrEqual(28);
    });

    it("does not fire onEventDrop when no drag occurs", async () => {
        const onEventDrop = vi.fn();
        render(
            <CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} onEventDrop={onEventDrop} />,
        );
        expect(onEventDrop).not.toHaveBeenCalled();
    });

    it("applies opacity-30 on the event chip after pointerDown", () => {
        const { container } = render(
            <CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} onEventDrop={vi.fn()} />,
        );
        const chip = container.querySelector("[class*='cursor-grab']") as HTMLElement;
        expect(chip).toBeTruthy();
        fireEvent.pointerDown(chip, { clientX: 100, clientY: 100, button: 0 });
        expect(chip.className).toContain("opacity-30");
        fireEvent.pointerUp(document);
    });

    it("does not call onEventDrop when pointerUp happens without moving to a new date", () => {
        const onEventDrop = vi.fn();
        const { container } = render(
            <CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} onEventDrop={onEventDrop} />,
        );
        const chip = container.querySelector("[class*='cursor-grab']") as HTMLElement;
        fireEvent.pointerDown(chip, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.pointerUp(document);
        expect(onEventDrop).not.toHaveBeenCalled();
    });

    it("removes opacity-30 from the event chip after pointerUp (drag end)", () => {
        render(
            <CalendarView defaultDate={FEB_2026} events={MOCK_EVENTS} onEventDrop={vi.fn()} />,
        );
        const chip = screen.getByText(/Team Standup/).closest("[class*='cursor-grab']") as HTMLElement;
        fireEvent.pointerDown(chip, { clientX: 100, clientY: 100, button: 0 });
        expect(chip.className).toContain("opacity-30");
        fireEvent.pointerUp(document);
        expect(chip.className).not.toContain("opacity-30");
    });

    it("renders data-drag-date and data-drag-grid attributes in week view", async () => {
        const { container } = render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="week"
                events={MOCK_EVENTS}
                onEventDrop={vi.fn()}
            />,
        );
        const timeGridCells = container.querySelectorAll("[data-drag-grid='time']");
        expect(timeGridCells.length).toBe(7);
    });

    it("renders data-drag-date and data-drag-grid attributes in day view", () => {
        const { container } = render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
                events={MOCK_EVENTS}
                onEventDrop={vi.fn()}
            />,
        );
        const timeGrid = container.querySelector("[data-drag-grid='time']");
        expect(timeGrid).not.toBeNull();
        expect(timeGrid!.getAttribute("data-drag-date")).toBeTruthy();
    });

    it("event chips in week view have touch-none for drag handling", () => {
        const { container } = render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="week"
                events={MOCK_EVENTS}
                onEventDrop={vi.fn()}
            />,
        );
        const chips = container.querySelectorAll(".touch-none");
        expect(chips.length).toBeGreaterThan(0);
    });

    it("event chips in day view have cursor-grab class", () => {
        const { container } = render(
            <CalendarView
                defaultDate={new Date(2026, 1, 10)}
                defaultView="day"
                events={MOCK_EVENTS}
                onEventDrop={vi.fn()}
            />,
        );
        const chips = container.querySelectorAll(".cursor-grab");
        expect(chips.length).toBeGreaterThan(0);
    });

    it("accepts onEventDrop prop without errors", () => {
        const onEventDrop = vi.fn();
        expect(() =>
            render(
                <CalendarView
                    defaultDate={FEB_2026}
                    events={MOCK_EVENTS}
                    onEventDrop={onEventDrop}
                />,
            ),
        ).not.toThrow();
    });
});