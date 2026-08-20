import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">Task Tracker</div>
      <div className="navbar-actions">
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user && (
          <>
            <span className="navbar-user">Hi, {user.name}</span>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}
