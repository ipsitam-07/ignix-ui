import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuizForm } from '.';
import type { Question, QuizAnswers } from '.';

/* ============================================
   META
============================================ */

const meta: Meta<typeof QuizForm> = {
  title: 'Templates/Pages/Forms/QuizForm',
  component: QuizForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A reusable multi-step survey/quiz form with animated transitions, three question types ' +
          '(single choice, multiple choice, rating), progress tracking, and scalable card style variants. ' +
          'Adding a new variant requires only a token object + one-line registration — no conditional logic changes.',
      },
    },
  },
  argTypes: {
    cardVariant: {
      control: 'select',
      options: ['default', 'gradient', 'bordered', 'dark'],
      description: 'Visual style of the question card',
      table: { defaultValue: { summary: 'default' } },
    },
    showResult: {
      control: 'boolean',
      description: 'Show a results summary after submission',
      table: { defaultValue: { summary: 'true' } },
    },
    submitLabel: {
      control: 'text',
      description: 'Label for the submit button on the last question',
    },
    nextLabel: {
      control: 'text',
      description: 'Label for the continue/next button',
    },
    backLabel: {
      control: 'text',
      description: 'Label for the back button',
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Color scheme for the component',
      table: { defaultValue: { summary: 'light' } },
    }
  },
};

export default meta;
type Story = StoryObj<typeof QuizForm>;

/* ============================================
   SHARED DATA
============================================ */

const basicQuestions: Question[] = [
  {
    id: 'discovery',
    type: 'single',
    question: 'How did you first hear about us?',
    options: ['Social Media', 'Search Engine', 'Friend / Referral', 'Advertisement', 'Event or Conference'],
    required: true,
  },
  {
    id: 'features',
    type: 'multiple',
    question: 'Which features are most important to you?',
    hint: 'Select all that apply',
    options: ['Ease of Use', 'Performance', 'Customization', 'Integrations', 'Support', 'Pricing'],
    required: true,
  },
  {
    id: 'satisfaction',
    type: 'rating',
    question: 'How satisfied are you with our product overall?',
    scale: 5,
    required: true,
  },
  {
    id: 'nps',
    type: 'rating',
    question: 'How likely are you to recommend us to a friend or colleague?',
    scale: 10,
    required: true,
  },
];

const onboardingQuestions: Question[] = [
  {
    id: 'role',
    type: 'single',
    question: 'What best describes your role?',
    options: ['Designer', 'Developer', 'Product Manager', 'Marketer', 'Other'],
    required: true,
  },
  {
    id: 'teamSize',
    type: 'single',
    question: 'How large is your team?',
    options: ['Just me', '2-10', '11-50', '51-200', '200+'],
    required: true,
  },
  {
    id: 'goals',
    type: 'multiple',
    question: 'What are your main goals?',
    hint: 'Pick everything that applies',
    options: ['Increase Productivity', 'Better Collaboration', 'Save Costs', 'Improve Quality', 'Scale Faster'],
    required: true,
  },
  {
    id: 'experience',
    type: 'rating',
    question: 'How would you rate your setup experience?',
    scale: 5,
    required: true,
  },
];

const handleSubmit = (answers: QuizAnswers) => {
  console.log('[QuizForm] Submitted:', answers);
};

/* ============================================
   STORIES
============================================ */

/**
 * Default — standard white card, full question set covering all three question types.
 */
export const Default: Story = {
  args: {
    questions: basicQuestions,
    onSubmit: handleSubmit,
    cardVariant: 'default',
    showResult: true,
    submitLabel: 'Submit',
    nextLabel: 'Continue',
    backLabel: 'Back',  
  },
};

/**
 * Gradient card — frosted white card with backdrop blur.
 * The component itself is fully transparent (`pageBg: 'bg-transparent'`);
 * wrap it in your own page background to see the blur effect.
 * The decorator below provides a soft lavender surface for the preview.
 */
export const GradientCard: Story = {
  args: { ...Default.args, cardVariant: 'gradient' },
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
        'Gradient card with vibrant background (`bg-gradient-to-r from-violet-500 to-fuchsia-500`). ' +
        'The component includes its own background styling, providing a bold, visually rich surface. ' +
        'Works well on neutral or light page backgrounds to highlight the content.',
      },
    },
  },
};

