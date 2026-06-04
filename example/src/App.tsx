"use client";

import { Tiptap, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import NodeRange from "@tiptap/extension-node-range";
import { MarqueeSelection } from "tiptap-marquee-selection";

export const App = () => {
  const editor = useEditor({
    extensions: [StarterKit, MarqueeSelection, NodeRange],
    content: "<p>Hello World!</p>",
  });

  return (
    <Tiptap editor={editor}>
      <Tiptap.Content />
    </Tiptap>
  );
};
