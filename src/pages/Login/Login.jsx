import { useAuth } from "@context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "@styles/shared/auth.scss";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    const result = await login(email.value, password.value);
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="auth-container login-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2 className="auth-card__title font-script">Connexion</h2>
          <p className="auth-card__subtitle">Accédez à vos recettes préférées</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <label htmlFor="email" className="auth-form__label">Email</label>
            <div className="auth-form__input-wrapper">
              <svg className="auth-form__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="auth-form__input" 
                placeholder="Votre adresse email" 
                required 
              />
            </div>
          </div>
          
          <div className="auth-form__group">
            <label htmlFor="password" className="auth-form__label">Mot de passe</label>
            <div className="auth-form__input-wrapper">
              <svg className="auth-form__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                type="password" 
                id="password" 
                name="password" 
                className="auth-form__input" 
                placeholder="Votre mot de passe" 
                required 
              />
            </div>
          </div>
          
          <div className="auth-form__options">
            <a href="#" className="auth-form__forgot-link">Mot de passe oublié ?</a>
          </div>
          
          <button type="submit" className="auth-form__submit">Se connecter</button>
          
          <div className="auth-form__separator">
            <span>ou</span>
          </div>
          
          <div className="auth-form__social">
            <button type="button" className="auth-form__social-btn auth-form__social-btn--google">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Continuer avec Google
            </button>
          </div>
        </form>
        
        <div className="auth-card__footer">
          <p>Pas encore de compte ? <Link to="/register" className="auth-card__link">S'inscrire</Link></p>
        </div>
      </div>
      
      <div className="auth-decoration">
        <div className="auth-decoration__image"></div>
      </div>
    </div>
  );
}
