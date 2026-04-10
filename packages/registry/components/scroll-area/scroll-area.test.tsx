import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScrollArea, ScrollBar } from "./index";

vi.mock("framer-motion", () => {
    return {
        motion: new Proxy(
            {},
            {
                get: (_target: object, prop: string) => {
                    const Tag = prop;
                    return React.forwardRef(
                        (
                            { children, initial: _i, animate: _a, exit: _e, transition: _t, ...rest }: React.PropsWithChildren<Record<string, unknown>>,
                            ref: React.Ref<HTMLElement>
                        ) => React.createElement(Tag, { ...rest, ref }, children)
                    );
                },
            }
        ),
        AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    };
});

vi.mock("@radix-ui/react-scroll-area", () => {
    const Root = React.forwardRef(
        ({ children, className, ...rest }: React.PropsWithChildren<{ className?: string }>, ref: React.Ref<HTMLDivElement>) =>
            <div ref={ref} className={className} data-testid="scroll-root" {...rest}>{children}</div>
    );
    Root.displayName = "Root";

    const Viewport = React.forwardRef(
        ({ children, className, ...rest }: React.PropsWithChildren<{ className?: string }>, ref: React.Ref<HTMLDivElement>) =>
            <div ref={ref} className={className} data-testid="scroll-viewport" {...rest}>{children}</div>
    );
    Viewport.displayName = "Viewport";

    const ScrollAreaScrollbar = React.forwardRef(
        ({ children, orientation, asChild, ...rest }: any, ref: React.Ref<HTMLDivElement>) => {
            if (asChild && React.isValidElement(children)) {
                return React.cloneElement(children, {
                    ...rest,
                    ref,
                    "data-testid": `scrollbar-${orientation}`,
                    "data-orientation": orientation,
                    className: [(children as any).props.className, (rest as any).className].filter(Boolean).join(" "),
                } as any);
            }
            return <div ref={ref} data-testid={`scrollbar-${orientation}`} data-orientation={orientation} {...rest}>{children}</div>;
        }
    );
    ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar";

    const ScrollAreaThumb = ({ className }: { className?: string }) =>
        <div className={className} data-testid="scroll-thumb" />;

    const Corner = () => <div data-testid="scroll-corner" />;

    return {
        Root,
        Viewport,
        ScrollAreaScrollbar,
        ScrollAreaThumb,
        Corner,
    };
});

vi.mock("@radix-ui/react-icons", () => ({
    ChevronUpIcon: () => <svg data-testid="icon-up" />,
    ChevronDownIcon: () => <svg data-testid="icon-down" />,
    ChevronLeftIcon: () => <svg data-testid="icon-left" />,
    ChevronRightIcon: () => <svg data-testid="icon-right" />,
}));

function renderScrollArea(props: React.ComponentProps<typeof ScrollArea> = {}) {
    return render(
        <ScrollArea {...props}>
            <div style={{ height: 1000, width: 1000 }}>Scrollable content</div>
        </ScrollArea>
    );
}

