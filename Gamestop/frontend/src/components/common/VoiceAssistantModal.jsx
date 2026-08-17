import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute, FaPaperPlane, FaTimes, FaRobot, FaShoppingCart, FaStar, FaExclamationTriangle } from "react-icons/fa";
import { processVoiceQuery, getVoiceSuggestions } from "../../services/voiceService";
import { updateQuantity } from "../../services/cartService";
import { useCart } from "../../context/CartContext";

function VoiceAssistantModal() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [assistantState, setAssistantState] = useState("READY"); // "READY" | "LISTENING" | "PROCESSING"
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const { addToCart, removeFromCart, clearCart, loadCart } = useCart();

  // Mode Controller Ref: "WAKE_LISTENING" | "COMMAND_LISTENING" | "PROCESSING" | "IDLE"
  const modeRef = useRef("IDLE");
  const activeRecognitionRef = useRef(null);
  const commandTimerRef = useRef(null);
  const latestTranscriptRef = useRef("");
  const handleSendQueryRef = useRef(null);
  const lastAiProductRef = useRef(null);
  const recentSearchResultsRef = useRef([]);

  // Helper function to stop text-to-speech
  function stopSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }

  // Helper function to play text-to-speech
  function speakText(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  // 1. Determine if user is authenticated (using existing GameStop auth source of truth)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLoggedIn = Boolean(token && token !== "null" && token !== "undefined");

  // 2. Check if current route is a public auth page or admin page
  const currentPath = location ? location.pathname : "";
  const isExcludedRoute =
    ["/login", "/register", "/forgot-password", "/reset-password"].includes(currentPath) ||
    currentPath.startsWith("/admin");

  const shouldRenderAI = isLoggedIn && !isExcludedRoute;

  // Extract current Product ID context if viewing a product details page
  let currentProductId = null;
  if (currentPath && currentPath.startsWith("/product/")) {
    const idStr = currentPath.split("/product/")[1];
    const parsed = parseInt(idStr, 10);
    if (!isNaN(parsed)) currentProductId = parsed;
  }

  // Safely stop any currently active recognition instance & clear 5s command timer
  function stopActiveRecognition() {
    if (commandTimerRef.current) {
      clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
    if (activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.stop();
      } catch (e) {}
      activeRecognitionRef.current = null;
    }
  }

  // Background Wake-Word Recognition Controller ("Hey GameStop")
  function startWakeListening() {
    if (!shouldRenderAI) return;

    const SpeechRecognition =
      typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) return;

    stopActiveRecognition();
    modeRef.current = "WAKE_LISTENING";
    setAssistantState("READY");

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("[WAKE] recognition started");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (!transcript || !transcript.trim()) return;
        const lower = transcript.toLowerCase().trim();
        console.log("[WAKE] recognition result:", lower);

        const isWake =
          lower.includes("hey gamestop") ||
          lower.includes("hey game stop") ||
          lower.includes("hi gamestop") ||
          lower.includes("hello gamestop") ||
          lower.includes("ok gamestop");

        if (isWake && modeRef.current === "WAKE_LISTENING") {
          console.log("[WAKE] wake word detected");

          // Stop background wake listener
          stopActiveRecognition();

          // POPUP OPENS AUTOMATICALLY
          setIsOpen(true);
          stopSpeech();

          // Extract any follow-up command spoken in the same sentence
          const cleanCommand = lower
            .replace(/hey\s*game\s*stop/g, "")
            .replace(/hi\s*game\s*stop/g, "")
            .replace(/hello\s*game\s*stop/g, "")
            .replace(/ok\s*game\s*stop/g, "")
            .replace(/gamestop/g, "")
            .trim();

          if (cleanCommand.length > 2) {
            // WAKE WORD + COMMAND IN ONE SENTENCE
            if (handleSendQueryRef.current) {
              handleSendQueryRef.current(cleanCommand);
            }
          } else {
            // WAKE WORD ONLY -> START 5-SECOND AUTOMATIC COMMAND LISTENING WINDOW
            startCommandListening(true);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn("[WAKE] recognition error:", event.error);
      };

      recognition.onend = () => {
        console.log("[WAKE] recognition ended");
        if (modeRef.current === "WAKE_LISTENING" && shouldRenderAI) {
          console.log("[WAKE] restarting recognition");
          setTimeout(() => {
            if (modeRef.current === "WAKE_LISTENING" && shouldRenderAI) {
              startWakeListening();
            }
          }, 300);
        }
      };

      recognition.start();
      activeRecognitionRef.current = recognition;
    } catch (e) {
      console.warn("[WAKE] init error:", e);
    }
  }

  // Active Command Listening Controller (Manual or Automatic 5s Window)
  function startCommandListening(isAutoFromWake = false) {
    const SpeechRecognition =
      typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setErrorMsg("Voice input is not supported in this browser. You can type your request below.");
      return;
    }

    stopActiveRecognition();
    modeRef.current = "COMMAND_LISTENING";
    setAssistantState("LISTENING");
    setErrorMsg("");
    setQueryText("");
    latestTranscriptRef.current = "";

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("[COMMAND] listening started (auto = " + isAutoFromWake + ")");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQueryText(transcript);
        latestTranscriptRef.current = transcript.trim();
      };

      recognition.onerror = (event) => {
        console.warn("[COMMAND] recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission required for voice commands.");
        }
      };

      recognition.onend = () => {
        console.log("[COMMAND] listening ended");
        if (commandTimerRef.current) {
          clearTimeout(commandTimerRef.current);
          commandTimerRef.current = null;
        }

        const captured = latestTranscriptRef.current;
        if (captured && captured.trim().length > 0) {
          latestTranscriptRef.current = "";
          if (handleSendQueryRef.current) {
            handleSendQueryRef.current(captured);
          }
        } else {
          // If no speech was captured, return to READY / WAKE_LISTENING (popup stays open!)
          startWakeListening();
        }
      };

      recognition.start();
      activeRecognitionRef.current = recognition;

      // REQUIREMENT 2: 5-Second Command Window for automatic wake-word activation ONLY
      if (isAutoFromWake) {
        commandTimerRef.current = setTimeout(() => {
          console.log("[COMMAND] 5-second wake-word window expired");
          if (modeRef.current === "COMMAND_LISTENING") {
            stopActiveRecognition();
            startWakeListening(); // Return to READY state, popup STAYS OPEN!
          }
        }, 5000);
      }
    } catch (e) {
      console.warn("[COMMAND] start error:", e);
      startWakeListening();
    }
  }

  // Initialize background wake word listener when component mounts or auth route changes
  useEffect(() => {
    if (shouldRenderAI) {
      startWakeListening();
    } else {
      stopActiveRecognition();
      modeRef.current = "IDLE";
    }

    return () => {
      stopActiveRecognition();
      modeRef.current = "IDLE";
    };
  }, [shouldRenderAI]);

  // Fetch verified dynamic suggestions from MySQL database when modal opens
  useEffect(() => {
    if (shouldRenderAI && isOpen) {
      getVoiceSuggestions()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSuggestions(data);
          }
        })
        .catch((err) => console.error("Error loading voice suggestions:", err));
    }
  }, [shouldRenderAI, isOpen]);

  // Stop Speech Synthesis when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
    }
  }, [isOpen]);

  // CRITICAL REQUIREMENT: Do NOT render anything if user is NOT logged in or on public auth/admin pages
  if (!shouldRenderAI) {
    return null;
  }

  // Manual Microphone Button Click Handler (OPTION A - No 5s timeout limit)
  const toggleListening = () => {
    if (assistantState === "LISTENING") {
      stopActiveRecognition();
      startWakeListening();
    } else {
      stopSpeech();
      startCommandListening(false); // Manual click does NOT have 5s limit
    }
  };

  const handleSendQuery = async (promptToUse) => {
    let rawText = promptToUse || queryText;
    if (!rawText || !rawText.trim()) return;

    // Pop up Assistant Modal Panel immediately
    setIsOpen(true);
    stopActiveRecognition();
    modeRef.current = "PROCESSING";
    setAssistantState("PROCESSING");

    // Clean wake-word prefixes if user spoke "Hey GameStop ..."
    const textToSend = rawText
      .replace(/^hey\s*game\s*stop\s*/i, "")
      .replace(/^hi\s*game\s*stop\s*/i, "")
      .replace(/^hello\s*game\s*stop\s*/i, "")
      .replace(/^ok\s*game\s*stop\s*/i, "")
      .trim();

    if (!textToSend) {
      startWakeListening();
      return;
    }

    setQueryText("");
    latestTranscriptRef.current = "";
    stopSpeech();
    setErrorMsg("");
    setLastQuery(textToSend);
    setPendingConfirmation(null);

    const lowerQuery = textToSend.toLowerCase();
    const isTopReq =
      lowerQuery.includes("top product") ||
      lowerQuery.includes("first product") ||
      lowerQuery.includes("first one") ||
      lowerQuery.includes("top result") ||
      lowerQuery.includes("first result") ||
      lowerQuery.includes("first item");

    const topProductFromRecentSearch =
      isTopReq && recentSearchResultsRef.current && recentSearchResultsRef.current.length > 0
        ? recentSearchResultsRef.current[0]
        : null;

    const lastSearchId = topProductFromRecentSearch
      ? topProductFromRecentSearch.productId || topProductFromRecentSearch.id
      : lastAiProductRef.current
      ? lastAiProductRef.current.productId || lastAiProductRef.current.id
      : null;

    try {
      const response = await processVoiceQuery(textToSend, {
        currentPage: currentPath,
        currentProductId: currentProductId,
        lastSearchResultProductId: lastSearchId,
      });

      // Persist the MOST RECENT completed AI search results
      if (response && response.products && response.products.length > 0) {
        recentSearchResultsRef.current = response.products;
        lastAiProductRef.current = response.products[0];
      }

      if (response) {
        const isActionTop = response.action === "ADD_TOP_PRODUCT" || isTopReq;

        if ((isActionTop || response.action === "ADD_TO_CART") && (response.resolvedProduct || topProductFromRecentSearch || recentSearchResultsRef.current.length > 0)) {
          let targetProd = null;

          if (isActionTop) {
            if (recentSearchResultsRef.current && recentSearchResultsRef.current.length > 0) {
              targetProd = recentSearchResultsRef.current[0];
            } else if (response.resolvedProduct) {
              targetProd = response.resolvedProduct;
            } else if (lastAiProductRef.current) {
              targetProd = lastAiProductRef.current;
            }
          } else {
            targetProd = response.resolvedProduct || (recentSearchResultsRef.current.length > 0 ? recentSearchResultsRef.current[0] : null);
          }

          if (targetProd) {
            const qty = response.quantity || 1;
            const pId = targetProd.productId || targetProd.id;

            try {
              await addToCart(targetProd);
              if (qty > 1 && pId) {
                await updateQuantity(pId, qty);
              }
              await loadCart();

              const confirmText =
                qty > 1
                  ? `${qty} × ${targetProd.name} have been added to your cart.`
                  : `${targetProd.name} has been added to your cart.`;

              response.textResponse = confirmText;
              response.action = isActionTop ? "ADD_TOP_PRODUCT" : "ADD_TO_CART";
              response.resolvedProduct = targetProd;
              setAiResponse(response);
              speakText(confirmText);
            } catch (err) {
              console.error("Cart action error:", err);
              const errText = `Failed to add ${targetProd.name} to cart. Please verify your login session.`;
              response.textResponse = errText;
              setAiResponse(response);
              setErrorMsg(errText);
            }
          } else if (isActionTop) {
            const errText = "No recent AI search results found. Please search for products first.";
            response.textResponse = errText;
            setAiResponse(response);
            setErrorMsg(errText);
          }
        } else if (response.action === "REMOVE_FROM_CART" && response.resolvedProduct) {
          const pId = response.resolvedProduct.productId || response.resolvedProduct.id;
          if (pId) {
            await removeFromCart(pId);
            await loadCart();
          }
        } else if (response.action === "EMPTY_CART" && response.requiresConfirmation) {
          setPendingConfirmation("EMPTY_CART");
        }

        setAiResponse(response);

        if (response.targetRoute && response.action !== "EMPTY_CART") {
          setTimeout(() => {
            navigate(response.targetRoute);
          }, 800);
        }

        if (response.textResponse) {
          speakText(response.textResponse);
        }
      }
    } catch (err) {
      console.error("Voice Query Processing Error:", err);
      setErrorMsg("Failed to connect to GameStop AI backend. Please check your server connection.");
    } finally {
      startWakeListening();
    }
  };

  handleSendQueryRef.current = handleSendQuery;

  const handleConfirmAction = async () => {
    if (pendingConfirmation === "EMPTY_CART") {
      await clearCart();
      await loadCart();
      setPendingConfirmation(null);
      speakText("Your cart is now completely empty.");
    }
  };

  const handleCancelAction = () => {
    setPendingConfirmation(null);
    speakText("Action cancelled.");
  };

  const handleQuickPrompt = (prompt) => {
    setQueryText(prompt);
    handleSendQuery(prompt);
  };

  return (
    <>
      {/* Floating Trigger Button Pinned to Bottom-Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 z-50 border border-red-400/30"
          title="Ask GameStop AI Voice Assistant (Say 'Hey GameStop')"
        >
          <div className="relative">
            <FaMicrophone className="text-xl animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">Ask GameStop AI 🎙️</span>
        </button>
      )}

      {/* Assistant Modal Panel (Popup) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 sm:w-[480px] max-h-[85vh] bg-zinc-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-800 flex flex-col z-50 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-zinc-900 px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/30">
                <FaRobot className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">GameStop AI Voice Assistant</h3>
                {/* REQUIREMENT 9: Simple Clean Real-Time Status Indicator */}
                <div className="flex items-center gap-2 mt-0.5">
                  {assistantState === "LISTENING" && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Listening...
                    </span>
                  )}
                  {assistantState === "PROCESSING" && (
                    <span className="text-[10px] bg-zinc-800 text-gray-300 border border-zinc-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-spin"></span>
                      Processing...
                    </span>
                  )}
                  {assistantState === "READY" && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      Ready
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {/* Status Visualizer Banner */}
            {assistantState === "LISTENING" && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3.5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-medium text-red-300">Listening... Speak now</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <FaStop /> Stop
                </button>
              </div>
            )}

            {assistantState === "PROCESSING" && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-300">Processing request against MySQL catalog...</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-950/30 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Query Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Voice / Text Query (Wake Word: "Hey GameStop")
              </label>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 focus-within:border-red-500 transition">
                <button
                  onClick={toggleListening}
                  className={`p-2.5 rounded-lg transition ${
                    assistantState === "LISTENING"
                      ? "bg-red-600 text-white animate-bounce"
                      : "bg-zinc-800 text-gray-300 hover:text-white hover:bg-zinc-700"
                  }`}
                  title={assistantState === "LISTENING" ? "Stop Listening" : "Start Voice Input"}
                >
                  <FaMicrophone />
                </button>
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (queryText.trim() && assistantState !== "PROCESSING") {
                        handleSendQuery();
                      }
                    }
                  }}
                  placeholder='Try saying "Hey GameStop find me a gaming mouse under 2000"'
                  className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
                />
                <button
                  onClick={() => handleSendQuery()}
                  disabled={!queryText.trim() || assistantState === "PROCESSING"}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white p-2.5 rounded-lg transition"
                >
                  <FaPaperPlane className="text-xs" />
                </button>
              </div>
            </div>

            {/* Dynamic Database-Aware Quick Suggestion Pills */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-gray-400 w-full mb-1">Quick Suggestions:</span>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(item.query)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Confirmation Banner for Destructive Actions (e.g. Empty Cart) */}
            {pendingConfirmation && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <FaExclamationTriangle className="text-base" />
                  <span>Confirmation Required</span>
                </div>
                <p className="text-xs text-gray-300">
                  {aiResponse?.textResponse || "Are you sure you want to proceed with this action?"}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleConfirmAction}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                  >
                    Yes, Empty Cart
                  </button>
                  <button
                    onClick={handleCancelAction}
                    className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* AI Natural Language Response */}
            {aiResponse && !pendingConfirmation && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-red-500 tracking-wide uppercase">
                    AI Response ({aiResponse.action || aiResponse.intent})
                  </span>
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeech}
                      className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      <FaVolumeMute /> Stop Audio
                    </button>
                  ) : (
                    <button
                      onClick={() => speakText(aiResponse.textResponse)}
                      className="text-xs bg-zinc-800 text-gray-300 hover:text-white px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      <FaVolumeUp /> Replay Voice
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-200 leading-relaxed font-normal">
                  {aiResponse.textResponse}
                </p>

                {/* Returned Real Product Cards from MySQL */}
                {aiResponse.products && aiResponse.products.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <span className="text-xs font-semibold text-gray-400">
                      Catalog Matches ({aiResponse.products.length}):
                    </span>
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
                      {aiResponse.products.map((item) => (
                        <div
                          key={item.productId || item.id}
                          className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex gap-3 items-center hover:border-zinc-700 transition"
                        >
                          <Link to={`/product/${item.productId || item.id}`}>
                            <img
                              src={item.image || "https://via.placeholder.com/150"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg border border-zinc-800"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.productId || item.id}`}>
                              <h4 className="font-bold text-sm text-white hover:text-red-400 transition truncate">
                                {item.name}
                              </h4>
                            </Link>
                            <div className="flex items-center gap-1.5 text-xs text-yellow-400 my-1">
                              <FaStar />
                              <span>{item.rating || "4.8"}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-red-400 font-bold">
                                ₹{Number(item.price).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 block truncate">
                              {item.category ? (item.category.name || item.category.categoryName || item.category) : "GameStop Catalog"}
                            </span>
                          </div>

                          <button
                            onClick={() => addToCart(item)}
                            className="bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center transition"
                            title="Add to Cart"
                          >
                            <FaShoppingCart />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default VoiceAssistantModal;
