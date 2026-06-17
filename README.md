# tiptap-marquee-selection

---

A [Tiptap](https://tiptap.dev) extension to mimic Notion marquee selection

## Installation

```bash
yarn add tiptap-marquee-selection @tiptap/extension-node-range
```

## Usage

This extension rely on the Node Range tiptap extension

### Import packages

```typescript
import { MarqueeSelection } from 'tiptap-marquee-selection';
import NodeRange from '@tiptap/extension-node-range';
```

### Register extensions in the editor

```typescript
extensions: [
  StarterKit,
  MarqueeSelection,
  NodeRange,
]
```

### Add styles to selected nodes and the overlay

```css
.ProseMirror-selectednoderange:after {
    content: "";
    position: absolute;
    left: -0.4rem;
    right: -0.4rem;
    top: -0.4rem;
    bottom: -0.4rem;
    background: rgba(35, 131, 226, 0.14);
    pointer-events: none;

    z-index: 10;
    border-radius: 4px;
    opacity: 1;
}


.ProseMirror:has(.ProseMirror-selectednoderange) .ProseMirror-cursor {
    display: none;
}

.marquee-overlay {
    position: fixed;
    background: rgba(35, 131, 226, 0.14);
    border: 1px solid rgba(35, 131, 226, 0.14);
    pointer-events: none;
    z-index: 9999;
}

```