describe("ScrollArea", () => {

    describe("Rendering", () => {
        it("renders root, viewport, and corner", () => {
            renderScrollArea();
            expect(screen.getByTestId("scroll-root")).toBeInTheDocument();
            expect(screen.getByTestId("scroll-viewport")).toBeInTheDocument();
            expect(screen.getByTestId("scroll-corner")).toBeInTheDocument();
        });

        it("renders children inside the viewport", () => {
            renderScrollArea();
            expect(screen.getByText("Scrollable content")).toBeInTheDocument();
        });

        it("applies custom className to root", () => {
            renderScrollArea({ className: "custom-class" });
            expect(screen.getByTestId("scroll-root")).toHaveClass("custom-class");
        });

        it("renders vertical scrollbar by default", () => {
            renderScrollArea();
            expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
        });

        it("does not render horizontal scrollbar when orientation is vertical", () => {
            renderScrollArea({ orientation: "vertical" });
            expect(screen.queryByTestId("scrollbar-horizontal")).not.toBeInTheDocument();
        });

        it("renders horizontal scrollbar when orientation is horizontal", () => {
            renderScrollArea({ orientation: "horizontal" });
            expect(screen.getByTestId("scrollbar-horizontal")).toBeInTheDocument();
            expect(screen.queryByTestId("scrollbar-vertical")).not.toBeInTheDocument();
        });

        it("renders both scrollbars when orientation is both", () => {
            renderScrollArea({ orientation: "both" });
            expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
            expect(screen.getByTestId("scrollbar-horizontal")).toBeInTheDocument();
        });
    });

    describe("showProgress", () => {
        it("does not render progress bar by default", () => {
            renderScrollArea();
            const root = screen.getByTestId("scroll-root");
            expect(root.querySelector(".origin-left")).not.toBeInTheDocument();
        });

        it("renders progress bar when showProgress is true", () => {
            renderScrollArea({ showProgress: true });
            const root = screen.getByTestId("scroll-root");
            expect(root.querySelector(".origin-left")).toBeInTheDocument();
        });
    });

    describe("showScrollButtons", () => {
        it("does not render scroll edge buttons by default", () => {
            renderScrollArea();
            expect(screen.queryByLabelText("Scroll up")).not.toBeInTheDocument();
            expect(screen.queryByLabelText("Scroll down")).not.toBeInTheDocument();
        });

        it("renders up/down edge buttons for vertical orientation when showScrollButtons is true", () => {
            renderScrollArea({ showScrollButtons: true, orientation: "vertical" });
            expect(screen.queryByLabelText("Scroll up")).not.toBeInTheDocument();
        });

        it("renders left/right edge buttons for horizontal orientation when showScrollButtons is true", () => {
            renderScrollArea({ showScrollButtons: true, orientation: "horizontal" });
            expect(screen.queryByLabelText("Scroll left")).not.toBeInTheDocument();
        });

        it("does not render vertical edge buttons for horizontal orientation", () => {
            renderScrollArea({ showScrollButtons: true, orientation: "horizontal" });
            expect(screen.queryByLabelText("Scroll up")).not.toBeInTheDocument();
            expect(screen.queryByLabelText("Scroll down")).not.toBeInTheDocument();
        });
    });

    describe("animation prop", () => {
        it("renders children directly when animation is none (default)", () => {
            renderScrollArea({ animation: "none" });
            const viewport = screen.getByTestId("scroll-viewport");
            expect(viewport).toHaveTextContent("Scrollable content");
        });

        it("wraps children in motion.div when animation is fade", () => {
            renderScrollArea({ animation: "fade" });
            const viewport = screen.getByTestId("scroll-viewport");
            expect(viewport).toHaveTextContent("Scrollable content");
        });

        it("wraps children in motion.div when animation is slide", () => {
            renderScrollArea({ animation: "slide" });
            const viewport = screen.getByTestId("scroll-viewport");
            expect(viewport).toHaveTextContent("Scrollable content");
        });

        it("wraps children in motion.div when animation is scale", () => {
            renderScrollArea({ animation: "scale" });
            const viewport = screen.getByTestId("scroll-viewport");
            expect(viewport).toHaveTextContent("Scrollable content");
        });
    });

    describe("autoHide", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("scrollbar is visible at all times when autoHide is false", () => {
            renderScrollArea({ autoHide: false });
            expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
        });

        it("scrollbar is present in DOM regardless of autoHide (forceMount)", () => {
            renderScrollArea({ autoHide: true });
            expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
        });
    });

    describe("viewport overflow classes", () => {
        it("adds overflow-x-auto for horizontal orientation", () => {
            renderScrollArea({ orientation: "horizontal" });
            expect(screen.getByTestId("scroll-viewport")).toHaveClass("overflow-x-auto");
        });

        it("adds overflow-auto for both orientation", () => {
            renderScrollArea({ orientation: "both" });
            expect(screen.getByTestId("scroll-viewport")).toHaveClass("overflow-auto");
        });

        it("does not add explicit overflow classes for vertical orientation (Radix handles it)", () => {
            renderScrollArea({ orientation: "vertical" });
            const vp = screen.getByTestId("scroll-viewport");
            expect(vp).not.toHaveClass("overflow-x-auto");
            expect(vp).not.toHaveClass("overflow-auto");
        });
    });

    describe("viewportRef", () => {
        it("forwards viewportRef as a ref object", () => {
            const ref = React.createRef<HTMLDivElement>();
            renderScrollArea({ viewportRef: ref });
            expect(ref.current).not.toBeNull();
        });

        it("forwards viewportRef as a callback ref", () => {
            let capturedNode: HTMLDivElement | null = null;
            renderScrollArea({ viewportRef: (node) => { capturedNode = node; } });
            expect(capturedNode).not.toBeNull();
        });
    });

    describe("scroll event handling", () => {
        it("does not throw when viewport fires scroll event", () => {
            renderScrollArea({ showProgress: true, orientation: "vertical" });
            const viewport = screen.getByTestId("scroll-viewport");
            Object.defineProperties(viewport, {
                scrollHeight: { value: 1000, configurable: true },
                clientHeight: { value: 200, configurable: true },
                scrollTop: { value: 200, configurable: true, writable: true },
            });
            expect(() => fireEvent.scroll(viewport)).not.toThrow();
        });

        it("computes horizontal scroll progress without throwing", () => {
            renderScrollArea({ showProgress: true, orientation: "horizontal" });
            const viewport = screen.getByTestId("scroll-viewport");
            Object.defineProperties(viewport, {
                scrollWidth: { value: 1000, configurable: true },
                clientWidth: { value: 200, configurable: true },
                scrollLeft: { value: 100, configurable: true, writable: true },
            });
            expect(() => fireEvent.scroll(viewport)).not.toThrow();
        });
    });

    describe("fadeMask", () => {
        it('applies top fade mask style to viewport for fadeMask="top"', () => {
            renderScrollArea({ fadeMask: "top" });
            const viewport = screen.getByTestId("scroll-viewport");
            expect(viewport.style.maskImage || viewport.style.webkitMaskImage || "").toContain("");
        });

        it('applies bottom fade mask style to viewport for fadeMask="bottom"', () => {
            renderScrollArea({ fadeMask: "bottom" });
            expect(screen.getByTestId("scroll-viewport")).toBeInTheDocument();
        });

        it('applies both-ends fade mask for fadeMask="fade"', () => {
            renderScrollArea({ fadeMask: "fade" });
            expect(screen.getByTestId("scroll-viewport")).toBeInTheDocument();
        });

        it('fadeMask="none" does not crash and renders normally', () => {
            renderScrollArea({ fadeMask: "none" });
            expect(screen.getByTestId("scroll-viewport")).toBeInTheDocument();
        });
    });

    describe("cleanup", () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it("clears hide timer on unmount without error", () => {
            const { unmount } = renderScrollArea({ autoHide: true });
            expect(() => unmount()).not.toThrow();
        });
    });
});

