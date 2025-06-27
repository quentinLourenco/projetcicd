import { render, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceProvider, useRecipeService, useReviewService, useAuthService } from './ServiceProvider';
import FirebaseRecipeService from '@service-implementations/FirebaseRecipeService';
import FirebaseReviewService from '@service-implementations/FirebaseReviewService';
import FirebaseAuthService from '@service-implementations/FirebaseAuthService';

vi.mock('@service-implementations/FirebaseRecipeService', () => ({
  default: vi.fn().mockImplementation(() => ({
    getAllRecipes: vi.fn(),
    getUserRecipes: vi.fn(),
    getRecipeById: vi.fn(),
    addRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
  })),
}));

vi.mock('@service-implementations/FirebaseReviewService', () => ({
  default: vi.fn().mockImplementation(() => ({
    getReviewsForRecipe: vi.fn(),
    addReview: vi.fn(),
    updateReview: vi.fn(),
    deleteReview: vi.fn(),
    getAverageRatingForRecipe: vi.fn(),
  })),
}));

vi.mock('@service-implementations/FirebaseAuthService', () => ({
  default: vi.fn().mockImplementation(() => ({
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    updateUserProfile: vi.fn(),
    onAuthStateChanged: vi.fn(),
  })),
}));

describe('ServiceProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should instantiate all services and provide them to children', () => {
    const TestComponent = () => {
      const recipeService = useRecipeService();
      const reviewService = useReviewService();
      const authService = useAuthService();
      
      return (
        <div>
          <div data-testid="recipe-service">{recipeService ? 'Recipe service available' : 'No recipe service'}</div>
          <div data-testid="review-service">{reviewService ? 'Review service available' : 'No review service'}</div>
          <div data-testid="auth-service">{authService ? 'Auth service available' : 'No auth service'}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(
      <ServiceProvider>
        <TestComponent />
      </ServiceProvider>
    );
    
    expect(getByTestId('recipe-service')).toHaveTextContent('Recipe service available');
    expect(getByTestId('review-service')).toHaveTextContent('Review service available');
    expect(getByTestId('auth-service')).toHaveTextContent('Auth service available');
    
    expect(FirebaseRecipeService).toHaveBeenCalledTimes(1);
    expect(FirebaseReviewService).toHaveBeenCalledTimes(1);
    expect(FirebaseAuthService).toHaveBeenCalledTimes(1);
  });
});

describe('Service Hooks', () => {
  const wrapper = ({ children }) => <ServiceProvider>{children}</ServiceProvider>;
  
  it('useRecipeService should return the recipe service', () => {
    const { result } = renderHook(() => useRecipeService(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.getAllRecipes).toBeDefined();
    expect(result.current.getUserRecipes).toBeDefined();
    expect(result.current.getRecipeById).toBeDefined();
    expect(result.current.addRecipe).toBeDefined();
    expect(result.current.updateRecipe).toBeDefined();
    expect(result.current.deleteRecipe).toBeDefined();
  });
  
  it('useReviewService should return the review service', () => {
    const { result } = renderHook(() => useReviewService(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.getReviewsForRecipe).toBeDefined();
    expect(result.current.addReview).toBeDefined();
    expect(result.current.updateReview).toBeDefined();
    expect(result.current.deleteReview).toBeDefined();
    expect(result.current.getAverageRatingForRecipe).toBeDefined();
  });
  
  it('useAuthService should return the auth service', () => {
    const { result } = renderHook(() => useAuthService(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.signup).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
    expect(result.current.updateUserProfile).toBeDefined();
    expect(result.current.onAuthStateChanged).toBeDefined();
  });
  
  it('useRecipeService should throw an error when used outside ServiceProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useRecipeService();
      } catch (error) {
        return error;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
    expect(result.current.message).toBe("useRecipeService doit être utilisé à l'intérieur d'un ServiceProvider");
  });
  
  it('useReviewService should throw an error when used outside ServiceProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useReviewService();
      } catch (error) {
        return error;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
    expect(result.current.message).toBe("useReviewService doit être utilisé à l'intérieur d'un ServiceProvider");
  });
  
  it('useAuthService should throw an error when used outside ServiceProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useAuthService();
      } catch (error) {
        return error;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
    expect(result.current.message).toBe("useAuthService doit être utilisé à l'intérieur d'un ServiceProvider");
  });
});
