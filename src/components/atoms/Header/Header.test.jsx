import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import Header from "./Header.jsx"

vi.mock("@context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Header component", () => {
    it("should test the logo display", () => {
        useAuth.mockReturnValue({ currentUser: null, logout: vi.fn() });
    
        renderWithRouter(<Header />);
        
        expect(screen.getByRole("link", { name: /marmitouille/i })).toBeInTheDocument();
    });

    it("should test the nav display when user is not logged in", () => {
      useAuth.mockReturnValue({ currentUser: null, logout: vi.fn() });
  
      renderWithRouter(<Header />);
      
      expect(screen.getByRole("link", { name: /connexion/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /inscription/i })).toBeInTheDocument();
    });

    it("should test the nav display when user is logged in", () => {
      useAuth.mockReturnValue({ 
        currentUser: {
          uid: "uidMock", 
          displayName: "totoMock", 
          email: "toto@example.com"
        }, 
        logout: vi.fn() 
      });
  
      renderWithRouter(<Header />);

      const userMenuButton = screen.getByRole("button", { expanded: false });
      expect(userMenuButton).toBeInTheDocument();
      
      expect(screen.getByText("totoMock")).toBeInTheDocument();
      
      fireEvent.click(userMenuButton);
      
      expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument();
      expect(screen.getByText("toto@example.com")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /déconnexion/i })).toBeInTheDocument();
    });
});