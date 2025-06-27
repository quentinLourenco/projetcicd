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
} from "firebase/firestore";
import { db } from "@firebase-config";
import ReviewService from "@service-interfaces/ReviewService";

/**
 * Implémentation Firebase du service de gestion des commentaires
 */
export default class FirebaseReviewService extends ReviewService {
  /**
   * Récupère tous les commentaires d'une recette
   * @param {string} recipeId - ID de la recette
   * @returns {Promise<Array>} Liste des commentaires
   */
  async getReviewsForRecipe(recipeId) {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("recipeId", "==", recipeId)
      );
      
      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviewsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      // Tri manuel des commentaires par date de création (du plus récent au plus ancien)
      reviewsData.sort((a, b) => b.createdAt - a.createdAt);
      
      return reviewsData;
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
      throw error;
    }
  }

  /**
   * Récupère le commentaire d'un utilisateur pour une recette spécifique
   * @param {string} recipeId - ID de la recette
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object|null>} Commentaire de l'utilisateur ou null s'il n'existe pas
   */
  async getUserReviewForRecipe(recipeId, userId) {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("recipeId", "==", recipeId),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(reviewsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du commentaire de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Ajoute un nouveau commentaire
   * @param {Object} reviewData - Données du commentaire à ajouter
   * @returns {Promise<Object>} Commentaire ajouté avec son ID
   */
  async addReview(reviewData) {
    try {
      const reviewWithTimestamp = {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "reviews"), reviewWithTimestamp);
      
      return {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      throw error;
    }
  }

  /**
   * Met à jour un commentaire existant
   * @param {string} reviewId - ID du commentaire à mettre à jour
   * @param {Object} reviewData - Nouvelles données du commentaire
   * @returns {Promise<Object>} Commentaire mis à jour
   */
  async updateReview(reviewId, reviewData) {
    try {
      const reviewWithTimestamp = {
        ...reviewData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, "reviews", reviewId), reviewWithTimestamp);
      
      return {
        id: reviewId,
        ...reviewData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error);
      throw error;
    }
  }

  /**
   * Supprime un commentaire
   * @param {string} reviewId - ID du commentaire à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  async deleteReview(reviewId) {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
      throw error;
    }
  }

  /**
   * Calcule la note moyenne d'une recette
   * @param {string} recipeId - ID de la recette
   * @returns {Promise<Object>} Objet contenant la note moyenne et le nombre de commentaires
   */
  async getAverageRatingForRecipe(recipeId) {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("recipeId", "==", recipeId)
      );
      
      const querySnapshot = await getDocs(reviewsQuery);
      const ratings = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.rating) {
          ratings.push(data.rating);
        }
      });
      
      if (ratings.length === 0) {
        return { averageRating: 0, reviewCount: 0 };
      }
      
      const sum = ratings.reduce((acc, rating) => acc + rating, 0);
      const averageRating = parseFloat((sum / ratings.length).toFixed(1));
      
      return {
        averageRating,
        reviewCount: ratings.length
      };
    } catch (error) {
      console.error("Erreur lors du calcul de la note moyenne:", error);
      throw error;
    }
  }
}
