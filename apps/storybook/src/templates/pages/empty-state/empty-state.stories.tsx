import type { Meta, StoryObj } from "@storybook/react";
import { ArchiveIcon, CubeIcon, UploadIcon, MagnifyingGlassIcon, EnvelopeOpenIcon } from "@radix-ui/react-icons";
import {
  EmptyState,
  EmptyStateIllustration,
  EmptyStateHeading,
  EmptyStateDesc,
  EmptyStateActions,
  EmptyStateHelp,
} from "./index";
import { Button } from "../../../components/button";

const meta: Meta<typeof EmptyState> = {
  title: "Templates/Pages/Empty State",
  component: EmptyState,
  subcomponents: {
    EmptyStateIllustration,
    EmptyStateHeading,
    EmptyStateDesc,
    EmptyStateActions,
    EmptyStateHelp,
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "card", "minimal", "gradient"],
      description: "The visual style of the empty state container.",
    },
    children: {
      control: false,
      description: "The components to be rendered inside the empty state.",
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A highly customizable and composable empty state template for building consistent 'no data' screens. It supports multiple variants, Framer Motion animations, and custom illustrations.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIllustration icon={ArchiveIcon} />
      <EmptyStateHeading>No Projects Yet</EmptyStateHeading>
      <EmptyStateDesc>
        You haven't created any projects. Get started by creating your first project to organize your work.
      </EmptyStateDesc>
      <EmptyStateActions>
        <Button variant="default" animationVariant="pulse">
          Create New Project
        </Button>
        <Button variant="outline">
          Import Project
        </Button>
      </EmptyStateActions>
      <EmptyStateHelp linkText="View documentation" href="#" />
    </EmptyState>
  ),
};

export const MinimalVariant: Story = {
  render: () => (
    <EmptyState variant="minimal">
      <EmptyStateIllustration icon={MagnifyingGlassIcon} />
      <EmptyStateHeading title="No results found" />
      <EmptyStateDesc description="We couldn't find anything matching your search query. Try adjusting your filters or search terms." />
      <EmptyStateActions>
        <Button variant="outline">Clear all filters</Button>
      </EmptyStateActions>
    </EmptyState>
  ),
};

export const CardVariant: Story = {
  render: () => (
    <div className="w-full max-w-2xl bg-muted/20 p-8 rounded-xl">
      <EmptyState variant="card">
        <EmptyStateIllustration icon={EnvelopeOpenIcon} />
        <EmptyStateHeading>Your inbox is empty</EmptyStateHeading>
        <EmptyStateDesc>
          You don't have any new messages. We'll notify you when someone reaches out.
        </EmptyStateDesc>
        <EmptyStateActions>
          <Button variant="default">Refresh Inbox</Button>
        </EmptyStateActions>
      </EmptyState>
    </div>
  ),
};

export const GradientVariant: Story = {
  render: () => (
    <EmptyState variant="gradient">
      <EmptyStateIllustration icon={UploadIcon} />
      <EmptyStateHeading>No files uploaded</EmptyStateHeading>
      <EmptyStateDesc>
        Upload files to your cloud storage to keep them safe and accessible from anywhere.
      </EmptyStateDesc>
      <EmptyStateActions>
        <Button variant="default" animationVariant="scalePulse">
          Upload Files
        </Button>
      </EmptyStateActions>
    </EmptyState>
  ),
};

export const CustomIllustration: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIllustration illustration={
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-pink-100 dark:bg-pink-900/30">
          <CubeIcon className="w-16 h-16 text-pink-500" />
        </div>
      } />
      <EmptyStateHeading>Your cart is empty</EmptyStateHeading>
      <EmptyStateDesc>
        Looks like you haven't added anything to your cart yet. Discover our latest products and deals.
      </EmptyStateDesc>
      <EmptyStateActions>
        <Button variant="default">Start Shopping</Button>
      </EmptyStateActions>
      <EmptyStateHelp linkText="Browse categories" />
    </EmptyState>
  ),
};
