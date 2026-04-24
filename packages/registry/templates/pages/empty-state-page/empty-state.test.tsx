import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("framer-motion", async () => {
    const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
    return {
        ...actual,
        motion: new Proxy(
            {},
            {
                get: (_target, tag: string): React.ForwardRefExoticComponent<React.PropsWithoutRef<Record<string, unknown>> & React.RefAttributes<unknown>> =>
                    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
                        const {
                            /* eslint-disable @typescript-eslint/no-unused-vars */
                            animate: _a, initial: _in, variants: _v, transition: _t, whileHover: _wh, whileTap: _wt,
                            transformStyle: _ts, rotateX: _rx, rotateY: _ry, translateZ: _tz,
                            /* eslint-enable @typescript-eslint/no-unused-vars */
                            ...domProps
                        } = props;
                        return React.createElement(tag, { ...domProps, ref });
                    }),
            }
        ),
        useMotionValue: (initial: number): { set: () => void; get: () => number } => ({ set: vi.fn(), get: () => initial }),
        useSpring: (mv: unknown): unknown => mv,
        useTransform: (_mv: unknown, _input: unknown, _output: unknown): number => 0,
        AnimatePresence: ({ children }: { children: React.ReactNode }): React.JSX.Element => <>{children}</>,
    };
});

vi.mock("@radix-ui/react-icons", () => ({
    FileTextIcon: (p: React.SVGProps<SVGSVGElement>): React.JSX.Element => <svg data-testid="icon-file-text"     {...p} />,
    PlusIcon: (p: React.SVGProps<SVGSVGElement>): React.JSX.Element => <svg data-testid="icon-plus"           {...p} />,
    UploadIcon: (p: React.SVGProps<SVGSVGElement>): React.JSX.Element => <svg data-testid="icon-upload"         {...p} />,
    QuestionMarkCircledIcon: (p: React.SVGProps<SVGSVGElement>): React.JSX.Element => <svg data-testid="icon-question-mark" {...p} />,
}));

vi.mock("../../../../utils/cn", () => ({ cn: (...c: unknown[]): string => c.filter(Boolean).join(" ") }));

vi.mock("../../../components/button", () => ({
    Button: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>): React.JSX.Element => (
        <button {...p}>{children}</button>
    ),
}));

vi.mock("../../../components/typography", () => ({
    Typography: ({
        children,
        variant,
        color,
        ...p
    }: React.PropsWithChildren<{ variant?: string; color?: string }>): React.JSX.Element => (
        <span data-variant={variant} data-color={color} {...p}>{children}</span>
    ),
}));

import {
    EmptyState,
    EmptyStateIllustration,
    EmptyStateBadge,
    EmptyStateHeading,
    EmptyStateDesc,
    EmptyStateActions,
    EmptyStateHelp,
    EmptyStateDefault,
    EmptyStateMinimal,
} from "./index";

const renderWith = (ui: React.ReactElement): ReturnType<typeof render> => render(ui);

describe("EmptyState", () => {
    it("renders children", () => {
        renderWith(<EmptyState><span>hello</span></EmptyState>);
        expect(screen.getByText("hello")).toBeInTheDocument();
    });

    it("forwards ref to the motion div", () => {
        const ref = React.createRef<HTMLDivElement>();
        renderWith(<EmptyState ref={ref}><span>ref-test</span></EmptyState>);
        expect(ref.current).not.toBeNull();
    });

    it("applies custom className", () => {
        const { container } = renderWith(
            <EmptyState className="my-custom-class"><span /></EmptyState>
        );
        expect(container.querySelector(".my-custom-class")).toBeInTheDocument();
    });

    it.each(["default", "card", "minimal", "gradient"] as const)(
        "renders variant=%s without crashing",
        (variant) => {
            const { container } = renderWith(<EmptyState variant={variant}><span /></EmptyState>);
            expect(container.firstChild).toBeInTheDocument();
        }
    );

    it("renders the subtle grid texture overlay", () => {
        const { container } = renderWith(<EmptyState><span /></EmptyState>);
        const overlay = container.querySelector("[aria-hidden='true']");
        expect(overlay).toBeInTheDocument();
    });

    describe("3-D tilt", () => {
        it("attaches mousemove / mouseleave handlers on the wrapper when tilt=true", () => {
            const { container } = renderWith(<EmptyState tilt><span /></EmptyState>);
            const wrapper = container.firstChild as HTMLElement;
            fireEvent.mouseMove(wrapper, { clientX: 100, clientY: 100 });
            fireEvent.mouseLeave(wrapper);
        });

        it("does not crash when tilt=false", () => {
            const { container } = renderWith(<EmptyState tilt={false}><span /></EmptyState>);
            const wrapper = container.firstChild as HTMLElement;
            fireEvent.mouseMove(wrapper, { clientX: 50, clientY: 50 });
            fireEvent.mouseLeave(wrapper);
        });
    });
});

