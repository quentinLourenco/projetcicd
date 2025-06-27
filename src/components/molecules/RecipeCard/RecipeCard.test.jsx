import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecipeCard from "./RecipeCard";
import { useReviewService } from "@services/ServiceProvider";


vi.mock("@services/ServiceProvider", () => ({
  useReviewService: vi.fn(),
}));

describe("RecipeCard component", () => {
  const mockProps = {
    title: "Tarte aux pommes",
    image: "https://example.com/tarte.jpg",
    description: "Une délicieuse tarte faite maison.",
    onClick: vi.fn(),
    id: "recipe-123"
  };

  const mockReviewService = {
    getAverageRatingForRecipe: vi.fn().mockResolvedValue({
      averageRating: 4.5,
      reviewCount: 10
    })
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useReviewService.mockReturnValue(mockReviewService);
  });

  it("should render the title, image, and description", () => {
    render(<RecipeCard {...mockProps} />);

    expect(screen.getByRole("heading")).toHaveTextContent("Tarte aux pommes");
    expect(screen.getByText("Une délicieuse tarte faite maison.")).toBeInTheDocument();
    
    const image = screen.getByAltText(mockProps.title);
    expect(image).toHaveAttribute("src", mockProps.image);
    expect(image).toHaveAttribute("alt", mockProps.title);
  });

  it("should call onClick when the card is clicked", () => {
    render(<RecipeCard {...mockProps} />);
    const card = screen.getByRole("button", { name: mockProps.title });
    fireEvent.click(card);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("should show difficulty with correct emoji and class", () => {
    render(<RecipeCard {...mockProps} difficulty="Facile" />);
    const difficulty = screen.getByText("Facile");
    expect(difficulty).toBeInTheDocument();
    expect(difficulty.previousSibling).toHaveTextContent("🟢");
    expect(difficulty.parentElement).toHaveClass("recipe-card__difficulty--facile");
  });

  it("should display cost if provided", () => {
    render(<RecipeCard {...mockProps} cost="€" />);
    expect(screen.getByText("€")).toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    render(<RecipeCard {...mockProps} actions={<button>Modifier</button>} />);
    expect(screen.getByRole("button", { name: /modifier/i })).toBeInTheDocument();
  });

  it("should not display 'Voir la recette' if actions are provided", () => {
    render(<RecipeCard {...mockProps} actions={<button>Modifier</button>} />);
    expect(screen.queryByText(/Voir la recette/i)).not.toBeInTheDocument();
  });

  it("should display 'Voir la recette' if actions are not provided", () => {
    render(<RecipeCard {...mockProps} />);
    expect(screen.getByText(/Voir la recette/i)).toBeInTheDocument();
  });

  it("should display placeholder if image fails to load", () => {
    render(<RecipeCard {...mockProps} />);
    const image = screen.getByAltText(mockProps.title);
    fireEvent.error(image);
    expect(image).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });

  it("should add hovered class on mouse enter and remove on mouse leave", () => {
    render(<RecipeCard {...mockProps} />);
    const card = screen.getByRole("button", { name: mockProps.title });

    fireEvent.mouseEnter(card);
    expect(card.className).toContain("recipe-card--hovered");

    fireEvent.mouseLeave(card);
    expect(card.className).not.toContain("recipe-card--hovered");
  });

  it("should fetch and display ratings", async () => {
    render(<RecipeCard {...mockProps} />);
    
    expect(mockReviewService.getAverageRatingForRecipe).toHaveBeenCalledWith("recipe-123");
    
    await waitFor(() => {
      expect(screen.getByText("(10)")).toBeInTheDocument();
    });
    
    const stars = document.querySelectorAll(".recipe-card__star");
    expect(stars.length).toBe(5);
    
    const filledStars = document.querySelectorAll(".recipe-card__star.filled");
    expect(filledStars.length).toBe(4);
  });
});