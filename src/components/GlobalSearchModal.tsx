import React, { useEffect } from "react";
import GlobalSearchComponent from "./GlobalSearchComponent";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialQuery?: string;
  onNavigateToScene?: (sceneId: string, highlightWord?: string) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  projectId,
  initialQuery = "",
  onNavigateToScene,
}: GlobalSearchModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl h-[85vh] bg-[#FCFAF5] rounded-2xl shadow-2xl overflow-hidden border border-[#E5E0D5] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <GlobalSearchComponent
          projectId={projectId}
          initialQuery={initialQuery}
          isModal={true}
          onClose={onClose}
          onNavigateToScene={onNavigateToScene}
        />
      </div>
    </div>
  );
}
