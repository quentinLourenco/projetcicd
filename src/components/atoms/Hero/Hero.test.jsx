import { render, screen } from "@testing-library/react";
import Hero from "./Hero";

describe("Hero component", () => {
  it("shourld test rendre info hero", () => {
    render(<Hero title="totoTitre" subtitle="totoSousTitre" />);
    expect(screen.getByRole("banner")).toHaveTextContent("totoTitre");
    expect(screen.getByRole("banner")).toHaveTextContent("totoSousTitre");
  });
});