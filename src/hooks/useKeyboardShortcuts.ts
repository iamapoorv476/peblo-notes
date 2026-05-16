import { useEffect } from "react";

interface Shortcuts {
  onSave?: () => void;
  onNewNote?: () => void;
  onPreviewToggle?: () => void;
}

export function useKeyboardShortcuts({
  onSave,
  onNewNote,
  onPreviewToggle,
}: Shortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+S — Save
      if (ctrl && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl+Shift+N — New note
      if (ctrl && e.shiftKey && e.key === "N") {
        e.preventDefault();
        onNewNote?.();
      }

      // Ctrl+Shift+P — Preview toggle
      if (ctrl && e.shiftKey && e.key === "P") {
        e.preventDefault();
        onPreviewToggle?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onNewNote, onPreviewToggle]);
}