import { render, screen } from "@testing-library/react";
import Home from "./Home";
import { vi } from "vitest";

vi.mock("@components/atoms/Hero/Hero", () => ({
  default: ({ title }) => <div role="banner" aria-label="hero">{title}</div>,
}));

vi.mock("@components/atoms/BestRecipes/BestRecipes", () => ({
  default: () => <div aria-label="best-recipes">Mocked BestRecipes</div>,
}));

describe("Home component", () => {
  it("should render Hero and BestRecipes components", () => {
    render(<Home />);

    expect(screen.getByRole("banner")).toHaveTextContent("Bienvenue sur Marmitouille");

    expect(screen.getByLabelText("best-recipes")).toBeInTheDocument();
  });
});