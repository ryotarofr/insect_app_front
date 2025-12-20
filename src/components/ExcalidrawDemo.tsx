import { onMount, onCleanup } from "solid-js";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

export default function ExcalidrawDemo() {
  let containerRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!containerRef) return;

    const root = createRoot(containerRef);
    root.render(createElement(Excalidraw));

    onCleanup(() => {
      root.unmount();
    });
  });

  return (
    <div style={{ width: "100%", height: "100%" }} ref={containerRef} />
  );
}
