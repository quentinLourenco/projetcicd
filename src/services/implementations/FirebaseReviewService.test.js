import { describe, it, expect, vi, beforeEach } from 'vitest';
import FirebaseReviewService from './FirebaseReviewService';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@firebase-config';

// Mock des modules Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'TIMESTAMP')
}));

vi.mock('@firebase-config', () => ({
  db: {}
}));

describe('FirebaseReviewService', () => {
  let reviewService;
  
  const mockReviews = [
    { 
      id: 'review1', 
      recipeId: 'recipe1', 
      userId: 'user1',
      rating: 5,
      comment: 'Excellent !',
      createdAt: {
        toDate: () => new Date('2023-01-02')
      },
      updatedAt: {
        toDate: () => new Date('2023-01-02')
      }
    },
    { 
      id: 'review2', 
      recipeId: 'recipe1', 
      userId: 'user2',
      rating: 4,
      comment: 'Très bon',
      createdAt: {
        toDate: () => new Date('2023-01-01')
      },
      updatedAt: {
        toDate: () => new Date('2023-01-01')
      }
    },
    { 
      id: 'review3', 
      recipeId: 'recipe2', 
      userId: 'user1',
      rating: 3,
      comment: 'Moyen',
      createdAt: {
        toDate: () => new Date('2023-01-03')
      },
      updatedAt: {
        toDate: () => new Date('2023-01-03')
      }
    }
  ];
  
  const createDocumentSnapshot = (review) => ({
    id: review.id,
    data: () => {
      const { id, ...data } = review;
      return data;
    }
  });

  const createMockQuerySnapshot = (reviews) => ({
    empty: reviews.length === 0,
    docs: reviews.map(createDocumentSnapshot),
    forEach: (callback) => {
      reviews.forEach(review => callback(createDocumentSnapshot(review)));
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    reviewService = new FirebaseReviewService();
    
    query.mockReturnValue('mockQuery');
    collection.mockReturnValue('mockCollection');
    doc.mockReturnValue('mockDocRef');
  });

  describe('getReviewsForRecipe', () => {
    it('should return all reviews for a specific recipe', async () => {
      const recipeId = 'recipe1';
      const recipeReviews = mockReviews.filter(r => r.recipeId === recipeId);
      const mockSnapshot = createMockQuerySnapshot(recipeReviews);
      
      where.mockReturnValue('mockWhereClause');
      getDocs.mockResolvedValue(mockSnapshot);
      
      const result = await reviewService.getReviewsForRecipe(recipeId);
      
      expect(collection).toHaveBeenCalledWith(db, 'reviews');
      expect(where).toHaveBeenCalledWith('recipeId', '==', recipeId);
      expect(query).toHaveBeenCalledWith('mockCollection', 'mockWhereClause');
      expect(getDocs).toHaveBeenCalledWith('mockQuery');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('review1');
      expect(result[1].id).toBe('review2');
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      where.mockReturnValue('mockWhereClause');
      getDocs.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(reviewService.getReviewsForRecipe('recipe1')).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getUserReviewForRecipe', () => {
    it('should return a user review for a specific recipe', async () => {
      const recipeId = 'recipe1';
      const userId = 'user1';
      const userReview = mockReviews.find(r => r.recipeId === recipeId && r.userId === userId);
      const mockSnapshot = createMockQuerySnapshot([userReview]);
      
      where.mockReturnValueOnce('mockWhereClause1')
           .mockReturnValueOnce('mockWhereClause2');
      getDocs.mockResolvedValue(mockSnapshot);
      
      const result = await reviewService.getUserReviewForRecipe(recipeId, userId);
      
      expect(collection).toHaveBeenCalledWith(db, 'reviews');
      expect(where).toHaveBeenCalledWith('recipeId', '==', recipeId);
      expect(where).toHaveBeenCalledWith('userId', '==', userId);
      expect(query).toHaveBeenCalledWith('mockCollection', 'mockWhereClause1', 'mockWhereClause2');
      expect(getDocs).toHaveBeenCalledWith('mockQuery');
      expect(result.id).toBe('review1');
      expect(result.userId).toBe('user1');
      expect(result.recipeId).toBe('recipe1');
    });
    
    it('should return null if no review exists', async () => {
      const mockSnapshot = createMockQuerySnapshot([]);
      
      where.mockReturnValue('mockWhereClause');
      getDocs.mockResolvedValue(mockSnapshot);
      
      const result = await reviewService.getUserReviewForRecipe('recipe1', 'nonexistentUser');
      
      expect(result).toBeNull();
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      where.mockReturnValue('mockWhereClause');
      getDocs.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(reviewService.getUserReviewForRecipe('recipe1', 'user1')).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('addReview', () => {
    it('should add a new review', async () => {
      const newReview = {
        recipeId: 'recipe1',
        userId: 'user3',
        rating: 5,
        comment: 'Parfait !'
      };
      
      addDoc.mockResolvedValue({ id: 'newReviewId' });
      
      const result = await reviewService.addReview(newReview);
      
      expect(collection).toHaveBeenCalledWith(db, 'reviews');
      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        ...newReview,
        createdAt: 'TIMESTAMP',
        updatedAt: 'TIMESTAMP'
      });
      expect(result).toEqual({
        id: 'newReviewId',
        ...newReview,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      addDoc.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(reviewService.addReview({})).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('updateReview', () => {
    it('should update an existing review', async () => {
      const reviewId = 'review1';
      const updatedReview = {
        rating: 4,
        comment: 'Commentaire mis à jour'
      };
      
      updateDoc.mockResolvedValue({});
      
      const result = await reviewService.updateReview(reviewId, updatedReview);
      
      expect(doc).toHaveBeenCalledWith(db, 'reviews', reviewId);
      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', {
        ...updatedReview,
        updatedAt: 'TIMESTAMP'
      });
      expect(result).toEqual({
        id: reviewId,
        ...updatedReview,
        updatedAt: expect.any(Date)
      });
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      updateDoc.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(reviewService.updateReview('review1', {})).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('deleteReview', () => {
    it('should delete a review', async () => {
      const reviewId = 'review1';
      deleteDoc.mockResolvedValue({});
      
      const result = await reviewService.deleteReview(reviewId);
      
      expect(doc).toHaveBeenCalledWith(db, 'reviews', reviewId);
      expect(deleteDoc).toHaveBeenCalledWith('mockDocRef');
      expect(result).toBe(true);
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      deleteDoc.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(reviewService.deleteReview('review1')).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getAverageRatingForRecipe', () => {
    it('should calculate the average rating for a recipe', async () => {
      const recipeId = 'recipe1';
      const recipeReviews = mockReviews.filter(r => r.recipeId === recipeId);
      const mockSnapshot = createMockQuerySnapshot(recipeReviews);
      
      where.mockReturnValue('mockWhereClause');
      getDocs.mockResolvedValue(mockSnapshot);
      
      const result = await reviewService.getAverageRatingForRecipe(recipeId);
      
      expect(collection).toHaveBeenCalledWith(db, 'reviews');
      expect(where).toHaveBeenCalledWith('recipeId', '==', recipeId);
      expect(query).toHaveBeenCalledWith('mockCollection', 'mockWhereClause');
      expect(getDocs).toHaveBeenCalledWith('mockQuery');
      
      expect(result.averageRating).toBe(4.5);
      expect(result.reviewCount).toBe(2);
    });
    
    it('should return zero for recipes with no reviews', async () => {
      const mockSnapshot = createMockQuerySnapshot([]);
      
      where.mockReturnValue('mockWhereClause');
      getDocs.mockResolvedValue(mockSnapshot);
      
      const result = await reviewService.getAverageRatingForRecipe('recipeWithNoReviews');
      
      expect(result.averageRating).toBe(0);
      expect(result.reviewCount).toBe(0);
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      where.mockReturnValue('mockWhereClause');
      getDocs.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(reviewService.getAverageRatingForRecipe('recipe1')).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
});
