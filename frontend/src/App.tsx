// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home"; // existing home page
import { MarkdownPage } from "./pages/Markdown"; 
const App = () => (
    <BrowserRouter>
      {/* Simple nav – you can replace with your own UI later */}
      {/*<nav style={{ marginBottom: "1rem" }}>
      <Link to="/">Home</Link> | <Link to="/markdown">MD</Link>
    </nav>*/}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markdown" element={<MarkdownPage />} />
      </Routes>
    </BrowserRouter>
);

export default App;
