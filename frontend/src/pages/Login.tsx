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
      setError((err as Error).message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="gap-4 flex flex-col max-w-md mx-auto"
    >
      <h2 className="text-2xl font-semibold text-ctp-text mb-2">
        Welcome Back
      </h2>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ctp-subtext0">
          Username
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          className="standard-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ctp-subtext0">
          Password
        </label>
        <input
          type="password"
          className="standard-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-ctp-red/10 border border-ctp-red text-ctp-red px-3 py-2 rounded-sm text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="accent-ctp-mauve cursor-pointer"
        />
        <label
          htmlFor="remember"
          className="text-sm text-ctp-subtext0 cursor-pointer"
        >
          Remember me
        </label>
      </div>

      <button
        type="submit"
        className="bg-ctp-mauve hover:bg-ctp-mauve/90 text-ctp-base font-semibold px-4 py-2.5 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-base"
      >
        Login
      </button>
    </form>
  );
};
