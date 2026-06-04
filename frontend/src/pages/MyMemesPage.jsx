import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  Badge,
  Button,
  Loader,
  Center,
  Alert,
  Pagination,
} from "@mantine/core";

import MemeCard from "../components/MemeCard";
import { getMemes } from "../api/memeApi";
import { getMemeVotes, voteMeme } from "../api/voteApi";
import { getCommentsByMeme } from "../api/commentApi";
import { useAuth } from "../context/AuthContext";

function MyMemesPage() {
  const { token, user, isAuthenticated, authLoaded } = useAuth();

  const [memes, setMemes] = useState([]);
  const [votes, setVotes] = useState({});
  const [commentCounts, setCommentCounts] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voteLoading, setVoteLoading] = useState({});

  async function loadMyMemes() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");

      const data = await getMemes(token, {
        userId: user.id,
        page: currentPage,
        sort: "newest",
      });

      const loadedMemes = Array.isArray(data) ? data : data.memes || [];

      setMemes(loadedMemes);
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
      console.error("Errore caricamento miei meme:", err);
      setError("Errore durante il caricamento dei tuoi meme");
    } finally {
      setLoading(false);
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
    if (!authLoaded) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    loadMyMemes();
  }, [authLoaded, isAuthenticated, user?.id, token, currentPage]);

  if (!authLoaded || loading) {
    return (
      <Center h="60vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container size="md" py="xl">
        <Alert color="yellow" mb="md">
          Devi effettuare il login per vedere i tuoi meme.
        </Alert>

        <Button component={Link} to="/login">
          Vai al login
        </Button>
      </Container>
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
      <Group justify="space-between" mb="md">
        <div>
          <Title order={1}>I miei meme</Title>

          <Text c="dimmed" mt="xs">
            Qui trovi tutti i meme che hai pubblicato.
          </Text>
        </div>

        <Button component={Link} to="/memes/create">
          Crea nuovo meme
        </Button>
      </Group>

      {memes.length === 0 ? (
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Text fw={600}>Non hai ancora pubblicato nessun meme.</Text>

          <Text c="dimmed" mt="xs">
            Crea il tuo primo meme per vederlo comparire in questa pagina.
          </Text>

          <Button component={Link} to="/memes/create" mt="md">
            Crea meme
          </Button>
        </Card>
      ) : (
        <>
          <Text size="sm" c="dimmed" mb="md">
            Meme pubblicati: {totalItems}
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

                {votes[meme.id] && (
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
                onChange={setCurrentPage}
              />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}

export default MyMemesPage;