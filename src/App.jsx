import Home from "@pages/Home";
import Login from "@pages/Login/Login";
import Register from "@pages/Register/Register";
import Profile from "@pages/Profile/Profile";
import MyRecipes from "@pages/MyRecipes/MyRecipes";
import Recipe from "@pages/Recipe/Recipe";
import { Routes, Route } from "react-router-dom";
import Header from "@components/atoms/Header/Header";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-recipes" element={<MyRecipes />} />
        <Route path="/recipe/:id" element={<Recipe />} />
      </Routes>
    </>
  );
}

export default App;
