import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import RecipeManager from "./RecipeManager";
import { vi } from "vitest";
import { useAuth } from "@context/AuthContext";
import { useRecipeService } from "@services/ServiceProvider";

vi.mock("@context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@services/ServiceProvider", () => ({
  useRecipeService: vi.fn(),
}));

vi.mock("@molecules/RecipeCard/RecipeCard", () => ({
  default: ({ title, onClick, actions }) => (
    <div>
      <h3 onClick={onClick}>{title}</h3>
      <div role="group" aria-label="actions">{actions}</div>
    </div>
  ),
}));

vi.mock("@atoms/ConfirmDialog/ConfirmDialog", () => ({
  default: ({ isOpen, onConfirm, onClose, message }) =>
  isOpen ? (
    <div role="dialog" aria-modal="true">
      <p>{message}</p>
      <button onClick={onConfirm}>Supprimer</button>
      <button onClick={onClose}>Annuler</button>
    </div>
  ) : null,
}));

describe("RecipeManager test", () => {
  const mockUser = {
    uid: "totobg",
    email: "toto@coucou.hey",
  };

  const mockRecipeService = {
    getUserRecipes: vi.fn().mockResolvedValue([]),
    addRecipe: vi.fn().mockImplementation(recipeData => ({ id: "new-recipe-id", ...recipeData })),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: mockUser });
    useRecipeService.mockReturnValue(mockRecipeService);
  });

  it("should render empty form", () => {
    render(<RecipeManager />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0]).toHaveTextContent("Ajouter une nouvelle recette");
    
    expect(screen.getByText("Vous n'avez pas encore créé de recettes.")).toBeInTheDocument();
  });

  it("should test add recipe", async () => {
    render(<RecipeManager />);

    fireEvent.change(screen.getByLabelText(/Nom de la recette/i), {
      target: { value: "Tarte de toto", name: "title" },
    });

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Normal c'est moi qui l'ai fait!", name: "description" },
    });

    fireEvent.click(screen.getByText("Ajouter cette recette"));

    await waitFor(() => {
      expect(mockRecipeService.addRecipe).toHaveBeenCalledWith(expect.objectContaining({
        title: "Tarte de toto",
        description: "Normal c'est moi qui l'ai fait!",
        ownerId: "totobg",
      }));
    });
  });

  it("should delete a recipe after confirmation", async () => {
    const mockRecipe = {
      id: "r1",
      title: "Tarte salé du papa de toto",
      description: "Tarte trop salé",
      image: "",
      ingredients: ["beaucoup trop de sel"],
      steps: ["rajouter du sel"],
      difficulty: "extrême",
      cost: "sel€",
      ownerId: "totobg",
      ownerEmail: "toto@coucou.hey",
    };


    mockRecipeService.getUserRecipes.mockResolvedValue([mockRecipe]);

    render(<RecipeManager />);


    const recipeTitle = await screen.findByText(mockRecipe.title);
    expect(recipeTitle).toBeInTheDocument();


    const deleteButton = screen.getByText(/supprimer/i);
    fireEvent.click(deleteButton);


    const confirmDialog = await screen.findByRole("dialog");
    expect(confirmDialog).toBeInTheDocument();


    const confirmButton = within(confirmDialog).getAllByRole("button")[0];
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockRecipeService.deleteRecipe).toHaveBeenCalledWith(mockRecipe.id);
    });
  });
});