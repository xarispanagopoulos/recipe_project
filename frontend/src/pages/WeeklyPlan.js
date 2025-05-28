import { useEffect, useState } from "react";

function WeeklyPlan() {
  const [plan, setPlan] = useState({});
  const user = localStorage.getItem("username") || "guest";

  useEffect(() => {
    fetch("http://localhost:5000/meal-plan/${user}")
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        data.forEach(item => {
          if (!grouped[item.day]) grouped[item.day] = {};
          grouped[item.day][item.meal_type] = item;
        });
        setPlan(grouped);
      })
      .catch(err => console.error("Error fetching meal plan:", err));
  }, [user]);

  const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
  const meals = ["Πρωινό", "Μεσημεριανό", "Βραδινό"];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Εβδομαδιαίο Πλάνο Γευμάτων</h2>
      <p>Εδώ θα εμφανίζονται οι συνταγές που έχεις επιλέξει για την εβδομάδα σου.</p>

      {days.map(day => (
        <div key={day}>
          <h4 style={{ marginBottom: "5px", marginTop: "15px" }}>{day}</h4>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {meals.map(meal => {
              const recipe = plan[day]?.[meal];
              return (
                <li key={meal}>
                  <strong>{meal}:</strong> {recipe ? recipe.title : "-"}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default WeeklyPlan;