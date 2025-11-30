import {
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  SandpackConfig,
  sandpackPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import { useNoteStore } from "../../stores/notesStore";
import { useEffect } from "react";
import { useUIStore } from "../../stores/uiStore";

const simpleSandpackConfig: SandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live react",
      sandpackTemplate: "react",
      sandpackTheme: "dark",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
    },
  ],
};

export const Editor = () => {
  const { selectedNote, setContent, setTitle, updateNote } = useNoteStore();
  const { updating, setUpdating } = useUIStore();

  useEffect(() => {
    if (!selectedNote) return;

    const timer = setTimeout(async () => {
      setUpdating(true);
      handleUpdate();
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedNote]);

  const handleUpdate = async () => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id);
    console.log(selectedNote.id);

    setTimeout(() => {
      setUpdating(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6">
      {/* Title input */}
      <input
        type="text"
        placeholder="Untitled note..."
        value={selectedNote?.title || ""}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-0 py-3 mb-4 text-3xl font-semibold bg-transparent border-b border-ctp-surface2 focus:outline-none focus:border-ctp-mauve transition-colors placeholder:text-ctp-overlay0 text-ctp-text"
      />
      <div className="flex-1">
        <MDXEditor
          markdown={selectedNote?.content || ""}
          key={selectedNote?.id || "new"}
          onChange={setContent}
          className="prose prose-invert max-w-none text-ctp-text h-full dark-editor dark-mode"
          plugins={[
            headingsPlugin(),
            toolbarPlugin({
              toolbarClassName: "toolbar",
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                </>
              ),
            }),

            tablePlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
            sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                js: "JavaScript",
                css: "CSS",
                python: "Python",
                typescript: "TypeScript",
                html: "HTML",
              },
            }),
            imagePlugin(),
            markdownShortcutPlugin(),
            diffSourcePlugin({
              viewMode: "rich-text",
              diffMarkdown: "boo",
            }),
          ]}
        />
      </div>
    </div>
  );
};
