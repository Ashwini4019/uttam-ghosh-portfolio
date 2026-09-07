import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  resetCategories,
  saveCategories,
  subscribeCategories,
} from "./categoryStore";

export function useCategories() {
  const [categories, setCategoriesState] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getCategories();
    setCategoriesState(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeCategories(() => {
      refresh();
    });
  }, [refresh]);

  const setCategories = useCallback(async (next) => {
    const value = typeof next === "function" ? next(await getCategories()) : next;
    await saveCategories(value);
    setCategoriesState(value);
  }, []);

  const restoreDefaults = useCallback(async () => {
    const defaults = await resetCategories();
    setCategoriesState(defaults);
  }, []);

  return {
    categories,
    loading,
    setCategories,
    restoreDefaults,
  };
}