describe("EmptyStateIllustration", () => {
    it("renders default FileTextIcon when no icon or illustration is given", () => {
        renderWith(<EmptyStateIllustration />);
        expect(screen.getByTestId("icon-file-text")).toBeInTheDocument();
    });

    it("renders a custom icon component", () => {
        const CustomIcon = (p: React.SVGProps<SVGSVGElement>): React.JSX.Element => (
            <svg data-testid="custom-icon" {...p} />
        );
        renderWith(<EmptyStateIllustration icon={CustomIcon} />);
        expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("renders a string illustration as <img> with alt text", () => {
        renderWith(<EmptyStateIllustration illustration="https://example.com/img.svg" />);
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", "https://example.com/img.svg");
        expect(img).toHaveAttribute("alt", "Empty state illustration");
    });

    it("renders a ReactNode illustration inside a wrapper div", () => {
        renderWith(
            <EmptyStateIllustration illustration={<span data-testid="custom-node">art</span>} />
        );
        expect(screen.getByTestId("custom-node")).toBeInTheDocument();
    });

    it.each(["primary", "teal", "amber"] as const)(
        "renders without error for accent=%s",
        (accent) => {
            expect(() =>
                renderWith(<EmptyStateIllustration accent={accent} />)
            ).not.toThrow();
        }
    );

    it("passes iconSize to the Icon component", () => {
        const SizedIcon = ({ width, height }: React.SVGProps<SVGSVGElement>): React.JSX.Element => (
            <svg data-testid="sized-icon" data-w={width} data-h={height} />
        );
        renderWith(<EmptyStateIllustration icon={SizedIcon} iconSize={32} />);
        const icon = screen.getByTestId("sized-icon");
        expect(icon).toHaveAttribute("data-w", "32");
        expect(icon).toHaveAttribute("data-h", "32");
    });
});

describe("EmptyStateBadge", () => {
    it("renders the label text", () => {
        renderWith(<EmptyStateBadge label="0 results" />);
        expect(screen.getByText("0 results")).toBeInTheDocument();
    });

    it("shows the dot indicator by default", () => {
        const { container } = renderWith(<EmptyStateBadge label="active" />);
        const spans = container.querySelectorAll("span");
        expect(spans.length).toBeGreaterThanOrEqual(1);
    });

    it("hides the dot when dot=false", () => {
        const { container } = renderWith(<EmptyStateBadge label="no dot" dot={false} />);
        const dotSpans = container.querySelectorAll("span.rounded-full");
        expect(dotSpans.length).toBe(0);
    });

    it("applies custom className", () => {
        const { container } = renderWith(
            <EmptyStateBadge label="x" className="badge-custom" />
        );
        expect(container.querySelector(".badge-custom")).toBeInTheDocument();
    });
});

describe("EmptyStateHeading", () => {
    it("renders children over title prop", () => {
        renderWith(<EmptyStateHeading title="title prop">child text</EmptyStateHeading>);
        expect(screen.getByText("child text")).toBeInTheDocument();
        expect(screen.queryByText("title prop")).not.toBeInTheDocument();
    });

    it("renders title prop when no children supplied", () => {
        renderWith(<EmptyStateHeading title="No data yet" />);
        expect(screen.getByText("No data yet")).toBeInTheDocument();
    });

    it("renders default fallback when neither title nor children are given", () => {
        renderWith(<EmptyStateHeading />);
        expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("passes variant='h3' to Typography", () => {
        renderWith(<EmptyStateHeading title="test" />);
        expect(screen.getByText("test")).toHaveAttribute("data-variant", "h3");
    });
});

describe("EmptyStateDesc", () => {
    it("renders children over description prop", () => {
        renderWith(<EmptyStateDesc description="desc prop">child desc</EmptyStateDesc>);
        expect(screen.getByText("child desc")).toBeInTheDocument();
    });

    it("renders description prop when no children supplied", () => {
        renderWith(<EmptyStateDesc description="Some description" />);
        expect(screen.getByText("Some description")).toBeInTheDocument();
    });

    it("renders default fallback text", () => {
        renderWith(<EmptyStateDesc />);
        expect(screen.getByText("There is no data to show right now.")).toBeInTheDocument();
    });

    it("passes color='muted' to Typography", () => {
        renderWith(<EmptyStateDesc description="x" />);
        expect(screen.getByText("x")).toHaveAttribute("data-color", "muted");
    });
});

describe("EmptyStateActions", () => {
    it("renders all child buttons", () => {
        renderWith(
            <EmptyStateActions>
                <button>Primary</button>
                <button>Secondary</button>
            </EmptyStateActions>
        );
        expect(screen.getByText("Primary")).toBeInTheDocument();
        expect(screen.getByText("Secondary")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        const { container } = renderWith(
            <EmptyStateActions className="actions-custom"><button>x</button></EmptyStateActions>
        );
        expect(container.querySelector(".actions-custom")).toBeInTheDocument();
    });

    it("renders with no children without crashing", () => {
        expect(() => renderWith(<EmptyStateActions />)).not.toThrow();
    });
});

describe("EmptyStateHelp", () => {
    it("renders default 'Learn more' link", () => {
        renderWith(<EmptyStateHelp />);
        expect(screen.getByText("Learn more")).toBeInTheDocument();
    });

    it("renders custom linkText", () => {
        renderWith(<EmptyStateHelp linkText="Read the docs" />);
        expect(screen.getByText("Read the docs")).toBeInTheDocument();
    });

    it("sets the correct href on the anchor", () => {
        renderWith(<EmptyStateHelp href="https://docs.example.com" linkText="Docs" />);
        expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
            "href",
            "https://docs.example.com"
        );
    });

    it("defaults href to '#'", () => {
        renderWith(<EmptyStateHelp linkText="Help" />);
        expect(screen.getByRole("link", { name: "Help" })).toHaveAttribute("href", "#");
    });

    it("renders the default QuestionMarkCircledIcon", () => {
        renderWith(<EmptyStateHelp />);
        expect(screen.getByTestId("icon-question-mark")).toBeInTheDocument();
    });

    it("renders a custom icon", () => {
        const CustomHelpIcon = (p: React.SVGProps<SVGSVGElement>): React.JSX.Element => (
            <svg data-testid="custom-help-icon" {...p} />
        );
        renderWith(<EmptyStateHelp icon={CustomHelpIcon} linkText="Help" />);
        expect(screen.getByTestId("custom-help-icon")).toBeInTheDocument();
    });

    it("renders 'Need help?' label", () => {
        renderWith(<EmptyStateHelp />);
        expect(screen.getByText("Need help?")).toBeInTheDocument();
    });
});

describe("EmptyStateDefault preset", () => {
    beforeEach(() => renderWith(<EmptyStateDefault />));

    it("renders the heading", () => {
        expect(screen.getByText("No projects yet")).toBeInTheDocument();
    });

    it("renders the description", () => {
        expect(
            screen.getByText(/Get started by creating a new project/i)
        ).toBeInTheDocument();
    });

    it("renders the Create project button", () => {
        expect(screen.getByText(/Create project/i)).toBeInTheDocument();
    });

    it("renders the Import button", () => {
        expect(screen.getByText("Import")).toBeInTheDocument();
    });

    it("renders the help link", () => {
        expect(screen.getByText("Read our documentation")).toBeInTheDocument();
    });

    it("renders the FileTextIcon illustration", () => {
        expect(screen.getByTestId("icon-file-text")).toBeInTheDocument();
    });
});

describe("EmptyStateMinimal preset", () => {
    beforeEach(() => renderWith(<EmptyStateMinimal />));

    it("renders the heading", () => {
        expect(screen.getByText("Nothing found")).toBeInTheDocument();
    });

    it("renders the description", () => {
        expect(
            screen.getByText(/We couldn't find anything matching your search/i)
        ).toBeInTheDocument();
    });

    it("renders the badge", () => {
        expect(screen.getByText("0 results")).toBeInTheDocument();
    });

    it("renders the Clear filters button", () => {
        expect(screen.getByText("Clear filters")).toBeInTheDocument();
    });

    it("uses the minimal variant (no tilt)", () => {
        const { container } = renderWith(<EmptyStateMinimal />);
        expect(() =>
            fireEvent.mouseMove(container.firstChild as HTMLElement)
        ).not.toThrow();
    });
});

describe("EmptyState full composition", () => {
    it("renders all sub-components together correctly", () => {
        renderWith(
            <EmptyState variant="gradient">
                <EmptyStateIllustration accent="amber" />
                <EmptyStateBadge label="empty" />
                <EmptyStateHeading title="Nothing here" />
                <EmptyStateDesc description="Start by adding some items." />
                <EmptyStateActions>
                    <button>Add item</button>
                </EmptyStateActions>
                <EmptyStateHelp linkText="Get help" href="/help" />
            </EmptyState>
        );

        expect(screen.getByText("empty")).toBeInTheDocument();
        expect(screen.getByText("Nothing here")).toBeInTheDocument();
        expect(screen.getByText("Start by adding some items.")).toBeInTheDocument();
        expect(screen.getByText("Add item")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Get help" })).toHaveAttribute("href", "/help");
    });
});

describe("displayName", () => {
    it.each([
        [EmptyState, "EmptyState"],
        [EmptyStateIllustration, "EmptyStateIllustration"],
        [EmptyStateBadge, "EmptyStateBadge"],
        [EmptyStateHeading, "EmptyStateHeading"],
        [EmptyStateDesc, "EmptyStateDesc"],
        [EmptyStateActions, "EmptyStateActions"],
        [EmptyStateHelp, "EmptyStateHelp"],
    ])("%s has correct displayName", (component, expected) => {
        expect((component as React.ForwardRefExoticComponent<unknown>).displayName).toBe(expected);
    });
});