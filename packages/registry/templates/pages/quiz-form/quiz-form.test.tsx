import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import QuizForm, { Question } from ".";

/* ============================================
   MOCKS
============================================ */

// framer-motion mock (important to avoid animation issues)
vi.mock("framer-motion", async () => {
  const actual: any = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      div: (props: any) => <div {...props} />,
      button: (props: any) => <button {...props} />,
      span: (props: any) => <span {...props} />,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

/* ============================================
   TEST DATA
============================================ */

const questions: Question[] = [
  {
    id: "q1",
    type: "single",
    question: "What is your favorite color?",
    options: ["Red", "Blue"],
  },
  {
    id: "q2",
    type: "multiple",
    question: "Select hobbies",
    options: ["Reading", "Gaming"],
  },
  {
    id: "q3",
    type: "rating",
    question: "Rate experience",
    scale: 5,
  },
];

/* ============================================
   TESTS
============================================ */

describe("QuizForm", () => {
  it("renders first question", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);

    expect(
      screen.getByText("What is your favorite color?")
    ).toBeInTheDocument();
  });

  it("does not allow next without answer", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);

    const nextBtn = screen.getByRole("button", { name: /continue/i });

    expect(nextBtn).toBeDisabled();
  });

  it("allows selecting single choice", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByText("Red"));

    const nextBtn = screen.getByRole("button", { name: /continue/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it("navigates to next question", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText("Select hobbies")).toBeInTheDocument();
  });

  it("supports multiple selection", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getByText("Reading"));
    fireEvent.click(screen.getByText("Gaming"));

    const nextBtn = screen.getByRole("button", { name: /continue/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it("supports rating selection", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);

    // step 1
    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // step 2
    fireEvent.click(screen.getByText("Reading"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // step 3
    const stars = screen.getAllByRole("button", { name: /star/i });
    fireEvent.click(stars[2]); // select 3 stars

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it("submits answers", () => {
    const onSubmit = vi.fn();

    render(<QuizForm questions={questions} onSubmit={onSubmit} />);

    // step 1
    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // step 2
    fireEvent.click(screen.getByText("Reading"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // step 3
    const stars = screen.getAllByRole("button", { name: /star/i });
    fireEvent.click(stars[3]);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      q1: "Red",
      q2: ["Reading"],
      q3: 4,
    });
  });

  it("shows result page after submit", () => {
    const onSubmit = vi.fn();

    render(<QuizForm questions={questions} onSubmit={onSubmit} />);

    // complete flow
    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getByText("Reading"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getAllByRole("button", { name: /star/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("All done!")).toBeInTheDocument();
  });

  it("resets quiz on restart", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);

    // complete flow
    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getByText("Reading"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getAllByRole("button", { name: /star/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // restart
    fireEvent.click(screen.getByText(/start over/i));

    expect(
      screen.getByText("What is your favorite color?")
    ).toBeInTheDocument();
  });

  it("calls onStepChange", () => {
    const onStepChange = vi.fn();

    render(
      <QuizForm
        questions={questions}
        onSubmit={vi.fn()}
        onStepChange={onStepChange}
      />
    );

    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(onStepChange).toHaveBeenCalledWith(1, 3);
  });

  it("allows continuing when question is not required", () => {
    const optionalQuestions: Question[] = [
      {
        id: "q1",
        type: "single",
        question: "Optional question",
        options: ["A", "B"],
        required: false,
      },
      {
        id: "q2",
        type: "single",
        question: "Next question",
        options: ["X", "Y"],
      },
    ];
  
    render(<QuizForm questions={optionalQuestions} onSubmit={vi.fn()} />);
  
    const nextBtn = screen.getByRole("button", { name: /continue/i });
  
    // should be enabled even without selecting
    expect(nextBtn).not.toBeDisabled();
  });


  it("preselects answers from initialAnswers", () => {
    render(
      <QuizForm
        questions={questions}
        onSubmit={vi.fn()}
        initialAnswers={{
          q1: "Red",
          q2: ["Reading"],
        }}
      />
    );
  
    // Step 1 → should already allow continue
    const nextBtn = screen.getByRole("button", { name: /continue/i });
    expect(nextBtn).not.toBeDisabled();
  
    // Move to step 2
    fireEvent.click(nextBtn);
  
    // "Reading" should already be selected → continue enabled
    const nextBtnStep2 = screen.getByRole("button", { name: /continue/i });
    expect(nextBtnStep2).not.toBeDisabled();
  });

  it("supports back navigation and preserves answers", () => {
    render(<QuizForm questions={questions} onSubmit={vi.fn()} />);
  
    // Step 1
    fireEvent.click(screen.getByText("Red"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  
    // Step 2
    fireEvent.click(screen.getByText("Reading"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  
    // Now go back
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
  
    // Should show step 2 again
    expect(screen.getByText("Select hobbies")).toBeInTheDocument();
  
    // Continue should still be enabled (answer persisted)
    const nextBtn = screen.getByRole("button", { name: /continue/i });
    expect(nextBtn).not.toBeDisabled();
  
    // Go back again
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
  
    // Step 1 again
    expect(
      screen.getByText("What is your favorite color?")
    ).toBeInTheDocument();
  
    // Answer persisted → continue enabled
    const nextBtnStep1 = screen.getByRole("button", { name: /continue/i });
    expect(nextBtnStep1).not.toBeDisabled();
  });
});