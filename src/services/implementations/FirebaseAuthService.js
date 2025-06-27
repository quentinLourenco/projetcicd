import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@firebase-config";
import AuthService from "@service-interfaces/AuthService";

/**
 * Implémentation Firebase du service d'authentification
 */
export default class FirebaseAuthService extends AuthService {
  /**
   * Inscrit un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @param {string} displayName - Nom d'affichage de l'utilisateur
   * @returns {Promise<Object>} Résultat de l'inscription avec l'utilisateur créé
   */
  async signup(email, password, displayName) {
    try {
      // Création de l'utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mise à jour du profil avec le pseudo
      await updateProfile(user, { displayName });

      // Création du document utilisateur dans Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      return { 
        success: true, 
        user: {
          uid: user.uid,
          email: user.email,
          displayName
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Connecte un utilisateur existant
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<Object>} Résultat de la connexion
   */
  async login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Déconnecte l'utilisateur actuellement connecté
   * @returns {Promise<Object>} Résultat de la déconnexion
   */
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Met à jour le profil de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  async updateUserProfile(userId, updates) {
    try {
      // Mise à jour dans Firebase Auth
      if (updates.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }

      // Mise à jour dans Firestore
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        { ...updates, updatedAt: serverTimestamp() },
        { merge: true }
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns {Promise<Object|null>} Utilisateur connecté ou null si aucun
   */
  async getCurrentUser() {
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    try {
      // Récupérer les données supplémentaires de l'utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData?.displayName || "",
        photoURL: user.photoURL || userData?.photoURL || "",
        ...userData
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      
      // Retourner les données de base de l'utilisateur en cas d'erreur
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || ""
      };
    }
  }

  /**
   * S'abonne aux changements d'état d'authentification
   * @param {Function} callback - Fonction à appeler lors des changements
   * @returns {Function} Fonction pour se désabonner
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Récupérer les données supplémentaires de l'utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData?.displayName || "",
            photoURL: user.photoURL || userData?.photoURL || "",
            ...userData
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          
          // Appeler le callback avec les données de base en cas d'erreur
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            photoURL: user.photoURL || ""
          });
        }
      } else {
        callback(null);
      }
    });
  }
}
