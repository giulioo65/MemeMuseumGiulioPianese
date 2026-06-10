import { useState, useEffect } from "react";
import { getMemes, deleteMeme } from "../api/memeApi";

/**
 * Gestisce il caricamento e l'eliminazione dei meme dell'utente loggato.
 */
export function useMyMemes({ token, user, isAuthenticated, authLoaded }) {
  const [memes,       setMemes]       = useState([]);
  const [deletingId,  setDeletingId]  = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!authLoaded) return;
    if (!isAuthenticated) { setLoading(false); return; } // eslint-disable-line react-hooks/set-state-in-effect
    if (!user?.id) return;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getMemes(token, { userId: user.id, page: currentPage, sort: "newest" });
        const loaded = Array.isArray(data) ? data : data.memes || [];
        setMemes(loaded);
        setTotalPages(Array.isArray(data) ? 1 : data.totalPages  || 1);
        setTotalItems(Array.isArray(data) ? loaded.length : data.totalItems || 0);
      } catch (err) {
        console.error("Errore caricamento miei meme:", err);
        setError("Errore durante il caricamento dei tuoi meme");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authLoaded, isAuthenticated, user?.id, token, currentPage]);

  async function handleDelete(memeId) {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questo meme? Questa azione non può essere annullata."
    );
    if (!confirmed) return;
    try {
      setDeletingId(memeId);
      await deleteMeme(memeId, token);
      setMemes((prev) => prev.filter((m) => m.id !== memeId));
      setTotalItems((prev) => prev - 1);
    } catch (err) {
      console.error("Errore eliminazione meme:", err);
      setError("Errore durante l'eliminazione del meme");
    } finally {
      setDeletingId(null);
    }
  }

  return {
    memes, deletingId, currentPage, setCurrentPage,
    totalPages, totalItems, loading, error, handleDelete,
  };
}
