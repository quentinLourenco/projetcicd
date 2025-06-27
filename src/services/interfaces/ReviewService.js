/**
 * Interface pour le service de gestion des commentaires (reviews)
 * Cette interface définit les méthodes que toute implémentation de service de commentaires doit fournir
 */
export default class ReviewService {
  /**
   * Récupère tous les commentaires d'une recette
   * @param {string} recipeId - ID de la recette
   * @returns {Promise<Array>} Liste des commentaires
   */
  async getReviewsForRecipe(recipeId) {
    throw new Error("Method not implemented");
  }

  /**
   * Récupère le commentaire d'un utilisateur pour une recette spécifique
   * @param {string} recipeId - ID de la recette
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object|null>} Commentaire de l'utilisateur ou null s'il n'existe pas
   */
  async getUserReviewForRecipe(recipeId, userId) {
    throw new Error("Method not implemented");
  }

  /**
   * Ajoute un nouveau commentaire
   * @param {Object} reviewData - Données du commentaire à ajouter
   * @returns {Promise<Object>} Commentaire ajouté avec son ID
   */
  async addReview(reviewData) {
    throw new Error("Method not implemented");
  }

  /**
   * Met à jour un commentaire existant
   * @param {string} reviewId - ID du commentaire à mettre à jour
   * @param {Object} reviewData - Nouvelles données du commentaire
   * @returns {Promise<Object>} Commentaire mis à jour
   */
  async updateReview(reviewId, reviewData) {
    throw new Error("Method not implemented");
  }

  /**
   * Supprime un commentaire
   * @param {string} reviewId - ID du commentaire à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  async deleteReview(reviewId) {
    throw new Error("Method not implemented");
  }

  /**
   * Calcule la note moyenne d'une recette
   * @param {string} recipeId - ID de la recette
   * @returns {Promise<Object>} Objet contenant la note moyenne et le nombre de commentaires
   */
  async getAverageRatingForRecipe(recipeId) {
    throw new Error("Method not implemented");
  }
}
