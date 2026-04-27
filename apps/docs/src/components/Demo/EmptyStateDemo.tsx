import React, { useState } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import VariantSelector from './VariantSelector';
import {
  EmptyState,
  EmptyStateIllustration,
  EmptyStateHeading,
  EmptyStateDesc,
  EmptyStateBadge,
  EmptyStateActions,
  EmptyStateHelp,
} from '@site/src/components/UI/empty-state';
import { Button } from '@site/src/components/UI/button';
import { ArchiveIcon, MagnifyingGlassIcon, UploadIcon, PlusIcon, BellIcon } from '@radix-ui/react-icons';

type EmptyStateVariant = 'default' | 'minimal' | 'gradient' | 'card';

const variants: EmptyStateVariant[] = ['default', 'minimal', 'gradient', 'card'];

const EmptyStateDemo = () => {
  const [variant, setVariant] = useState<EmptyStateVariant>('default');

  const generateCodeString = () => {
    return `import {
  EmptyState,
  EmptyStateIllustration,
  EmptyStateHeading,
  EmptyStateDesc,
  EmptyStateActions,
  EmptyStateHelp,
} from '@ignix-ui/empty-state';
import { Button } from '@ignix-ui/button';
import { ArchiveIcon, PlusIcon, UploadIcon } from '@radix-ui/react-icons';

<EmptyState variant="${variant}">
  <EmptyStateIllustration icon={ArchiveIcon} />
  <EmptyStateHeading>No Projects Yet</EmptyStateHeading>
  <EmptyStateDesc>
    You haven't created any projects. Get started by creating your first project to organize your work.
  </EmptyStateDesc>
  <EmptyStateActions>
    <Button variant="default" animationVariant="pulse">
      <PlusIcon className="mr-2" /> Create New Project
    </Button>
    <Button variant="outline">
      <UploadIcon className="mr-2" /> Import Project
    </Button>
  </EmptyStateActions>
  <EmptyStateHelp linkText="View documentation" href="#" />
</EmptyState>`;
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
        <VariantSelector
          variants={[...variants]}
          selectedVariant={variant}
          onSelectVariant={(v) => setVariant(v as EmptyStateVariant)}
          type="Variant"
        />
      </div>

      <Tabs>
        <TabItem value="preview" label="Preview">
          <div className="border border-border rounded-xl overflow-hidden bg-background transition-colors duration-300">
            <div className="p-8 flex justify-center items-center min-h-[500px]">
              {variant === 'card' ? (
                <div className="w-full max-w-2xl p-12 rounded-[3rem] bg-gradient-to-b from-primary/5 to-transparent border border-primary/10 shadow-inner">
                  <EmptyState variant="card">
                    <EmptyStateIllustration icon={BellIcon} accent="teal" />
                    <EmptyStateBadge label="New Notification" dot />
                    <EmptyStateHeading>Your inbox is empty</EmptyStateHeading>
                    <EmptyStateDesc>
                      You don't have any new messages. We'll notify you as soon as someone reaches out or a task is assigned.
                    </EmptyStateDesc>
                    <EmptyStateActions>
                      <Button variant="default" className="rounded-full px-8 shadow-lg shadow-primary/20">Refresh Inbox</Button>
                    </EmptyStateActions>
                  </EmptyState>
                </div>
              ) : (
                <EmptyState variant={variant}>
                  <EmptyStateIllustration
                    icon={variant === 'minimal' ? MagnifyingGlassIcon : (variant === 'gradient' ? UploadIcon : ArchiveIcon)}
                    accent={variant === 'gradient' ? 'amber' : 'primary'}
                  />
                  {variant !== 'minimal' && <EmptyStateBadge label="Project status: inactive" dot={false} className="mb-6 opacity-80" />}
                  <EmptyStateHeading>{variant === 'minimal' ? 'No results found' : 'No Projects Yet'}</EmptyStateHeading>
                  <EmptyStateDesc>
                    {variant === 'minimal'
                      ? "We couldn't find anything matching your search query. Try adjusting your filters."
                      : "You haven't created any projects. Get started by creating your first project to organize your work."}
                  </EmptyStateDesc>
                  <EmptyStateActions>
                    {variant === 'minimal' ? (
                      <Button variant="outline" className="rounded-full">Clear all filters</Button>
                    ) : (
                      <>
                        <Button variant="default" animationVariant="pulse" className="rounded-full px-6">
                          <PlusIcon className="mr-2" /> Create New Project
                        </Button>
                        <Button variant="outline" className="rounded-full px-6">
                          <UploadIcon className="mr-2" /> Import Project
                        </Button>
                      </>
                    )}
                  </EmptyStateActions>
                  {variant !== 'minimal' && <EmptyStateHelp linkText="View documentation" href="#" />}
                </EmptyState>
              )}
            </div>
          </div>
        </TabItem>
        <TabItem value="code" label="Code">
          <CodeBlock language="tsx" className="whitespace-pre-wrap max-h-[500px] overflow-y-scroll">
            {generateCodeString()}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
};

export { EmptyStateDemo };
