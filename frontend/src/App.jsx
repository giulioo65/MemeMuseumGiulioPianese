import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MemeDetailPage from "./pages/MemeDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateMemePage from "./pages/CreateMemePage";
import MyMemesPage from "./pages/MyMemesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateMemeFab from "./components/CreateMemeFab";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <CreateMemeFab />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/memes/:id" element={<MemeDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes that require authentication */}
        <Route
          path="/memes/create"
          element={
            <ProtectedRoute>
              <CreateMemePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-memes"
          element={
            <ProtectedRoute>
              <MyMemesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;