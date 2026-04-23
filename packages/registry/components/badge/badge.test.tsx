import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Badge } from "./index";
import React from "react";

vi.mock("framer-motion", () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        React.forwardRef(({ children, ...rest }: any, ref) =>
          React.createElement(tag, { ...rest, ref }, children)
        ),
    }
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

const renderBadge = (props: Partial<React.ComponentProps<typeof Badge>> = {}) =>
  render(<Badge text="Badge Text" {...props} />);

describe("Badge rendering", () => {
  it("renders without crashing", () => {
    renderBadge();
    expect(screen.getByText("Badge Text")).toBeInTheDocument();
  });

  it("displays the text prop", () => {
    renderBadge({ text: "42" });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the badge text inside a <span>", () => {
    renderBadge({ text: "Hello" });
    expect(screen.getByText("Hello").tagName).toBe("SPAN");
  });

  it("renders overlay only in attached mode", () => {
    const { container } = render(
      <Badge mode="attached" text="1">
        <div>child</div>
      </Badge>
    );

    const overlay = container.querySelector("div[aria-hidden='true']");
    expect(overlay).toBeInTheDocument();
  });
});

describe("Badge children", () => {
  it("renders children only in attached mode", () => {
    render(
      <Badge mode="attached" text="3">
        <button>Bell</button>
      </Badge>
    );

    expect(screen.getByRole("button", { name: "Bell" })).toBeInTheDocument();
  });

  it("does NOT render children in inline mode", () => {
    render(
      <Badge text="3">
        <button>Bell</button>
      </Badge>
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("Badge type prop", () => {
  const typeCases: Array<[React.ComponentProps<typeof Badge>["type"], string]> = [
    ["primary", "bg-primary"],
    ["secondary", "bg-secondary"],
    ["success", "bg-success"],
    ["warning", "bg-warning"],
    ["error", "bg-destructive"],
  ];

  it.each(typeCases)('type="%s" applies class "%s"', (type, expectedClass) => {
    render(<Badge text="X" type={type} />);
    const badge = screen.getByText("X").parentElement;
    expect(badge?.className).toContain(expectedClass);
  });

  it("defaults to primary type", () => {
    render(<Badge text="X" />);
    const badge = screen.getByText("X").parentElement;
    expect(badge?.className).toContain("bg-primary");
  });
});

describe("Badge variant prop", () => {
  it.each(["pulse", "bounce", "tinypop"] as const)(
    'variant="%s" renders',
    (variant) => {
      renderBadge({ variant });
      expect(screen.getByText("Badge Text")).toBeInTheDocument();
    }
  );
});

describe("Badge className", () => {
  it("applies custom className", () => {
    render(<Badge text="X" className="custom" />);
    const badge = screen.getByText("X").parentElement;
    expect(badge?.className).toContain("custom");
  });

  it("merges with default classes", () => {
    render(<Badge text="X" type="success" className="extra" />);
    const badge = screen.getByText("X").parentElement;
    expect(badge?.className).toContain("bg-success");
    expect(badge?.className).toContain("extra");
  });
});

describe("Badge structure", () => {
  it("inline mode has no wrapper", () => {
    const { container } = renderBadge();
    const root = container.firstElementChild;
    expect(root?.className).not.toContain("relative inline-flex");
  });

  it("attached mode has wrapper", () => {
    const { container } = render(
      <Badge mode="attached" text="1">
        <div>child</div>
      </Badge>
    );

    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("relative");
    expect(wrapper?.className).toContain("inline-flex");
  });

  it("badge has rounded-full", () => {
    renderBadge();
    const badge = screen.getByText("Badge Text").parentElement;
    expect(badge?.className).toContain("rounded-full");
  });
});

describe("Badge displayName", () => {
  it("has correct displayName", () => {
    expect(Badge.displayName).toBe("Badge");
  });
});