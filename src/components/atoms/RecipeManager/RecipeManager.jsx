import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useRecipeService } from "@services/ServiceProvider";
import RecipeCard from "@molecules/RecipeCard/RecipeCard";
import ConfirmDialog from "@atoms/ConfirmDialog/ConfirmDialog";
import "./RecipeManager.scss";

export default function RecipeManager() {
  const { currentUser } = useAuth();
  const recipeService = useRecipeService();
  const [recipes, setRecipes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    ingredients: [""],
    steps: [""],
    difficulty: "facile",
    cost: "€",
  });

  // Gérer les champs standards
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gérer les listes (ingrédients / étapes)
  const handleListChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  // Ajouter un champ dans une liste
  const addToList = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  // Réinitialiser
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      image: "",
      ingredients: [""],
      steps: [""],
      difficulty: "facile",
      cost: "€",
    });
    setEditing(null);
  };

  // Charger les recettes utilisateur
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!currentUser) return;
      try {
        const data = await recipeService.getUserRecipes(currentUser.uid);
        setRecipes(data);
      } catch (error) {
        console.error("Erreur lors du chargement des recettes:", error);
      }
    };

    fetchRecipes();
  }, [currentUser, recipeService]);

  // Ajouter ou modifier une recette
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const recipeData = {
      ...form,
      ownerId: currentUser.uid,
      ownerEmail: currentUser.email,
    };

    try {
      if (editing) {
        const updatedRecipe = await recipeService.updateRecipe(editing.id, recipeData);
        setRecipes((prev) =>
          prev.map((r) => r.id === editing.id ? updatedRecipe : r)
        );
      } else {
        const newRecipe = await recipeService.addRecipe(recipeData);
        setRecipes((prev) => [...prev, newRecipe]);
      }
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la recette:", error);
    }
  };

  // Ouvrir la modale de confirmation pour supprimer une recette
  const confirmDelete = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteConfirmOpen(true);
  };

  // Supprimer une recette après confirmation
  const handleDelete = async () => {
    if (!recipeToDelete) return;
    
    try {
      await recipeService.deleteRecipe(recipeToDelete.id);
      setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));
      setRecipeToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de la recette:", error);
    }
  };

  const handleEdit = (recipe) => {
    setForm({
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      difficulty: recipe.difficulty,
      cost: recipe.cost,
    });
    setEditing(recipe);
  };

  return (
    <div className="recipe-manager">
      <h2>{editing ? "Modifier une recette" : "Ajouter une nouvelle recette"}</h2>

      <form className="recipe-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <label htmlFor="title">Nom de la recette</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ex: Ratatouille provençale"
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="image">URL de l'image</label>
          <input
            id="image"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-section">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Décrivez votre recette en quelques phrases..."
            required
          />
        </div>

        <div className="form-section">
          <label>Ingrédients</label>
          {form.ingredients.map((ing, i) => (
            <div key={i} className="list-item">
              <input
                value={ing}
                onChange={(e) =>
                  handleListChange("ingredients", i, e.target.value)
                }
                placeholder={`Ingrédient ${i + 1} (ex: 200g de tomates)`}
              />
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addToList("ingredients")}
            className="add-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter un ingrédient
          </button>
        </div>

        <div className="form-section">
          <label>Étapes de préparation</label>
          {form.steps.map((step, i) => (
            <div key={i} className="list-item">
              <div className="step-number">{i + 1}</div>
              <textarea
                value={step}
                onChange={(e) => handleListChange("steps", i, e.target.value)}
                placeholder={`Décrivez l'étape ${i + 1}...`}
              />
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addToList("steps")}
            className="add-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter une étape
          </button>
        </div>

        <div className="form-row">
          <div className="form-section form-section--half">
            <label htmlFor="difficulty">Difficulté</label>
            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
            >
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>
          </div>

          <div className="form-section form-section--half">
            <label htmlFor="cost">Coût</label>
            <select 
              id="cost"
              name="cost" 
              value={form.cost} 
              onChange={handleChange}
            >
              <option value="€">€ - Économique</option>
              <option value="€€">€€ - Modéré</option>
              <option value="€€€">€€€ - Assez cher</option>
            </select>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="primary-button">
            {editing ? "Enregistrer les modifications" : "Ajouter cette recette"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="secondary-button">
              Annuler les modifications
            </button>
          )}
        </div>
      </form>

      <hr />

      <h2>Mes recettes ({recipes.length})</h2>
      
      <div className="recipe-list">
        {recipes.length === 0 && (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
            </svg>
            <p>Vous n'avez pas encore créé de recettes.</p>
            <p>Commencez par ajouter votre première recette ci-dessus !</p>
          </div>
        )}
        {recipes.map((r) => (
          <div key={r.id} className="recipe-item">
            <RecipeCard
              id={r.id}
              title={r.title}
              image={r.image || 'https://placehold.co/400'}
              description={r.description}
              difficulty={r.difficulty}
              cost={r.cost}
              onClick={() => handleEdit(r)}
              actions={
                <div className="recipe-actions">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(r);
                  }} className="edit-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Modifier
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(r);
                  }} className="delete-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Supprimer
                  </button>
                </div>
              }
            />
          </div>
        ))}
      </div>
      
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer cette recette"
        message={recipeToDelete ? `Êtes-vous sûr de vouloir supprimer la recette "${recipeToDelete.title}" ? Cette action est irréversible.` : "Êtes-vous sûr de vouloir supprimer cette recette ?"}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
