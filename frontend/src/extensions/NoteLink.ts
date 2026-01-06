import { Mark, markInputRule } from "@tiptap/core";

export const NoteLink = Mark.create({
  name: "noteLink",
  inclusive: false,
  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute("data-note-id");
        },
        renderHTML: (attributes) => {
          return {
            "data-note-id": attributes.noteId,
          };
        },
      },
      title: {
        default: "",
        parseHTML: (element) => {
          return element.getAttribute("data-title");
        },
        renderHTML: (attributes) => {
          return {
            "data-title": attributes.title,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[data-note-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", { ...HTMLAttributes, class: "note-link" }, 0];
  },

  addInputRules() {
    return [
      markInputRule({
        find: /\[\[([^\]]+)\]\]$/,
        type: this.type,
        getAttributes: (match) => {
          const title = match[1];
          // TODO: Look up noteId from title
          return {
            title,
            noteId: null, // For now
          };
        },
      }),
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize: (state, mark, parent, index) => {
          // Get the text content
          const textContent = parent.child(index).text || mark.attrs.title;

          // Return the complete link, no wrapping
          return `[[${mark.attrs.title}:${mark.attrs.noteId}]]`;
        },
      },
    };
  },
});
