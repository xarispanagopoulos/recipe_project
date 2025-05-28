const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Multer for image uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, "uploads/"),
filename: (req, file, cb) =>
cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ---------------------- Recipes ------------------------

app.get("/recipes", (req, res) => {
db.query("SELECT * FROM recipes", (err, results) => {
if (err) {
console.error("Error fetching recipes:", err);
return res.status(500).send("Error fetching recipes");
}
res.json(results);
});
});

app.get("/recipes/:id", (req, res) => {
const { id } = req.params;
db.query("SELECT * FROM recipes WHERE id = ?", [id], (err, results) => {
if (err) return res.status(500).send("Error fetching recipe");
if (results.length === 0) return res.status(404).send("Not found");
res.json(results[0]);
});
});

app.post("/recipes", upload.single("image"), (req, res) => {
const {
title,
description,
ingredients,
steps_json,
author,
category,
cook_time,
difficulty,
servings,
tips,
} = req.body;
const image = req.file ? `/uploads/${req.file.filename}` : null;

if (!title || !ingredients || !steps_json || !cook_time || !difficulty || !servings) {
return res.status(400).send("Missing required fields");
}

let parsedSteps;
try {
parsedSteps = JSON.parse(steps_json);
if (!Array.isArray(parsedSteps)) throw new Error();
} catch {
return res.status(400).send("Invalid steps JSON");
}

const sql = `
INSERT INTO recipes
(title, description, ingredients, steps_json, image, author, category, cook_time, difficulty, servings, tips)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

db.query(sql, [
title,
description,
ingredients,
steps_json,
image,
author,
category,
cook_time,
difficulty,
servings,
tips,
], (err) => {
if (err) return res.status(500).send("Error inserting recipe");
res.status(201).send("Recipe added successfully");
});
});

app.delete("/recipes/:id", (req, res) => {
const { id } = req.params;

// Διαγραφή εξαρτημένων εγγραφών πρώτα
const deleteDependencies = [
"DELETE FROM comments WHERE recipe_id = ?",
"DELETE FROM likes WHERE recipe_id = ?",
"DELETE FROM ratings WHERE recipe_id = ?",
"DELETE FROM meal_plan WHERE recipe_id = ?"
];

// Εκτελούμε κάθε διαγραφή σειριακά
const deleteNext = (index = 0) => {
if (index >= deleteDependencies.length) {
// Τέλος, διαγράφουμε τη συνταγή
return db.query("DELETE FROM recipes WHERE id = ?", [id], (err) => {
if (err) return res.status(500).send("Error deleting recipe");
res.send("Recipe deleted");
});
}

db.query(deleteDependencies[index], [id], (err) => {
if (err) return res.status(500).send("Error deleting related data");
deleteNext(index + 1);
});
};

deleteNext();
});

// ---------------------- Auth ------------------------

app.post("/register", async (req, res) => {
const { username, email, password } = req.body;
const hashedPassword = await bcrypt.hash(password, 10);
db.query(
"INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
[username, email, hashedPassword],
(err) => {
if (err) return res.status(500).send("Σφάλμα κατά την εγγραφή");
res.send("Εγγραφή επιτυχής");
}
);
});

app.post("/login", (req, res) => {
const { email, password } = req.body;
db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
if (err || results.length === 0) return res.status(401).send("Μη έγκυρα στοιχεία");
const user = results[0];
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(401).send("Λάθος κωδικός");

const token = jwt.sign({ id: user.id, username: user.username }, "secret123", {
expiresIn: "2h",
});
res.json({ token, username: user.username });
});
});

// ---------------------- Comments ------------------------

app.post("/recipes/:id/comments", (req, res) => {
const { id } = req.params;
const { username, content } = req.body;
db.query(
"INSERT INTO comments (recipe_id, username, content) VALUES (?, ?, ?)",
[id, username, content],
(err) => {
if (err) return res.status(500).send("Error posting comment");
res.send("Comment added");
}
);
});

app.get("/recipes/:id/comments", (req, res) => {
const { id } = req.params;
db.query(
"SELECT * FROM comments WHERE recipe_id = ? ORDER BY created_at DESC",
[id],
(err, results) => {
if (err) return res.status(500).send("Error loading comments");
res.json(results);
}
);
});

// ---------------------- Likes ------------------------

app.post("/recipes/:id/like", (req, res) => {
const { id } = req.params;
const { username } = req.body;
db.query(
"INSERT INTO likes (recipe_id, username) VALUES (?, ?) ON DUPLICATE KEY UPDATE username = username",
[id, username],
(err) => {
if (err) return res.status(500).send("Error liking recipe");
res.send("Liked");
}
);
});

app.get("/recipes/:id/likes", (req, res) => {
const { id } = req.params;
db.query(
"SELECT COUNT(*) as total FROM likes WHERE recipe_id = ?",
[id],
(err, results) => {
if (err) return res.status(500).send("Error loading likes");
res.json(results[0]);
}
);
});

// ---------------------- Ratings ------------------------

app.post("/recipes/:id/rate", (req, res) => {
const { id } = req.params;
const { username, stars } = req.body;
db.query(
"INSERT INTO ratings (recipe_id, username, stars) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE stars = ?",
[id, username, stars, stars],
(err) => {
if (err) return res.status(500).send("Error rating recipe");
res.send("Rating saved");
}
);
});

app.get("/recipes/:id/rating", (req, res) => {
const { id } = req.params;
db.query(
"SELECT AVG(stars) as average, COUNT(*) as count FROM ratings WHERE recipe_id = ?",
[id],
(err, results) => {
if (err) return res.status(500).send("Error loading rating");
res.json(results[0]);
}
);
});

// ---------------------- Meal Plan ------------------------

app.post("/meal-plan", (req, res) => {
const { user, recipe_id, day, meal_type } = req.body;
db.query(
"INSERT INTO meal_plan (user, recipe_id, day, meal_type) VALUES (?, ?, ?, ?)",
[user, recipe_id, day, meal_type],
(err) => {
if (err) return res.status(500).send("Error adding to meal plan");
res.send("Added to plan");
}
);
});

app.get("/meal-plan/:user", (req, res) => {
const { user } = req.params;
db.query(
`SELECT mp.*, r.title, r.image FROM meal_plan mp
JOIN recipes r ON mp.recipe_id = r.id
WHERE mp.user = ? ORDER BY
FIELD(mp.day, 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'),
FIELD(mp.meal_type, 'Πρωινό', 'Μεσημεριανό', 'Βραδινό')`,
[user],
(err, results) => {
if (err) return res.status(500).send("Error fetching meal plan");
res.json(results);
}
);
});

// ---------------------- Start Server ------------------------

app.listen(5000, () => {
console.log("🚀 Server is running on http://localhost:5000");
});
