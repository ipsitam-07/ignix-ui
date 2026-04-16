import React, { useState } from 'react';
import { ExplodingInput } from '@site/src/components/UI/exploding-input';
import VariantSelector from './VariantSelector';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

const presetVariants = [
  'confetti',
  'sparks',
  'stars',
  'bubbles',
  'letters',
  'emoji'
];

const ExplodingInputDemo = () => {
  const [preset, setPreset] = useState('confetti');
  const [value, setValue] = useState('');

  const codeString = `
import { ExplodingInput } from '@ignix-ui/exploding-input';

    <ExplodingInput
      placeholder="Type something to explode..."
      particlePreset="${preset}"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
`;

  return (
    <div className="flex flex-col space-y-4 mb-8 sm:justify-end justify-start">
      <VariantSelector
        variants={presetVariants}
        selectedVariant={preset}
        onSelectVariant={setPreset}
        type="Variant"
      />
      <Tabs>
        <TabItem value="preview" label="Preview">
          <div className="p-4 pt-10 pb-[100px] border rounded-lg mt-4 flex items-center justify-center">
            <div className="w-full max-w-sm">
                <ExplodingInput
                placeholder="Type here..."
                particlePreset={preset as any}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                />
            </div>
          </div>
        </TabItem>
        <TabItem value="code" label="Code">
          <CodeBlock language="tsx">{codeString}</CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
};

export default ExplodingInputDemo;
