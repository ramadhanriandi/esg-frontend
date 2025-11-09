import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Upload,
  UserCircle,
  UserIcon,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { getAvatarImageUrl } from "@/utils/avatar-utils";
import { cn } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { ChatGPTSidebar } from "./common/chatgpt-sidebar";
import { NotesPanel } from "./common/notes-panel";
import { CommandPalette } from "./common/command-palette";
import { ScrollArea } from "./ui/scroll-area";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button } from "./ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FileText },
  { name: "Relationships", href: "/relationships", icon: Users },
  { name: "User Management", href: "/users", icon: UserCircle },
  { name: "Bulk Upload", href: "/bulk-upload", icon: Upload },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Audit Log", href: "/audit-log", icon: History },
  { name: "AI Tools", href: "/ai-tools", icon: Sparkles },
];

const LEFT_SIDEBAR_KEY = "riskguard-left-sidebar";
const RIGHT_SIDEBAR_KEY = "riskguard-right-sidebar";
const RIGHT_SIDEBAR_TAB_KEY = "riskguard-right-sidebar-tab";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  // const [user, setUser] = useState<User | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<"profile" | "chat">(
    "profile"
  );
  const [notesHeight, setNotesHeight] = useState(200);
  const { user: authUser, signOut } = useAuthenticator();
  const logout = async () => {
    await signOut();
  };

  // cuser?.signInDetails?.loginId}'s todos</h1>
  const user = authUser.username ?? "test";
  const email = authUser.signInDetails?.loginId ?? "test@test.com";
  const userId = authUser.userId ?? "1234567890";
  const userName = authUser.username ?? "testName";
  useEffect(() => {
    const leftState = localStorage.getItem(LEFT_SIDEBAR_KEY);
    const rightState = localStorage.getItem(RIGHT_SIDEBAR_KEY);
    const rightTab = localStorage.getItem(RIGHT_SIDEBAR_TAB_KEY);

    if (leftState !== null) setLeftSidebarOpen(leftState === "true");
    if (rightState !== null) setRightSidebarOpen(rightState === "true");
    if (rightTab) setRightSidebarTab(rightTab as "profile" | "chat");
  }, []);

  useEffect(() => {
    localStorage.setItem(LEFT_SIDEBAR_KEY, String(leftSidebarOpen));
  }, [leftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem(RIGHT_SIDEBAR_KEY, String(rightSidebarOpen));
  }, [rightSidebarOpen]);

  useEffect(() => {
    localStorage.setItem(RIGHT_SIDEBAR_TAB_KEY, rightSidebarTab);
  }, [rightSidebarTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setRightSidebarOpen(true);
        setRightSidebarTab("chat");

        const stored = sessionStorage.getItem("riskguard-chats");
        if (!stored || JSON.parse(stored).length === 0) {
          const initialChat = {
            id: Date.now().toString(),
            title: "Chat 1",
            messages: [
              {
                id: "1",
                role: "assistant",
                content: "Ask Anything",
              },
            ],
          };
          sessionStorage.setItem(
            "riskguard-chats",
            JSON.stringify([initialChat])
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const checkChats = () => {
      const stored = sessionStorage.getItem("riskguard-chats");
      if (stored) {
        const chats = JSON.parse(stored);
        if (chats.length === 0 && rightSidebarTab === "chat") {
          setRightSidebarTab("profile");
        }
      }
    };

    const interval = setInterval(checkChats, 1000);
    return () => clearInterval(interval);
  }, [rightSidebarTab]);

  // if (!user) {
  //   return null;
  // }

  const handleLogout = () => {
    logout();
  };

  const handleTabChange = (value: string) => {
    if (value === "chat") {
      const stored = sessionStorage.getItem("riskguard-chats");
      if (!stored || JSON.parse(stored).length === 0) {
        const initialChat = {
          id: Date.now().toString(),
          title: "Chat 1",
          messages: [
            {
              id: "1",
              role: "assistant",
              content: "Ask Anything",
            },
          ],
        };
        sessionStorage.setItem(
          "riskguard-chats",
          JSON.stringify([initialChat])
        );
      }
    }
    setRightSidebarTab(value as "profile" | "chat");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = notesHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      const newHeight = Math.max(100, Math.min(500, startHeight + delta));
      setNotesHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <header className="flex-shrink-0 z-50 border-b border-border bg-card/95 backdrop-blur-support">
        <div className="flex h-16 items-center gap-4 px-4">
          <RouterLink to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              ART
            </span>
          </RouterLink>

          <div className="flex-1 max-w-2xl mx-auto">
            <CommandPalette />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userName} alt={userName} />
                <AvatarFallback className="rounded-lg">
                  {userName}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block">{userName}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "flex-shrink-0 border-r border-border bg-sidebar backdrop-blur-support transition-all duration-300 flex flex-col",
            leftSidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="p-2 border-b border-sidebar-border flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            >
              {leftSidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <nav className="space-y-1 p-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <RouterLink key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        !leftSidebarOpen && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {leftSidebarOpen && <span>{item.name}</span>}
                    </Button>
                  </RouterLink>
                );
              })}
            </nav>
          </ScrollArea>

          {leftSidebarOpen && (
            <>
              <div
                className="h-1 bg-sidebar-border hover:bg-primary cursor-ns-resize transition-colors flex-shrink-0"
                onMouseDown={handleMouseDown}
              />
              <div
                style={{ height: `${notesHeight}px` }}
                className="flex-shrink-0 overflow-hidden"
              >
                <NotesPanel />
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>

        {rightSidebarOpen && (
          <aside className="flex-shrink-0 w-80 border-l border-border bg-sidebar backdrop-blur-support flex flex-col">
            <Tabs
              value={rightSidebarTab}
              onValueChange={handleTabChange}
              className="h-full flex flex-col"
            >
              <div className="flex items-center gap-2 p-4 border-b border-sidebar-border flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="profile"
                className="flex-1 mt-0 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={userName} alt={userName} />
                        <AvatarFallback className="rounded-lg">
                          {userName}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{userName}</h3>
                      <p className="text-sm text-muted-foreground">{email}</p>
                      {/* <Badge variant="secondary" className="mt-2">
                        {(roles as string[])?.join(", ")}
                      </Badge> */}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                      >
                        <UserIcon className="h-4 w-4" />
                        My Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </div>

                    <Button
                      variant="destructive"
                      className="w-full gap-2 mt-4"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
                <ChatGPTSidebar />
              </TabsContent>
            </Tabs>
          </aside>
        )}
      </div>
    </div>
  );
}
