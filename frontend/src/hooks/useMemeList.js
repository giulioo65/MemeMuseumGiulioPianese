import { useState, useEffect } from "react";
import { getMemes }         from "../api/memeApi";
import { getMemeOfTheDay }  from "../api/todayApi";

/**
 * Carica la lista dei meme in base ai filtri URL e il meme del giorno.
 * Separato dalla HomePage per ridurre gli useState nella pagina principale.
 */
export function useMemeList({ token, authLoaded, filters, showMemeOfDay }) {
  const [memes,       setMemes]       = useState([]);
  const [memeOfTheDay,setMemeOfTheDay]= useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  const serializedFilters = JSON.stringify(filters);

  useEffect(() => {
    if (!authLoaded) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        if (showMemeOfDay) {
          getMemeOfTheDay(token)
            .then(setMemeOfTheDay)
            .catch((err) => console.error("Meme del giorno:", err));
        }

        const data = await getMemes(token, filters);
        const loaded = Array.isArray(data) ? data : data.memes || [];
        setMemes(loaded);
        setCurrentPage(Array.isArray(data) ? 1 : data.currentPage || 1);
        setTotalPages(Array.isArray(data)  ? 1 : data.totalPages  || 1);
        setTotalItems(Array.isArray(data)  ? loaded.length : data.totalItems || 0);
      } catch (err) {
        console.error(err);
        setError("Errore durante il caricamento dei meme");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authLoaded, token, serializedFilters, showMemeOfDay]); // eslint-disable-line react-hooks/exhaustive-deps

  return { memes, memeOfTheDay, currentPage, totalPages, totalItems, loading, error };
}
