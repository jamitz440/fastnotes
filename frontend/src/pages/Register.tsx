import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="gap-4 flex flex-col max-w-md mx-auto"
    >
      <h2 className="text-2xl font-semibold text-text mb-2">Create Account</h2>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-subtext">Username</label>
        <input
          type="text"
          placeholder="Choose a username"
          className="standard-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-subtext">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="standard-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-subtext">Password</label>
        <input
          type="password"
          className="standard-input"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger px-3 py-2 rounded-sm text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="bg-accent hover:bg-accent/90 text-base font-semibold px-4 py-2.5 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
      >
        Register
      </button>
    </form>
  );
};
