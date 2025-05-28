import "./home.css";

const topRecipes = [
  {
  },
  {
  },
  {
  },
  {
  },
  {
  },
  {
  },
  {
  },
  {
  },
];

function Home() {
  return (
    <div className="trending-section">
      <h2>🔥 Δημοφιλείς Συνταγές του Μήνα</h2>
      <div className="grid">
        {topRecipes.map((recipe, index) => (
          <div className="recipe-box" key={index}>
            <img src={recipe.image} alt={recipe.title} />
            <h3>{recipe.title}</h3>
            <p>👤 {recipe.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
