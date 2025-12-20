import { Title } from "@solidjs/meta";
import { lazy, Suspense } from "solid-js";

const ExcalidrawDemo = lazy(() => import("~/components/ExcalidrawDemo"));

export default function ExcalidrawPage() {
  return (
    <main style={{ height: "100vh", margin: "0", padding: "0" }}>
      <Title>Excalidraw Demo</Title>
      <Suspense fallback={
        <div style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "font-size": "18px",
          color: "#666"
        }}>
          Loading Excalidraw...
        </div>
      }>
        <ExcalidrawDemo />
      </Suspense>
    </main>
  );
}
