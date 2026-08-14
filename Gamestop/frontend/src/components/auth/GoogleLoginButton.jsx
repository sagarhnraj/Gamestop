import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../services/authService";
import { FcGoogle } from "react-icons/fc";

function GoogleLoginButton({ onSuccess }) {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "921251241673-r8ae5rnbv041nrhs7s943ueiv2eqa2hf.apps.googleusercontent.com";

  useEffect(() => {
    if (!clientId) return;

    const handleCredentialResponse = async (response) => {
      try {
        setLoading(true);
        setError("");
        const data = await googleLogin(response.credential);

        if (data.token) {
          localStorage.setItem("token", String(data.token));
          if (data.userId) localStorage.setItem("userId", String(data.userId));
          if (data.username) localStorage.setItem("username", String(data.username));

          if (onSuccess) {
            onSuccess(data);
          } else {
            navigate("/");
          }
        } else {
          setError("Google Sign-In failed. No token received.");
        }
      } catch (err) {
        console.error("Google login error:", err);
        setError(err.message || "Google Sign-In failed.");
      } finally {
        setLoading(false);
      }
    };

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "filled_black",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    }
  }, [clientId, navigate, onSuccess]);

  if (!clientId) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() =>
            alert(
              "Google Sign-In configuration required: Please add VITE_GOOGLE_CLIENT_ID to Vercel/environment variables."
            )
          }
          className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl border border-zinc-700 transition"
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {error && <div className="text-red-400 text-xs text-center">{error}</div>}
      {loading ? (
        <div className="w-full text-center py-3 text-sm text-zinc-400">
          Authenticating with Google...
        </div>
      ) : (
        <div ref={buttonRef} className="w-full flex justify-center"></div>
      )}
    </div>
  );
}

export default GoogleLoginButton;
