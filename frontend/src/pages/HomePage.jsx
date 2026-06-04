import { useEffect, useState } from "react";
import {
  Container,
  Title,
  SimpleGrid,
  Text,
  Loader,
  Center,
  Alert,
  Card,
  Group,
  Badge,
  Button,
  TextInput,
  Select,
  Pagination,
} from "@mantine/core";

import MemeCard from "../components/MemeCard";
import { getMemes } from "../api/memeApi";
import { getMemeVotes, voteMeme } from "../api/voteApi";
import { getCommentsByMeme } from "../api/commentApi";
import { getMemeOfTheDay } from "../api/todayApi";
import { useAuth } from "../context/AuthContext";
import { Link, useSearchParams } from "react-router-dom";

function HomePage() {
  const { token, user, isAuthenticated, authLoaded } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTag = searchParams.get("tag") || "";
  const selectedAuthor = searchParams.get("author") || "";
  const selectedUserId = searchParams.get("userId") || "";
  const selectedDateFrom = searchParams.get("dateFrom") || "";
  const selectedDateTo = searchParams.get("dateTo") || "";
  const selectedSort = searchParams.get("sort") || "";
  const selectedPage = Number(searchParams.get("page")) || 1;

  const hasActiveFilters =
    selectedTag ||
    selectedAuthor ||
    selectedUserId ||
    selectedDateFrom ||
    selectedDateTo ||
    selectedSort;

  const isMineFilter =
    selectedUserId && user && String(selectedUserId) === String(user.id);

  const [memes, setMemes] = useState([]);
  const [votes, setVotes] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [memeOfTheDay, setMemeOfTheDay] = useState(null);

  const [currentPage, setCurrentPage] = useState(selectedPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voteLoading, setVoteLoading] = useState({});

  const [showFilters, setShowFilters] = useState(false);
  const [tagInput, setTagInput] = useState(selectedTag);
  const [authorInput, setAuthorInput] = useState(selectedAuthor);
  const [dateFromInput, setDateFromInput] = useState(selectedDateFrom);
  const [dateToInput, setDateToInput] = useState(selectedDateTo);
  const [sortInput, setSortInput] = useState(selectedSort);

  function syncFilterInputsFromUrl() {
    setTagInput(selectedTag);
    setAuthorInput(selectedAuthor);
    setDateFromInput(selectedDateFrom);
    setDateToInput(selectedDateTo);
    setSortInput(selectedSort);
  }

  function buildFiltersFromUrl() {
    const filters = {
      page: selectedPage,
    };

    if (selectedTag) filters.tag = selectedTag;
    if (selectedAuthor) filters.author = selectedAuthor;
    if (selectedUserId) filters.userId = selectedUserId;
    if (selectedDateFrom) filters.dateFrom = selectedDateFrom;
    if (selectedDateTo) filters.dateTo = selectedDateTo;
    if (selectedSort) filters.sort = selectedSort;

    return filters;
  }

  function applyFilters(event) {
    if (event) {
      event.preventDefault();
    }

    const params = {};

    if (tagInput.trim()) params.tag = tagInput.trim();
    if (authorInput.trim()) params.author = authorInput.trim();
    if (selectedUserId) params.userId = selectedUserId;
    if (dateFromInput) params.dateFrom = dateFromInput;
    if (dateToInput) params.dateTo = dateToInput;
    if (sortInput) params.sort = sortInput;

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

    if (selectedTag) params.tag = selectedTag;
    if (selectedAuthor) params.author = selectedAuthor;
    if (selectedUserId) params.userId = selectedUserId;
    if (selectedDateFrom) params.dateFrom = selectedDateFrom;
    if (selectedDateTo) params.dateTo = selectedDateTo;
    if (selectedSort) params.sort = selectedSort;

    params.page = String(page);

    setSearchParams(params);
  }

  async function loadMemes() {
    try {
      setLoading(true);
      setError("");

      const filters = buildFiltersFromUrl();
      const data = await getMemes(token, filters);

      const loadedMemes = Array.isArray(data) ? data : data.memes || [];

      setMemes(loadedMemes);
      setCurrentPage(Array.isArray(data) ? 1 : data.currentPage || 1);
      setTotalPages(Array.isArray(data) ? 1 : data.totalPages || 1);
      setTotalItems(
        Array.isArray(data) ? loadedMemes.length : data.totalItems || 0
      );

      const votesData = {};
      const commentsData = {};

      for (const meme of loadedMemes) {
        try {
          votesData[meme.id] = await getMemeVotes(meme.id, token);
        } catch {
          votesData[meme.id] = {
            upvotes: 0,
            downvotes: 0,
            score: 0,
            userVote: 0,
          };
        }

        try {
          const memeComments = await getCommentsByMeme(meme.id, token);
          commentsData[meme.id] = memeComments.length;
        } catch {
          commentsData[meme.id] = 0;
        }
      }

      setVotes(votesData);
      setCommentCounts(commentsData);
    } catch (err) {
      console.error(err);
      setError("Errore durante il caricamento dei meme");
    } finally {
      setLoading(false);
    }
  }

  async function loadMemeOfTheDay() {
    try {
      const meme = await getMemeOfTheDay(token);
      setMemeOfTheDay(meme);
    } catch (err) {
      console.error("Errore caricamento meme del giorno:", err);
    }
  }

  async function handleVote(memeId, value) {
    if (!isAuthenticated || !token) return;

    try {
      setVoteLoading((prev) => ({
        ...prev,
        [memeId]: true,
      }));

      const updatedVotes = await voteMeme(memeId, value, token);

      setVotes((prev) => ({
        ...prev,
        [memeId]: updatedVotes,
      }));
    } catch (err) {
      console.error("Errore voto:", err);
    } finally {
      setVoteLoading((prev) => ({
        ...prev,
        [memeId]: false,
      }));
    }
  }

  useEffect(() => {
    syncFilterInputsFromUrl();
  }, [
    selectedTag,
    selectedAuthor,
    selectedDateFrom,
    selectedDateTo,
    selectedSort,
  ]);

  useEffect(() => {
    if (!authLoaded) return;

    if (!hasActiveFilters && selectedPage === 1) {
      loadMemeOfTheDay();
    }

    loadMemes();
  }, [
    authLoaded,
    token,
    selectedTag,
    selectedAuthor,
    selectedUserId,
    selectedDateFrom,
    selectedDateTo,
    selectedSort,
    selectedPage,
  ]);

  if (loading) {
    return (
      <Center h="60vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert color="red">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="sm">
        MemeMuseum
      </Title>

      <Text c="dimmed" mb="xl">
        Esplora i meme pubblicati dagli utenti.
      </Text>

      <Group mb="md">
        <Button variant="light" onClick={() => setShowFilters((prev) => !prev)}>
          Filtra
        </Button>

        {hasActiveFilters && (
          <Button variant="subtle" color="gray" onClick={resetFilters}>
            Rimuovi filtri 
          </Button>
        )}
      </Group>

      {showFilters && (
        <Card shadow="sm" padding="sm" radius="md" withBorder mb="md">
          <form onSubmit={applyFilters}>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="sm">
              <Select
                label="Ordina per"
                placeholder="Scegli"
                size="xs"
                value={sortInput || null}
                onChange={(value) => setSortInput(value || "")}
                clearable
                data={[
                  { value: "newest", label: "Data: più recenti" },
                  { value: "oldest", label: "Data: più vecchi" },
                  { value: "titleAsc", label: "Titolo: A-Z" },
                  { value: "titleDesc", label: "Titolo: Z-A" },
                  { value: "upvotes", label: "Più upvoted" },
                  { value: "downvotes", label: "Più downvoted" },
                ]}
              />

              <TextInput
                label="Tag"
                placeholder="Es. calcio"
                size="xs"
                value={tagInput}
                onChange={(event) => setTagInput(event.currentTarget.value)}
              />

              <TextInput
                label="Creatore"
                placeholder="Es. mario"
                size="xs"
                value={authorInput}
                onChange={(event) => setAuthorInput(event.currentTarget.value)}
              />

              <TextInput
                label="Data da"
                type="date"
                size="xs"
                value={dateFromInput}
                onChange={(event) => setDateFromInput(event.currentTarget.value)}
              />

            </SimpleGrid>

            <Group mt="sm">
              <Button type="submit" size="xs">
                Applica filtri
              </Button>

              <Button
                type="button"
                variant="light"
                color="gray"
                size="xs"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Group>
          </form>
        </Card>
      )}

      {hasActiveFilters && (
        <Alert color="violet" mb="lg">
          <Group justify="space-between">
            <Text>
              Filtri attivi:
              {isMineFilter && (
                <>
                  {" "}
                  <strong>I miei meme</strong>
                </>
              )}
              {!isMineFilter && selectedUserId && (
                <>
                  {" "}
                  utente ID <strong>{selectedUserId}</strong>
                </>
              )}
              {selectedTag && (
                <>
                  {" "}
                  tag <strong>{selectedTag}</strong>
                </>
              )}
              {selectedAuthor && (
                <>
                  {" "}
                  creatore <strong>{selectedAuthor}</strong>
                </>
              )}
              {selectedDateFrom && (
                <>
                  {" "}
                  da <strong>{selectedDateFrom}</strong>
                </>
              )}
              {selectedDateTo && (
                <>
                  {" "}
                  a <strong>{selectedDateTo}</strong>
                </>
              )}
              {selectedSort && (
                <>
                  {" "}
                  ordinamento <strong>{selectedSort}</strong>
                </>
              )}
            </Text>

            <Button onClick={resetFilters} variant="light" size="xs">
              Rimuovi filtri
            </Button>
          </Group>
        </Alert>
      )}

      {!hasActiveFilters && selectedPage === 1 && memeOfTheDay && (
       <Card
  shadow="sm"
  padding="lg"
  radius="xl"
  withBorder
  mb="lg"
  style={{
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
  }}
>
          <Title order={2} mb="md">
            Meme del giorno
          </Title>

          <MemeCard meme={memeOfTheDay} />
        </Card>
      )}

      {memes.length === 0 ? (
        <Text>Nessun meme disponibile.</Text>
      ) : (
        <>
          <Text size="sm" c="dimmed" mb="md">
            Risultati: {totalItems}
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {memes.map((meme) => (
              <Card key={meme.id} shadow="sm" padding="lg" radius="md" withBorder>
                <MemeCard meme={meme} />

                {votes[meme.id] && (
                  <Group mt="sm">
                    <Badge
                      component={Link}
                      to={`/memes/${meme.id}`}
                      color="green"
                      style={{ cursor: "pointer", textDecoration: "none" }}
                    >
                      Upvote: {votes[meme.id].upvotes}
                    </Badge>

                    <Badge
                      component={Link}
                      to={`/memes/${meme.id}`}
                      color="red"
                      style={{ cursor: "pointer", textDecoration: "none" }}
                    >
                      Downvote: {votes[meme.id].downvotes}
                    </Badge>

                    <Badge
                      component={Link}
                      to={`/memes/${meme.id}`}
                      color="gray"
                      style={{ cursor: "pointer", textDecoration: "none" }}
                    >
                      Commenti: {commentCounts[meme.id] ?? 0}
                    </Badge>
                  </Group>
                )}

                {isAuthenticated && votes[meme.id] && (
                  <Group mt="sm">
                    <Button
                      color="green"
                      variant={votes[meme.id].userVote === 1 ? "filled" : "light"}
                      onClick={() => handleVote(meme.id, 1)}
                      loading={voteLoading[meme.id]}
                    >
                      Upvote
                    </Button>

                    <Button
                      color="red"
                      variant={votes[meme.id].userVote === -1 ? "filled" : "light"}
                      onClick={() => handleVote(meme.id, -1)}
                      loading={voteLoading[meme.id]}
                    >
                      Downvote
                    </Button>
                  </Group>
                )}
              </Card>
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <Center mt="xl">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={handlePageChange}
              />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}

export default HomePage;