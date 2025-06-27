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
} from "firebase/firestore";
import { db } from "@firebase-config";
import RecipeService from "@service-interfaces/RecipeService";

/**
 * Implémentation Firebase du service de gestion des recettes
 */
export default class FirebaseRecipeService extends RecipeService {
  /**
   * Récupère toutes les recettes
   * @returns {Promise<Array>} Liste des recettes
   */
  async getAllRecipes() {
    try {
      const recipesQuery = query(collection(db, "recipes"));
      const querySnapshot = await getDocs(recipesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes:", error);
      throw error;
    }
  }

  /**
   * Récupère les recettes d'un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des recettes de l'utilisateur
   */
  async getUserRecipes(userId) {
    try {
      const recipesQuery = query(
        collection(db, "recipes"),
        where("ownerId", "==", userId)
      );
      
      const querySnapshot = await getDocs(recipesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Récupère une recette par son ID
   * @param {string} recipeId - ID de la recette
   * @returns {Promise<Object>} Données de la recette
   */
  async getRecipeById(recipeId) {
    try {
      const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
      
      if (!recipeDoc.exists()) {
        throw new Error("Recette non trouvée");
      }
      
      return {
        id: recipeDoc.id,
        ...recipeDoc.data()
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette:", error);
      throw error;
    }
  }

  /**
   * Ajoute une nouvelle recette
   * @param {Object} recipeData - Données de la recette à ajouter
   * @returns {Promise<Object>} Recette ajoutée avec son ID
   */
  async addRecipe(recipeData) {
    try {
      const recipeWithTimestamp = {
        ...recipeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "recipes"), recipeWithTimestamp);
      
      return {
        id: docRef.id,
        ...recipeData
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout de la recette:", error);
      throw error;
    }
  }

  /**
   * Met à jour une recette existante
   * @param {string} recipeId - ID de la recette à mettre à jour
   * @param {Object} recipeData - Nouvelles données de la recette
   * @returns {Promise<Object>} Recette mise à jour
   */
  async updateRecipe(recipeId, recipeData) {
    try {
      const recipeWithTimestamp = {
        ...recipeData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, "recipes", recipeId), recipeWithTimestamp);
      
      return {
        id: recipeId,
        ...recipeData
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la recette:", error);
      throw error;
    }
  }

  /**
   * Supprime une recette
   * @param {string} recipeId - ID de la recette à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  async deleteRecipe(recipeId) {
    try {
      await deleteDoc(doc(db, "recipes", recipeId));
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de la recette:", error);
      throw error;
    }
  }

  /**
   * Récupère les meilleures recettes (les plus notées)
   * @param {number} limitCount - Nombre de recettes à récupérer
   * @returns {Promise<Array>} Liste des meilleures recettes
   */
  async getBestRecipes(limitCount = 5) {
    try {
      // Cette méthode est plus complexe car elle nécessite de calculer les moyennes
      // des notes, ce qui n'est pas directement possible avec Firestore
      
      // 1. Récupérer toutes les recettes
      const recipes = await this.getAllRecipes();
      
      // 2. Pour chaque recette, récupérer ses commentaires et calculer la moyenne
      const reviewsQuery = query(collection(db, "reviews"));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewsByRecipe = {};
      reviewsSnapshot.forEach(doc => {
        const review = doc.data();
        if (review.recipeId && review.rating) {
          if (!reviewsByRecipe[review.recipeId]) {
            reviewsByRecipe[review.recipeId] = [];
          }
          reviewsByRecipe[review.recipeId].push(review.rating);
        }
      });
      
      // 3. Calculer la moyenne pour chaque recette
      const recipesWithRatings = recipes.map(recipe => {
        const ratings = reviewsByRecipe[recipe.id] || [];
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;
        
        return {
          ...recipe,
          averageRating,
          reviewCount: ratings.length
        };
      });
      
      // 4. Trier par note moyenne et limiter le nombre de résultats
      return recipesWithRatings
        .filter(recipe => recipe.averageRating > 0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, limitCount);
    } catch (error) {
      console.error("Erreur lors de la récupération des meilleures recettes:", error);
      throw error;
    }
  }
}
