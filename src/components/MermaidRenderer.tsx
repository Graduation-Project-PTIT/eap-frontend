import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

interface MermaidRendererProps {
  diagram: string;
  className?: string;
  enableFullscreen?: boolean;
}

// Initialize mermaid once globally
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
  er: {
    useMaxWidth: true,
  },
});

export const MermaidRenderer = ({
  diagram,
  className = "",
  enableFullscreen = true,
}: MermaidRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const renderCountRef = useRef(0);

  // Render main preview
  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagram) {
        return;
      }

      try {
        setRenderError(null);

        // Generate unique ID for each render
        renderCountRef.current += 1;
        const diagramId = `mermaid-${Date.now()}-${renderCountRef.current}`;

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, diagram);
        setSvgContent(svg);
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setRenderError(errorMessage);
        setSvgContent(`
          <div class="text-destructive p-4 border border-destructive rounded-lg bg-destructive/10">
            <p class="font-semibold">Error rendering diagram</p>
            <p class="text-sm mt-2">${errorMessage}</p>
            <p class="text-xs mt-2 text-muted-foreground">Please check the Mermaid syntax.</p>
          </div>
        `);
      }
    };

    renderDiagram();
  }, [diagram]);

  // Update container when SVG content changes
  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;

      // Make SVG responsive
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        svgElement.style.maxWidth = "100%";
        svgElement.style.height = "auto";
      }
    }
  }, [svgContent]);

  // Update fullscreen container when dialog opens
  useEffect(() => {
    if (isFullscreen && svgContent) {
      // Use setTimeout to ensure the dialog has rendered
      const timer = setTimeout(() => {
        if (fullscreenContainerRef.current) {
          fullscreenContainerRef.current.innerHTML = svgContent;

          // Make SVG responsive
          const svgElement = fullscreenContainerRef.current.querySelector("svg");
          if (svgElement) {
            // Reset any absolute positioning and make it responsive
            svgElement.style.maxWidth = "100%";
            svgElement.style.width = "100%";
            svgElement.style.height = "auto";
            svgElement.style.display = "block";
            svgElement.style.margin = "0 auto";
            svgElement.style.position = "relative";

            // Remove any transform that might be positioning it off-screen
            svgElement.style.transform = "none";
          } else {
            console.error("MermaidRenderer: SVG element not found in fullscreen container");
          }
        } else {
          console.error("MermaidRenderer: Fullscreen container ref is still null after timeout");
        }
      }, 100); // Small delay to let dialog render

      return () => clearTimeout(timer);
    }
  }, [isFullscreen, svgContent]);

  return (
    <>
      <div className="relative">
        <div
          ref={containerRef}
          className={`mermaid-container rounded-lg p-4 bg-white overflow-auto ${className}`}
        />
        {enableFullscreen && !renderError && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              setIsFullscreen(true);
            }}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] flex flex-col p-6"
          aria-describedby="mermaid-fullscreen-description"
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Mermaid Diagram Preview</DialogTitle>
            <DialogDescription id="mermaid-fullscreen-description">
              Fullscreen view of the Mermaid ERD diagram
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex-1 overflow-auto p-4 bg-white rounded-lg border mt-4"
            style={{ minHeight: "400px" }}
          >
            <div
              ref={fullscreenContainerRef}
              className="mermaid-container-fullscreen w-full min-h-full flex items-center justify-center"
              style={{
                minHeight: "400px",
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
