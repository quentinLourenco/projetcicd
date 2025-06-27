import { render, screen, fireEvent } from "@testing-library/react";
import Login from "./Login";
import { vi } from "vitest";
import { useAuth } from "@context/AuthContext";

vi.mock("@context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
});

describe("Login component", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin });
  });

  it("should render title and register link", () => {
    render(<Login />);
    expect(screen.getByText("Connexion")).toBeInTheDocument();
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
  });

  it("should render login form and handle successful login", async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: "toto@coucou.hey" } });
    fireEvent.change(passwordInput, { target: { value: "totomdp" } });
    fireEvent.click(submitButton);

    await new Promise((r) => setTimeout(r, 0));
    expect(mockLogin).toHaveBeenCalledWith("toto@coucou.hey", "totomdp");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});