import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MemeDetailPage from "./pages/MemeDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateMemePage from "./pages/CreateMemePage";
import MyMemesPage from "./pages/MyMemesPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/memes/:id" element={<MemeDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/memes/create" element={<CreateMemePage />} />
        <Route path="/my-memes" element={<MyMemesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;