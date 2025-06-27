import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Profile from "./Profile";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";

vi.mock("@context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@components/atoms/ConfirmDialog/ConfirmDialog", () => ({
  default: () => <div>ConfirmDialog Mock</div>,
}));

describe("Profile component", () => {
  const mockNavigate = vi.fn();
  const mockLogout = vi.fn();
  const mockUpdateUserProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("should render message when user connected", () => {
    useAuth.mockReturnValue({ currentUser: null });

    render(<Profile />);

    expect(screen.getByText("Profil non disponible")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Se connecter" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should render user info", async () => {
    useAuth.mockReturnValue({
      currentUser: {
        displayName: "toto",
        email: "toto@coucou.hey",
        bio: "toto le plus beau",
        favoriteFood: "la tarte de toto",
      },
      logout: mockLogout,
      updateUserProfile: mockUpdateUserProfile,
    });

    render(<Profile />);

    expect(screen.getByDisplayValue("toto")).toBeInTheDocument();
    expect(screen.getByDisplayValue("toto@coucou.hey")).toBeInTheDocument();
    expect(screen.getByDisplayValue("toto le plus beau")).toBeInTheDocument();
    expect(screen.getByDisplayValue("la tarte de toto")).toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: "Modifier" });
    fireEvent.click(editButton);

    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Annuler" })).toBeInTheDocument();
  });
});