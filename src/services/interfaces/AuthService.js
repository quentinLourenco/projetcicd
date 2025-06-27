/**
 * Interface pour le service d'authentification
 * Cette interface définit les méthodes que toute implémentation de service d'authentification doit fournir
 */
export default class AuthService {
  /**
   * Inscrit un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @param {string} displayName - Nom d'affichage de l'utilisateur
   * @returns {Promise<Object>} Résultat de l'inscription avec l'utilisateur créé
   */
  async signup(email, password, displayName) {
    throw new Error("Method not implemented");
  }

  /**
   * Connecte un utilisateur existant
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<Object>} Résultat de la connexion
   */
  async login(email, password) {
    throw new Error("Method not implemented");
  }

  /**
   * Déconnecte l'utilisateur actuellement connecté
   * @returns {Promise<Object>} Résultat de la déconnexion
   */
  async logout() {
    throw new Error("Method not implemented");
  }

  /**
   * Met à jour le profil de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  async updateUserProfile(userId, updates) {
    throw new Error("Method not implemented");
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns {Promise<Object|null>} Utilisateur connecté ou null si aucun
   */
  async getCurrentUser() {
    throw new Error("Method not implemented");
  }

  /**
   * S'abonne aux changements d'état d'authentification
   * @param {Function} callback - Fonction à appeler lors des changements
   * @returns {Function} Fonction pour se désabonner
   */
  onAuthStateChanged(callback) {
    throw new Error("Method not implemented");
  }
}
