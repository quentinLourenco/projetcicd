import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./Register";
import { vi } from "vitest";
import { useAuth } from "@context/AuthContext";

vi.mock("@context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

let mockNavigate;
let mockSignup;

describe("Register", () => {
  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSignup = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({ signup: mockSignup });
  });

  it("should render registration form", () => {
    render(<Register />);

    expect(screen.getByText("Inscription")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer un compte" })).toBeInTheDocument();
  });

  it("should navigate to home after successful signup", async () => {
    render(<Register />);

    const nameInput = screen.getByLabelText("Nom d'utilisateur");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", { name: "Créer un compte" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    fireEvent.click(submitButton);

    expect(mockSignup).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
      "Test User"
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should not navigate if signup fails", async () => {
    mockSignup.mockResolvedValue({ success: false });
    render(<Register />);

    const nameInput = screen.getByLabelText("Nom d'utilisateur");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", { name: "Créer un compte" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    fireEvent.click(submitButton);

    expect(mockSignup).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should have a link to the login page", () => {
    render(<Register />);
    
    const loginLink = screen.getByText("Se connecter");
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
