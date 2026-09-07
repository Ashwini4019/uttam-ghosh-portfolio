import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Admin from "./pages/Admin/Admin";
import AdminLogin from "./pages/Admin/AdminLogin";
import NewsletterConfirm from "./pages/NewsletterConfirm";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import CreativeJourney from "./pages/CreativeJourney";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<CreativeJourney />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/newsletter/confirm/:token"
          element={<NewsletterConfirm />}
        />
        <Route
          path="/newsletter/unsubscribe/:token"
          element={<NewsletterUnsubscribe />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
