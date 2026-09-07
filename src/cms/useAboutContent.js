import { useCallback, useEffect, useState } from "react";
import {
  getAboutContent,
  resetAboutContent,
  saveAboutContent,
  subscribeAboutContent,
} from "./aboutStore";

export function useAboutContent() {
  const [content, setContentState] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getAboutContent();
    setContentState(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeAboutContent(() => {
      refresh();
    });
  }, [refresh]);

  const setContent = useCallback(async (next) => {
    const value =
      typeof next === "function" ? next(await getAboutContent()) : next;
    await saveAboutContent(value);
    setContentState(value);
  }, []);

  const restoreDefaults = useCallback(async () => {
    const defaults = await resetAboutContent();
    setContentState(defaults);
  }, []);

  return {
    content,
    loading,
    setContent,
    restoreDefaults,
  };
}
