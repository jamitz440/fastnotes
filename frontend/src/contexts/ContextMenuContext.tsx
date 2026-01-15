import React, { createContext, useContext, useState, useEffect } from "react";

interface ContextMenuState {
  x: number;
  y: number;
  type: "note" | "folder" | "editor" | null;
  data: any;
}

interface ContextMenuContextType {
  contextMenu: ContextMenuState | null;
  openContextMenu: (
    x: number,
    y: number,
    type: "note" | "folder" | "editor",
    data: any,
  ) => void;
  closeContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within a ContextMenuProvider");
  }
  return context;
};

export const ContextMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const openContextMenu = (
    x: number,
    y: number,
    type: "note" | "folder" | "editor",
    data: any,
  ) => {
    // Estimate menu height (you can adjust this based on your menu)
    const menuHeight = 200;
    const menuWidth = 160;

    // Adjust y position if too close to bottom
    const adjustedY =
      y + menuHeight > window.innerHeight
        ? window.innerHeight - menuHeight - 10
        : y;

    // Adjust x position if too close to right edge
    const adjustedX =
      x + menuWidth > window.innerWidth
        ? window.innerWidth - menuWidth - 10
        : x;

    setContextMenu({ x: adjustedX, y: adjustedY, type, data });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Close on click outside
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu) {
        closeContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener("click", handleClick);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("click", handleClick);
      document.body.style.overflow = "unset";
    };
  }, [contextMenu]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contextMenu) {
        closeContextMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [contextMenu]);

  return (
    <ContextMenuContext.Provider
      value={{ contextMenu, openContextMenu, closeContextMenu }}
    >
      {contextMenu && (
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            closeContextMenu();
          }}
          className=" h-screen w-screen bg-surface1/25 z-40 fixed top-0 left-0"
        ></div>
      )}
      {children}
    </ContextMenuContext.Provider>
  );
};
