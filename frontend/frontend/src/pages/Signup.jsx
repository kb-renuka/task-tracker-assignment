import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await signup(name, email, password, adminKey || undefined);
    if (ok) navigate("/");
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Name
          <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>

        {showAdminField ? (
          <label>
            Admin Key (optional)
            <input
              type="password"
              className="input"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Leave blank for a regular account"
            />
          </label>
        ) : (
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowAdminField(true)}
          >
            Signing up as an admin?
          </button>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
