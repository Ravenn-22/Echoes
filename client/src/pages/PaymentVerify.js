import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  verifyPayment,
  createPrintOrder,
  completePendingOrder,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get("reference");
      if (!reference) {
        setStatus("failed");
        return;
      }

      try {
        const { data } = await verifyPayment(reference);
        const pendingPrintOrder = localStorage.getItem("pendingPrintOrder");

        // Check payment metadata to determine type
        if (data.plan && (data.plan === "monthly" || data.plan === "yearly")) {
          // This is a Pro subscription payment
          const storedUser = JSON.parse(localStorage.getItem("user"));
          const updatedUser = {
            ...storedUser,
            isPro: true,
            proExpiresAt: data.proExpiresAt,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          localStorage.removeItem("pendingPrintOrder");
          setStatus("success");
          setTimeout(() => navigate("/home"), 3000);

          // WHY: createPrintOrder now requires `paystackReference` so the backend
          // can look up the already-verified Order and pull the real book details
          // from there (instead of trusting whatever is in localStorage / the request
          // body). The reference is already in scope in this component — it's the
          // same `reference` used for verifyPayment — it just wasn't being passed
          // through to createPrintOrder before.
          //
          // Replace this part of the `verify` function:
        } else if (pendingPrintOrder) {
          // This is a print order payment
          setStatus("printing");
          try {
            await createPrintOrder({
              ...JSON.parse(pendingPrintOrder),
              paystackReference: reference, // FIX: was missing — now lets the backend tie this to the verified Order
            });
            await completePendingOrder(reference);
            localStorage.removeItem("pendingPrintOrder");
            setStatus("printSuccess");
            setTimeout(() => navigate("/home"), 3000);
          } catch (error) {
            setStatus("failed");
          }
        } else {
          setStatus("failed");
        }
      } catch (error) {
        setStatus("failed");
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <h2>Verifying your payment... 🌸</h2>
          <p>Please wait a moment.</p>
        </>
      )}
      {status === "success" && (
        <>
          <h2>Payment Successful! 🎉</h2>
          <p>Welcome to Echoes Pro! Redirecting you home...</p>
        </>
      )}
      {status === "failed" && (
        <>
          <h2>Payment Failed 😢</h2>
          <p>Something went wrong. Please try again.</p>
          <button
            onClick={() => navigate("/upgrade")}
            style={{
              background: "#72011f",
              color: "#fff2d7",
              border: "none",
              padding: "12px 30px",
              borderRadius: "25px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Try Again
          </button>
        </>
      )}
      {status === "printing" && (
        <>
          <h2> Creating your print order...</h2>
          <p>Please wait while we curate your book.</p>
        </>
      )}
      {status === "printSuccess" && (
        <>
          <h2> Your book is on its way!</h2>
          <p>Check your email for confirmation. Redirecting you to home....</p>
        </>
      )}
    </div>
  );
};

export default PaymentVerify;
