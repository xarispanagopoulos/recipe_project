import { useState } from "react";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("username", data.username); // αποθήκευση ονόματος χρήστη
        localStorage.setItem("token", data.token); // αποθήκευση token (προαιρετικά)
        setMessage(`Καλωσήρθες ${data.username}!`);
      } else {
        setMessage("❌ Λάθος στοιχεία.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("⚠️ Σφάλμα κατά την είσοδο.");
    }
  };

  return (
    <div>
      <h2>🔑 Είσοδος</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Κωδικός"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Σύνδεση</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
