// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home"; // existing home page
import { Import } from "./pages/Import";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Test } from "./pages/Test";
import { useAuthStore } from "./stores/authStore";
import { ContextMenuProvider } from "./contexts/ContextMenuContext";
import { ContextMenuRenderer } from "./components/contextMenus/ContextMenuRenderer";

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <ContextMenuProvider>
      <BrowserRouter>
        {/* Simple nav – you can replace with your own UI later */}
        {/*<nav style={{ marginBottom: "1rem" }}>
      <Link to="/">Home</Link> | <Link to="/markdown">MD</Link>
    </nav>*/}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/import" element={<Import />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<Test />} />
        </Routes>
        <ContextMenuRenderer />
      </BrowserRouter>
    </ContextMenuProvider>
  );
};

export default App;
