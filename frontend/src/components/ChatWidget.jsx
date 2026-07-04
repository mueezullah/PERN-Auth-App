import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, ArrowLeft, Send, MessageSquare } from "lucide-react";
import { getPusher } from "../utils/pusher";

// ─────────────────────────────────────────────────────────────
// Mock Data — Replace with real API calls when backend is ready
// ─────────────────────────────────────────────────────────────

/**
 * Mock current user ID.
 * Replace with the real authenticated user's ID from your auth context/state.
 */
const CURRENT_USER_ID = "user_self";

/**
 * Mock recent conversations list.
 * Each entry represents a user we have an active message history with.
 * Set to [] to test the empty "No recent conversations" state.
 */
const MOCK_CONVERSATIONS = [
  {
    id: "user_1",
    name: "Ali Hassan",
    avatarInitial: "AH",
    lastMessage: "Sure, I'll review the proposal tonight.",
    timestamp: "2:34 PM",
  },
  {
    id: "user_2",
    name: "Sara Malik",
    avatarInitial: "SM",
    lastMessage: "Thanks for the funding update!",
    timestamp: "Yesterday",
  },
];

/**
 * Mock message history keyed by the other user's ID.
 * Each message has: id, senderId, text, timestamp.
 */
const MOCK_MESSAGES = {
  user_1: [
    { id: "m1", senderId: "user_1", text: "Hey, did you get a chance to look at the project proposal?", timestamp: "2:30 PM" },
    { id: "m2", senderId: CURRENT_USER_ID, text: "Yes, I went through it. Looks solid overall.", timestamp: "2:31 PM" },
    { id: "m3", senderId: "user_1", text: "Great! Any concerns about the budget section?", timestamp: "2:32 PM" },
    { id: "m4", senderId: CURRENT_USER_ID, text: "A few minor tweaks needed. I'll send notes.", timestamp: "2:33 PM" },
    { id: "m5", senderId: "user_1", text: "Sure, I'll review the proposal tonight.", timestamp: "2:34 PM" },
  ],
  user_2: [
    { id: "m6", senderId: CURRENT_USER_ID, text: "Hi Sara, the funding has been approved!", timestamp: "11:00 AM" },
    { id: "m7", senderId: "user_2", text: "Thanks for the funding update!", timestamp: "11:05 AM" },
  ],
};

// ─────────────────────────────────────────────────────────────
// Placeholder API function
// ─────────────────────────────────────────────────────────────

/**
 * Placeholder: Send a message to the backend.
 * Replace the body of this function with your actual fetch/axios API call.
 *
 * @param {string} recipientId - The ID of the user you are messaging.
 * @param {string} text        - The message text content.
 */
// eslint-disable-next-line no-unused-vars
async function sendMessageToServer(recipientId, text) {
  // TODO: Replace with your real API call, e.g.:
  // await fetch('/api/messages', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ recipientId, text }),
  // });
  console.log(`📤 sendMessageToServer(recipientId="${recipientId}", text="${text}")`);
}

// ─────────────────────────────────────────────────────────────
// Helper: Generate a Pusher channel name for a 1-to-1 conversation.
// Sorts both IDs alphabetically so both users subscribe to the same channel.
// ─────────────────────────────────────────────────────────────
function getChatChannelName(userA, userB) {
  const sorted = [userA, userB].sort();
  return `chat-room-${sorted[0]}-${sorted[1]}`;
}

// ═════════════════════════════════════════════════════════════
// ChatWidget Component
// ═════════════════════════════════════════════════════════════

/**
 * ChatWidget — A globally accessible floating chat widget.
 *
 * Two-screen flow:
 *   Screen A → Conversations list (default)
 *   Screen B → Active chat with a specific user
 *
 * Integrates with Pusher for real-time incoming messages via
 * the existing getPusher() singleton from utils/pusher.ts.
 */
