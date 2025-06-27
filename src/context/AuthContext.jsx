import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuthService } from "@services/ServiceProvider";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const authService = useAuthService();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Écoute des changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Nettoyage
    return () => unsubscribe();
  }, [authService]);

  // Inscription avec email, mot de passe et pseudo
  const signup = async (email, password, displayName) => {
    setError("");
    const result = await authService.signup(email, password, displayName);
    if (result.success) {
      setCurrentUser({
        ...result.user,
        displayName
      });
    } else {
      setError(result.error);
    }
    return result;
  };

  // Connexion avec email et mot de passe
  const login = async (email, password) => {
    setError("");
    const result = await authService.login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  // Déconnexion
  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setCurrentUser(null);
    } else {
      setError(result.error);
    }
    return result;
  };

  // Mise à jour du profil utilisateur
  const updateUserProfile = async (updates) => {
    if (!currentUser) return { success: false, error: "Utilisateur non connecté" };
    
    const result = await authService.updateUserProfile(currentUser.uid, updates);
    if (result.success) {
      // Mise à jour de l'état local
      setCurrentUser(prev => ({
        ...prev,
        ...updates
      }));
    } else {
      setError(result.error);
    }
    return result;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateUserProfile,
    error,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
