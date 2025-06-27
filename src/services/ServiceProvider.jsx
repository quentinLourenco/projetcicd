import React, { createContext, useContext } from 'react';
import FirebaseRecipeService from '@service-implementations/FirebaseRecipeService';
import FirebaseReviewService from '@service-implementations/FirebaseReviewService';
import FirebaseAuthService from '@service-implementations/FirebaseAuthService';

// Créer les contextes pour chaque service
const RecipeServiceContext = createContext(null);
const ReviewServiceContext = createContext(null);
const AuthServiceContext = createContext(null);

// Hooks pour accéder aux services
export const useRecipeService = () => {
  const context = useContext(RecipeServiceContext);
  if (!context) {
    throw new Error('useRecipeService doit être utilisé à l\'intérieur d\'un ServiceProvider');
  }
  return context;
};

export const useReviewService = () => {
  const context = useContext(ReviewServiceContext);
  if (!context) {
    throw new Error('useReviewService doit être utilisé à l\'intérieur d\'un ServiceProvider');
  }
  return context;
};

export const useAuthService = () => {
  const context = useContext(AuthServiceContext);
  if (!context) {
    throw new Error('useAuthService doit être utilisé à l\'intérieur d\'un ServiceProvider');
  }
  return context;
};

// Fournisseur de services
export const ServiceProvider = ({ children }) => {
  // Instancier les services
  const recipeService = new FirebaseRecipeService();
  const reviewService = new FirebaseReviewService();
  const authService = new FirebaseAuthService();

  return (
    <AuthServiceContext.Provider value={authService}>
      <RecipeServiceContext.Provider value={recipeService}>
        <ReviewServiceContext.Provider value={reviewService}>
          {children}
        </ReviewServiceContext.Provider>
      </RecipeServiceContext.Provider>
    </AuthServiceContext.Provider>
  );
};
