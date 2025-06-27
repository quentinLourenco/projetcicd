import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useReviewService } from "@services/ServiceProvider";
import "./RecipeReviews.scss";

export default function RecipeReviews({ recipeId }) {
    const { currentUser } = useAuth();
    const reviewService = useReviewService();
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Récupérer les commentaires
    useEffect(() => {
        if (!recipeId) return;

        const fetchReviews = async () => {
            try {
                setLoading(true);
                
                // Utiliser le service pour récupérer tous les commentaires
                const reviewsData = await reviewService.getReviewsForRecipe(recipeId);
                setReviews(reviewsData);
                
                // Vérifier si l'utilisateur actuel a déjà un commentaire
                if (currentUser) {
                    const userReviewData = await reviewService.getUserReviewForRecipe(recipeId, currentUser.uid);
                    setUserReview(userReviewData);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des commentaires:", err);
                setError("Une erreur est survenue lors du chargement des commentaires.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [recipeId, currentUser, reviewService]);

    // Gérer le changement de note
    const handleRatingChange = (rating) => {
        setNewReview(prev => ({ ...prev, rating }));
    };

    // Gérer le changement de commentaire
    const handleCommentChange = (e) => {
        setNewReview(prev => ({ ...prev, comment: e.target.value }));
    };

    // Soumettre un nouveau commentaire
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            setError("Vous devez être connecté pour laisser un commentaire.");
            return;
        }

        if (newReview.rating === 0) {
            setError("Veuillez attribuer une note à cette recette.");
            return;
        }

        try {
            setLoading(true);
            
            if (isEditing && userReview) {
                // Mettre à jour un commentaire existant via le service
                const updatedReview = await reviewService.updateReview(userReview.id, {
                    rating: newReview.rating,
                    comment: newReview.comment
                });
                
                // Préserver les informations de l'auteur et la date de création
                const completeUpdatedReview = {
                    ...updatedReview,
                    userName: userReview.userName,
                    userPhotoURL: userReview.userPhotoURL,
                    createdAt: userReview.createdAt,
                    userId: userReview.userId
                };
                
                setUserReview(completeUpdatedReview);
                setReviews(reviews.map(review => 
                    review.id === userReview.id ? completeUpdatedReview : review
                ));
                setIsEditing(false);
            } else {
                // Ajouter un nouveau commentaire via le service
                const newReviewData = {
                    recipeId,
                    userId: currentUser.uid,
                    userName: currentUser.displayName || "Utilisateur",
                    userPhotoURL: currentUser.photoURL || "",
                    rating: newReview.rating,
                    comment: newReview.comment
                };

                const addedReview = await reviewService.addReview(newReviewData);
                
                setUserReview(addedReview);
                setReviews([addedReview, ...reviews]);
            }
            
            // Réinitialiser le formulaire
            setNewReview({ rating: 0, comment: "" });
            setError(null);
        } catch (err) {
            console.error("Erreur lors de l'ajout/modification du commentaire:", err);
            setError("Une erreur est survenue lors de l'enregistrement de votre commentaire.");
        } finally {
            setLoading(false);
        }
    };

    // Modifier un commentaire existant
    const handleEditReview = () => {
        if (userReview) {
            setNewReview({
                rating: userReview.rating,
                comment: userReview.comment
            });
            setIsEditing(true);
        }
    };

    // Annuler la modification
    const handleCancelEdit = () => {
        setNewReview({ rating: 0, comment: "" });
        setIsEditing(false);
        setError(null);
    };

    // Supprimer un commentaire
    const handleDeleteReview = async () => {
        if (!userReview) return;
        
        if (!confirm("Êtes-vous sûr de vouloir supprimer votre commentaire ?")) {
            return;
        }

        try {
            setLoading(true);
            // Utiliser le service pour supprimer le commentaire
            await reviewService.deleteReview(userReview.id);
            
            // Mettre à jour l'état local
            setReviews(reviews.filter(review => review.id !== userReview.id));
            setUserReview(null);
            setNewReview({ rating: 0, comment: "" });
            setIsEditing(false);
        } catch (err) {
            console.error("Erreur lors de la suppression du commentaire:", err);
            setError("Une erreur est survenue lors de la suppression de votre commentaire.");
        } finally {
            setLoading(false);
        }
    };

    // Composant pour afficher les étoiles
    const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''} ${!readOnly ? 'interactive' : ''}`}
                        onClick={() => !readOnly && onRatingChange(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // Formater la date
    const formatDate = (date) => {
        if (!date) return "";
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="recipe-reviews">
            <h2>Commentaires</h2>
            
            {error && <div className="recipe-reviews__error">{error}</div>}
            
            {currentUser ? (
                (userReview && !isEditing) ? (
                    <div className="recipe-reviews__user-review">
                        <h3>Votre avis</h3>
                        <div className="review-card">
                            <div className="review-card__header">
                                <div className="review-card__user">
                                    <span className="review-card__username">{userReview.userName}</span>
                                    <span className="review-card__date">{formatDate(userReview.createdAt)}</span>
                                </div>
                                <StarRating rating={userReview.rating} readOnly={true} onRatingChange={() => {}} />
                            </div>
                            <div className="review-card__content">{userReview.comment}</div>
                            <div className="review-card__actions">
                                <button 
                                    className="review-card__edit-btn" 
                                    onClick={handleEditReview}
                                    disabled={loading}
                                >
                                    Modifier
                                </button>
                                <button 
                                    className="review-card__delete-btn" 
                                    onClick={handleDeleteReview}
                                    disabled={loading}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="recipe-reviews__form">
                        <h3>{isEditing ? "Modifier votre avis" : "Ajouter un avis"}</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                                <label>Votre note :</label>
                                <StarRating 
                                    rating={newReview.rating} 
                                    onRatingChange={handleRatingChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="comment">Votre commentaire :</label>
                                <textarea
                                    id="comment"
                                    value={newReview.comment}
                                    onChange={handleCommentChange}
                                    placeholder="Partagez votre expérience avec cette recette..."
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                {isEditing && (
                                    <button 
                                        type="button" 
                                        className="cancel-btn" 
                                        onClick={handleCancelEdit}
                                        disabled={loading}
                                    >
                                        Annuler
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    className="submit-btn" 
                                    disabled={loading}
                                >
                                    {loading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Publier"}
                                </button>
                            </div>
                        </form>
                    </div>
                )
            ) : (
                <div className="recipe-reviews__login-prompt">
                    <p>Connectez-vous pour laisser un commentaire.</p>
                </div>
            )}
            
            <div className="recipe-reviews__comments">
                <h3>Tous les avis ({reviews.filter(review => !currentUser || review.userId !== currentUser.uid).length})</h3>
                
                {loading && reviews.length === 0 ? (
                    <div className="recipe-reviews__loading">Chargement des commentaires...</div>
                ) : reviews.filter(review => !currentUser || review.userId !== currentUser.uid).length > 0 ? (
                    <div className="review-list">
                        {reviews
                            .filter(review => !currentUser || review.userId !== currentUser.uid)
                            .map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-card__header">
                                        <div className="review-card__user">
                                            <span className="review-card__username">{review.userName}</span>
                                            <span className="review-card__date">{formatDate(review.createdAt)}</span>
                                        </div>
                                        <StarRating rating={review.rating} readOnly={true} onRatingChange={() => {}} />
                                    </div>
                                    <div className="review-card__content">{review.comment}</div>
                                </div>
                            ))
                        }
                    </div>
                ) : (
                    <div className="recipe-reviews__empty">
                        <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                    </div>
                )}
            </div>
        </div>
    );
}
