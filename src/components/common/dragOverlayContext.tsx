import { createContext, type ReactNode, useContext, useState } from "react";

interface DragOverlayContextProps {
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  setIsDraggingDisabled: (value: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

const DragOverlayContext = createContext<DragOverlayContextProps | undefined>(
  undefined,
);

export const DragOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);
  const body = document.querySelector("body");

  return (
    <DragOverlayContext.Provider
      value={{
        isDragging,
        setIsDragging,
        setIsDraggingDisabled,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDragEnter={() => {
          if (!isDraggingDisabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(e) => {
          if (
            (e.clientX <= 0 && e.clientX <= (body as any)?.clientWidth) ||
            (e.clientY <= 0 && e.clientY <= (body as any)?.clientHeight)
          ) {
            setIsDragging(false);
          }
        }}
        className="z-88 min-h-screen w-full"
      >
        {children}
      </div>
    </DragOverlayContext.Provider>
  );
};

export const useDragOverlay = (): DragOverlayContextProps => {
  const context = useContext(DragOverlayContext);
  if (!context)
    throw new Error("useDragOverlay must be used within DragOverlayProvider");
  return context;
};
