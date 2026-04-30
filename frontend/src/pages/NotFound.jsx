import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            marginBottom: "1rem",
            fontSize: "2.5rem",
            fontWeight: "700",
          }}
        >
          404
        </h1>

        <p
          style={{
            marginBottom: "1rem",
            fontSize: "1.2rem",
            color: "#6b7280",
          }}
        >
          Oops! Page not found
        </p>

        <a
          href="/"
          style={{
            color: "#2563eb",
            textDecoration: "underline",
            fontWeight: "500",
          }}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;