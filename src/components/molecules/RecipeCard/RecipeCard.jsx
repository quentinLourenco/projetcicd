import "./RecipeCard.scss";
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useReviewService } from "@services/ServiceProvider";

export default function RecipeCard({ title, image, description, onClick, difficulty, cost, actions, id }) {
  const reviewService = useReviewService();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
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
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`recipe-card__star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    
    return (
      <div className="recipe-card__stars">
        {stars}
        <span className="recipe-card__rating-count">({reviewCount})</span>
      </div>
    );
  };
  
  const handleImageError = () => {
    setImageError(true);
  };

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
      className: `recipe-card__difficulty recipe-card__difficulty--${diffLower}`,
      label: diff
    };
  };

  const difficultyInfo = getDifficultyInfo(difficulty);
  
  return (
    <button 
      className={`recipe-card ${isHovered ? 'recipe-card--hovered' : ''}`} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={title}
      type="button"
    >
      <div className="recipe-card__image-container">
        <img 
          src={imageError ? 'https://via.placeholder.com/300x200?text=Image+non+disponible' : image} 
          alt={title} 
          className="recipe-card__image" 
          onError={handleImageError}
        />
        {cost && <div className="recipe-card__cost">{cost}</div>}
      </div>
      
      <div className="recipe-card__content">
        <h3 className="recipe-card__title">{title}</h3>
        
        <div className="recipe-card__meta">
          {renderStars(averageRating)}
          
          {difficultyInfo.emoji && (
            <div className={difficultyInfo.className}>
              <span className="recipe-card__difficulty-emoji">{difficultyInfo.emoji}</span>
              <span className="recipe-card__difficulty-label">{difficultyInfo.label}</span>
            </div>
          )}
        </div>
        
        <p className="recipe-card__description">{description}</p>
        
        <div className="recipe-card__footer">
          {!actions && (
            <div className="recipe-card__view">
              <span>Voir la recette</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </div>
          )}
        </div>
        
        {actions && (
          <div className="recipe-card__actions">
            {actions}
          </div>
        )}
      </div>
    </button>
  );
}

RecipeCard.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  difficulty: PropTypes.string.isRequired,
  cost: PropTypes.string.isRequired,
  actions: PropTypes.node,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};
