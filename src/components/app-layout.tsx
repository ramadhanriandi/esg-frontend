import {
  UserIcon,
  Settings,
  FileText,
  Code2,
  Home,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useEcoAuth } from "@/authentication/use-eco-auth-hook";
import { ReactNode, useEffect } from "react";
import { useOverlay } from "./common/dragOverlayContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Compliance",
    icon: Settings,
    href: "/compliance",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    title: "Developer Portal",
    icon: Code2,
    href: "/developer",
  },
];

const LEFT_SIDEBAR_KEY = "riskguard-left-sidebar";
const RIGHT_SIDEBAR_KEY = "riskguard-right-sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  const authContext = useEcoAuth();

  const handleLogout = () => {
    authContext.logout?.();
  };
  const isProd = import.meta.env.VITE_ENV === "production";

  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
  } = useOverlay();

  const user = authContext.user ?? "";
  const email = authContext.email || "email@nus.com";
  const userName = authContext.userName || "username";

  useEffect(() => {
    const leftState = localStorage.getItem(LEFT_SIDEBAR_KEY);
    const rightState = localStorage.getItem(RIGHT_SIDEBAR_KEY);

    if (leftState !== null) setLeftSidebarOpen(leftState === "true");
    if (rightState !== null) setRightSidebarOpen(rightState === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(LEFT_SIDEBAR_KEY, String(leftSidebarOpen));
  }, [leftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem(RIGHT_SIDEBAR_KEY, String(rightSidebarOpen));
  }, [rightSidebarOpen]);

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <header className="flex-shrink-0 z-50 border-b border-border bg-card/95 backdrop-blur-support ">
        <div className="flex h-16 items-center gap-4 px-4 justify-between">
          <RouterLink to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              EcoTrack
            </span>
          </RouterLink>

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
          <div className="pt-2 pb-2 border-b border-sidebar-border flex-shrink-0">
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
            <nav>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <RouterLink key={item.title} to={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        !leftSidebarOpen && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {leftSidebarOpen && <span>{item.title}</span>}
                    </Button>
                  </RouterLink>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        <main className="flex-1 relative">
          <div className="flex h-full">
            <div className="p-6 flex-1 overflow-auto relative">{children}</div>
          </div>
        </main>

        {rightSidebarOpen && (
          <aside className="flex-shrink-0 w-80 border-l border-border bg-sidebar backdrop-blur-support flex flex-col">
            <div className="flex items-center gap-2 p-4 border-b border-sidebar-border flex-shrink-0">
              <Button
                className="absolute"
                variant="ghost"
                size="icon"
                onClick={() => setRightSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-center w-full">
                Profile
              </span>
            </div>

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
                </div>

                <Separator className="my-4" />

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
          </aside>
        )}
      </div>
    </div>
  );
}
