import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "./index";

const meta: Meta<typeof Container> = {
  title: "Layouts/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A flexible layout container that controls max-width, padding, centering, and responsive behavior. **maxWidth** takes precedence over **size** when both are provided.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["small", "normal", "large", "full", "readable"],
      table: { defaultValue: { summary: "normal" } },
    },
    padding: {
      control: "select",
      options: ["none", "small", "normal", "large", "xl"],
      table: { defaultValue: { summary: "normal" } },
    },
    maxWidth: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full", undefined],
    },
    center: {
      control: "boolean",
      table: { defaultValue: { summary: "true" } },
    },
    responsive: {
      control: "boolean",
      table: { defaultValue: { summary: "true" } },
    },
    className: {
      control: "text",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Container>;

const Placeholder = ({
  label,
  tall = false,
}: {
  label?: string;
  tall?: boolean;
}) => (
  <div
    className={`w-full rounded-md border-2 border-dashed border-blue-400 bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-mono ${
      tall ? "h-40" : "h-16"
    }`}
  >
    {label ?? "container content"}
  </div>
);

export const Default: Story = {
  args: {
    size: "normal",
    padding: "normal",
    center: true,
    responsive: true,
  },
  render: (args) => (
    <Container {...args}>
      <Placeholder />
    </Container>
  ),
};

export const SizeSmall: Story = {
  name: "Size / Small",
  render: () => (
    <Container size="small">
      <Placeholder label="size=small - max-w-sm" />
    </Container>
  ),
};

export const SizeNormal: Story = {
  name: "Size / Normal",
  render: () => (
    <Container size="normal">
      <Placeholder label="size=normal - max-w-md" />
    </Container>
  ),
};

export const SizeLarge: Story = {
  name: "Size / Large",
  render: () => (
    <Container size="large">
      <Placeholder label="size=large - max-w-3xl" />
    </Container>
  ),
};

export const SizeReadable: Story = {
  name: "Size / Readable",
  render: () => (
    <Container size="readable">
      <Placeholder label="size=readable - max-w-prose" />
    </Container>
  ),
};

export const SizeFull: Story = {
  name: "Size / Full",
  render: () => (
    <Container size="full">
      <Placeholder label="size=full - max-w-full" />
    </Container>
  ),
};

export const AllSizes: Story = {
  name: "Size / All sizes",
  render: () => (
    <div className="space-y-4 py-6 bg-gray-50 min-h-screen">
      {(["small", "normal", "large", "readable", "full"] as const).map(
        (size) => (
          <Container key={size} size={size}>
            <Placeholder label={`size="${size}"`} />
          </Container>
        )
      )}
    </div>
  ),
};

export const AllPaddings: Story = {
  name: "Padding / All variants",
  render: () => (
    <div className="space-y-4 py-6 bg-gray-100 min-h-screen">
      {(["none", "small", "normal", "large", "xl"] as const).map((p) => (
        <Container key={p} size="large" padding={p} className="bg-white border border-gray-200">
          <Placeholder label={`padding="${p}"`} />
        </Container>
      ))}
    </div>
  ),
};

export const NotCentered: Story = {
  name: "Center / Disabled",
  render: () => (
    <div className="bg-gray-50 min-h-screen p-4">
      <Container size="normal" center={false}>
        <Placeholder label="center=false" />
      </Container>
    </div>
  ),
};

export const ResponsiveOff: Story = {
  name: "Responsive / Disabled",
  render: () => (
    <div className="bg-gray-50 min-h-screen p-4">
      <Container size="large" responsive={false} className="bg-white border border-gray-200">
        <Placeholder label="responsive=false" />
      </Container>
    </div>
  ),
};
