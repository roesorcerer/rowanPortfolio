import { useState } from "react";
import { useContactSubmissions } from "../../hooks/useContactSubmissions";
import LoadingPulse from "../LoadingPulse";

function MessagesTab() {
  const { data: messages = [], isLoading } = useContactSubmissions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-ink text-xl font-medium tracking-tight">
          Contact messages
        </h1>
        <span className="text-muted text-sm">{messages.length} total</span>
      </div>

      {isLoading && <LoadingPulse />}

      {!isLoading && messages.length === 0 && (
        <p className="text-faint text-sm py-10">No messages yet.</p>
      )}

      {!isLoading && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isExpanded = expandedId === msg._id;
            return (
              <div
                key={msg._id}
                className="bg-white border border-rule rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : msg._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-ink text-sm font-medium">
                        {msg.name}
                      </span>
                      <span className="text-faint text-xs">·</span>
                      <span className="text-muted text-xs">{msg.email}</span>
                    </div>
                    <p className="text-body text-sm truncate">{msg.subject}</p>
                    {!isExpanded && (
                      <p className="text-faint text-xs truncate mt-0.5">
                        {msg.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                    <span className="text-faint text-xs">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-faint text-xs">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#F0EEE9]">
                    <p className="text-ink text-sm whitespace-pre-wrap pt-4">
                      {msg.message}
                    </p>
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="inline-block mt-3 text-xs text-accent-dark hover:underline"
                    >
                      Reply via email →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default MessagesTab;
