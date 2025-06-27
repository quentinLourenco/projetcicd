import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MyRecipes from "./MyRecipes";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";

vi.mock("@context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@components/atoms/RecipeManager/RecipeManager", () => ({
  default: () => <div>RecipeManager Mock</div>,
}));

describe("MyRecipes", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("affiche un message et un bouton si l'utilisateur n'est pas connecté", () => {
    useAuth.mockReturnValue({ currentUser: null });

    render(<MyRecipes />);

    expect(screen.getByText("Vous devez être connecté pour accéder à cette page.")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Se connecter" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("affiche le gestionnaire de recettes si l'utilisateur est connecté", () => {
    useAuth.mockReturnValue({ currentUser: { uid: "123" } });

    render(<MyRecipes />);

    expect(screen.getByText("Mes recettes")).toBeInTheDocument();
    expect(screen.getByText("Gérez vos recettes personnelles, ajoutez-en de nouvelles ou modifiez celles existantes.")).toBeInTheDocument();
    expect(screen.getByText("RecipeManager Mock")).toBeInTheDocument();
  });
});