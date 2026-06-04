import { NodeRangeSelection } from "@tiptap/extension-node-range";
import { Node } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

const getClosestScrollableParent = (element: HTMLElement) => {
  let scrollContainer = element;
  while (scrollContainer) {
    const { overflowY } = window.getComputedStyle(scrollContainer);
    if (overflowY === "scroll" || overflowY === "auto") break;
    scrollContainer = scrollContainer.parentElement as HTMLElement;
  }

  return scrollContainer;
};

const getResolvedPositions = (doc: Node, from: number) => {
  const $from = doc.resolve(from);
  const node = $from.nodeAfter!;
  const to = $from.node(0).resolve($from.pos + node.nodeSize);

  return {
    from: $from,
    to,
  };
};

const OVERLAY_CLASSNAME = "marquee-overlay";

export const startMarqueeSelection = (
  view: EditorView,
  startEvent: MouseEvent,
) => {
  startEvent.preventDefault();
  view.dom.blur();

  let scrollContainer = getClosestScrollableParent(view.dom);
  if (!scrollContainer) scrollContainer = document.body;

  const startX = startEvent.clientX;
  const startY = startEvent.clientY;
  const startScrollTop = scrollContainer.scrollTop;
  const startScrollLeft = scrollContainer.scrollLeft;

  let currentX = startEvent.clientX;
  let currentY = startEvent.clientY;
  let scrollFrameId: number | null = null;

  const overlay = document.createElement("div");
  overlay.className = OVERLAY_CLASSNAME;
  document.body.appendChild(overlay);

  const selectIntersectingBlocks = (marqueeRect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }) => {
    const { doc } = view.state;
    let startPos: number | null = null;
    let endPos: number | null = null;

    doc.forEach((node, offset) => {
      const dom = view.nodeDOM(offset);
      if (!dom || !(dom instanceof HTMLElement)) return;
      const nodeRect = dom.getBoundingClientRect();

      const intersects =
        marqueeRect.left < nodeRect.right &&
        marqueeRect.right > nodeRect.left &&
        marqueeRect.top < nodeRect.bottom &&
        marqueeRect.bottom > nodeRect.top;

      if (intersects) {
        if (startPos === null) startPos = offset;
        endPos = offset;
      }
    });

    if (startPos !== null && endPos !== null) {
      const $anchor = getResolvedPositions(doc, startPos);
      const $head = getResolvedPositions(doc, endPos);

      view.dispatch(
        view.state.tr.setSelection(
          NodeRangeSelection.create(
            view.state.doc,
            $anchor.from.pos,
            $head.to.pos,
          ),
        ),
      );
    } else if (endPos !== null) {
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, endPos),
        ),
      );
    }
  };

  const updateSelection = () => {
    const scrollDiffX = scrollContainer.scrollLeft - startScrollLeft;
    const scrollDiffY = scrollContainer.scrollTop - startScrollTop;

    const effectiveStartX = startX - scrollDiffX;
    const effectiveStartY = startY - scrollDiffY;

    const rawLeft = Math.min(effectiveStartX, currentX);
    const rawTop = Math.min(effectiveStartY, currentY);
    const rawRight = Math.max(effectiveStartX, currentX);
    const rawBottom = Math.max(effectiveStartY, currentY);

    const containerRect =
      scrollContainer === document.body
        ? {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        }
        : scrollContainer.getBoundingClientRect();

    const clippedLeft = Math.max(rawLeft, containerRect.left);
    const clippedTop = Math.max(rawTop, containerRect.top);
    const clippedRight = Math.max(
      clippedLeft,
      Math.min(rawRight, containerRect.right),
    );
    const clippedBottom = Math.max(
      clippedTop,
      Math.min(rawBottom, containerRect.bottom),
    );

    overlay.style.left = `${clippedLeft}px`;
    overlay.style.top = `${clippedTop}px`;
    overlay.style.width = `${clippedRight - clippedLeft}px`;
    overlay.style.height = `${clippedBottom - clippedTop}px`;

    selectIntersectingBlocks({
      left: rawLeft,
      top: rawTop,
      right: rawRight,
      bottom: rawBottom,
    });
  };

  const checkAutoScroll = () => {
    const scrollSpeed = 10;
    const scrollThreshold = 50;

    const isBody =
      scrollContainer === document.body ||
      scrollContainer === document.scrollingElement;
    const rect = isBody
      ? { top: 0, bottom: window.innerHeight }
      : scrollContainer.getBoundingClientRect();

    let scrollY = 0;
    if (currentY < rect.top + scrollThreshold) {
      scrollY = -scrollSpeed;
    } else if (currentY > rect.bottom - scrollThreshold) {
      scrollY = scrollSpeed;
    }

    if (scrollY !== 0) {
      scrollContainer.scrollTop += scrollY;
      updateSelection();
      if (!scrollFrameId) {
        scrollFrameId = requestAnimationFrame(checkAutoScroll);
      }
    } else if (scrollFrameId) {
      cancelAnimationFrame(scrollFrameId);
      scrollFrameId = null;
    }
  };

  const onMove = (e: MouseEvent) => {
    currentX = e.clientX;
    currentY = e.clientY;
    updateSelection();
    checkAutoScroll();
  };

  const onUp = () => {
    if (overlay.parentNode) document.body.removeChild(overlay);
    if (scrollFrameId) cancelAnimationFrame(scrollFrameId);

    if (view.isDestroyed) {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      return;
    }

    view.focus();

    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
};
