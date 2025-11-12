import { JSX, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Check, Copy, Edit2, Loader2, Plus, Send, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { getApiBaseUrl } from "@/api/base-url";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

const STORAGE_KEY = "riskguard-chats";
const DEFAULT_MODEL_LABEL = "GPT-4.1-mini";
const API_BASE = getApiBaseUrl();
const STREAM_PATH = (id: string) => `${API_BASE}/chats/${id}/stream`;
const SEND_PATH = (id: string) => `${API_BASE}/chats/${id}/messages`;

const stripImages = (s: string) =>
  s
    .replace(/!\[[^\]]*]\([^)]+\)/g, "[image removed]")
    .replace(/<img[^>]*>/gi, "[image removed]")
    .replace(
      /data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/g,
      "[image removed]"
    );
function AssistantContent({ text }: { text: string }) {
  const clean = stripImages(text);
  const parts: JSX.Element[] = [];
  const re = /```(\w+)?\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(clean))) {
    if (m.index > last) {
      const chunk = clean.slice(last, m.index).trim();
      if (chunk)
        parts.push(
          <p key={`p-${last}`} className="text-sm whitespace-pre-wrap">
            {chunk}
          </p>
        );
    }
    const lang = m[1] || "text";
    const code = m[2];
    parts.push(
      <pre
        key={`c-${m.index}`}
        className="rounded-md bg-background/50 border text-xs p-3 overflow-auto"
        aria-label={`code-${lang}`}
      >
        <code>{code}</code>
      </pre>
    );
    last = re.lastIndex;
  }
  const tail = clean.slice(last).trim();
  if (tail)
    parts.push(
      <p key="p-tail" className="text-sm whitespace-pre-wrap">
        {tail}
      </p>
    );

  return <>{parts}</>;
}

async function sendUserMessage(conversationId: string, content: string) {
  await fetch(SEND_PATH(conversationId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({ content }),
  });
}

function openStream(
  conversationId: string,
  onDelta: (chunk: string) => void,
  onDone: () => void
) {
  const es = new EventSource(STREAM_PATH(conversationId), {
    withCredentials: false,
  });
  es.onmessage = (e) => onDelta(e.data ?? "");
  es.onerror = () => {
    es.close();
    onDone();
  };
  return () => es.close();
}

export function ChatGPTSidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [loadingByChat, setLoadingByChat] = useState<Record<string, boolean>>(
    {}
  );

  const streamClosersRef = useRef<Map<string, () => void>>(new Map());

  const renameInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const setChatLoading = (chatId: string, val: boolean) =>
    setLoadingByChat((prev) => ({ ...prev, [chatId]: val }));

  const clearChatLoading = (chatId: string) =>
    setLoadingByChat((prev) => {
      const { [chatId]: _, ...rest } = prev;
      return rest;
    });

  const stopChatStream = (chatId: string) => {
    const closer = streamClosersRef.current.get(chatId);
    if (closer) {
      closer();
      streamClosersRef.current.delete(chatId);
    }
    clearChatLoading(chatId);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedChats: Chat[] = JSON.parse(stored);
      setChats(parsedChats);
      if (parsedChats.length > 0) {
        setActiveChat(parsedChats[0].id);
      }
    } else {
      const initialChat = createNewChat(1);
      setChats([initialChat]);
      setActiveChat(initialChat.id);
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [chats]);

  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, activeChat, loadingByChat]);

  const createNewChat = (index: number): Chat => {
    const nowId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id: nowId,
      title: `Chat ${index}`,
      messages: [
        {
          id: "intro",
          role: "assistant",
          content: DEFAULT_MODEL_LABEL, // simple “model tag” bubble
        },
      ],
    };
  };

  const handleNewChat = () => {
    // NOTE: Do NOT cancel other chats' streams; concurrent allowed
    const newChat = createNewChat(chats.length + 1);
    setChats([...chats, newChat]);
    setActiveChat(newChat.id);
  };

  const handleCloseChat = (chatId: string) => {
    // stop only this chat's stream
    stopChatStream(chatId);

    const updatedChats = chats.filter((c) => c.id !== chatId);
    setChats(updatedChats);

    if (chatId === activeChat) {
      if (updatedChats.length > 0) {
        setActiveChat(updatedChats[0].id);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const handleRenameStart = (chatId: string, currentTitle: string) => {
    setRenamingChatId(chatId);
    setRenameValue(currentTitle);
  };

  const handleRenameComplete = () => {
    if (renamingChatId && renameValue.trim()) {
      setChats(
        chats.map((c) =>
          c.id === renamingChatId ? { ...c, title: renameValue.trim() } : c
        )
      );
    }
    setRenamingChatId(null);
    setRenameValue("");
  };

  const handleRenameCancel = () => {
    setRenamingChatId(null);
    setRenameValue("");
  };

  const handleSend = async () => {
    const chatId = activeChat;
    if (!input.trim() || !chatId || loadingByChat[chatId]) return;

    const currentChat = chats.find((c) => c.id === chatId);
    if (!currentChat) return;

    // cancel any existing stream for THIS chat only (new message supersedes)
    stopChatStream(chatId);

    // 1) append user message
    const userMessage: Message = {
      id: `${Date.now()}-u`,
      role: "user",
      content: input,
    };
    const afterUserMessages = [...currentChat.messages, userMessage];

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, messages: afterUserMessages } : c
      )
    );
    setInput("");

    // 2) create assistant placeholder (shows typing state)
    const asstId = `${Date.now()}-a`;
    const withAssistantPlaceholder = [
      ...afterUserMessages,
      { id: asstId, role: "assistant", content: "" } as Message,
    ];
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, messages: withAssistantPlaceholder } : c
      )
    );

    // 3) call backend & stream (per-chat loading)
    setChatLoading(chatId, true);
    try {
      await sendUserMessage(chatId, userMessage.content);

      let draft = "";
      const close = openStream(
        chatId,
        (delta) => {
          draft += delta;
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === asstId ? { ...m, content: draft } : m
                    ),
                  }
                : c
            )
          );
        },
        () => {
          // stream ended (for this chat only)
          setChatLoading(chatId, false);
          streamClosersRef.current.delete(chatId);
        }
      );
      streamClosersRef.current.set(chatId, close);
    } catch {
      // if send fails, show error in placeholder
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === asstId
                    ? {
                        ...m,
                        content:
                          "Sorry, I couldn't reach the server. Please try again.",
                      }
                    : m
                ),
              }
            : c
        )
      );
      setChatLoading(chatId, false);
      streamClosersRef.current.delete(chatId);
      return;
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentChat = chats.find((c) => c.id === activeChat);
  const isActiveChatLoading = !!loadingByChat[activeChat];

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-muted-foreground mb-4">No active chats</p>
        <Button onClick={handleNewChat} className="gap-2">
          <Plus className="h-4 w-4" />
          Start New Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-sidebar-border p-2 flex-shrink-0 bg-sidebar">
        <div className="flex items-center gap-1">
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1">
              {chats.map((chat) => (
                <ContextMenu key={chat.id}>
                  <ContextMenuTrigger>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer whitespace-nowrap flex-shrink-0",
                        activeChat === chat.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => {
                        // NOTE: Do NOT cancel other chats' streams on switch
                        setActiveChat(chat.id);
                      }}
                      onDoubleClick={() =>
                        handleRenameStart(chat.id, chat.title)
                      }
                    >
                      {renamingChatId === chat.id ? (
                        <Input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={handleRenameComplete}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameComplete();
                            if (e.key === "Escape") handleRenameCancel();
                          }}
                          className="h-6 w-32 px-2 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span>{chat.title}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseChat(chat.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => handleRenameStart(chat.id, chat.title)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Rename
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleCloseChat(chat.id)}
                      className="text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Close
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {currentChat?.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg p-3 relative group",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" ? (
                  <>
                    {/* Typing indicator: only for THIS chat */}
                    {isActiveChatLoading && message.content.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking…</span>
                      </div>
                    ) : (
                      <AssistantContent text={message.content} />
                    )}
                  </>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}

                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(message.content, message.id)}
                  >
                    {copiedId === message.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border flex-shrink-0">
        <div className="flex gap-2 items-center">
          <Input
            placeholder={
              isActiveChatLoading ? "Generating reply..." : "Ask me anything..."
            }
            value={input}
            disabled={isActiveChatLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={isActiveChatLoading || !input.trim()}
          >
            {isActiveChatLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
