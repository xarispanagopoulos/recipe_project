import { useState } from "react";

function AddRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [servings, setServings] = useState("");
  const [tips, setTips] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [ingredients, setIngredients] = useState([
    { quantity: "", unit: "g", name: "" },
  ]);
  const [steps, setSteps] = useState([""]);

  const addIngredient = () =>
    setIngredients([...ingredients, { quantity: "", unit: "g", name: "" }]);
  const removeIngredient = (index) =>
    setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (index) =>
    setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedIngredients = ingredients.filter(
      (i) => i.name.trim() !== "" && i.quantity !== ""
    );
    const cleanedSteps = steps.filter((s) => s.trim() !== "");

    if (!title || cleanedIngredients.length === 0 || cleanedSteps.length === 0) {
      alert("⚠️ Συμπλήρωσε τουλάχιστον τίτλο, υλικά και βήματα.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("ingredients", JSON.stringify(cleanedIngredients));
    formData.append("steps_json", JSON.stringify(cleanedSteps));
    formData.append("category", category);
    formData.append("cook_time", cookTime);
    formData.append("difficulty", difficulty);
    formData.append("servings", servings);
    formData.append("tips", tips);
    formData.append("author", localStorage.getItem("username") || "Ανώνυμος");
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch("http://localhost:5000/recipes", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ Συνταγή καταχωρήθηκε!");
        setTitle(""); setDescription(""); setCategory("");
        setCookTime(""); setDifficulty(""); setServings("");
        setTips(""); setImageFile(null);
        setIngredients([{ quantity: "", unit: "g", name: "" }]);
        setSteps([""]);
      } else {
        alert("❌ Σφάλμα κατά την αποθήκευση.");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div>
      <h2>➕ Προσθήκη Συνταγής</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input placeholder="Τίτλος" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Περιγραφή" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">-- Επιλέξτε κατηγορία --</option>
          <option value="Κυρίως Πιάτο">Κυρίως Πιάτο</option>
          <option value="Γλυκό">Γλυκό</option>
          <option value="Ορεκτικό">Ορεκτικό</option>
          <option value="Σαλάτα">Σαλάτα</option>
          <option value="Ρόφημα">Ρόφημα</option>
        </select>

        <input type="number" min="1" placeholder="Χρόνος (λεπτά)" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">Δυσκολία</option>
          <option value="Εύκολη">Εύκολη</option>
          <option value="Μέτρια">Μέτρια</option>
          <option value="Δύσκολη">Δύσκολη</option>
        </select>
        <input type="number" min="1" placeholder="Μερίδες" value={servings} onChange={(e) => setServings(e.target.value)} />

        <h4>Υλικά</h4>
        {ingredients.map((item, index) => (
          <div key={index} className="ingredient-row">
            <input type="number" min="1" placeholder="Ποσότητα" value={item.quantity} onChange={(e) => updateIngredient(index, "quantity", e.target.value)} />
            <select value={item.unit} onChange={(e) => updateIngredient(index, "unit", e.target.value)}>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="pcs">τεμ</option>
              <option value="cup">φλ.</option>
              <option value="oz">oz</option>
              <option value="tbsp">κ.σ.</option>
              <option value="tsp">κ.γ.</option>
            </select>
            <input type="text" placeholder="Υλικό" value={item.name} onChange={(e) => updateIngredient(index, "name", e.target.value)} />
            <button type="button" onClick={() => removeIngredient(index)}>❌</button>
          </div>
        ))}
        <button type="button" onClick={addIngredient}>+ Προσθήκη Υλικού</button>

        <h4>Βήματα Εκτέλεσης</h4>
        {steps.map((step, index) => (
          <div key={index}>
            <textarea placeholder={`Βήμα ${index + 1}`} value={step} onChange={(e) => updateStep(index, e.target.value)} />
            <button type="button" onClick={() => removeStep(index)}>❌</button>
          </div>
        ))}
        <button type="button" onClick={addStep}>+ Προσθήκη Βήματος</button>

        <textarea placeholder="💡 Tip (προαιρετικό)" value={tips} onChange={(e) => setTips(e.target.value)} />

        <button type="submit">Αποθήκευση</button>
      </form>
    </div>
  );
}

export default AddRecipe;
