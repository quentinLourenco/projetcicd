import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RecipeReviews from './RecipeReviews';

vi.mock('@services/ServiceProvider', () => ({
  useReviewService: vi.fn(() => mockReviewService)
}));

vi.mock('@context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ currentUser: mockCurrentUser }))
}));

let mockReviewService;
let mockCurrentUser;

describe('RecipeReviews', () => {
  const recipeId = 'recipe123';
  const testUser = {
    uid: 'user123',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  };

  const mockReviews = [
    {
      id: 'review1',
      recipeId: 'recipe123',
      userId: 'user123',
      userName: 'Test User',
      rating: 4,
      comment: 'Très bonne recette',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    {
      id: 'review2',
      recipeId: 'recipe123',
      userId: 'otherUser',
      userName: 'Other User',
      rating: 5,
      comment: 'Excellente recette',
      createdAt: new Date('2023-01-10'),
      updatedAt: new Date('2023-01-10')
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReviewService = {
      getReviewsForRecipe: vi.fn().mockResolvedValue(mockReviews),
      getUserReviewForRecipe: vi.fn().mockResolvedValue(mockReviews[0]),
      addReview: vi.fn().mockImplementation(data => Promise.resolve({ id: 'newReview', ...data })),
      updateReview: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
      deleteReview: vi.fn().mockResolvedValue(true)
    };
    
    mockCurrentUser = testUser;
  });

  const renderComponent = (user = null) => {
    mockCurrentUser = user;
    return render(<RecipeReviews recipeId={recipeId} />);
  };

  it('should display loading state initially', () => {
    renderComponent(testUser);
    
    expect(screen.getByText('Chargement des commentaires...')).toBeInTheDocument();
  });

  it('should display user review when logged in and review exists', async () => {
    renderComponent(testUser);
    
    await waitFor(() => {
      expect(screen.getByText('Votre avis')).toBeInTheDocument();
      expect(screen.getByText('Très bonne recette')).toBeInTheDocument();
      expect(screen.getByText('Modifier')).toBeInTheDocument();
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });
  });

  it('should display review form when logged in but no review exists', async () => {
    mockReviewService.getUserReviewForRecipe.mockResolvedValue(null);
    
    renderComponent(testUser);
    
    await waitFor(() => {
      expect(screen.getByText('Ajouter un avis')).toBeInTheDocument();
      expect(screen.getByText('Votre note :')).toBeInTheDocument();
      expect(screen.getByLabelText('Votre commentaire :')).toBeInTheDocument();
    });
  });

  it('should display login prompt when not logged in', () => {
    renderComponent(null);
    
    expect(screen.getByText('Connectez-vous pour laisser un commentaire.')).toBeInTheDocument();
  });

  it('should display other users reviews', async () => {
    renderComponent(testUser);
    
    await waitFor(() => {
      expect(screen.getByText('Other User')).toBeInTheDocument();
      expect(screen.getByText('Excellente recette')).toBeInTheDocument();
    });
  });

  it('should display empty state when no reviews exist', async () => {
    mockReviewService.getReviewsForRecipe.mockResolvedValue([]);
    mockReviewService.getUserReviewForRecipe.mockResolvedValue(null);
    
    renderComponent(testUser);
    
    await waitFor(() => {
      expect(screen.getByText('Aucun avis pour le moment. Soyez le premier à donner votre avis !')).toBeInTheDocument();
    });
  });
});
