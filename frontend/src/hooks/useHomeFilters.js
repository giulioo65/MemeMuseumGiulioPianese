import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Gestisce lo stato dei filtri della HomePage e la sincronizzazione con i query param dell'URL.
 * Separando questa logica dalla pagina si evita che ogni input di filtro
 * provochi un re-render dell'intera HomePage.
 */
export function useHomeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Valori correnti letti dall'URL (source of truth per i filtri applicati)
  const selectedTag      = searchParams.get("tag")      || "";
  const selectedAuthor   = searchParams.get("author")   || "";
  const selectedUserId   = searchParams.get("userId")   || "";
  const selectedUsername = searchParams.get("username") || "";
  const selectedDateFrom = searchParams.get("dateFrom") || "";
  const selectedDateTo   = searchParams.get("dateTo")   || "";
  const selectedSort     = searchParams.get("sort")     || "";
  const selectedPage     = Number(searchParams.get("page")) || 1;

  const hasActiveFilters =
    selectedTag || selectedAuthor || selectedUserId ||
    selectedDateFrom || selectedDateTo || selectedSort;

  // Stato locale dei campi del form filtri (modificati prima di applicare)
  const [showFilters,  setShowFilters]  = useState(false);
  const [tagInput,     setTagInput]     = useState(selectedTag);
  const [authorInput,  setAuthorInput]  = useState(selectedAuthor);
  const [dateFromInput,setDateFromInput]= useState(selectedDateFrom);
  const [dateToInput,  setDateToInput]  = useState(selectedDateTo);
  const [sortInput,    setSortInput]    = useState(selectedSort);

  // Sincronizza i campi del form quando l'URL cambia esternamente
  // (es. click su un tag da MemeCard o navigazione diretta con parametri)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setTagInput(selectedTag);
    setAuthorInput(selectedAuthor);
    setDateFromInput(selectedDateFrom);
    setDateToInput(selectedDateTo);
    setSortInput(selectedSort);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedTag, selectedAuthor, selectedDateFrom, selectedDateTo, selectedSort]);

  function applyFilters(event) {
    if (event) event.preventDefault();
    const params = {};
    if (tagInput.trim())    params.tag    = tagInput.trim();
    if (authorInput.trim()) params.author = authorInput.trim();
    if (selectedUserId)     params.userId = selectedUserId;
    if (dateFromInput)      params.dateFrom = dateFromInput;
    if (dateToInput)        params.dateTo   = dateToInput;
    if (sortInput)          params.sort     = sortInput;
    params.page = "1";
    setSearchParams(params);
  }

  function resetFilters() {
    setTagInput("");
    setAuthorInput("");
    setDateFromInput("");
    setDateToInput("");
    setSortInput("");
    setSearchParams({});
  }

  function handlePageChange(page) {
    const params = {};
    if (selectedTag)      params.tag      = selectedTag;
    if (selectedAuthor)   params.author   = selectedAuthor;
    if (selectedUserId)   params.userId   = selectedUserId;
    if (selectedDateFrom) params.dateFrom = selectedDateFrom;
    if (selectedDateTo)   params.dateTo   = selectedDateTo;
    if (selectedSort)     params.sort     = selectedSort;
    params.page = String(page);
    setSearchParams(params);
  }

  return {
    // Valori URL (filtri applicati)
    selectedTag, selectedAuthor, selectedUserId, selectedUsername,
    selectedDateFrom, selectedDateTo, selectedSort, selectedPage,
    hasActiveFilters,

    // Stato form locale
    showFilters, setShowFilters,
    tagInput, setTagInput,
    authorInput, setAuthorInput,
    dateFromInput, setDateFromInput,
    dateToInput, setDateToInput,
    sortInput, setSortInput,

    // Azioni
    applyFilters,
    resetFilters,
    handlePageChange,
  };
}
