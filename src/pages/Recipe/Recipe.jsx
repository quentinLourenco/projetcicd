import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useRecipeService, useReviewService } from "@services/ServiceProvider";
import RecipeReviews from "@components/molecules/RecipeReviews/RecipeReviews";
import "./Recipe.scss";

export default function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipeService = useRecipeService();
  const reviewService = useReviewService();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        try {
          const recipeData = await recipeService.getRecipeById(id);
          setRecipe(recipeData);
        } catch (err) {
          if (err.message === "Recette non trouvée") {
            setError("Cette recette n'existe pas.");
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la recette:", err);
        setError("Une erreur est survenue lors du chargement de la recette.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, recipeService]);
  
  // Récupérer les notes pour calculer la moyenne
  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;
      
      try {
        const { averageRating: avgRating, reviewCount: count } = await reviewService.getAverageRatingForRecipe(id);
        setAverageRating(avgRating);
        setReviewCount(count);
      } catch (err) {
        console.error("Erreur lors de la récupération des notes:", err);
      }
    };
    
    fetchRatings();
  }, [id, reviewService]);

  const getDifficultyInfo = (diff) => {
    if (!diff) return { emoji: '', className: '' };
    
    const diffLower = diff.toLowerCase();
    let emoji = '';
    
    switch (diffLower) {
      case 'facile':
        emoji = '🟢';
        break;
      case 'moyen':
        emoji = '🟠';
        break;
      case 'difficile':
        emoji = '🔴';
        break;
      default:
        emoji = '';
    }
    
    return { 
      emoji, 
      className: `recipe-page__difficulty recipe-page__difficulty--${diffLower}`,
      label: diff 
    };
  };

  if (loading) {
    return (
      <div className="recipe-page">
        <div className="recipe-page__loading">
          <div className="recipe-page__spinner"></div>
          <p>Chargement de la recette...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-page">
        <div className="recipe-page__error">
          <h2>Oups !</h2>
          <p>{error}</p>
          <button className="recipe-page__back-button" onClick={() => navigate(-1)}>
            Retourner aux recettes
          </button>
        </div>
      </div>
    );
  }



  if (!recipe) return null;

  const difficultyInfo = getDifficultyInfo(recipe.difficulty);
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`recipe-page__star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="recipe-page">
      <div className="container">
        <button className="recipe-page__back-button" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Retour
        </button>

        <div className="recipe-page__header">
          <div className="recipe-page__image-container">
            <img 
              src={recipe.image || 'https://placehold.co/800x600?text=Pas+d\'image'} 
              alt={recipe.title} 
              className="recipe-page__image" 
            />
          </div>
          
          <div className="recipe-page__info">
            <h1 className="recipe-page__title">{recipe.title}</h1>
            
            <div className="recipe-page__meta">
              <div className="recipe-page__rating">
                <div className="recipe-page__stars">
                  {renderStars(averageRating)}
                </div>
                <div className="recipe-page__rating-info">
                  <span className="recipe-page__rating-value">{averageRating}/5</span>
                  <span className="recipe-page__rating-count">({reviewCount} avis)</span>
                </div>
              </div>
              
              {recipe.difficulty && (
                <div className={difficultyInfo.className}>
                  <span className="recipe-page__difficulty-emoji">{difficultyInfo.emoji}</span>
                  <span className="recipe-page__difficulty-label">{difficultyInfo.label}</span>
                </div>
              )}
              
              {recipe.cost && (
                <div className="recipe-page__cost">
                  <span className="recipe-page__cost-label">Coût:</span>
                  <span className="recipe-page__cost-value">{recipe.cost}</span>
                </div>
              )}
            </div>
            
            <p className="recipe-page__description">{recipe.description}</p>
          </div>
        </div>

        <div className="recipe-page__content">
          <div className="recipe-page__ingredients">
            <h2 className="recipe-page__section-title">Ingrédients</h2>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="recipe-page__ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="recipe-page__ingredient-item">{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p className="recipe-page__empty">Aucun ingrédient spécifié.</p>
            )}
          </div>

          <div className="recipe-page__steps">
            <h2 className="recipe-page__section-title">Préparation</h2>
            {recipe.steps && recipe.steps.length > 0 ? (
              <ol className="recipe-page__steps-list">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="recipe-page__step-item">
                    <div className="recipe-page__step-number">{index + 1}</div>
                    <div className="recipe-page__step-content">{step}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="recipe-page__empty">Aucune étape spécifiée.</p>
            )}
          </div>
        </div>
        <RecipeReviews recipeId={id} />
      </div>
    </div>
  );
}