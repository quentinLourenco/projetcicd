import { describe, it, expect, vi, beforeEach } from 'vitest';
import FirebaseRecipeService from './FirebaseRecipeService';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@firebase-config';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => 'TIMESTAMP')
}));

vi.mock('@firebase-config', () => ({
  db: {}
}));

describe('FirebaseRecipeService', () => {
  let recipeService;
  
  // Données de test
  const mockRecipes = [
    { 
      id: 'recipe1', 
      title: 'Tarte aux pommes', 
      description: 'Délicieuse tarte', 
      ownerId: 'user1' 
    },
    { 
      id: 'recipe2', 
      title: 'Gâteau au chocolat', 
      description: 'Moelleux et fondant', 
      ownerId: 'user2' 
    }
  ];
  
  const mockRecipeDoc = {
    exists: () => true,
    id: 'recipe1',
    data: () => ({
      title: 'Tarte aux pommes',
      description: 'Délicieuse tarte',
      ownerId: 'user1'
    })
  };
  
  const mockQuerySnapshot = {
    docs: mockRecipes.map(recipe => ({
      id: recipe.id,
      data: () => {
        const { id, ...rest } = recipe;
        return rest;
      }
    }))
  };
  
  const mockReviews = [
    { recipeId: 'recipe1', rating: 5 },
    { recipeId: 'recipe1', rating: 4 },
    { recipeId: 'recipe2', rating: 3 }
  ];
  
  const mockReviewsSnapshot = {
    forEach: callback => {
      mockReviews.forEach((review, index) => {
        callback({
          id: `review${index}`,
          data: () => review
        });
      });
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    recipeService = new FirebaseRecipeService();
    
    query.mockReturnValue('mockQuery');
    collection.mockReturnValue('mockCollection');
    doc.mockReturnValue('mockDocRef');
  });

  describe('getAllRecipes', () => {
    it('should return all recipes', async () => {
      getDocs.mockResolvedValue(mockQuerySnapshot);
      
      const result = await recipeService.getAllRecipes();
      
      expect(collection).toHaveBeenCalledWith(db, 'recipes');
      expect(query).toHaveBeenCalledWith('mockCollection');
      expect(getDocs).toHaveBeenCalledWith('mockQuery');
      expect(result).toEqual(expect.arrayContaining(
        mockRecipes.map(recipe => expect.objectContaining({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          ownerId: recipe.ownerId
        }))
      ));
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      getDocs.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.getAllRecipes()).rejects.toThrow(errorMessage);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getUserRecipes', () => {
    it('should return recipes for a specific user', async () => {
      getDocs.mockResolvedValue(mockQuerySnapshot);
      where.mockReturnValue('mockWhereClause');
      
      const result = await recipeService.getUserRecipes('user1');
      
      expect(collection).toHaveBeenCalledWith(db, 'recipes');
      expect(where).toHaveBeenCalledWith('ownerId', '==', 'user1');
      expect(query).toHaveBeenCalledWith('mockCollection', 'mockWhereClause');
      expect(getDocs).toHaveBeenCalledWith('mockQuery');
      expect(result).toEqual(expect.arrayContaining(
        mockRecipes.map(recipe => expect.objectContaining({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          ownerId: recipe.ownerId
        }))
      ));
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      getDocs.mockRejectedValue(new Error(errorMessage));
      where.mockReturnValue('mockWhereClause');
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.getUserRecipes('user1')).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getRecipeById', () => {
    it('should return a recipe by id', async () => {
      getDoc.mockResolvedValue(mockRecipeDoc);
      
      const result = await recipeService.getRecipeById('recipe1');
      
      expect(doc).toHaveBeenCalledWith(db, 'recipes', 'recipe1');
      expect(getDoc).toHaveBeenCalledWith('mockDocRef');
      expect(result).toEqual({
        id: 'recipe1',
        title: 'Tarte aux pommes',
        description: 'Délicieuse tarte',
        ownerId: 'user1'
      });
    });
    
    it('should throw error if recipe does not exist', async () => {
      getDoc.mockResolvedValue({
        exists: () => false
      });
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.getRecipeById('nonexistent')).rejects.toThrow('Recette non trouvée');
      
      consoleErrorSpy.mockRestore();
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      getDoc.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.getRecipeById('recipe1')).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('addRecipe', () => {
    it('should add a new recipe', async () => {
      const newRecipe = {
        title: 'Nouvelle recette',
        description: 'Description de la nouvelle recette',
        ownerId: 'user1'
      };
      
      addDoc.mockResolvedValue({ id: 'newRecipeId' });
      
      const result = await recipeService.addRecipe(newRecipe);
      
      expect(collection).toHaveBeenCalledWith(db, 'recipes');
      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        ...newRecipe,
        createdAt: 'TIMESTAMP',
        updatedAt: 'TIMESTAMP'
      });
      expect(result).toEqual({
        id: 'newRecipeId',
        ...newRecipe
      });
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      addDoc.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.addRecipe({})).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('updateRecipe', () => {
    it('should update an existing recipe', async () => {
      const updatedRecipe = {
        title: 'Tarte aux pommes mise à jour',
        description: 'Description mise à jour',
        ownerId: 'user1'
      };
      
      updateDoc.mockResolvedValue({});
      
      const result = await recipeService.updateRecipe('recipe1', updatedRecipe);
      
      expect(doc).toHaveBeenCalledWith(db, 'recipes', 'recipe1');
      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', {
        ...updatedRecipe,
        updatedAt: 'TIMESTAMP'
      });
      expect(result).toEqual({
        id: 'recipe1',
        ...updatedRecipe
      });
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      updateDoc.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.updateRecipe('recipe1', {})).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('deleteRecipe', () => {
    it('should delete a recipe', async () => {
      deleteDoc.mockResolvedValue({});
      
      const result = await recipeService.deleteRecipe('recipe1');
      
      expect(doc).toHaveBeenCalledWith(db, 'recipes', 'recipe1');
      expect(deleteDoc).toHaveBeenCalledWith('mockDocRef');
      expect(result).toBe(true);
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      deleteDoc.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.deleteRecipe('recipe1')).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getBestRecipes', () => {
    it('should return the best recipes sorted by rating', async () => {
      vi.spyOn(recipeService, 'getAllRecipes').mockResolvedValue(mockRecipes);
      
      getDocs.mockResolvedValue(mockReviewsSnapshot);
      
      const result = await recipeService.getBestRecipes(2);
      
      expect(collection).toHaveBeenCalledWith(db, 'reviews');
      expect(query).toHaveBeenCalledWith('mockCollection');
      expect(getDocs).toHaveBeenCalledWith('mockQuery');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('recipe1');
      expect(result[0].averageRating).toBe(4.5);
      expect(result[0].reviewCount).toBe(2);
      
      expect(result[1].id).toBe('recipe2');
      expect(result[1].averageRating).toBe(3);
      expect(result[1].reviewCount).toBe(1);
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      vi.spyOn(recipeService, 'getAllRecipes').mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(recipeService.getBestRecipes()).rejects.toThrow(errorMessage);
      
      consoleErrorSpy.mockRestore();
    });
    
    it('should filter out recipes with no ratings', async () => {
      const mockRecipesWithNoRatings = [
        ...mockRecipes,
        { 
          id: 'recipe3', 
          title: 'Salade', 
          description: 'Fraîche et légère', 
          ownerId: 'user1' 
        }
      ];
      
      vi.spyOn(recipeService, 'getAllRecipes').mockResolvedValue(mockRecipesWithNoRatings);
      getDocs.mockResolvedValue(mockReviewsSnapshot);
      
      const result = await recipeService.getBestRecipes(5);
      
      expect(result).toHaveLength(2);
      expect(result.find(r => r.id === 'recipe3')).toBeUndefined();
    });
    
    it('should limit the number of results', async () => {
      vi.spyOn(recipeService, 'getAllRecipes').mockResolvedValue(mockRecipes);
      getDocs.mockResolvedValue(mockReviewsSnapshot);
      
      const result = await recipeService.getBestRecipes(1);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('recipe1');
    });
  });
});
