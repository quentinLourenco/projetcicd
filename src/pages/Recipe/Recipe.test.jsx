import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Recipe from "./Recipe";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: mockRecipeId }),
  useNavigate: () => mockNavigate
}));

vi.mock("@services/ServiceProvider", () => ({
  useRecipeService: () => mockRecipeService,
  useReviewService: () => mockReviewService
}));

vi.mock("@components/molecules/RecipeReviews/RecipeReviews", () => ({
  default: ({ recipeId }) => <div data-testid="recipe-reviews">{recipeId}</div>
}));

// Variables globales pour les mocks
let mockRecipeId;
let mockNavigate;
let mockRecipeService;
let mockReviewService;

describe("Recipe", () => {
  const mockRecipe = {
    id: "recipe123",
    title: "Tarte aux pommes",
    description: "Une délicieuse tarte aux pommes maison",
    image: "https://example.com/tarte.jpg",
    difficulty: "Moyen",
    cost: "Abordable",
    ingredients: ["Pommes", "Farine", "Sucre", "Beurre"],
    steps: ["Préparer la pâte", "Couper les pommes", "Cuire au four"]
  };

  const mockRatings = {
    averageRating: 4.5,
    reviewCount: 10
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecipeId = "recipe123";
    mockNavigate = vi.fn();
    mockRecipeService = {
      getRecipeById: vi.fn().mockResolvedValue(mockRecipe)
    };
    mockReviewService = {
      getAverageRatingForRecipe: vi.fn().mockResolvedValue(mockRatings)
    };
  });

  it("should display loading state initially", () => {
    render(<Recipe />);
    expect(screen.getByText("Chargement de la recette...")).toBeInTheDocument();
  });

  it("should display recipe details after loading", async () => {
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.queryByText("Chargement de la recette...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Tarte aux pommes")).toBeInTheDocument();
    expect(screen.getByText("Une délicieuse tarte aux pommes maison")).toBeInTheDocument();
    expect(screen.getByText("Moyen")).toBeInTheDocument();
    expect(screen.getByText("Abordable")).toBeInTheDocument();
    expect(screen.getByText("4.5/5")).toBeInTheDocument();
    expect(screen.getByText("(10 avis)")).toBeInTheDocument();
  });

  it("should display ingredients and steps", async () => {
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.queryByText("Chargement de la recette...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Ingrédients")).toBeInTheDocument();
    expect(screen.getByText("Pommes")).toBeInTheDocument();
    expect(screen.getByText("Farine")).toBeInTheDocument();
    expect(screen.getByText("Sucre")).toBeInTheDocument();
    expect(screen.getByText("Beurre")).toBeInTheDocument();

    expect(screen.getByText("Préparation")).toBeInTheDocument();
    expect(screen.getByText("Préparer la pâte")).toBeInTheDocument();
    expect(screen.getByText("Couper les pommes")).toBeInTheDocument();
    expect(screen.getByText("Cuire au four")).toBeInTheDocument();
  });

  it("should display error message when recipe is not found", async () => {
    mockRecipeService.getRecipeById.mockRejectedValue(new Error("Recette non trouvée"));
    
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.getByText("Cette recette n'existe pas.")).toBeInTheDocument();
    });

    expect(screen.getByText("Retourner aux recettes")).toBeInTheDocument();
  });

  it("should display generic error message for other errors", async () => {
    mockRecipeService.getRecipeById.mockRejectedValue(new Error("Erreur serveur"));
    
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.getByText("Une erreur est survenue lors du chargement de la recette.")).toBeInTheDocument();
    });
  });

  it("should navigate back when back button is clicked", async () => {
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.queryByText("Chargement de la recette...")).not.toBeInTheDocument();
    });

    const backButton = screen.getByText("Retour");
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("should render RecipeReviews component with correct recipeId", async () => {
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.queryByText("Chargement de la recette...")).not.toBeInTheDocument();
    });

    const reviewsComponent = screen.getByTestId("recipe-reviews");
    expect(reviewsComponent).toBeInTheDocument();
    expect(reviewsComponent.textContent).toBe("recipe123");
  });

  it("should display placeholder when recipe has no ingredients", async () => {
    const recipeWithoutIngredients = { ...mockRecipe, ingredients: [] };
    mockRecipeService.getRecipeById.mockResolvedValue(recipeWithoutIngredients);
    
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.queryByText("Chargement de la recette...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Aucun ingrédient spécifié.")).toBeInTheDocument();
  });

  it("should display placeholder when recipe has no steps", async () => {
    const recipeWithoutSteps = { ...mockRecipe, steps: [] };
    mockRecipeService.getRecipeById.mockResolvedValue(recipeWithoutSteps);
    
    render(<Recipe />);

    await waitFor(() => {
      expect(screen.queryByText("Chargement de la recette...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Aucune étape spécifiée.")).toBeInTheDocument();
  });
});
