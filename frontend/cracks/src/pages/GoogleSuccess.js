// src/pages/GoogleSuccess.js
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token and name from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const name = params.get("name");
    const email = params.get("email");

    if (token&& id && email && name) {
      const userInfo = {token, _id:id, name, email};
      // Save to localStorage
      localStorage.setItem(
        "userInfo",
        JSON.stringify(userInfo)
      );
      // Redirect to home
      navigate("/home");
    } else {
      // If no token, go back to login
      navigate("/");
    }
  }, [navigate, location]);

  return <p>Logging you in with Google...</p>;
};

export default GoogleSuccess;
