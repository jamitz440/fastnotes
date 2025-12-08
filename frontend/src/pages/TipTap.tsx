import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { ListKit } from "@tiptap/extension-list";
import "./tiptap.css";
// @ts-ignore
import BoldIcon from "../assets/fontawesome/svg/bold.svg?react";
// @ts-ignore
import ItalicIcon from "../assets/fontawesome/svg/italic.svg?react";
// @ts-ignore
import StrikethroughIcon from "../assets/fontawesome/svg/strikethrough.svg?react";
// @ts-ignore
import CodeIcon from "../assets/fontawesome/svg/code.svg?react";
// @ts-ignore
import ListUlIcon from "../assets/fontawesome/svg/list-ul.svg?react";
// @ts-ignore
import ListOlIcon from "../assets/fontawesome/svg/list-ol.svg?react";
// @ts-ignore
import SquareCheckIcon from "../assets/fontawesome/svg/square-check.svg?react";
// @ts-ignore
import CodeBracketIcon from "../assets/fontawesome/svg/code-simple.svg?react";
// @ts-ignore
import QuoteLeftIcon from "../assets/fontawesome/svg/quote-left.svg?react";

interface TiptapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export const TiptapEditor = ({
  placeholder,
  content,
  onChange,
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      ListKit,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "code-block",
          },
        },
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = (
        editor.storage as Record<string, any>
      ).markdown.getMarkdown();
      onChange(markdown);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor h-full">
      {/* Toolbar */}
      {/*<div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "active" : ""}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon className="w-4 h-4 fill-ctp-text" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "active" : ""}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon className="w-4 h-4 fill-ctp-text" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "active" : ""}
            title="Strikethrough"
          >
            <StrikethroughIcon className="w-4 h-4 fill-ctp-text" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "active" : ""}
            title="Inline code"
          >
            <CodeIcon className="w-4 h-4 fill-ctp-text" />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={editor.isActive("heading", { level: 3 }) ? "active" : ""}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "active" : ""}
            title="Bullet list"
          >
            <ListUlIcon className="w-4 h-4 fill-ctp-text" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "active" : ""}
            title="Numbered list"
          >
            <ListOlIcon className="w-4 h-4 fill-ctp-text" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive("taskList") ? "active" : ""}
            title="Task list"
          >
            <SquareCheckIcon className="w-4 h-4 fill-ctp-text" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "active" : ""}
            title="Code block"
          >
            <CodeBracketIcon className="w-4 h-4 fill-ctp-text" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "active" : ""}
            title="Quote"
          >
            <QuoteLeftIcon className="w-4 h-4 fill-ctp-text" />
          </button>
        </div>

        <div className="toolbar-divider"></div>
      </div>*/}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="editor-content h-min-screen p-4!"
      />
    </div>
  );
};
