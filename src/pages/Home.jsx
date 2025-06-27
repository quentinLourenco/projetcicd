import Hero from "@components/atoms/Hero/Hero";
import BestRecipes from "@components/atoms/BestRecipes/BestRecipes";

export default function Home() {
  return (
    <>
    <div className="container">
      <Hero 
        title="Bienvenue sur Marmitouille" 
        subtitle="Découvrez des recettes délicieuses et faciles à préparer" 
        backgroundImage="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
      />

      <BestRecipes />
    </div>
    </>
  );
}
