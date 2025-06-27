import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

vi.mock("@services/ServiceProvider", () => ({
  useAuthService: vi.fn(),
}));

import { useAuthService } from "@services/ServiceProvider";

const mockAuthService = {
  signup: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  updateUserProfile: vi.fn(),
  onAuthStateChanged: vi.fn((callback) => {
    callback(null);
    return () => {};
  })
};

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuthService.mockReturnValue(mockAuthService);
  });

  it("should test signUp", async () => {
    mockAuthService.signup.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.signup("toto@coucou.hey", "totomdp", "totobg");
    });

    expect(mockAuthService.signup).toHaveBeenCalledWith("toto@coucou.hey", "totomdp", "totobg");
    expect(response.success).toBe(true);
  });

  it("should test login", async () => {
    mockAuthService.login.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.login("toto@coucou.hey", "totomdp");
    });

    expect(mockAuthService.login).toHaveBeenCalledWith("toto@coucou.hey", "totomdp");
    expect(response.success).toBe(true);
  });

  it("should test logout", async () => {
    mockAuthService.logout.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.logout();
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(result.current.currentUser).toBe(null);
    expect(response.success).toBe(true);
  });

  it("should test the useEffect interract with auth service", async () => {
    const mockUser = {
      uid: "totobg",
      email: "toto@coucou.hey",
      displayName: "totoName",
      photoURL: "totoPhoto.jpg",
      extraField: "toto&co",
    };
  
    mockAuthService.onAuthStateChanged.mockImplementationOnce((callback) => {
      callback(mockUser);
      return () => {};
    });
  
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => result.current.loading === false);
  
    expect(result.current.currentUser).toEqual(mockUser);
  });

  it("should test updateUserProfile", async () => {
    const mockUser = {
      uid: "totobg",
      email: "toto@coucou.hey",
      displayName: "Old Name",
    };
  
    const updates = { displayName: "tototropbeau" };
  
    mockAuthService.onAuthStateChanged.mockImplementationOnce((callback) => {
      callback(mockUser);
      return () => {};
    });
    
    mockAuthService.updateUserProfile.mockResolvedValue({ success: true });
  
    const { result } = renderHook(() => useAuth(), { wrapper });
  
    await waitFor(() => !result.current.loading);
  
    let response;
    await act(async () => {
      response = await result.current.updateUserProfile(updates);
    });
  
    expect(mockAuthService.updateUserProfile).toHaveBeenCalledWith(mockUser.uid, updates);
    
    expect(result.current.currentUser).toEqual({
      ...mockUser,
      ...updates
    });
    expect(response.success).toBe(true);
  });
  

  it("should signup error ", async () => {
    mockAuthService.signup.mockResolvedValue({ success: false, error: "Signup failed" });
  
    const { result } = renderHook(() => useAuth(), { wrapper });
  
    let response;
    await act(async () => {
      response = await result.current.signup("fail@user.com", "badpassword", "failUser");
    });
  
    expect(response.success).toBe(false);
    expect(response.error).toBe("Signup failed");
    expect(result.current.error).toBe("Signup failed");
  });

  it("should handle error in login", async () => {
    mockAuthService.login.mockResolvedValue({ success: false, error: "Login failed" });
  
    const { result } = renderHook(() => useAuth(), { wrapper });
  
    let response;
    await act(async () => {
      response = await result.current.login("fail@user.com", "wrongpassword");
    });
  
    expect(response.success).toBe(false);
    expect(response.error).toBe("Login failed");
    expect(result.current.error).toBe("Login failed");
  });

  it("should handle error in logout", async () => {
    mockAuthService.logout.mockResolvedValue({ success: false, error: "Logout failed" });
  
    const { result } = renderHook(() => useAuth(), { wrapper });
  
    let response;
    await act(async () => {
      response = await result.current.logout();
    });
  
    expect(response.success).toBe(false);
    expect(response.error).toBe("Logout failed");
    expect(result.current.error).toBe("Logout failed");
  });
});