import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, HelpCircle, RotateCcw } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// FAQ Database / Knowledge Base
// ─────────────────────────────────────────────────────────────
const FAQ_DATABASE = [
  {
    id: "faq_campaigns",
    question: "How do I create a campaign?",
    answer: "To start a campaign, go to your Creator Dashboard and click 'Create Campaign'. You'll need to provide a title, detailed description, target funding goal ($), project deadline, and a media URL or image. Once published, your campaign becomes active and public for anyone to support!",
    keywords: ["create", "start", "campaign", "campaigns", "launch", "publish"]
  },
  {
    id: "faq_payments",
    question: "Are Stripe payments secure?",
    answer: "Yes, absolutely! All payment processing is handled securely by Stripe. We do not store or transmit any credit card data on our servers. Stripe uses AES-256 encryption and conforms to strict PCI-DSS standards to ensure your transactions are 100% secure.",
    keywords: ["stripe", "payment", "payments", "secure", "security", "card", "credit", "pay", "donate"]
  },
  {
    id: "faq_refunds",
    question: "How do refunds work?",
    answer: "We support automated donor protection! If a creator deletes or cancels their campaign, our backend automatically triggers a refund for all completed donations back to the donor's original card via the Stripe API. It typically takes 5-10 business days to appear on your statement.",
    keywords: ["refund", "refunds", "cancel", "delete", "failed", "money back", "return"]
  },
  {
    id: "faq_fees",
    question: "Are there any platform fees?",
    answer: "Creating and hosting a campaign on our platform is completely free! Stripe handles processing fees (usually around 2.9% + $0.30 per transaction), which are deducted directly from donations. We do not charge creators any additional platform hosting fees.",
    keywords: ["fee", "fees", "cost", "free", "percent", "stripe fee", "charge"]
  },
  {
    id: "faq_deadlines",
    question: "What happens when a deadline is reached?",
    answer: "When a campaign reaches its deadline, it is marked as 'ended' and can no longer accept new donations. If the campaign successfully reached or exceeded its target goal, the status changes to 'completed' and the creator can access the funds.",
    keywords: ["deadline", "deadlines", "expire", "ended", "time limit", "ends"]
  }
];

// Helper to find answer based on input keywords
function findBestResponse(userInput) {
  const normalized = userInput.toLowerCase();
  
  // 1. Check direct matches against FAQ database keywords
  for (const faq of FAQ_DATABASE) {
    if (faq.keywords.some(keyword => normalized.includes(keyword))) {
      return faq.answer;
    }
  }
  
  // 2. Simple greetings matching
  if (normalized.match(/\b(hi|hello|hey|greetings|hola|heyy)\b/)) {
    return "Hello! 😊 How can I help you today? Feel free to ask me about campaigns, Stripe payments, refunds, or platform fees.";
  }
  
  // 3. Fallback answer
  return "I'm not quite sure I understand that query, but I can tell you all about how to start campaigns, Stripe payment security, automated refunds, platform fees, or deadlines. Feel free to use one of the quick options or ask a related question!";
}

// ═════════════════════════════════════════════════════════════
// ChatWidget Component
// ═════════════════════════════════════════════════════════════

