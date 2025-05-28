import { useState } from "react";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await 
      fetch("http://localhost:5000/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      console.error("Register error:", err);
      setMessage("Σφάλμα κατά την εγγραφή");
    }
  };

  return (
    <div>
      <h2>🔐 Εγγραφή</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Όνομα Χρήστη"
          value={form.username}
          onChange={handleChange}
          required
        />
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
        <button type="submit">Εγγραφή</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
