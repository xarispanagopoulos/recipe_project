import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Recipes() {
const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const search = searchParams.get("search") || "";

const [recipes, setRecipes] = useState([]);
const [unitSystem, setUnitSystem] = useState("metric");
const [categories, setCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState("");
const [filtered, setFiltered] = useState([]);

useEffect(() => {
fetch("http://localhost:5000/recipes")
.then((res) => res.json())
.then((data) => {
setRecipes(data);
const uniqueCategories = [...new Set(data.map(r => r.category).filter(Boolean))];
setCategories(uniqueCategories);
});
}, []);

useEffect(() => {
const results = recipes.filter((r) => {
const inCategory = selectedCategory ? r.category === selectedCategory : true;
const inSearch =
r.title.toLowerCase().includes(search.toLowerCase()) ||
JSON.parse(r.ingredients || "[]").some(i => i.name.toLowerCase().includes(search.toLowerCase()));
return inCategory && inSearch;
});
setFiltered(results);
}, [search, selectedCategory, recipes]);

const handleDelete = (id) => {
if (!window.confirm("Είσαι σίγουρος ότι θέλεις να διαγράψεις τη συνταγή;")) return;

fetch(`http://localhost:5000/recipes/${id}`, {
method: "DELETE",
})
.then((res) => {
if (res.ok) {
setRecipes((prev) => prev.filter((r) => r.id !== id));
} else {
alert("Αποτυχία διαγραφής");
}
})
.catch(() => alert("Σφάλμα σύνδεσης με τον server"));
};

return (
<div style={{ padding: "10px 20px" }}>
{/* Επιλογή κατηγορίας */}
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
{["Κυρίως Πιάτο", "Γλυκό", "Ορεκτικό", "Σαλάτα", "Ρόφημα"].map((cat) => (
<button
key={cat}
onClick={() => setSelectedCategory(cat)}
style={{
padding: "6px 12px",
backgroundColor: selectedCategory === cat ? "#f0f0f0" : "#fff",
border: selectedCategory === cat ? "2px solid black" : "1px solid #ccc",
borderRadius: "20px",
cursor: "pointer",
fontWeight: "bold",
color: "black"
}}
>
{cat}
</button>
))}
{selectedCategory && (
<button
onClick={() => setSelectedCategory("")}
style={{
padding: "6px 12px",
borderRadius: "20px",
background: "#eee",
border: "1px solid #ccc",
color: "black",
fontWeight: "bold"
}}
>
✖ Όλες
</button>
)}
</div>

{/* Συνταγές */}
{filtered.length === 0 ? (
<p>Δεν υπάρχουν συνταγές.</p>
) : (
<div style={{
display: "grid",
gridTemplateColumns: "repeat(3, 1fr)",
gap: "20px"
}}>
{filtered.map((recipe) => (
<div key={recipe.id} className="recipe-card" style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px" }}>
{recipe.image && (
<img
src={`http://localhost:5000${recipe.image}`}
alt={recipe.title}
style={{
width: "100%",
height: "220px",
objectFit: "cover",
borderRadius: "8px"
}}
/>
)}

<div className="recipe-title">
{recipe.title.length > 35 ? recipe.title.slice(0, 32) + "..." : recipe.title}
</div>

<div className="recipe-meta">
<span>⏱️ {recipe.cook_time}'</span><br />
<span>💪 {recipe.difficulty}</span><br />
<span>🍽️ {recipe.servings}</span>
</div>

<div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
<Link to={`/recipes/${recipe.id}`}>
<button style={{ padding: "4px 8px" }}>Προβολή</button>
</Link>
<button
onClick={() => handleDelete(recipe.id)}
style={{
padding: "4px 8px",
backgroundColor: "red",
color: "white",
border: "none",
borderRadius: "4px",
cursor: "pointer"
}}
>
Διαγραφή
</button>
</div>
</div>
))}
</div>
)}
</div>
);
}

export default Recipes;
