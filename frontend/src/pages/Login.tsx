import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../stores/uiStore";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const { login, setRememberMe } = useAuthStore();
  const navigate = useNavigate();
  const { setShowModal } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRememberMe(remember);
    try {
      await login(username, password);
      setShowModal(false);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="gap-2 flex flex-col">
      <input
        type="text"
        placeholder="Username"
        className="standard-input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="standard-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <div>{error}</div>}
      <button type="submit">Login</button>
      <div className="flex gap-2">
        <input
          type="check box"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <div>Remember me?</div>
      </div>
    </form>
  );
};
