import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute, FaPaperPlane, FaTimes, FaRobot, FaShoppingCart, FaStar, FaExclamationTriangle, FaTerminal } from "react-icons/fa";
import { processVoiceQuery, getVoiceSuggestions } from "../../services/voiceService";
import { updateQuantity } from "../../services/cartService";
import { useCart } from "../../context/CartContext";

function VoiceAssistantModal() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);

  const { addToCart, removeFromCart, clearCart, loadCart } = useCart();
  const recognitionRef = useRef(null);
  const wakeWordRecognitionRef = useRef(null);
  const latestVoiceTranscriptRef = useRef("");
  const handleSendQueryRef = useRef(null);
  const lastAiProductRef = useRef(null);
  const recentSearchResultsRef = useRef([]);

  // Helper to append a live action status log entry
  function addActionLog(msg) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActionLogs((prev) => [...prev.slice(-5), { time: timeStr, msg }]);
  }

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

  // Cleanup & stop all AI activity if user logs out or navigates to excluded route
  useEffect(() => {
    if (!shouldRenderAI) {
      if (isOpen) setIsOpen(false);
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        setIsListening(false);
      }
      stopSpeech();
      setQueryText("");
      setAiResponse(null);
      setPendingConfirmation(null);
      setActionLogs([]);
      latestVoiceTranscriptRef.current = "";
    }
  }, [shouldRenderAI, currentPath]);

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

  // Hands-Free "Hey GameStop" Wake Word Listener
  useEffect(() => {
    if (!shouldRenderAI) return;

    const SpeechRecognition =
      typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) return;

    try {
      const wakeRec = new SpeechRecognition();
      wakeRec.continuous = true;
      wakeRec.interimResults = true;
      wakeRec.lang = "en-US";

      wakeRec.onstart = () => {
        setIsWakeWordActive(true);
      };

      wakeRec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();

          if (
            transcript.includes("hey gamestop") ||
            transcript.includes("hey game stop") ||
            transcript.includes("hi gamestop") ||
            transcript.includes("hello gamestop") ||
            transcript.includes("ok gamestop")
          ) {
            // POPUP MODAL IMMEDIATELY!
            setIsOpen(true);
            stopSpeech();

            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setActionLogs([
              { time: timeStr, msg: `🚀 WAKE WORD DETECTED: "Hey GameStop"` },
              { time: timeStr, msg: `🎙️ Opening AI Assistant Popup Panel...` }
            ]);

            // Extract any follow-up command spoken after the wake word
            const cleanQuery = transcript
              .replace(/hey\s*game\s*stop/g, "")
              .replace(/hi\s*game\s*stop/g, "")
              .replace(/hello\s*game\s*stop/g, "")
              .replace(/ok\s*game\s*stop/g, "")
              .replace(/gamestop/g, "")
              .trim();

            if (cleanQuery.length > 2) {
              if (handleSendQueryRef.current) {
                handleSendQueryRef.current(cleanQuery);
              }
            } else {
              speakText("GameStop AI active! What command can I perform for you?");
              setTimeout(() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (e) {}
                }
              }, 1200);
            }
            break;
          }
        }
      };

      wakeRec.onerror = () => {
        setIsWakeWordActive(false);
      };

      wakeRec.onend = () => {
        if (shouldRenderAI && !isListening) {
          try {
            wakeRec.start();
          } catch (e) {}
        }
      };

      try {
        wakeRec.start();
      } catch (e) {}

      wakeWordRecognitionRef.current = wakeRec;
    } catch (e) {
      console.warn("Wake word listener initialization error:", e);
    }

    return () => {
      if (wakeWordRecognitionRef.current) {
        try {
          wakeWordRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [shouldRenderAI, isListening]);

  useEffect(() => {
    if (!shouldRenderAI) return;

    // Initialize Browser SpeechRecognition if supported
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg("");
        latestVoiceTranscriptRef.current = "";
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQueryText(transcript);
        latestVoiceTranscriptRef.current = transcript.trim();
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        latestVoiceTranscriptRef.current = "";
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission denied. Please allow microphone access or type your query.");
        } else if (event.error === "no-speech") {
          setErrorMsg("No speech detected. Please try speaking again.");
        } else {
          setErrorMsg(`Voice error: ${event.error}. You can type your request below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const voiceText = latestVoiceTranscriptRef.current;
        if (voiceText && voiceText.trim().length > 0) {
          latestVoiceTranscriptRef.current = "";
          if (handleSendQueryRef.current) {
            handleSendQueryRef.current(voiceText);
          }
        }
      };

      recognitionRef.current = recognition;
    }
  }, [shouldRenderAI]);

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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg("Voice input is not supported in this browser. You can type your request below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      setErrorMsg("");
      setQueryText("");
      latestVoiceTranscriptRef.current = "";
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Start recognition error:", err);
      }
    }
  };

  const handleSendQuery = async (promptToUse) => {
    let rawText = promptToUse || queryText;
    if (!rawText || !rawText.trim()) return;

    // Pop up Assistant Modal Panel immediately!
    setIsOpen(true);

    const isWakeTrigger = promptToUse && (
      promptToUse.toLowerCase().includes("hey gamestop") ||
      promptToUse.toLowerCase().includes("hey game stop")
    );

    // Clean wake-word prefixes if user spoke "Hey GameStop ..."
    const textToSend = rawText
      .replace(/^hey\s*game\s*stop\s*/i, "")
      .replace(/^hi\s*game\s*stop\s*/i, "")
      .replace(/^hello\s*game\s*stop\s*/i, "")
      .replace(/^ok\s*game\s*stop\s*/i, "")
      .trim();

    if (!textToSend) return;

    // Clear input box and voice ref after message is sent
    setQueryText("");
    latestVoiceTranscriptRef.current = "";

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    stopSpeech();
    setIsThinking(true);
    setErrorMsg("");
    setLastQuery(textToSend);
    setPendingConfirmation(null);

    const initialTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActionLogs([
      { time: initialTime, msg: isWakeTrigger ? `🚀 Wake Word Detected: "Hey GameStop"` : `🗣️ Command Received: "${textToSend}"` },
      { time: initialTime, msg: `⚙️ Parsing Intent: "${textToSend}"` },
      { time: initialTime, msg: `🔍 Querying Spring Boot AI & MySQL Database...` }
    ]);

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

      setIsThinking(false);

      // Persist the MOST RECENT completed AI search results
      if (response && response.products && response.products.length > 0) {
        recentSearchResultsRef.current = response.products;
        lastAiProductRef.current = response.products[0];
        addActionLog(`📦 Search complete: ${response.products.length} products found in MySQL catalog.`);
      }

      // Execute Whitelisted Ecommerce Actions locally using existing GameStop Cart & Route logic
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

            addActionLog(`⚡ Executing Action: ${isActionTop ? 'ADD_TOP_PRODUCT' : 'ADD_TO_CART'} for "${targetProd.name}" (ID: ${pId})`);

            try {
              await addToCart(targetProd);
              if (qty > 1 && pId) {
                await updateQuantity(pId, qty);
              }
              addActionLog(`🛒 Cart Updated: Added ${qty} unit(s) of "${targetProd.name}".`);
              await loadCart();
              addActionLog(`🔄 CartContext Refreshed & Navbar Badge Updated!`);

              const confirmText =
                qty > 1
                  ? `${qty} × ${targetProd.name} have been added to your cart.`
                  : `${targetProd.name} has been added to your cart.`;

              response.textResponse = confirmText;
              response.action = isActionTop ? "ADD_TOP_PRODUCT" : "ADD_TO_CART";
              response.resolvedProduct = targetProd;
              setAiResponse(response);
              speakText(confirmText);
              addActionLog(`✅ Command Finished Successfully!`);
            } catch (err) {
              console.error("Cart action error:", err);
              const errText = `Failed to add ${targetProd.name} to cart. Please verify your login session.`;
              response.textResponse = errText;
              setAiResponse(response);
              setErrorMsg(errText);
              addActionLog(`❌ Action Failed: Cart request returned error.`);
            }
            return;
          } else if (isActionTop) {
            const errText = "No recent AI search results found. Please search for products first.";
            response.textResponse = errText;
            setAiResponse(response);
            setErrorMsg(errText);
            addActionLog(`⚠️ Warning: No recent AI search results available.`);
            return;
          }
        } else if (response.action === "REMOVE_FROM_CART" && response.resolvedProduct) {
          const pId = response.resolvedProduct.productId || response.resolvedProduct.id;
          if (pId) {
            addActionLog(`⚡ Action Executing: REMOVE_FROM_CART for "${response.resolvedProduct.name}"`);
            await removeFromCart(pId);
            await loadCart();
            addActionLog(`🛒 Cart Updated: Removed item successfully.`);
          }
        } else if (response.action === "EMPTY_CART" && response.requiresConfirmation) {
          addActionLog(`⚠️ Confirmation Required: Empty Cart requested.`);
          setPendingConfirmation("EMPTY_CART");
        } else {
          addActionLog(`ℹ️ Response Received: ${response.action || 'SEARCH_RESULT'}`);
        }

        setAiResponse(response);

        // Handle navigation if requested (e.g. /checkout, /orders, /cart)
        if (response.targetRoute && response.action !== "EMPTY_CART") {
          addActionLog(`🔀 Navigating to route: ${response.targetRoute}`);
          setTimeout(() => {
            navigate(response.targetRoute);
          }, 800);
        }

        // Trigger Text-to-Speech audio response
        if (response.textResponse) {
          speakText(response.textResponse);
        }
      }
    } catch (err) {
      console.error("Voice Query Processing Error:", err);
      setIsThinking(false);
      setErrorMsg("Failed to connect to GameStop AI backend. Please check your server connection.");
      addActionLog(`❌ Error: Backend API connection failed.`);
    }
  };

  // Assign latest handleSendQuery function to ref to prevent stale closures in speech recognition callback
  handleSendQueryRef.current = handleSendQuery;

  const handleConfirmAction = async () => {
    if (pendingConfirmation === "EMPTY_CART") {
      addActionLog(`⚡ Executing: EMPTY_CART action confirmed by user.`);
      await clearCart();
      await loadCart();
      setPendingConfirmation(null);
      speakText("Your cart is now completely empty.");
      addActionLog(`🛒 Cart Cleared successfully.`);
    }
  };

  const handleCancelAction = () => {
    setPendingConfirmation(null);
    speakText("Action cancelled.");
    addActionLog(`ℹ️ Action cancelled by user.`);
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
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  GameStop AI Voice Assistant
                  {isWakeWordActive && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Wake Word Active
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">Say "Hey GameStop" • Natural Voice & Command Tracker</p>
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
            {/* REAL-TIME COMMAND & ACTION EXECUTION MONITOR */}
            {actionLogs.length > 0 && (
              <div className="bg-zinc-900/90 border border-red-500/30 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-red-400 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <FaTerminal className="text-xs" />
                    Live Command & Action Monitor
                  </span>
                  <span className="text-[10px] text-gray-500">Real-Time Log Stream</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {actionLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-300">
                      <span className="text-gray-500 text-[10px] select-none">[{log.time}]</span>
                      <span className="leading-snug">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Visualizer */}
            {isListening && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3.5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-medium text-red-300">Listening... Speak command now</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <FaStop /> Stop
                </button>
              </div>
            )}

            {isThinking && (
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
                    isListening
                      ? "bg-red-600 text-white animate-bounce"
                      : "bg-zinc-800 text-gray-300 hover:text-white hover:bg-zinc-700"
                  }`}
                  title={isListening ? "Stop Listening" : "Start Voice Input"}
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
                      if (queryText.trim() && !isThinking) {
                        handleSendQuery();
                      }
                    }
                  }}
                  placeholder='Try saying "Hey GameStop find me a gaming mouse under 2000"'
                  className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
                />
                <button
                  onClick={() => handleSendQuery()}
                  disabled={!queryText.trim() || isThinking}
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