export default function ChatWidget({ isAuthenticated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! 👋 I'm your CrowdFund Support Assistant. Ask me anything about how our campaigns work, security, or refunds!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSystem: false
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Close widget on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close widget on Escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Auto-scroll to bottom when messages change or typing state updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Send message process (User -> Bot Response)
  const processMessage = useCallback((text) => {
    if (!text.trim()) return;

    // 1. Add User message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // 2. Determine Bot response and trigger realistic typing delay
    const botAnswer = findBestResponse(text);
    
    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: botAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000); // 1 second delay feels natural and high quality
  }, []);

  const handleSend = useCallback(() => {
    processMessage(inputText);
  }, [inputText, processMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: "bot",
        text: "Chat history cleared. How else can I assist you today? 🌟",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, []);

  // Render nothing if user is not authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ──────────────────────────────────────────────
          Chat Panel (popup window)
          ────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className={`
          fixed bottom-24 right-5 z-[9998]
          w-[390px] h-[580px] max-w-[calc(100vw-2.5rem)] max-h-[calc(100vh-8rem)]
          flex flex-col
          rounded-2xl overflow-hidden
          border border-white/[0.08]
          bg-[#0f1117]/90 backdrop-blur-2xl
          shadow-[0_8px_60px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.35)]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          origin-bottom-right
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          }
        `}
        role="dialog"
        aria-label="FAQ and AI Assistant window"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border border-white/[0.12] shadow-md">
              <Bot size={18} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-[14.5px] font-semibold text-white/90 tracking-wide select-none flex items-center gap-1.5">
                AI Assistant <Sparkles size={13} className="text-violet-400" />
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium tracking-wider uppercase">Active Helper</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Reset Chat"
              aria-label="Reset chat history"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label="Close assistant panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-2.5 animate-fadeIn`}
              >
                {isBot && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mt-0.5">
                    <HelpCircle size={14} className="text-violet-400" />
                  </div>
                )}
                <div
                  className={`
                    max-w-[80%] px-3.5 py-2.5 rounded-2xl
                    text-[13.5px] leading-relaxed shadow-sm
                    ${isBot
                      ? "bg-white/[0.06] text-white/85 border border-white/[0.05] rounded-tl-sm"
                      : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm"
                    }
                  `}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <p
                    className={`text-[9.5px] mt-1.5 select-none ${isBot ? "text-white/30" : "text-indigo-200/70 text-right"
                      }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start items-start gap-2.5 animate-pulse">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mt-0.5">
                <HelpCircle size={14} className="text-violet-400" />
              </div>
              <div className="bg-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm border border-white/[0.05] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {/* Invisible anchor element for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* Scrollable Quick FAQ options at the bottom of the message container */}
        <div className="px-4 py-2 border-t border-white/[0.04] bg-white/[0.02]">
          <p className="text-[11px] text-white/30 mb-2 font-medium tracking-wide flex items-center gap-1.5 select-none">
            💡 Quick Help Suggestions
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
            {FAQ_DATABASE.map((faq) => (
              <button
                key={faq.id}
                onClick={() => processMessage(faq.question)}
                className="
                  text-[12px] text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] 
                  px-3 py-1.5 rounded-lg border border-white/[0.06] transition-all duration-150
                  cursor-pointer active:scale-95 text-left truncate max-w-full
                "
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>

        {/* Input footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me a question..."
              className="
                flex-1 h-10 px-4 rounded-xl
                bg-white/[0.04] border border-white/[0.08]
                text-[13px] text-white/90 placeholder-white/35
                outline-none
                focus:border-indigo-500/40 focus:bg-white/[0.06]
                transition-all duration-200
              "
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`
                flex-shrink-0 h-10 w-10
                flex items-center justify-center
                rounded-xl
                transition-all duration-200
                cursor-pointer
                ${inputText.trim()
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_2px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.45)] active:scale-95"
                  : "bg-white/[0.04] text-white/25 cursor-not-allowed"
                }
              `}
              aria-label="Send message"
            >
              <Send size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          Toggle Button (FAB)
          ────────────────────────────────────────────── */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          fixed bottom-5 right-5 z-[9999]
          h-14 w-14
          flex items-center justify-center
          rounded-full
          border border-white/[0.1]
          bg-gradient-to-br from-indigo-500 to-violet-600
          text-white
          shadow-[0_4px_24px_rgba(99,102,241,0.45),0_1px_4px_rgba(0,0,0,0.2)]
          hover:shadow-[0_6px_32px_rgba(99,102,241,0.65),0_2px_8px_rgba(0,0,0,0.28)]
          hover:scale-105
          active:scale-95
          transition-all duration-200 ease-out
          cursor-pointer
          group
        `}
        aria-label={isOpen ? "Close Assistant" : "Open Assistant"}
        aria-expanded={isOpen}
      >
        {/* Animated icon swap — Message icon ↔ X icon */}
        <MessageCircle
          size={24}
          strokeWidth={2}
          className={`
            absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}
          `}
        />
        <X
          size={24}
          strokeWidth={2}
          className={`
            absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}
          `}
        />
      </button>
    </>
  );
}
