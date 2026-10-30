"use client";

import { useEffect, useState } from "react";
import { fetchSettings } from "./api";
import { DEFAULT_SETTINGS, type Settings } from "./utils";

// Loads the budget and category lists. Falls back to defaults if loading fails.
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load settings.");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, setSettings, loaded, error };
}
