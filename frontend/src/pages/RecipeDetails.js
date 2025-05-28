import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function RecipeDetails() {
const { id } = useParams();
const [recipe, setRecipe] = useState(null);
const [servingCount, setServingCount] = useState(1);
const [unitSystem, setUnitSystem] = useState("metric");
const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState("");
const [likes, setLikes] = useState(0);
const [rating, setRating] = useState(0);
const [ratingCount, setRatingCount] = useState(0);
const [userStars, setUserStars] = useState(0);

// ΝΕΑ STATES για dropdowns
const [selectedDay, setSelectedDay] = useState("Δευτέρα");
const [mealType, setMealType] = useState("Μεσημεριανό");

useEffect(() => {
fetch(`http://localhost:5000/recipes/${id}`)
.then(res => res.json())
.then(data => {
setRecipe(data);
setServingCount(data.servings || 1);
});

fetch(`http://localhost:5000/recipes/${id}/comments`)
.then(res => res.json())
.then(setComments);

fetch(`http://localhost:5000/recipes/${id}/likes`)
.then(res => res.json())
.then(data => setLikes(data.total));

fetch(`http://localhost:5000/recipes/${id}/rating`)
.then(res => res.json())
.then(data => {
setRating(data.average || 0);
setRatingCount(data.count || 0);
});
}, [id]);

const handleCommentSubmit = () => {
const username = localStorage.getItem("username") || "Ανώνυμος";
fetch(`http://localhost:5000/recipes/${id}/comments`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, content: newComment })
}).then(() => {
setComments(prev => [{ username, content: newComment }, ...prev]);
setNewComment("");
});
};

const handleLike = () => {
const username = localStorage.getItem("username") || "guest";
fetch(`http://localhost:5000/recipes/${id}/like`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username })
}).then(() => setLikes(prev => prev + 1));
};

const submitRating = (stars) => {
const username = localStorage.getItem("username") || "guest";
fetch(`http://localhost:5000/recipes/${id}/rate`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, stars })
}).then(() => setUserStars(stars));
};

const addToPlan = () => {
const user = localStorage.getItem("username") || "guest";
fetch("http://localhost:5000/meal-plan", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
user,
recipe_id: recipe.id,
day: selectedDay,
meal_type: mealType
})
})
.then(res => res.ok ? alert("Προστέθηκε στο εβδομαδιαίο πλάνο!") : alert("Σφάλμα"))
.catch(() => alert("Σφάλμα"));
};

if (!recipe) return <p>Φόρτωση...</p>;

const ingredients = JSON.parse(recipe.ingredients || "[]");
const steps = JSON.parse(recipe.steps_json || "[]");

const convertUnit = (quantity, unit) => {
if (unitSystem === "imperial") {
switch (unit) {
case "g": return { qty: (quantity / 28.35).toFixed(2), unit: "oz" };
case "ml": return { qty: (quantity / 240).toFixed(2), unit: "cups" };
default: return { qty: quantity, unit };
}
}
return { qty: quantity, unit };
};

return (
<div style={{ maxWidth: "900px", margin: "30px auto" }}>
<h2>{recipe.title}</h2>

{recipe.image && (
<img src={`http://localhost:5000${recipe.image}`} alt={recipe.title} style={{ width: "100%", borderRadius: "8px", marginBottom: "20px" }} />
)}

<div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "16px", marginBottom: "10px" }}>
<span>⏱️ {recipe.cook_time}'</span>
<span>💪 {recipe.difficulty}</span>
<span>🍽️ {recipe.servings}</span>
<span>❤️ {likes}</span>
<button onClick={handleLike}>Like</button>
</div>

<div>
<strong>Αξιολόγηση:</strong> {"⭐".repeat(Math.round(rating))} ({ratingCount} ψήφοι)
</div>

<div style={{ marginBottom: "20px" }}>
{[1, 2, 3, 4, 5].map(star => (
<span
key={star}
style={{ fontSize: "24px", cursor: "pointer", color: star <= userStars ? "gold" : "gray" }}
onClick={() => submitRating(star)}
>★</span>
))}
</div>

<p>{recipe.description}</p>

{/* Πλάνο */}
<div style={{ marginBottom: "20px" }}>
<label>Προσθήκη στο εβδομαδιαίο πλάνο:</label>
<select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
<option>Δευτέρα</option><option>Τρίτη</option><option>Τετάρτη</option><option>Πέμπτη</option><option>Παρασκευή</option><option>Σάββατο</option><option>Κυριακή</option>
</select>
<select value={mealType} onChange={e => setMealType(e.target.value)} style={{ marginLeft: "10px" }}>
<option>Πρωινό</option><option>Μεσημεριανό</option><option>Βραδινό</option>
</select>
<button onClick={addToPlan} style={{ marginLeft: "10px" }}>Προσθήκη στο εβδομαδιαίο πλάνο</button>
</div>

<div style={{ display: "flex", gap: "40px" }}>
<div style={{ flex: 1 }}>
<h4>Υλικά</h4>
<input type="number" min="1" value={servingCount} onChange={e => setServingCount(+e.target.value || 1)} />
<select value={unitSystem} onChange={e => setUnitSystem(e.target.value)}>
<option value="metric">g/ml</option>
<option value="imperial">oz/cups</option>
</select>
<ul>
{ingredients.map((item, i) => {
const quantity = (item.quantity * servingCount / recipe.servings).toFixed(2);
const converted = convertUnit(quantity, item.unit);
return (
<li key={i}>{converted.qty} {converted.unit} {item.name}</li>
);
})}
</ul>
</div>

<div style={{ flex: 2 }}>
<h4>Βήματα</h4>
<ol>{steps.map((step, i) => <li key={i}>{step}</li>)}</ol>

{recipe.tips && <p><strong>💡 Tip:</strong> {recipe.tips}</p>}

<h4>Σχόλια</h4>
<textarea value={newComment} onChange={e => setNewComment(e.target.value)} />
<button onClick={handleCommentSubmit}>Αποστολή</button>
<ul>
{comments.map((c, i) => (
<li key={i}><strong>{c.username}:</strong> {c.content}</li>
))}
</ul>
</div>
</div>
</div>
);
}

export default RecipeDetails;