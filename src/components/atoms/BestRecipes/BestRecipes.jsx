import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipeService } from "@services/ServiceProvider";
import "./BestRecipes.scss";
import RecipeCard from "@molecules/RecipeCard/RecipeCard";

export default function BestRecipes() {
  const navigate = useNavigate();
  const recipeService = useRecipeService();
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const recipesData = await recipeService.getAllRecipes();
        setRecipes(recipesData.slice(0, 20));
      } catch (error) {
        console.error("Erreur lors de la récupération des recettes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [recipeService]);

  const filteredRecipes = recipes.filter((recipe) =>
    `${recipe.title} ${recipe.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <section className="best-recipes">
      <div className="best-recipes__header">
        <h2 className="best-recipes__title">Les meilleures recettes</h2>
        <div className="best-recipes__search-container">
          <input
            type="text"
            className="best-recipes__search-input"
            placeholder="Rechercher une recette..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="best-recipes__grid">
        {loading ? (
          <div className="best-recipes__loading">
            <div className="best-recipes__spinner"></div>
            <p>Chargement des recettes...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              image={recipe.image || 'https://placehold.co/400'}
              difficulty={recipe.difficulty}
              cost={recipe.cost}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            />
          ))
        ) : (
          <p className="best-recipes__no-result">Aucune recette trouvée.</p>
        )}
      </div>
    </section>
  );
}
