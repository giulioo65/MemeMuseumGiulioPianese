import { useState, useEffect, useRef } from "react";
import { createMeme } from "../api/memeApi";

/**
 * Gestisce tutto lo stato e la logica del form di creazione meme.
 * Separato da CreateMemePage per ridurre gli useState nella pagina.
 */
export function useCreateMeme({ token, isAuthenticated, navigate }) {
  const [title,          setTitle]          = useState("");
  const [description,    setDescription]    = useState("");
  const [imageUrl,       setImageUrl]       = useState("");
  const [imageFile,      setImageFile]      = useState(null);
  const [filePreview,    setFilePreview]    = useState("");
  const [tagInput,       setTagInput]       = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const resetRef = useRef(null);

  // Genera URL di anteprima quando cambia il file
  useEffect(() => {
    if (!imageFile) { setFilePreview(""); return; }
    const url = URL.createObjectURL(imageFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function showError(msg) {
    setError(msg);
    setErrorModalOpen(true);
  }

  function getTagsArray() {
    return [
      ...new Set(
        tagInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      ),
    ];
  }

  function handleFileChange(file) {
    setImageFile(file);
    if (file) setImageUrl("");
  }

  function handleUrlChange(value) {
    setImageUrl(value);
    if (value.trim()) setImageFile(null);
  }

  function clearFile() {
    setImageFile(null);
    resetRef.current?.();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      showError("Devi effettuare il login per creare un meme");
      return;
    }

    const tags = getTagsArray();

    if (!title.trim()) {
      showError("Il titolo è obbligatorio. Inserisci un titolo per il tuo meme.");
      return;
    }
    if (!imageFile && !imageUrl.trim()) {
      showError("Devi fornire un'immagine. Carica un file dal tuo PC oppure inserisci un URL immagine valido.");
      return;
    }
    if (tags.length === 0) {
      showError("Inserisci almeno un tag per categorizzare il tuo meme (es. Gatto, Programmazione).");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title",       title.trim());
      formData.append("description", description.trim());
      formData.append("tags",        tags.join(","));
      if (imageFile) formData.append("image",    imageFile);
      else           formData.append("imageUrl", imageUrl.trim());

      const data = await createMeme(formData, token);
      navigate(`/memes/${data.meme.id}`);
    } catch (err) {
      console.error(err);
      showError("Errore durante la creazione del meme. Riprova tra qualche istante.");
    } finally {
      setLoading(false);
    }
  }

  return {
    title, setTitle,
    description, setDescription,
    imageUrl, imageFile, filePreview,
    tagInput, setTagInput,
    resetRef,
    loading, error, errorModalOpen, setErrorModalOpen,
    handleFileChange, handleUrlChange, clearFile, handleSubmit,
  };
}
