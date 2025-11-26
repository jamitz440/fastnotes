import { useState } from "react";
import JSZip from "jszip";
import { folderApi } from "../api/folders";
import { notesApi } from "../api/notes";

export const Import = () => {
  const [file, setFile] = useState<File | null>(null);

  // Recursive function to create folders and notes
  const createFromStructure = async (
    structure: any,
    parentFolderId: number | null = null,
  ): Promise<void> => {
    for (const [name, item] of Object.entries(structure)) {
      if (item.type === "folder") {
        // Create the folder
        const { data: newFolder } = await folderApi.create({
          name: name,
          parent_id: parentFolderId,
        });

        console.log(`Created folder: ${name} (id: ${newFolder.id})`);

        // Recursively process children
        if (item.children && Object.keys(item.children).length > 0) {
          await createFromStructure(item.children, newFolder.id);
        }
      } else if (item.type === "file") {
        // Parse the markdown file
        const fileName = name.replace(".md", "");
        const { title, content } = parseFrontmatter(item.content, fileName);

        // Create the note
        await notesApi.create({
          title,
          content,
          folder_id: parentFolderId,
          encrypted: false,
        });

        console.log(`Created note: ${title} in folder ${parentFolderId}`);
      }
    }
  };

  // Helper to parse frontmatter (if you used it in export)
  const parseFrontmatter = (markdown: string, defaultTitle: string) => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontmatterRegex);

    if (match) {
      const frontmatter = match[1];
      const content = match[2].trim();
      const titleMatch = frontmatter.match(/title:\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : defaultTitle;
      return { title, content };
    }

    return { title: defaultTitle, content: markdown };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(selectedFile);
      const structure: any = {};

      console.log("Files in zip:");

      // Build structure (your existing code)
      for (const [relativePath, file] of Object.entries(contents.files)) {
        if (relativePath.includes(".md")) {
          const splitPath = relativePath.split("/");
          let current = structure;

          for (let i = 0; i < splitPath.length; i++) {
            const part = splitPath[i];

            if (i === splitPath.length - 1) {
              if (part.includes(".md")) {
                const content = await file.async("string");
                current[part] = {
                  type: "file",
                  content: content,
                };
              }
            } else {
              if (!current[part]) {
                current[part] = {
                  type: "folder",
                  children: {},
                };
              }
              current = current[part].children;
            }
          }
        }
      }

      console.log("Structure:", structure);

      // Create folders and notes from structure
      await createFromStructure(structure);

      console.log("Import complete!");

      // Optional: Show success message or redirect
      alert("Import successful!");
    } catch (error) {
      console.error("Error processing zip:", error);
      alert("Import failed: " + error.message);
    }
  };

  return (
    <>
      {file && <div>Selected: {file.name}</div>}
      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange} // Remove value prop
      />
    </>
  );
};
