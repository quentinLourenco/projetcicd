/**
 * Interface pour le service de gestion des recettes
 * Cette interface définit les méthodes que toute implémentation de service de recettes doit fournir
 */
export default class RecipeService {
  /**
   * Récupère toutes les recettes
   * @returns {Promise<Array>} Liste des recettes
   */
  async getAllRecipes() {
    throw new Error("Method not implemented");
  }

  /**
   * Récupère les recettes d'un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des recettes de l'utilisateur
   */
  async getUserRecipes(userId) {
    throw new Error("Method not implemented");
  }

  /**
   * Récupère une recette par son ID
   * @param {string} recipeId - ID de la recette
   * @returns {Promise<Object>} Données de la recette
   */
  async getRecipeById(recipeId) {
    throw new Error("Method not implemented");
  }

  /**
   * Ajoute une nouvelle recette
   * @param {Object} recipeData - Données de la recette à ajouter
   * @returns {Promise<Object>} Recette ajoutée avec son ID
   */
  async addRecipe(recipeData) {
    throw new Error("Method not implemented");
  }

  /**
   * Met à jour une recette existante
   * @param {string} recipeId - ID de la recette à mettre à jour
   * @param {Object} recipeData - Nouvelles données de la recette
   * @returns {Promise<Object>} Recette mise à jour
   */
  async updateRecipe(recipeId, recipeData) {
    throw new Error("Method not implemented");
  }

  /**
   * Supprime une recette
   * @param {string} recipeId - ID de la recette à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  async deleteRecipe(recipeId) {
    throw new Error("Method not implemented");
  }

  /**
   * Récupère les meilleures recettes (les plus notées)
   * @param {number} limit - Nombre de recettes à récupérer
   * @returns {Promise<Array>} Liste des meilleures recettes
   */
  async getBestRecipes(limit) {
    throw new Error("Method not implemented");
  }
}
