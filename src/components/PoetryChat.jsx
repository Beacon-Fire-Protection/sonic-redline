import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ACTIVE_COLOR = "#FF3399";
const ACCENT_AQUA = "#06b6d4";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  if (!message.content) return null;
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 flex-shrink-0 mt-0.5 flex items-center justify-center rounded-sm" style={{ background: `${ACTIVE_COLOR}22` }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACTIVE_COLOR }} />
        </div>
      )}
      <div
        className="max-w-[85%] px-3 py-2 text-sm leading-relaxed"
        style={{
          background: isUser ? `${ACTIVE_COLOR}22` : "rgba(255,255,255,0.05)",
          border: `1px solid ${isUser ? ACTIVE_COLOR + "44" : ACCENT_AQUA + "22"}`,
          color: "#f3e8ff",
          borderRadius: "8px",
        }}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="my-0.5">{children}</p>,
              code: ({ children }) => (
                <code className="px-1 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.1)" }}>
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function PoetryChat() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!open || conversation) return;

    base44.agents.createConversation({
      agent_name: "sonic_redline",
      metadata: { name: "Poetry Chat" },
    }).then((conv) => {
      setConversation(conv);
      setMessages(conv.messages || []);
    });
  }, [open]);

  useEffect(() => {
    if (!conversation) return;
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !conversation) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed z-50 flex items-center justify-center w-12 h-12 shadow-lg transition-all"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)",
          right: "1rem",
          background: open ? `${ACCENT_AQUA}` : ACTIVE_COLOR,
          borderRadius: "50%",
          boxShadow: `0 0 20px ${open ? ACCENT_AQUA : ACTIVE_COLOR}60`,
          border: "none",
        }}
        aria-label="Open poetry chat"
      >
        {open ? <X className="w-5 h-5" style={{ color: "#fff" }} /> : <MessageCircle className="w-5 h-5" style={{ color: "#fff" }} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-40 flex flex-col shadow-2xl"
          style={{
            bottom: "calc(env(safe-area-inset-bottom) + 8rem)",
            right: "1rem",
            width: "min(90vw, 360px)",
            height: "min(70vh, 520px)",
            background: "linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 100%)",
            border: `1px solid ${ACCENT_AQUA}33`,
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0"
            style={{ borderColor: `${ACCENT_AQUA}33` }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: ACTIVE_COLOR, boxShadow: `0 0 6px ${ACTIVE_COLOR}` }} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: ACCENT_AQUA }}>
              Sonic Redline
            </span>
            <span className="text-xs ml-1" style={{ color: "#C084FC88" }}>· Poetry Expert</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && !sending && (
              <p className="text-xs text-center mt-8" style={{ color: "#C084FC66" }}>
                Ask me anything about poetry — craft, technique, canon, your work.
              </p>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {sending && (
              <div className="flex gap-2 justify-start">
                <Loader2 className="w-4 h-4 animate-spin mt-1" style={{ color: ACTIVE_COLOR }} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 pb-3 pt-2 border-t flex-shrink-0"
            style={{ borderColor: `${ACCENT_AQUA}33` }}
          >
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about a poem, technique, or poet…"
                rows={2}
                className="flex-1 resize-none text-sm px-3 py-2 leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${ACCENT_AQUA}33`,
                  color: "#f3e8ff",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || !conversation}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center transition-all disabled:opacity-40"
                style={{
                  background: ACTIVE_COLOR,
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                <Send className="w-4 h-4" style={{ color: "#fff" }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}