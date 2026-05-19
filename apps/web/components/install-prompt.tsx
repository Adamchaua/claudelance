"use client";

import * as React from "react";

const DISMISS_KEY = "claudelance-install-prompt-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPrompt() {
  const [event, setEvent] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "true");

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "true");
    };

    const handleAppInstalled = () => {
      setEvent(null);
      window.localStorage.setItem(DISMISS_KEY, "true");
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const install = async () => {
    if (!event) return;

    await event.prompt();
    const choice = await event.userChoice.catch(() => null);
    setEvent(null);

    if (choice?.outcome !== "dismissed") {
      window.localStorage.setItem(DISMISS_KEY, "true");
      setDismissed(true);
    }
  };

  if (!event || dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-emerald-400/30 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur md:left-auto md:right-6 md:max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Install Claudelance</p>
          <p className="mt-1 text-xs text-slate-300">Add the app to your home screen for faster bounty work.</p>
        </div>
        <button className="min-h-11 min-w-11 rounded-full text-slate-300 hover:text-white" onClick={dismiss} aria-label="Dismiss install prompt">
          x
        </button>
      </div>
      <button
        className="mt-3 min-h-11 w-full rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950"
        onClick={install}
      >
        Install app
      </button>
    </div>
  );
}
