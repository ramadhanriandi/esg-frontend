import { X, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type NotificationType = "success" | "error" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (type: NotificationType, message: string) => {
      const id = Math.random().toString(36).substring(7);
      setNotifications((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    },
    [],
  );

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border animate-in slide-in-from-top-5",
              notification.type === "success" &&
                "bg-green-500/90 border-green-600 text-white",
              notification.type === "error" &&
                "bg-red-500/90 border-red-600 text-white",
              notification.type === "warning" &&
                "bg-yellow-500/90 border-yellow-600 text-white",
            )}
          >
            {notification.type === "success" && (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            {notification.type === "warning" && (
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
