import "./Header.scss";
import { NavLink } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useState, useRef, useEffect } from "react";
import ConfirmDialog from "@components/atoms/ConfirmDialog/ConfirmDialog";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const popoverRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverRef]);

  return (
    <>
      <header className="header" role="header">
        <div className="header-left">
          <NavLink to="/" className="logo">
            Marmitouille
          </NavLink>
        </div>
        <nav className="header-nav">
          {!currentUser ? (
            <>
              <NavLink to="/login" className="login_link">
                Connexion
              </NavLink>
              <NavLink to="/register" className="register_link">
                Inscription
              </NavLink>
            </>
          ) : (
            <div className="user-menu" ref={popoverRef}>
              <button 
                className="user-menu__button" 
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                aria-expanded={isPopoverOpen}
                aria-haspopup="true"
              >
                <div className="user-menu__avatar">
                  {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="user-menu__name">{currentUser.displayName}</span>
              </button>
              {isPopoverOpen && (
                <div className="user-menu__popover">
                  <div className="user-menu__popover-header">
                    <div className="user-menu__avatar user-menu__avatar--large">
                      {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="user-menu__info">
                      <div className="user-menu__name--large">{currentUser.displayName}</div>
                      <div className="user-menu__email">{currentUser.email}</div>
                    </div>
                  </div>
                  <div className="user-menu__divider"></div>
                  <NavLink to="/profile" className="user-menu__item" onClick={() => setIsPopoverOpen(false)}>
                    Mon profil
                  </NavLink>
                  <NavLink to="/my-recipes" className="user-menu__item" onClick={() => setIsPopoverOpen(false)}>
                    Mes recettes
                  </NavLink>
                  <button 
                    className="user-menu__item user-menu__logout" 
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setIsPopoverOpen(false);
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>
      
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Déconnexion"
        cancelText="Annuler"
      />
    </>
  );
}
