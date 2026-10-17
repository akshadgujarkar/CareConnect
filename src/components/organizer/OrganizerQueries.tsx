import { useState, useMemo } from "react";
import { MessageSquare, Send, CheckCheck, User, Calendar, Clock } from "lucide-react";
import { MockStore, type Conversation, type Message, type Language } from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { formatCampDate } from "@/lib/reminderEngine";

interface Props {
  conversations: Conversation[];
  onToast: (msg: string) => void;
  lang?: Language;
}

export function OrganizerQueries({ conversations, onToast, lang = "en" }: Props) {
  const t = getTranslation(lang);
  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations.length > 0 ? conversations[0].id : "",
  );
  const [replyText, setReplyText] = useState("");

  const activeConv = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;
  }, [conversations, selectedConvId]);

  const messages: Message[] = useMemo(() => {
    if (!activeConv) return [];
    return MockStore.getMessages(activeConv.id);
  }, [activeConv]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !replyText.trim()) return;

    MockStore.sendMessage(activeConv.id, replyText.trim(), {
      id: "u_org_1",
      name: "Dr. Aruna Shinde (Organizer)",
      role: "organizer",
    });

    setReplyText("");
    onToast(`Reply sent to ${activeConv.userName}!`);
  };

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground shadow-soft">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
        <p className="font-semibold text-foreground">No participant queries yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          When beneficiaries ask questions on your camp pages, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr] rounded-2xl border bg-card shadow-soft overflow-hidden h-[620px]">
      {/* Conversations List (Left) */}
      <div className="border-r flex flex-col h-full bg-muted/20">
        <div className="border-b p-3.5 bg-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Participant Conversations ({conversations.length})
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {conversations.map((c) => {
            const isSelected = activeConv?.id === c.id;
            const convMsgs = MockStore.getMessages(c.id);
            const lastMsg = convMsgs[convMsgs.length - 1];

            return (
              <button
                key={c.id}
                onClick={() => setSelectedConvId(c.id)}
                className={`w-full p-3.5 text-left transition flex items-start gap-3 ${
                  isSelected ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/50"
                }`}
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary font-bold text-xs shrink-0">
                  {c.userName.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-foreground truncate">{c.userName}</p>
                    {c.unreadCountOrganizer > 0 && (
                      <span className="rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-primary-foreground">
                        {c.unreadCountOrganizer} new
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-primary truncate font-medium mt-0.5">
                    {c.campName}
                  </p>
                  {lastMsg && (
                    <p className="text-[11px] text-muted-foreground truncate mt-1">
                      {lastMsg.senderRole === "organizer" ? "You: " : ""}
                      {lastMsg.messageText}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Thread View (Right) */}
      {activeConv ? (
        <div className="flex flex-col h-full bg-card">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between bg-card">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {activeConv.userName}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3 w-3 text-primary" />
                Camp: <span className="font-medium text-foreground">{activeConv.campName}</span>
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              Direct Beneficiary Query
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">{t.noMessages}</p>
            ) : (
              messages.map((m) => {
                const isOrg = m.senderRole === "organizer";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isOrg ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                      <span>{m.senderName}</span>
                      <span>·</span>
                      <span className="font-mono">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isOrg
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-muted text-foreground rounded-tl-xs border"
                      }`}
                    >
                      {m.messageText}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Input Box */}
          <form
            onSubmit={handleSendReply}
            className="border-t p-3.5 flex items-center gap-2 bg-card"
          >
            <input
              type="text"
              className="input flex-1 text-xs"
              placeholder={t.replyPlaceholder}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t.replySend}</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
