import { useState, useEffect } from "react";
import { getMemeById, deleteMeme }        from "../api/memeApi";
import { getCommentsByMeme, createComment } from "../api/commentApi";
import { getMemeVotes, voteMeme }          from "../api/voteApi";

const DEFAULT_VOTES = { upvotes: 0, downvotes: 0, score: 0, userVote: 0 };

/**
 * Carica e gestisce tutti i dati della pagina di dettaglio di un meme:
 * - il meme stesso
 * - i voti (con azione handleVote)
 * - i commenti (con azione handleCreateComment)
 * - l'eliminazione (con azione handleDeleteMeme)
 */
export function useMemeDetail({ id, token, isAuthenticated, authLoaded, navigate, locationPath }) {
  const [meme,          setMeme]          = useState(null);
  const [votes,         setVotes]         = useState(DEFAULT_VOTES);
  const [comments,      setComments]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [voteLoading,   setVoteLoading]   = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [commentText,   setCommentText]   = useState("");
  const [commentLoading,setCommentLoading]= useState(false);
  const [commentError,  setCommentError]  = useState("");

  useEffect(() => {
    if (!authLoaded || !id) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [memeData, commentsData, votesData] = await Promise.all([
          getMemeById(id, token),
          getCommentsByMeme(id, token).catch(() => []),
          getMemeVotes(id, token).catch(() => DEFAULT_VOTES),
        ]);

        setMeme(memeData);
        setComments(commentsData);
        setVotes(votesData);
      } catch (err) {
        console.error("Meme load error:", err);
        setError("Errore durante il caricamento del meme");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, token, authLoaded]);

  async function handleVote(value) {
    if (!isAuthenticated || !token) {
      navigate("/login", { state: { from: locationPath } });
      return;
    }
    try {
      setVoteLoading(true);
      const updated = await voteMeme(id, value, token);
      setVotes(updated);
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setVoteLoading(false);
    }
  }

  async function handleDeleteMeme() {
    if (!isAuthenticated || !token) return;
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questo meme? Questa azione non può essere annullata."
    );
    if (!confirmed) return;
    try {
      setDeleteLoading(true);
      await deleteMeme(id, token);
      navigate("/");
    } catch (err) {
      console.error("Delete meme error:", err);
      setError("Errore durante l'eliminazione del meme");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCreateComment(event) {
    event.preventDefault();
    if (!isAuthenticated || !token) {
      navigate("/login", { state: { from: locationPath } });
      return;
    }
    if (!commentText.trim()) {
      setCommentError("Il commento non può essere vuoto");
      return;
    }
    try {
      setCommentLoading(true);
      setCommentError("");
      await createComment(id, { text: commentText.trim() }, token);
      setCommentText("");
      const updated = await getCommentsByMeme(id, token);
      setComments(updated);
    } catch (err) {
      console.error("Create comment error:", err);
      setCommentError("Errore durante l'invio del commento");
    } finally {
      setCommentLoading(false);
    }
  }

  return {
    meme, votes, comments, loading, error,
    voteLoading, deleteLoading,
    commentText, setCommentText, commentLoading, commentError,
    handleVote, handleDeleteMeme, handleCreateComment,
  };
}
