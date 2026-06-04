import { Extension } from "@tiptap/core";
import { NodeRangeSelection } from "@tiptap/extension-node-range";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { keydownHandler } from "@tiptap/pm/keymap";
import { startMarqueeSelection } from "./helper.js";

const selectionPlugin = new Plugin({
  key: new PluginKey("marquee-selection"),
  props: {
    handleKeyDown(view, event) {
      if (!view.editable) {
        return false;
      }

      const handler = keydownHandler({
        Escape: (state) => {
          if (state.selection instanceof NodeRangeSelection) {
            view.dispatch(
              view.state.tr.setSelection(
                TextSelection.create(view.state.doc, state.selection.to - 1),
              ),
            );
            return true;
          }
          return false;
        },
      });

      return handler(view, event);
    },
    handleDOMEvents: {
      mousedown(view, event) {
        const { selection } = view.state;

        if (event.shiftKey && selection instanceof NodeRangeSelection) {
          event.preventDefault();
          const result = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (!result) return false;

          const $pos = view.state.doc.resolve(result.pos);
          const nodePos = $pos.depth === 0 ? $pos.pos : $pos.before();
          const node = $pos.node();

          const { from, to } = selection;
          const $start = from < to ? from : to;
          const $end = from > to ? from : to;

          if (nodePos < $start) {
            view.dispatch(
              view.state.tr.setSelection(
                NodeRangeSelection.create(view.state.doc, nodePos, $end),
              ),
            );
          } else if (nodePos + node.nodeSize > $end) {
            view.dispatch(
              view.state.tr.setSelection(
                NodeRangeSelection.create(
                  view.state.doc,
                  $start,
                  nodePos + node.nodeSize,
                ),
              ),
            );
          } else {
            view.dispatch(
              view.state.tr.setSelection(
                NodeRangeSelection.create(
                  view.state.doc,
                  from,
                  nodePos + node.nodeSize,
                ),
              ),
            );
          }
          return true;
        }

        const target = event.target as HTMLElement;
        const isGutterClick = target === view.dom;
        const isForceKey = event.altKey;

        if (isGutterClick || isForceKey) {
          startMarqueeSelection(view, event);
          return true;
        }

        return false;
      },
    },
  },
});

export const MarqueeSelection = Extension.create({
  name: "marqueeSelection",

  addProseMirrorPlugins() {
    return [selectionPlugin];
  },
});
