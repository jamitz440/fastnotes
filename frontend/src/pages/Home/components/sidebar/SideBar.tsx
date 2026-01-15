import React, { useState, useRef, useEffect } from "react";

// @ts-ignore
import FolderIcon from "@/assets/fontawesome/svg/folder.svg?react";
// @ts-ignore
import TagsIcon from "@/assets/fontawesome/svg/tags.svg?react";
import { DraggableNote } from "./subcomponents/DraggableNote";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { FolderTree } from "./subcomponents/FolderTree.tsx";
import { SidebarHeader } from "./subcomponents/SideBarHeader.tsx";
import { useAuthStore } from "@/stores/authStore.ts";
import { useUIStore } from "@/stores/uiStore.ts";
import {
  useCreateFolder,
  useFolderTree,
  useUpdateFolder,
  useUpdateNote,
} from "@/hooks/useFolders.ts";

export const Sidebar = () => {
  const [newFolder, setNewFolder] = useState(false);
  const [newFolderText, setNewFolderText] = useState("");
  const [activeItem, setActiveItem] = useState<{
    type: "note" | "folder";
    data: any;
  } | null>(null);
  const newFolderRef = useRef<HTMLInputElement>(null);

  const { data: folderTree, isLoading, error } = useFolderTree();
  const createFolder = useCreateFolder();

  const { encryptionKey } = useAuthStore();

  const { setSideBarResize, sideBarResize, setColourScheme } = useUIStore();
  useEffect(() => {
    if (newFolder && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [newFolder]);

  useEffect(() => {
    if (!encryptionKey) return;
  }, [encryptionKey]);

  const handleCreateFolder = async () => {
    if (!newFolderText.trim()) return;
    createFolder.mutate({ name: newFolderText, parentId: null });
  };

  const pointer = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 30,
    },
  });
  const sensors = useSensors(pointer);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "note") {
      setActiveItem({ type: "note", data: active.data.current.note });
    } else if (active.data.current?.type === "folder") {
      setActiveItem({ type: "folder", data: active.data.current.folder });
    }
  };

  const updateNote = useUpdateNote();
  const updateFolder = useUpdateFolder();

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    console.log("Drag ended:", {
      activeId: active.id,
      activeType: active.data.current?.type,
      activeFolder: active.data.current?.folder,
      overId: over.id,
      overType: over.data.current?.type,
    });

    if (active.data.current?.type === "note") {
      console.log("Updating note ", active.id, "to folder", over.id);
      updateNote.mutate({
        noteId: active.id as number,
        note: { folderId: over.id as number },
      });
    } else if (active.data.current?.type === "folder") {
      // Prevent dropping folder into itself
      if (active.data.current.folder.id === over.id) {
        console.log("Cannot drop folder into itself");
        return;
      }

      console.log(
        "Updating folder",
        active.data.current.folder.id,
        "parent to",
        over.id,
      );
      try {
        updateFolder.mutate({
          folderId: active.data.current.folder.id,
          folder: { parentId: over.id as number },
        });
      } catch (error) {
        console.error("Failed to update folder:", error);
        return;
      }
    }
  };

  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate new width based on mouse position from the left edge
      const newWidth = e.clientX;

      if (newWidth >= 200 && newWidth <= 500) {
        setSideBarResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={false}
      sensors={sensors}
    >
      <div className="flex-row-reverse flex h-screen">
        <div
          className="h-full bg-surface1 w-0.5 hover:cursor-ew-resize hover:bg-accent/50 transition-colors"
          onMouseDown={handleMouseDown}
        ></div>
        <div
          className="flex flex-col h-full"
          style={{ width: `${sideBarResize}px` }}
        >
          <SidebarHeader setNewFolder={setNewFolder} />
          <div className="flex-1 overflow-y-auto bg-surface1 border-r border-surface1">
            <>
              <div
                className="w-full p-4 sm:block hidden"
                onDragOver={(e) => e.preventDefault()}
                onTouchMove={(e) => e.preventDefault()}
              >
                {/* New folder input */}
                {newFolder && (
                  <div className="mb-2">
                    <input
                      onBlur={() => setNewFolder(false)}
                      onChange={(e) => setNewFolderText(e.target.value)}
                      value={newFolderText}
                      type="text"
                      placeholder="Folder name..."
                      className="standard-input"
                      ref={newFolderRef}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateFolder();
                        }
                        if (e.key === "Escape") {
                          setNewFolder(false);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Loading state */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8 text-subtext0">
                    <div className="text-sm">Loading folders...</div>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="flex items-center justify-center py-8 text-danger">
                    <div className="text-sm">Failed to load folders</div>
                  </div>
                )}

                {/* Folder tree */}
                {!isLoading && !error && (
                  <>
                    <div className="flex flex-col gap-1">
                      {folderTree?.folders.map((folder) => (
                        <FolderTree key={folder.id} folder={folder} depth={0} />
                      ))}
                    </div>

                    {/* Orphaned notes */}
                    {folderTree?.orphanedNotes &&
                      folderTree.orphanedNotes.length > 0 && (
                        <div className="mt-4 flex flex-col gap-1">
                          {folderTree.orphanedNotes.map((note) => (
                            <DraggableNote key={note.id} note={note} />
                          ))}
                        </div>
                      )}
                  </>
                )}
              </div>
              {/*<div className="fixed bottom-1 left-2">
                <button onClick={setColour}>purple</button>
              </div>*/}

              <DragOverlay>
                {activeItem?.type === "note" && (
                  <div className="bg-surface0 rounded-md px-2 py-1 shadow-lg border border-accent">
                    {activeItem.data.title}
                  </div>
                )}
                {activeItem?.type === "folder" && (
                  <div className="bg-surface0 rounded-md px-1 py-0.5 shadow-lg flex items-center gap-1 text-sm">
                    <FolderIcon className="w-3 h-3 fill-accent mr-1" />
                    {activeItem.data.name}
                  </div>
                )}
              </DragOverlay>
            </>
          </div>
        </div>
      </div>
    </DndContext>
  );
};
