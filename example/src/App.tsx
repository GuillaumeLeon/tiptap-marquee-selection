"use client";

import { Tiptap, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MarqueeSelection } from "@jeunecouy/tiptap-marquee-selection";
import NodeRange, { NodeRangeSelection } from "@tiptap/extension-node-range";

export const App = () => {
  const editor = useEditor({
    extensions: [StarterKit, MarqueeSelection, NodeRange],
    content: "<p>Hello World!</p>",
    onSelectionUpdate: ({ editor: e }) => {
      console.log(e.state.selection, e instanceof NodeRangeSelection);
    },
  });

  return (
    <Tiptap editor={editor}>
      <Tiptap.Content />
    </Tiptap>
  );
};
