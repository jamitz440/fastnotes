// src/pages/TestPage.tsx
import { FC } from "react";
import Markdown from "react-markdown";
import { MDXEditor, SandpackConfig } from "@mdxeditor/editor";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  sandpackPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

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

export const MarkdownPage: FC = () => {
  const markdown = `
  # This is *perfect*!
  - TestPage
    - te
  `;
  return (
    <MDXEditor
      markdown={markdown}
      plugins={[
        toolbarPlugin({
          toolbarClassName: "my-class",
          toolbarContents: () => (
            <>
              <BoldItalicUnderlineToggles />
            </>
          ),
        }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
        sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
        codeMirrorPlugin({
          codeBlockLanguages: { js: "JavaScript", css: "CSS" },
        }),
        markdownShortcutPlugin(),
      ]}
    />
  );
};
