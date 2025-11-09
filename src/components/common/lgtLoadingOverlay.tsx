import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export default function lgtLoadingOverlay({
  show,
  message,
}: LoadingOverlayProps) {
  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>,
    document.body, // Render directly to body, outside all containers
  );
}
