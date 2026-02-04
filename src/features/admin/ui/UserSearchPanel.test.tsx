import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserSearchPanel from "./UserSearchPanel";
import { adminService, UserSearchResult } from "../api/adminService";

vi.mock("../api/adminService", () => ({
  adminService: {
    searchUsers: vi.fn(),
  },
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useUITranslation: () => ({
    tUI: (key: string) => key,
  }),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

const mockUsers: UserSearchResult[] = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    role: "USER",
    isPremium: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastActivityAt: "2024-01-15T10:00:00Z",
    submissionsCount: 50,
    coursesCount: 3,
  },
  {
    id: "2",
    email: "admin@example.com",
    name: null,
    role: "ADMIN",
    isPremium: false,
    createdAt: "2023-06-01T00:00:00Z",
    lastActivityAt: null,
    submissionsCount: 100,
    coursesCount: 5,
  },
];

describe("UserSearchPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render search input and button", () => {
    render(<UserSearchPanel />);

    expect(screen.getByPlaceholderText("admin.userSearch.placeholder")).toBeInTheDocument();
    expect(screen.getByText("admin.userSearch.search")).toBeInTheDocument();
  });

  it("should show hint text initially", () => {
    render(<UserSearchPanel />);

    expect(screen.getByText("admin.userSearch.hint")).toBeInTheDocument();
  });

  it("should show error for short query", async () => {
    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "a" } });

    const button = screen.getByText("admin.userSearch.search");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("admin.userSearch.minChars")).toBeInTheDocument();
    });
  });

  it("should search users and display results", async () => {
    vi.mocked(adminService.searchUsers).mockResolvedValue(mockUsers);

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "john" } });

    const button = screen.getByText("admin.userSearch.search");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should search on Enter key", async () => {
    vi.mocked(adminService.searchUsers).mockResolvedValue(mockUsers);

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(adminService.searchUsers).toHaveBeenCalledWith("test");
    });
  });

  it("should show Premium badge for premium users", async () => {
    vi.mocked(adminService.searchUsers).mockResolvedValue(mockUsers);

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "john" } });
    fireEvent.click(screen.getByText("admin.userSearch.search"));

    await waitFor(() => {
      expect(screen.getByText("Premium")).toBeInTheDocument();
    });
  });

  it("should show Admin badge for admin users", async () => {
    vi.mocked(adminService.searchUsers).mockResolvedValue(mockUsers);

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "admin" } });
    fireEvent.click(screen.getByText("admin.userSearch.search"));

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
  });

  it("should show 'No name' for users without name", async () => {
    vi.mocked(adminService.searchUsers).mockResolvedValue(mockUsers);

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "admin" } });
    fireEvent.click(screen.getByText("admin.userSearch.search"));

    await waitFor(() => {
      expect(screen.getByText("admin.userSearch.noName")).toBeInTheDocument();
    });
  });

  it("should show no results message when empty", async () => {
    vi.mocked(adminService.searchUsers).mockResolvedValue([]);

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "nonexistent" } });
    fireEvent.click(screen.getByText("admin.userSearch.search"));

    await waitFor(() => {
      expect(screen.getByText("admin.userSearch.noResults")).toBeInTheDocument();
    });
  });

  it("should show error on search failure", async () => {
    vi.mocked(adminService.searchUsers).mockRejectedValue(new Error("Network error"));

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(screen.getByText("admin.userSearch.search"));

    await waitFor(() => {
      expect(screen.getByText("admin.userSearch.searchError")).toBeInTheDocument();
    });
  });

  it("should display submissions and courses count", async () => {
    vi.mocked(adminService.searchUsers).mockResolvedValue(mockUsers);

    render(<UserSearchPanel />);

    const input = screen.getByPlaceholderText("admin.userSearch.placeholder");
    fireEvent.change(input, { target: { value: "john" } });
    fireEvent.click(screen.getByText("admin.userSearch.search"));

    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});
