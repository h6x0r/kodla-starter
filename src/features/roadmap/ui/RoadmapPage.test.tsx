import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import RoadmapPage from "./RoadmapPage";
import { AuthContext } from "@/components/Layout";

// Mock dependencies
vi.mock("../api/roadmapService", () => ({
  roadmapService: {
    getUserRoadmap: vi.fn(),
    generateVariants: vi.fn(),
    selectVariant: vi.fn(),
    deleteRoadmap: vi.fn(),
  },
}));

vi.mock("@/lib/storage", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useUITranslation: () => ({
    tUI: (key: string) => {
      const translations: Record<string, string> = {
        "roadmap.introTitle": "AI-Powered Learning Roadmap",
        "roadmap.introDescription":
          "Answer a few questions and get a personalized learning path",
        "roadmap.featureAI": "AI-Generated",
        "roadmap.featureAIDesc": "Personalized recommendations",
        "roadmap.featurePersonal": "Personal Goals",
        "roadmap.featurePersonalDesc": "Tailored to your interests",
        "roadmap.featureProgress": "Track Progress",
        "roadmap.featureProgressDesc": "Monitor your journey",
        "roadmap.startButton": "Get Started",
        "roadmap.yourPersonalRoadmap": "Your Personal Roadmap",
        "roadmap.regenerate": "Regenerate",
        "roadmap.regeneratePremium": "Regenerate (Premium)",
        "roadmap.regeneratePremiumTitle": "Regeneration requires Premium",
        "roadmap.regeneratePremiumDesc":
          "Upgrade to create unlimited personalized roadmaps",
        "roadmap.regenerateModalTitle": "Regenerate Your Roadmap",
        "roadmap.regenerateModalDesc":
          "Create a new personalized learning path based on updated preferences",
        "roadmap.oneTimePayment": "One-time payment",
        "roadmap.regenerateFeature1": "AI-powered personalized path generation",
        "roadmap.regenerateFeature2": "Choose from multiple path variants",
        "roadmap.regenerateFeature3": "Adjust goals and time commitments",
        "roadmap.purchaseRegenerate": "Purchase Regeneration",
        "roadmap.unlimitedWith": "Want unlimited regenerations?",
        "roadmap.upgradeToPremium": "Upgrade to Premium →",
        "roadmap.interestsHint": "Select at least one area of interest",
        "roadmap.interestsError":
          "Please select at least one area of interest to continue",
        "common.cancel": "Cancel",
        "common.upgrade": "Upgrade",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock("./components/RoadmapVariantCard", () => ({
  RoadmapVariantCard: ({ variant, isSelected, onSelect }: any) => (
    <div
      data-testid={`variant-${variant.id}`}
      onClick={() => onSelect(variant)}
      className={isSelected ? "selected" : ""}
    >
      {variant.name}
    </div>
  ),
}));

import { roadmapService } from "../api/roadmapService";

describe("RoadmapPage", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
  };

  const mockRoadmap = {
    id: "roadmap-1",
    userId: "user-1",
    role: "backend",
    roleTitle: "Backend Developer",
    level: "intermediate",
    targetLevel: "Intermediate",
    canRegenerate: true,
    isPremium: false,
    phases: [
      {
        id: "phase-1",
        title: "Go Fundamentals",
        description: "Learn Go basics",
        colorTheme: "from-blue-500 to-cyan-500",
        progressPercentage: 50,
        steps: [
          {
            id: "step-1",
            title: "Variables",
            type: "task",
            status: "completed",
            deepLink: "/task/go-vars",
            durationEstimate: "15m",
          },
          {
            id: "step-2",
            title: "Functions",
            type: "task",
            status: "pending",
            deepLink: "/task/go-func",
            durationEstimate: "20m",
          },
        ],
      },
    ],
  };

  const mockVariants = [
    {
      id: "variant-1",
      name: "Backend Focus",
      description: "Focus on backend development",
      totalTasks: 50,
      estimatedHours: 100,
      estimatedMonths: 3,
      targetRole: "Backend Developer",
      difficulty: "intermediate" as const,
      phases: [],
    },
    {
      id: "variant-2",
      name: "Full Stack",
      description: "Complete full stack path",
      totalTasks: 80,
      estimatedHours: 160,
      estimatedMonths: 6,
      targetRole: "Full Stack Developer",
      difficulty: "advanced" as const,
      phases: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);
    vi.mocked(roadmapService.generateVariants).mockResolvedValue({
      variants: mockVariants,
    });
    vi.mocked(roadmapService.selectVariant).mockResolvedValue(mockRoadmap);
  });

  const renderWithAuth = (user: typeof mockUser | null) => {
    return render(
      <AuthContext.Provider value={{ user, setUser: vi.fn() }}>
        <MemoryRouter>
          <RoadmapPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
  };

  describe("initial state", () => {
    it("should check for existing roadmap when user is logged in", async () => {
      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(roadmapService.getUserRoadmap).toHaveBeenCalled();
      });
    });

    it("should show intro screen when no roadmap exists", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(
          screen.getByText("AI-Powered Learning Roadmap"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });
  });

  describe("existing roadmap", () => {
    it("should display existing roadmap", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Your Personal Roadmap")).toBeInTheDocument();
      });

      expect(screen.getByText("Go Fundamentals")).toBeInTheDocument();
    });

    it("should show progress for phases", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("50% Done")).toBeInTheDocument();
      });
    });

    it("should show regenerate button", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Regenerate")).toBeInTheDocument();
      });
    });
  });

  describe("intro screen", () => {
    it("should show features on intro screen", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("AI-Generated")).toBeInTheDocument();
      });

      expect(screen.getByText("Personal Goals")).toBeInTheDocument();
      expect(screen.getByText("Track Progress")).toBeInTheDocument();
    });
  });

  describe("unauthenticated user", () => {
    it("should show intro screen for unauthenticated users", async () => {
      renderWithAuth(null);

      await waitFor(() => {
        expect(
          screen.getByText("AI-Powered Learning Roadmap"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("should not fetch roadmap for unauthenticated users", async () => {
      renderWithAuth(null);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      expect(roadmapService.getUserRoadmap).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle API error gracefully and show intro", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockRejectedValue(
        new Error("API Error"),
      );

      renderWithAuth(mockUser);

      // Should not crash and show intro screen
      await waitFor(() => {
        expect(
          screen.getByText("AI-Powered Learning Roadmap"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("wizard flow", () => {
    it("should start wizard when clicking Get Started for authenticated user", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
        expect(screen.getByText("Your Background")).toBeInTheDocument();
      });
    });

    it("should show language selection on step 1", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      await waitFor(() => {
        expect(screen.getByText("Python")).toBeInTheDocument();
        expect(screen.getByText("JavaScript")).toBeInTheDocument();
        expect(screen.getByText("Java")).toBeInTheDocument();
        expect(screen.getByText("Go")).toBeInTheDocument();
      });
    });

    it("should allow selecting languages on step 1", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      await waitFor(() => {
        expect(screen.getByText("Python")).toBeInTheDocument();
      });

      // Click Python to select it
      fireEvent.click(screen.getByText("Python"));

      // Python button should now have selected styling (border-brand-500)
      const pythonButton = screen.getByText("Python").closest("button");
      expect(pythonButton).toHaveClass("border-brand-500");
    });

    it("should navigate through wizard steps with Continue button", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Step 1
      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue"));

      // Step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
        expect(screen.getByText("Experience Level")).toBeInTheDocument();
      });
    });

    it("should show Back button disabled on step 1", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });

      const backButton = screen.getByText("Back").closest("button");
      expect(backButton).toBeDisabled();
    });

    it("should navigate back with Back button", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Go to step 2
      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      // Go back to step 1
      fireEvent.click(screen.getByText("Back"));

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });
    });

    it("should require interest selection on step 3", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 3
      fireEvent.click(screen.getByText("Continue")); // to step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // to step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
        expect(screen.getByText("Your Interests")).toBeInTheDocument();
      });

      // Continue should be disabled without selecting interests
      const continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).toHaveClass("cursor-not-allowed");
    });

    it("should show hint message on interests step", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 3
      fireEvent.click(screen.getByText("Continue")); // to step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // to step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      // Shows hint text
      expect(
        screen.getByText("Select at least one area of interest"),
      ).toBeInTheDocument();

      // Continue button should be disabled
      const continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).toBeDisabled();
    });

    it("should enable continue after selecting an interest", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 3
      fireEvent.click(screen.getByText("Continue")); // to step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // to step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      // Continue button should be disabled initially
      let continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).toBeDisabled();

      // Select an interest
      fireEvent.click(screen.getByText("Backend Development"));

      // Continue button should now be enabled
      continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).not.toBeDisabled();

      // Still shows hint text (not error)
      expect(
        screen.getByText("Select at least one area of interest"),
      ).toBeInTheDocument();
    });

    it("should require goal selection on step 4", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 3 and select an interest
      fireEvent.click(screen.getByText("Continue")); // to step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // to step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      // Select an interest
      fireEvent.click(screen.getByText("Backend Development"));

      fireEvent.click(screen.getByText("Continue")); // to step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
        expect(screen.getByText("Your Goal")).toBeInTheDocument();
      });

      // Continue should be disabled without selecting a goal
      const continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).toHaveClass("cursor-not-allowed");
    });

    it("should show Generate Roadmaps button on last step", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate through all steps
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development")); // select interest
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job")); // select goal
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
        expect(screen.getByText("Time Commitment")).toBeInTheDocument();
        expect(screen.getByText("Generate Roadmaps")).toBeInTheDocument();
      });
    });
  });

  describe("variant selection", () => {
    it("should display variants after generation", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard quickly
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      // Start generation
      fireEvent.click(screen.getByText("Generate Roadmaps"));

      // Wait for loading phases
      await vi.advanceTimersByTimeAsync(3500);

      // Wait for variants to appear
      await waitFor(
        () => {
          expect(screen.getByText("Choose Your Path")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      expect(screen.getByTestId("variant-variant-1")).toBeInTheDocument();
      expect(screen.getByTestId("variant-variant-2")).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("should allow selecting a variant", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Generate Roadmaps"));
      await vi.advanceTimersByTimeAsync(3500);

      await waitFor(
        () => {
          expect(screen.getByTestId("variant-variant-1")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // Select variant
      fireEvent.click(screen.getByTestId("variant-variant-1"));

      // Check it has selected class
      expect(screen.getByTestId("variant-variant-1")).toHaveClass("selected");

      vi.useRealTimers();
    });
  });

  describe("roadmap display", () => {
    it("should display phase steps with correct status", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Your Personal Roadmap")).toBeInTheDocument();
      });

      // Check step titles
      expect(screen.getByText("Variables")).toBeInTheDocument();
      expect(screen.getByText("Functions")).toBeInTheDocument();

      // Check step links
      const variablesLink = screen.getByText("Variables").closest("a");
      expect(variablesLink).toHaveAttribute("href", "/task/go-vars");

      const functionsLink = screen.getByText("Functions").closest("a");
      expect(functionsLink).toHaveAttribute("href", "/task/go-func");
    });

    it("should display role and level badges", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Backend Developer")).toBeInTheDocument();
        expect(screen.getByText("Intermediate")).toBeInTheDocument();
      });
    });

    it("should display Goal Achieved section", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Goal Achieved")).toBeInTheDocument();
        expect(
          screen.getByText(/Ready for Backend Developer/),
        ).toBeInTheDocument();
      });
    });

    it("should show step duration estimates", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("15m")).toBeInTheDocument();
        expect(screen.getByText("20m")).toBeInTheDocument();
      });
    });

    it("should show step types", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        const taskLabels = screen.getAllByText("task");
        expect(taskLabels.length).toBe(2);
      });
    });
  });

  describe("regenerate flow", () => {
    it("should start wizard when clicking Regenerate for user with canRegenerate", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(mockRoadmap);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Regenerate")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Regenerate"));

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });
    });

    it("should show premium gate modal when canRegenerate is false and not premium", async () => {
      const nonRegenerateRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: false,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        nonRegenerateRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText(/Regenerate/)).toBeInTheDocument();
      });

      // Find the regenerate button that has the lock icon
      const regenerateButton = screen
        .getByText(/Regenerate \(Premium\)/)
        .closest("button");
      expect(regenerateButton).toBeInTheDocument();

      fireEvent.click(regenerateButton!);

      // Modal should appear
      await waitFor(() => {
        expect(screen.getByText(/Regenerate Your Roadmap/)).toBeInTheDocument();
        expect(screen.getByText("$4.99")).toBeInTheDocument();
      });
    });

    it("should show premium required banner when canRegenerate is false", async () => {
      const nonRegenerateRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: false,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        nonRegenerateRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(
          screen.getByText(/Regeneration requires Premium/),
        ).toBeInTheDocument();
      });
    });

    it("should close premium modal when clicking Cancel", async () => {
      const nonRegenerateRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: false,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        nonRegenerateRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText(/Regenerate \(Premium\)/)).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(
        screen.getByText(/Regenerate \(Premium\)/).closest("button")!,
      );

      await waitFor(() => {
        expect(screen.getByText("$4.99")).toBeInTheDocument();
      });

      // Click Cancel
      fireEvent.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.queryByText("$4.99")).not.toBeInTheDocument();
      });
    });

    it("should close premium modal when clicking backdrop", async () => {
      const nonRegenerateRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: false,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        nonRegenerateRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText(/Regenerate \(Premium\)/)).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(
        screen.getByText(/Regenerate \(Premium\)/).closest("button")!,
      );

      await waitFor(() => {
        expect(screen.getByText("$4.99")).toBeInTheDocument();
      });

      // Click backdrop (the outer modal div)
      const backdrop = document.querySelector(".fixed.inset-0");
      fireEvent.click(backdrop!);

      await waitFor(() => {
        expect(screen.queryByText("$4.99")).not.toBeInTheDocument();
      });
    });

    it("should close premium modal when clicking close button", async () => {
      const nonRegenerateRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: false,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        nonRegenerateRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText(/Regenerate \(Premium\)/)).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(
        screen.getByText(/Regenerate \(Premium\)/).closest("button")!,
      );

      await waitFor(() => {
        expect(screen.getByText("$4.99")).toBeInTheDocument();
      });

      // Click close button (X icon)
      const closeButton = document.querySelector(".absolute.top-4.right-4");
      fireEvent.click(closeButton!);

      await waitFor(() => {
        expect(screen.queryByText("$4.99")).not.toBeInTheDocument();
      });
    });

    it("should allow regenerate when isPremium is true even if canRegenerate is false", async () => {
      const premiumRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: true,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        premiumRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Regenerate")).toBeInTheDocument();
      });

      // Should not show premium banner
      expect(
        screen.queryByText(/Regeneration requires Premium/),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("Regenerate"));

      // Should start wizard directly without showing modal
      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });
    });

    it("should show modal features list", async () => {
      const nonRegenerateRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: false,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        nonRegenerateRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText(/Regenerate \(Premium\)/)).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByText(/Regenerate \(Premium\)/).closest("button")!,
      );

      await waitFor(() => {
        expect(
          screen.getByText("AI-powered personalized path generation"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Choose from multiple path variants"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Adjust goals and time commitments"),
        ).toBeInTheDocument();
      });
    });

    it("should show upgrade to premium link in modal", async () => {
      const nonRegenerateRoadmap = {
        ...mockRoadmap,
        canRegenerate: false,
        isPremium: false,
      };
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(
        nonRegenerateRoadmap,
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText(/Regenerate \(Premium\)/)).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByText(/Regenerate \(Premium\)/).closest("button")!,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Want unlimited regenerations?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Upgrade to Premium →")).toBeInTheDocument();
      });

      // Check the link
      const premiumLink = screen.getByText("Upgrade to Premium →");
      expect(premiumLink.closest("a")).toHaveAttribute("href", "/premium");
    });
  });

  describe("variant confirmation", () => {
    it("should confirm variant selection and create roadmap", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Generate Roadmaps"));
      await vi.advanceTimersByTimeAsync(3500);

      await waitFor(
        () => {
          expect(screen.getByTestId("variant-variant-1")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // Select and confirm variant
      fireEvent.click(screen.getByTestId("variant-variant-1"));
      fireEvent.click(screen.getByText(/Start Backend Focus Path/));

      // Should call selectVariant
      await waitFor(() => {
        expect(roadmapService.selectVariant).toHaveBeenCalled();
      });

      // Should show roadmap result
      await waitFor(
        () => {
          expect(screen.getByText("Your Personal Roadmap")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      vi.useRealTimers();
    });

    it("should show Adjust Preferences button in variants view", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard quickly
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Generate Roadmaps"));
      await vi.advanceTimersByTimeAsync(3500);

      await waitFor(
        () => {
          expect(screen.getByText("Choose Your Path")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // Adjust Preferences button should be visible
      expect(screen.getByText("← Adjust Preferences")).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("should go back to wizard when clicking Adjust Preferences", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Generate Roadmaps"));
      await vi.advanceTimersByTimeAsync(3500);

      await waitFor(
        () => {
          expect(screen.getByText("← Adjust Preferences")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // Click Adjust Preferences
      fireEvent.click(screen.getByText("← Adjust Preferences"));

      // Should go back to wizard step 1
      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe("wizard step 4 - goal selection", () => {
    it("should enable continue after selecting a goal", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 4
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      // Continue should be disabled initially
      let continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).toHaveClass("cursor-not-allowed");

      // Select a goal
      fireEvent.click(screen.getByText("Reach Senior Level"));

      // Continue should now be enabled
      continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).not.toHaveClass("cursor-not-allowed");
    });

    it("should show all goal options", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 4
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      // Check all goal options are displayed
      expect(screen.getByText("Find a Job")).toBeInTheDocument();
      expect(screen.getByText("Reach Senior Level")).toBeInTheDocument();
      expect(screen.getByText("Build a Startup")).toBeInTheDocument();
      expect(screen.getByText("Master a Skill")).toBeInTheDocument();
    });
  });

  describe("wizard step 5 - time commitment", () => {
    it("should show time commitment options", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 5
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      // Check hours options
      expect(screen.getByText("5 hrs/week")).toBeInTheDocument();
      expect(screen.getByText("10 hrs/week")).toBeInTheDocument();
      expect(screen.getByText("15 hrs/week")).toBeInTheDocument();
      expect(screen.getByText("20+ hrs/week")).toBeInTheDocument();

      // Check months options
      expect(screen.getByText("3 months")).toBeInTheDocument();
      expect(screen.getByText("6 months")).toBeInTheDocument();
      expect(screen.getByText("9 months")).toBeInTheDocument();
      expect(screen.getByText("12 months")).toBeInTheDocument();
    });

    it("should allow changing time commitment options", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 5
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      // Select different hours
      const hoursButton = screen.getByText("20+ hrs/week").closest("button");
      fireEvent.click(hoursButton!);
      expect(hoursButton).toHaveClass("border-brand-500");

      // Select different months
      const monthsButton = screen.getByText("12 months").closest("button");
      fireEvent.click(monthsButton!);
      expect(monthsButton).toHaveClass("border-brand-500");
    });
  });

  describe("experience level selection", () => {
    it("should allow selecting experience level", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Go to step 2
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      // Check experience options are displayed
      expect(screen.getByText("No experience")).toBeInTheDocument();
      expect(screen.getByText("< 1 year")).toBeInTheDocument();
      expect(screen.getByText("1-2 years")).toBeInTheDocument();
      expect(screen.getByText("3-5 years")).toBeInTheDocument();
      expect(screen.getByText("5+ years")).toBeInTheDocument();

      // Select experience level
      const seniorButton = screen.getByText("5+ years").closest("button");
      fireEvent.click(seniorButton!);
      expect(seniorButton).toHaveClass("border-brand-500");
    });
  });

  describe("generation error handling", () => {
    it("should show error message when generation fails", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);
      vi.mocked(roadmapService.generateVariants).mockRejectedValue(
        new Error("Generation failed"),
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Generate Roadmaps"));
      await vi.advanceTimersByTimeAsync(3500);

      // Should show error and go back to wizard
      await waitFor(
        () => {
          expect(
            screen.getByText(
              "Failed to generate roadmap variants. Please try again.",
            ),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      vi.useRealTimers();
    });

    it("should show premium required error on 403", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      const error403 = new Error("Forbidden");
      (error403 as any).status = 403;
      vi.mocked(roadmapService.generateVariants).mockRejectedValue(error403);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Generate Roadmaps"));
      await vi.advanceTimersByTimeAsync(3500);

      // Should show premium error
      await waitFor(
        () => {
          expect(
            screen.getByText(/Regeneration requires Premium/),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      vi.useRealTimers();
    });

    it("should handle variant selection error", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);
      vi.mocked(roadmapService.selectVariant).mockRejectedValue(
        new Error("Selection failed"),
      );

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Complete wizard
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Backend Development"));
      fireEvent.click(screen.getByText("Continue")); // step 4
      await waitFor(() => {
        expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Find a Job"));
      fireEvent.click(screen.getByText("Continue")); // step 5
      await waitFor(() => {
        expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Generate Roadmaps"));
      await vi.advanceTimersByTimeAsync(3500);

      await waitFor(
        () => {
          expect(screen.getByTestId("variant-variant-1")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // Select and confirm variant
      fireEvent.click(screen.getByTestId("variant-variant-1"));
      fireEvent.click(screen.getByText(/Start Backend Focus Path/));

      // Should show error
      await waitFor(
        () => {
          expect(
            screen.getByText("Failed to create roadmap. Please try again."),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      vi.useRealTimers();
    });
  });

  describe("interests validation", () => {
    it("should show error when trying to continue without interests", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 3
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      // Try to click Continue without selecting interests (should not work due to disabled button)
      const continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).toBeDisabled();
    });

    it("should clear interest error when selecting an interest", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 3
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      // Should show hint message initially
      expect(
        screen.getByText("Select at least one area of interest"),
      ).toBeInTheDocument();

      // Select an interest
      fireEvent.click(screen.getByText("Go Programming"));

      // Hint should still be visible (not error state)
      expect(
        screen.getByText("Select at least one area of interest"),
      ).toBeInTheDocument();

      // Button should be enabled
      const continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).not.toBeDisabled();
    });

    it("should allow deselecting an interest", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      // Navigate to step 3
      fireEvent.click(screen.getByText("Continue")); // step 2
      await waitFor(() => {
        expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Continue")); // step 3
      await waitFor(() => {
        expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
      });

      // Select an interest
      fireEvent.click(screen.getByText("Backend Development"));

      // Button should be enabled
      let continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).not.toBeDisabled();

      // Deselect the interest
      fireEvent.click(screen.getByText("Backend Development"));

      // Button should be disabled again
      continueButton = screen.getByText("Continue").closest("button");
      expect(continueButton).toBeDisabled();
    });
  });

  describe("language selection", () => {
    it("should allow selecting multiple languages", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });

      // Select multiple languages
      fireEvent.click(screen.getByText("Python"));
      fireEvent.click(screen.getByText("Go"));
      fireEvent.click(screen.getByText("TypeScript"));

      // All three should be selected
      expect(screen.getByText("Python").closest("button")).toHaveClass(
        "border-brand-500",
      );
      expect(screen.getByText("Go").closest("button")).toHaveClass(
        "border-brand-500",
      );
      expect(screen.getByText("TypeScript").closest("button")).toHaveClass(
        "border-brand-500",
      );
    });

    it("should allow deselecting a language", async () => {
      vi.mocked(roadmapService.getUserRoadmap).mockResolvedValue(null);

      renderWithAuth(mockUser);

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Get Started"));

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
      });

      // Select then deselect Python
      fireEvent.click(screen.getByText("Python"));
      expect(screen.getByText("Python").closest("button")).toHaveClass(
        "border-brand-500",
      );

      fireEvent.click(screen.getByText("Python"));
      expect(screen.getByText("Python").closest("button")).not.toHaveClass(
        "border-brand-500",
      );
    });
  });
});
