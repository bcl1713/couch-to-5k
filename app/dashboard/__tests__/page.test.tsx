import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import DashboardPage from "../page";
import * as useWorkoutCompletionModule from "@/hooks/useWorkoutCompletion";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the useWorkoutCompletion hook
jest.mock("@/hooks/useWorkoutCompletion");

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseWorkoutCompletion =
  useWorkoutCompletionModule.useWorkoutCompletion as jest.MockedFunction<
    typeof useWorkoutCompletionModule.useWorkoutCompletion
  >;

describe("DashboardPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    // Default mock for useWorkoutCompletion
    mockUseWorkoutCompletion.mockReturnValue({
      markComplete: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });

    // Mock fetch for data loading
    global.fetch = jest.fn((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { email: "test@example.com" } }),
        } as Response);
      }
      if (url === "/api/user/progress") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              currentWeek: 1,
              currentWorkout: 1,
              lastCompletedAt: null,
              nextWorkout: {
                id: 1,
                week: 1,
                number: 1,
                intervals: {
                  week: 1,
                  number: 1,
                  warmup_seconds: 300,
                  intervals: [],
                  total_duration_seconds: 1200,
                  is_final_workout: false,
                },
                durationSeconds: 1200,
              },
            }),
        } as Response);
      }
      if (url === "/api/user/history") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ history: [] }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render loading state initially", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display user data", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("should display current progress", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Week 1 - Workout 1/)).toBeInTheDocument();
    });
  });

  it("should redirect to login if auth fails", async () => {
    global.fetch = jest.fn((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({
          ok: false,
        } as Response);
      }
      // Still need to handle other URLs to prevent Promise.all from rejecting
      if (url === "/api/user/progress" || url === "/api/user/history") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as jest.Mock;

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should navigate to workout when Start Workout is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Start Workout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Start Workout"));

    expect(mockPush).toHaveBeenCalledWith("/workout/active");
  });

  it("should open mark complete dialog when Mark Complete is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    // Click the Mark Complete button
    const markCompleteButtons = screen.getAllByText("Mark Complete");
    await user.click(markCompleteButtons[0]);

    // Dialog should open
    expect(screen.getByText("Mark Workout Complete")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to mark Week 1, Workout 1 as complete?/
      )
    ).toBeInTheDocument();
  });

  it("should call markComplete when dialog is confirmed", async () => {
    const mockMarkComplete = jest.fn();
    mockUseWorkoutCompletion.mockReturnValue({
      markComplete: mockMarkComplete,
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    // Open dialog
    const markCompleteButtons = screen.getAllByText("Mark Complete");
    await user.click(markCompleteButtons[0]);

    // Confirm
    await user.click(screen.getByText("Confirm"));

    expect(mockMarkComplete).toHaveBeenCalled();
  });

  it("should close dialog when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    // Open dialog
    const markCompleteButtons = screen.getAllByText("Mark Complete");
    await user.click(markCompleteButtons[0]);

    expect(screen.getByText("Mark Workout Complete")).toBeInTheDocument();

    // Click Cancel
    await user.click(screen.getByText("Cancel"));

    // Dialog should be closed
    await waitFor(() => {
      expect(
        screen.queryByText("Mark Workout Complete")
      ).not.toBeInTheDocument();
    });
  });

  it("should display error in dialog when markComplete fails", async () => {
    mockUseWorkoutCompletion.mockReturnValue({
      markComplete: jest.fn(),
      isLoading: false,
      error: "Failed to mark complete",
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    // Open dialog
    const markCompleteButtons = screen.getAllByText("Mark Complete");
    await user.click(markCompleteButtons[0]);

    // Error should be displayed
    expect(screen.getByText("Failed to mark complete")).toBeInTheDocument();
  });

  it("should clear error when opening dialog", async () => {
    const mockClearError = jest.fn();
    mockUseWorkoutCompletion.mockReturnValue({
      markComplete: jest.fn(),
      isLoading: false,
      error: "Previous error",
      clearError: mockClearError,
    });

    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    // Open dialog
    const markCompleteButtons = screen.getAllByText("Mark Complete");
    await user.click(markCompleteButtons[0]);

    expect(mockClearError).toHaveBeenCalled();
  });

  it("should disable buttons when marking complete", async () => {
    mockUseWorkoutCompletion.mockReturnValue({
      markComplete: jest.fn(),
      isLoading: true,
      error: null,
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    // Open dialog
    const markCompleteButtons = screen.getAllByText("Mark Complete");
    await user.click(markCompleteButtons[0]);

    // Buttons should be disabled
    const cancelButton = screen.getByText("Cancel");
    const confirmButton = screen.getByText("Marking...");

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it("should display recent workout history", async () => {
    global.fetch = jest.fn((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { email: "test@example.com" } }),
        } as Response);
      }
      if (url === "/api/user/progress") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              currentWeek: 2,
              currentWorkout: 1,
              lastCompletedAt: 1000,
              nextWorkout: null,
            }),
        } as Response);
      }
      if (url === "/api/user/history") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              history: [
                {
                  id: 1,
                  week: 1,
                  workoutNumber: 3,
                  completedAt: 1000,
                  type: "timer_completion",
                },
              ],
            }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as jest.Mock;

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Week 1, Workout 3/)).toBeInTheDocument();
      expect(screen.getByText(/Timer/)).toBeInTheDocument();
    });
  });

  it("should show message when no workout history exists", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("No completed workouts yet")).toBeInTheDocument();
    });
  });

  it("should call logout and redirect when Logout is clicked", async () => {
    const mockLogoutFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      } as Response)
    );

    global.fetch = jest.fn((url, options) => {
      if (url === "/api/auth/logout" && options?.method === "POST") {
        return mockLogoutFetch();
      }
      if (url === "/api/auth/me") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { email: "test@example.com" } }),
        } as Response);
      }
      if (url === "/api/user/progress") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              currentWeek: 1,
              currentWorkout: 1,
              lastCompletedAt: null,
              nextWorkout: null,
            }),
        } as Response);
      }
      if (url === "/api/user/history") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ history: [] }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as jest.Mock;

    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Logout"));

    expect(mockLogoutFetch).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
