import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import AddRecipe from "./pages/AddRecipe";
import Challenges from "./pages/Challenges";
import WorldMap from "./pages/WorldMap";
import WeeklyPlan from "./pages/WeeklyPlan";
import Register from "./pages/Register";
import Login from "./pages/Login";
import RecipeDetails from "./pages/RecipeDetails";
import "./App.css";
import logo from "./logo_new.png";
import { useState } from "react";

function App() {
const [searchTerm, setSearchTerm] = useState("");
const navigate = useNavigate();

const handleSearch = (e) => {
if (e.key === "Enter" && searchTerm.trim()) {
navigate("/recipes?search=${encodeURIComponent(searchTerm.trim())");
}
};

return (
<>
<div className="navbar">
<div className="navbar-left">
<img src={logo} alt="Logo" className="logo" />
</div>
<div className="navbar-center">
<Link to="/">🏠 Αρχική</Link>
<Link to="/recipes">📖 Συνταγές</Link>
<Link to="/add">➕ Προσθήκη</Link>
<Link to="/challenges">🏆 Challenges</Link>
<Link to="/map">🗺️ Χάρτης</Link>
<Link to="/weekly">📅 Πρόγραμμα</Link>
</div>
<div className="navbar-right">
<input
  type="text"
  placeholder="Αναζήτηση..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={(e) => {
  if (e.key === "Enter" && searchTerm.trim()) {
    navigate(`/recipes?search=${encodeURIComponent(searchTerm.trim())}`);
  }
}}
/>
<Link to="/login">Είσοδος</Link>
<Link to="/register">Εγγραφή</Link>
</div>
</div>

<Routes>
<Route path="/recipes/:id" element={<RecipeDetails />} />
<Route path="/" element={<Home />} />
<Route path="/recipes" element={<Recipes />} />
<Route path="/add" element={<AddRecipe />} />
<Route path="/challenges" element={<Challenges />} />
<Route path="/map" element={<WorldMap />} />
<Route path="/weekly" element={<WeeklyPlan />} />
<Route path="/register" element={<Register />} />
<Route path="/login" element={<Login />} />
</Routes>
</>
);
}

export default App;
