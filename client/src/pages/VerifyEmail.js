import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    // The verification happens via the backend redirect
    // This page just handles the success state
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      setStatus("success");
      setTimeout(() => navigate("/auth"), 3000);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#232020",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "Raleway, sans-serif",
        color: "#fff2d7",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {status === "verifying" && (
        <>
          <h2>Verifying your email... 🌸</h2>
          <p>Please wait a moment.</p>
        </>
      )}
      {status === "success" && (
        <>
          <h2>Email verified! 🎉</h2>
          <p>Your account is now active. Redirecting you to login...</p>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
