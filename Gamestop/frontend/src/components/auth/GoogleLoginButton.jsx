import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";

function GoogleLoginButton({ onCredentialResponse, disabled }) {
  const buttonRef = useRef(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [error, setError] = useState("");

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "921251241673-r8ae5rnbv041nrhs7s943ueiv2eqa2hf.apps.googleusercontent.com";

  useEffect(() => {
    if (!clientId) return;

    const handleCredentialResponse = (response) => {
      if (response && response.credential) {
        onCredentialResponse(response.credential);
      }
    };

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });

          if (buttonRef.current) {
            buttonRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: "filled_black",
              size: "large",
              width: 320,
              text: "continue_with",
              shape: "rectangular",
            });
            setGisLoaded(true);
          }
        } catch (e) {
          console.error("GIS initialization error:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initializeGoogleSignIn);
    }
  }, [clientId, onCredentialResponse]);

  const handleManualClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError("Google Sign-In is initializing, please try again in a moment.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {error && (
        <div className="text-red-400 text-xs mb-2 text-center">{error}</div>
      )}

      {/* Official GIS Button container - rendered when GIS is ready */}
      <div
        ref={buttonRef}
        className={`w-full flex justify-center ${gisLoaded ? "block" : "hidden"}`}
      />

      {/* Fallback button rendered ONLY when GIS script has not loaded yet */}
      {!gisLoaded && (
        <button
          type="button"
          onClick={handleManualClick}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg text-base cursor-pointer disabled:opacity-50"
        >
          <FcGoogle className="text-2xl bg-white rounded-full p-0.5" />
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}

export default GoogleLoginButton;