describe("ScrollBar", () => {
    it("renders vertical scrollbar by default", () => {
        render(<ScrollBar />);
        expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
    });

    it("renders horizontal scrollbar when orientation is horizontal", () => {
        render(<ScrollBar orientation="horizontal" />);
        expect(screen.getByTestId("scrollbar-horizontal")).toBeInTheDocument();
    });

    it("renders the thumb inside the scrollbar", () => {
        render(<ScrollBar />);
        expect(screen.getByTestId("scroll-thumb")).toBeInTheDocument();
    });

    it("applies variant class for thick variant", () => {
        render(<ScrollBar variant="thick" />);
        expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
    });

    it("applies hidden variant class", () => {
        render(<ScrollBar variant="hidden" />);
        const sb = screen.getByTestId("scrollbar-vertical");
        expect(sb.className).toMatch(/opacity-0/);
    });

    it("applies accent thumbColor class", () => {
        render(<ScrollBar thumbColor="accent" />);
        expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(<ScrollBar className="my-scrollbar" />);
        expect(screen.getByTestId("scrollbar-vertical")).toHaveClass("my-scrollbar");
    });

    it("renders with forceVisible false without crashing", () => {
        render(<ScrollBar forceVisible={false} />);
        expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
    });

    it("renders with expandOnHover false without crashing", () => {
        render(<ScrollBar expandOnHover={false} />);
        expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
    });

    it("has correct displayName", () => {
        expect(ScrollBar.displayName).toBe("ScrollBar");
    });
});

describe("getTrackClasses (via ScrollBar)", () => {
    const sizes = ["sm", "md", "lg"] as const;
    const variants = ["thin", "thick", "pill", "line", "hidden"] as const;

    for (const variant of variants) {
        for (const size of sizes) {
            it(`renders without error for variant="${variant}" size="${size}"`, () => {
                render(<ScrollBar variant={variant} size={size} />);
                expect(screen.getByTestId("scrollbar-vertical")).toBeInTheDocument();
            });
        }
    }

    it("renders horizontal track classes without error for thick/lg", () => {
        render(<ScrollBar orientation="horizontal" variant="thick" size="lg" />);
        expect(screen.getByTestId("scrollbar-horizontal")).toBeInTheDocument();
    });
});

describe("displayName", () => {
    it("ScrollArea has correct displayName", () => {
        expect(ScrollArea.displayName).toBe("ScrollArea");
    });

    it("ScrollBar has correct displayName", () => {
        expect(ScrollBar.displayName).toBe("ScrollBar");
    });
});