/**
 * Bordered card — violet border accent instead of shadow.
 */
export const BorderedCard: Story = {
  args: { ...Default.args, cardVariant: 'bordered' },
};


/**
 * Onboarding flow — role selection, team size, goals, and experience rating
 * with step-label pill progress bar.
 */
export const OnboardingFlow: Story = {
  args: {
    questions: onboardingQuestions,
    onSubmit: handleSubmit,
    showResult: true,
    stepLabels: ['Role', 'Team', 'Goals', 'Experience'],
    submitLabel: 'Finish Setup',
    nextLabel: 'Next Step',
    backLabel: 'Back',
  },
  parameters: {
    docs: {
      description: {
        story: 'An onboarding survey with the step-label pill progress indicator.',
      },
    },
  },
};

/**
 * Star rating only — single 1–5 star question with result summary.
 */
export const StarRatingOnly: Story = {
  args: {
    questions: [
      { id: 'rating', type: 'rating', question: 'Rate your overall experience', scale: 5, required: true },
    ],
    onSubmit: handleSubmit,
    showResult: true,
    submitLabel: 'Submit Rating',
    nextLabel: 'Continue',
    backLabel: 'Back',
  },
  parameters: {
    docs: {
      description: { story: 'Minimal single star-rating question — useful as an inline feedback widget.' },
    },
  },
};

/**
 * Recommendation Score — 1–10 numeric scale with red → amber → green colour coding.
 */
export const RecommendationScore: Story = {
  args: {
    questions: [
      {
        id: 'score',
        type: 'rating',
        question: 'How likely are you to recommend us to a friend or colleague?',
        scale: 10,
        required: true,
      },
    ],
    onSubmit: handleSubmit,
    showResult: true,
    submitLabel: 'Submit Score',
    nextLabel: 'Continue',
    backLabel: 'Back',
  },
};

/**
 * No result page — submit fires the callback without showing a summary screen.
 */
export const NoResultPage: Story = {
  args: { ...Default.args, showResult: false },
  parameters: {
    docs: {
      description: {
        story: 'When `showResult` is false the form calls `onSubmit` without displaying the summary screen.',
      },
    },
  },
};

/**
 * Pre-filled answers — the form starts with existing answer data.
 */
export const PrefilledAnswers: Story = {
  args: {
    ...Default.args,
    initialAnswers: {
      discovery:    'Friend / Referral',
      features:     ['Ease of Use', 'Performance'],
      satisfaction: 4,
      nps:          9,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass `initialAnswers` to pre-populate the form — useful for editing a previously submitted response.',
      },
    },
  },
};

/**
 * Custom labels — button labels adapted to a different product tone.
 */
export const CustomLabels: Story = {
  args: {
    ...Default.args,
    submitLabel: 'Send Feedback →',
    nextLabel:   'Next Question →',
    backLabel:   '← Previous',
  },
};

/**
 * Step change callback — logs every step transition to the console.
 */
export const WithStepCallback: Story = {
  args: {
    ...Default.args,
    onStepChange: (step: number, total: number) => {
      console.log(`[QuizForm] Step changed: ${step + 1} / ${total}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: '`onStepChange` fires on every navigation. Open the console to see the output.',
      },
    },
  },
};

/**
 * Compound usage — sub-components composed directly for full layout control.
 */
export const CompoundComponents: Story = {
  render: () => (
    <QuizForm questions={basicQuestions} onSubmit={handleSubmit}>
      <div className="bg-background border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/80 overflow-hidden">
        <QuizForm.AccentBar />
        <div className="p-8">
          <QuizForm.ProgressBar />
          <QuizForm.QuestionCard />
          <QuizForm.NavigationButtons />
        </div>
      </div>
    </QuizForm>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `<QuizForm>` as a context provider and compose `ProgressBar`, `QuestionCard`, ' +
          '`NavigationButtons`, and `AccentBar` directly for full layout control.',
      },
    },
  },
};
