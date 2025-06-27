import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@components/atoms/ConfirmDialog/ConfirmDialog";
import "./Profile.scss";

export default function Profile() {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  // État pour le mode édition
  const [isEditing, setIsEditing] = useState(false);
  // État pour les données du formulaire
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    bio: "",
    favoriteFood: ""
  });
  // États pour les messages et le chargement
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Initialiser les données du formulaire lorsque l'utilisateur est chargé
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        favoriteFood: currentUser.favoriteFood || ""
      });
    }
  }, [currentUser]);
  
  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Activer le mode édition
  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage("");
    setError("");
  };
  
  // Annuler les modifications et réinitialiser le formulaire
  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        favoriteFood: currentUser.favoriteFood || ""
      });
    }
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  };
  
  // Soumettre les modifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEditing) {
      // Si on n'est pas en mode édition, activer le mode édition
      handleEdit();
      return;
    }
    
    setIsSaving(true);
    setError("");
    setSuccessMessage("");
    
    try {
      // Préparer les données à mettre à jour
      const updates = {
        displayName: formData.displayName,
        bio: formData.bio,
        favoriteFood: formData.favoriteFood
      };
      
      // Appeler la fonction de mise à jour du profil
      const result = await updateUserProfile(updates);
      
      if (result.success) {
        setSuccessMessage("Profil mis à jour avec succès !");
        setIsEditing(false); // Désactiver le mode édition après la mise à jour
      } else {
        setError(result.error || "Une erreur est survenue lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      setError(error.message || "Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Gérer la suppression du compte
  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setError("Erreur lors de la suppression du compte");
    }
  };
  
  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!currentUser) {
    return (
      <div className="profile">
        <div className="profile__container">
          <h1 className="profile__title">Profil non disponible</h1>
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <button 
            className="profile__button profile__button--primary"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile">
      <div className="profile__container">
        <h1 className="profile__title">Mon Profil</h1>
        
        {error && <div className="profile__error">{error}</div>}
        {successMessage && <div className="profile__success">{successMessage}</div>}
        
        <div className="profile__avatar">
          <div className="profile__avatar-circle">
            {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
        
        {isEditing ? (
          <form className="profile__form" onSubmit={handleSubmit}>
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="displayName">Nom d'utilisateur</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                className="profile__input profile__input--editable"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="profile__input"
                value={formData.email}
                disabled={true}
                readOnly
              />
              <small className="profile__help-text">L'email ne peut pas être modifié</small>
            </div>
            
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                className="profile__textarea profile__textarea--editable"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Parlez-nous de vous..."
                rows={4}
              />
            </div>
            
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="favoriteFood">Plat préféré</label>
              <input
                type="text"
                id="favoriteFood"
                name="favoriteFood"
                className="profile__input profile__input--editable"
                value={formData.favoriteFood}
                onChange={handleChange}
                placeholder="Ex: Ratatouille, Coq au vin..."
              />
            </div>
            
            <div className="profile__actions">
              <button
                type="submit"
                className="profile__button profile__button--primary"
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                type="button"
                className="profile__button profile__button--secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="profile__form">
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="displayName">Nom d'utilisateur</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                className="profile__input"
                value={formData.displayName}
                disabled={true}
                readOnly
              />
            </div>
            
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="profile__input"
                value={formData.email}
                disabled={true}
                readOnly
              />
              <small className="profile__help-text">L'email ne peut pas être modifié</small>
            </div>
            
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                className="profile__textarea"
                value={formData.bio}
                disabled={true}
                readOnly
                rows={4}
              />
            </div>
            
            <div className="profile__form-group">
              <label className="profile__label" htmlFor="favoriteFood">Plat préféré</label>
              <input
                type="text"
                id="favoriteFood"
                name="favoriteFood"
                className="profile__input"
                value={formData.favoriteFood}
                disabled={true}
                readOnly
              />
            </div>
            
            <div className="profile__actions">
              <button
                type="button"
                className="profile__button profile__button--primary"
                onClick={handleEdit}
              >
                Modifier
              </button>
              <button
                type="button"
                className="profile__button profile__button--danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Supprimer le compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
