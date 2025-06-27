import { render, screen, waitFor } from "@testing-library/react";
import BestRecipes from "./BestRecipes";
import { vi } from "vitest";
import { useRecipeService } from "@services/ServiceProvider";

vi.mock("@services/ServiceProvider", () => ({
  useRecipeService: vi.fn(),
}));
vi.mock("@molecules/RecipeCard/RecipeCard", () => ({
  __esModule: true,
  default: ({ title, description }) => (
    <div role="article" aria-label={title}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("BestRecipes component", () => {
  const mockRecipes = [
    {
      id: "1",
      title: "Tarte aux pommes",
      description: "Délicieuse tarte",
      image: "",
      difficulty: "facile",
      cost: "€",
    },
    {
      id: "2",
      title: "Gâteau au chocolat",
      description: "Moelleux et fondant",
      image: "",
      difficulty: "moyen",
      cost: "€€",
    },
  ];

  const mockRecipeService = {
    getAllRecipes: vi.fn().mockResolvedValue(mockRecipes),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRecipeService.mockReturnValue(mockRecipeService);
  });

  it("should render title", () => {
    render(<BestRecipes />);
    expect(screen.getByRole("heading", { name: /Les meilleures recettes/i })).toBeInTheDocument();
  });

  it("should display loading and then recipe cards", async () => {
    render(<BestRecipes />);
    
    expect(screen.getByText("Chargement des recettes...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByRole("article", { name: "Tarte aux pommes" })).toBeInTheDocument();
      expect(screen.getByRole("article", { name: "Gâteau au chocolat" })).toBeInTheDocument();
    });
    
    expect(mockRecipeService.getAllRecipes).toHaveBeenCalledTimes(1);
  });
});