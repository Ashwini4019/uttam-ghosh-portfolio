import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { isAdminAuthenticated, loginAdmin } from "../../cms/auth";
import AdminPasswordInput from "./AdminPasswordInput";
import "../Admin/Admin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (loginAdmin(password)) {
      navigate("/admin", { replace: true });
      return;
    }

    setError("Incorrect password. Try again.");
    setPassword("");
  };

  return (
    <div className="admin-page login-page">
      <div className="login-card">
        <h1>Website Admin</h1>
        <p>
          Sign in to add photos, update About text, and see newsletter sign-ups.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-password">Password</label>
          <AdminPasswordInput
            id="admin-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            placeholder="Enter password"
            autoFocus
            autoComplete="current-password"
          />

          {error ? <p className="admin-error">{error}</p> : null}

          <button type="submit" className="admin-btn primary login-submit">
            Sign in
          </button>
        </form>

        <Link to="/" className="login-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