export default function ChatWidget({ isAuthenticated }) {
  // ── Widget-level state ──
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // ── Two-screen navigation state ──
  // activeChat is null → Screen A (conversations list)
  // activeChat is a conversation object → Screen B (chat area)
  const [activeChat, setActiveChat] = useState(null);

  // ── Messages for the currently active chat ──
  const [messages, setMessages] = useState([]);

  // ── Message input state ──
  const [inputText, setInputText] = useState("");

  // ── Ref for auto-scrolling the message body ──
  const messagesEndRef = useRef(null);

  // ── Conversations list (start with mock data) ──
  const [conversations] = useState(MOCK_CONVERSATIONS);

  // ──────────────────────────────────────────────
  // Close widget on outside click
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // Close widget on Escape key
  // ──────────────────────────────────────────────
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // ──────────────────────────────────────────────
  // Auto-scroll to bottom when messages change
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ──────────────────────────────────────────────
  // Pusher subscription for real-time messages
  // Subscribe when entering a chat, unsubscribe on exit
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeChat) return;

    const pusher = getPusher();
    if (!pusher) return;

    const channelName = getChatChannelName(CURRENT_USER_ID, activeChat.id);
    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (data) => {
      // Append the incoming message to the active chat state in real-time
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || `rt_${Date.now()}`,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    });

    // Cleanup: unsubscribe when leaving the chat or switching users
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [activeChat]);

  // ──────────────────────────────────────────────
  // Open a conversation (transition to Screen B)
  // ──────────────────────────────────────────────
  const openConversation = useCallback((conversation) => {
    setActiveChat(conversation);
    // Load mock messages for this conversation (replace with API fetch later)
    setMessages(MOCK_MESSAGES[conversation.id] || []);
    setInputText("");
  }, []);

  // ──────────────────────────────────────────────
  // Go back to conversations list (Screen A)
  // ──────────────────────────────────────────────
  const goBack = useCallback(() => {
    setActiveChat(null);
    setMessages([]);
    setInputText("");
  }, []);

  // ──────────────────────────────────────────────
  // Send a message
  // ──────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || !activeChat) return;

    const newMsg = {
      id: `local_${Date.now()}`,
      senderId: CURRENT_USER_ID,
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Optimistically append to UI
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Send to backend (placeholder)
    sendMessageToServer(activeChat.id, trimmed);
  }, [inputText, activeChat]);

  // ──────────────────────────────────────────────
  // Handle Enter key to send
  // ──────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Don't render the widget for unauthenticated users
  if (!isAuthenticated) return null;

  // ══════════════════════════════════════════════
  // Screen A — Conversations List
  // ══════════════════════════════════════════════
  const renderConversationsList = () => (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </span>
          <h2 className="text-[15px] font-semibold text-white/90 tracking-wide select-none">
            Messages
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer"
          aria-label="Close chat"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      {/* ── Conversations body ── */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <MessageSquare size={28} className="text-white/20" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[14px] text-white/50 font-medium">No recent conversations.</p>
              <p className="text-[12px] text-white/30 mt-1">Start a conversation to see it here.</p>
            </div>
          </div>
        ) : (
          /* ── Conversation entries ── */
          <div className="py-1.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className="
                  w-full flex items-center gap-3.5 px-5 py-3.5
                  hover:bg-white/[0.04] active:bg-white/[0.06]
                  transition-colors duration-150
                  cursor-pointer text-left group
                "
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/80 to-violet-600/80 flex items-center justify-center border border-white/[0.08]">
                  <span className="text-[13px] font-bold text-white/90 select-none">
                    {conv.avatarInitial}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-white/85 truncate">
                      {conv.name}
                    </span>
                    <span className="text-[11px] text-white/30 ml-2 flex-shrink-0">
                      {conv.timestamp}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-white/40 truncate mt-0.5 group-hover:text-white/50 transition-colors">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ══════════════════════════════════════════════
  // Screen B — Active Chat Area
  // ══════════════════════════════════════════════
  const renderChatArea = () => (
    <>
      {/* ── Header with back button + user name ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
        <button
          onClick={goBack}
          className="p-1.5 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        {/* Active user avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/80 to-violet-600/80 flex items-center justify-center border border-white/[0.08]">
            <span className="text-[11px] font-bold text-white/90 select-none">
              {activeChat?.avatarInitial}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-white/90 truncate">
              {activeChat?.name}
            </h2>
            <span className="text-[11px] text-emerald-400/70">Online</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer"
          aria-label="Close chat"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      {/* ── Message body (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-white/30">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === CURRENT_USER_ID;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[75%] px-3.5 py-2.5 rounded-2xl
                    text-[13.5px] leading-relaxed
                    ${isMine
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-md"
                      : "bg-white/[0.07] text-white/80 border border-white/[0.06] rounded-bl-md"
                    }
                  `}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1.5 ${isMine ? "text-white/50 text-right" : "text-white/30"
                      }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {/* Invisible anchor element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input footer ── */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="
              flex-1 h-10 px-4 rounded-xl
              bg-white/[0.05] border border-white/[0.08]
              text-[13.5px] text-white/90 placeholder-white/30
              outline-none
              focus:border-indigo-500/50 focus:bg-white/[0.07]
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
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_2px_12px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.5)] active:scale-95"
                : "bg-white/[0.05] text-white/20 cursor-not-allowed"
              }
            `}
            aria-label="Send message"
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );

  // ══════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════
  return (
    <>
      {/* ──────────────────────────────────────────────
          Chat Panel (popup window)
          ────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className={`
          fixed bottom-24 right-5 z-[9998]
          w-[380px] h-[560px] max-w-[calc(100vw-2.5rem)] max-h-[calc(100vh-8rem)]
          flex flex-col
          rounded-2xl overflow-hidden
          border border-white/[0.08]
          bg-[#0f1117]/80 backdrop-blur-2xl
          shadow-[0_8px_60px_rgba(0,0,0,0.55),0_1px_3px_rgba(0,0,0,0.3)]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          origin-bottom-right
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          }
        `}
        role="dialog"
        aria-label="Chat window"
        aria-hidden={!isOpen}
      >
        {activeChat ? renderChatArea() : renderConversationsList()}
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
          hover:shadow-[0_6px_32px_rgba(99,102,241,0.6),0_2px_8px_rgba(0,0,0,0.25)]
          hover:scale-105
          active:scale-95
          transition-all duration-200 ease-out
          cursor-pointer
          group
        `}
        aria-label={isOpen ? "Close chat" : "Open chat"}
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
