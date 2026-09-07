import { useCallback, useEffect, useState } from "react";
import { getPlaces, resetPlaces, savePlaces, subscribePlaces } from "./placeStore";

export function usePlaces() {
  const [places, setPlacesState] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getPlaces();
    setPlacesState(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    return subscribePlaces(() => {
      refresh();
    });
  }, [refresh]);

  const setPlaces = useCallback(async (next) => {
    const value = typeof next === "function" ? next(await getPlaces()) : next;
    await savePlaces(value);
    setPlacesState(value);
  }, []);

  const restoreDefaults = useCallback(async () => {
    const defaults = await resetPlaces();
    setPlacesState(defaults);
  }, []);

  return {
    places,
    loading,
    setPlaces,
    restoreDefaults,
  };
}
