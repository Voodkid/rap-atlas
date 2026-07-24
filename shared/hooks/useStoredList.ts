import { useEffect, useState } from "react";

export function useStoredList(key: string, legacyKey: string) {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/__state?key=${encodeURIComponent(key)}`, { cache: "no-store" });
        if (response.ok) {
          const stored = await response.json();
          if (!cancelled && Array.isArray(stored)) setItems(stored.filter((item): item is string => typeof item === "string"));
        } else {
          const legacy = window.localStorage.getItem(legacyKey);
          if (!cancelled && legacy) setItems(JSON.parse(legacy));
        }
      } catch {
        try {
          const legacy = window.localStorage.getItem(legacyKey);
          if (!cancelled && legacy) setItems(JSON.parse(legacy));
        } catch {
          if (!cancelled) setItems([]);
        }
      }
      if (!cancelled) setReady(true);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key, legacyKey]);

  useEffect(() => {
    if (!ready) return;
    const body = JSON.stringify(items);
    fetch(`/__state?key=${encodeURIComponent(key)}`, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).then((response) => {
      if (response.ok) window.localStorage.removeItem(legacyKey);
      else window.localStorage.setItem(legacyKey, body);
    }).catch(() => window.localStorage.setItem(legacyKey, body));
  }, [items, key, legacyKey, ready]);

  return [items, setItems] as const;
}
