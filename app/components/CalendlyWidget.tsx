"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
      closePopupWidget: () => void;
    };
  }
}

function useCalendlyScript() {
  useEffect(() => {
    if (document.getElementById("calendly-script")) return;

    const link = document.createElement("link");
    link.id = "calendly-css";
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.id = "calendly-script";
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

export function CalendlyPopupButton({
  url,
  label = "Book a Call",
  className,
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  useCalendlyScript();

  return (
    <button
      onClick={() => window.Calendly?.initPopupWidget({ url })}
      className={className}
    >
      {label}
    </button>
  );
}

export function CalendlyInline({ url }: { url: string }) {
  useCalendlyScript();

  return (
    <div
      className="calendly-inline-widget w-full rounded overflow-hidden"
      data-url={url}
      style={{ minWidth: 280, height: 660 }}
    />
  );
}
