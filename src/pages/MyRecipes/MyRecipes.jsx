import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";
import RecipeManager from "@components/atoms/RecipeManager/RecipeManager";
import "./MyRecipes.scss";

export default function MyRecipes() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!currentUser) {
    return (
      <div className="my-recipes">
        <div className="my-recipes__container">
          <h1 className="my-recipes__title">Mes recettes</h1>
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <button 
            className="my-recipes__button"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-recipes">
      <div className="my-recipes__container">
        <h1 className="my-recipes__title">Mes recettes</h1>
        <p className="my-recipes__description">
          Gérez vos recettes personnelles, ajoutez-en de nouvelles ou modifiez celles existantes.
        </p>
        
        <RecipeManager />
      </div>
    </div>
  );
}
