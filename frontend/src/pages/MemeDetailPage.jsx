import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Image,
  Card,
  Loader,
  Center,
  Alert,
  Group,
  Badge,
  Stack,
  Button,
  Divider,
  Textarea,
} from "@mantine/core";

import { getMemeById, deleteMeme } from "../api/memeApi";
import { getCommentsByMeme, createComment } from "../api/commentApi";
import { getMemeVotes, voteMeme } from "../api/voteApi";
import { useAuth } from "../context/AuthContext";

function MemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, user, isAuthenticated, authLoaded } = useAuth();

  const [meme, setMeme] = useState(null);
  const [comments, setComments] = useState([]);
  const [votes, setVotes] = useState({
    upvotes: 0,
    downvotes: 0,
    score: 0,
    userVote: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [voteLoading, setVoteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadMemeDetail() {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const memeData = await getMemeById(id, token);
      setMeme(memeData);

      const commentsResult = await getCommentsByMeme(id, token).catch((err) => {
        console.error("Comments load error:", err);
        return [];
      });

      const votesResult = await getMemeVotes(id, token).catch((err) => {
        console.error("Votes load error:", err);
        return {
          upvotes: 0,
          downvotes: 0,
          score: 0,
          userVote: 0,
        };
      });

      setComments(commentsResult);
      setVotes(votesResult);
    } catch (err) {
      console.error("Meme load error:", err);
      setError("Errore durante il caricamento del meme");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateComment(event) {
    event.preventDefault();

    if (!isAuthenticated || !token) {
      navigate("/login", { state: { from: location.pathname } });
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

      const updatedComments = await getCommentsByMeme(id, token);
      setComments(updatedComments);
    } catch (err) {
      console.error("Create comment error:", err);
      setCommentError("Errore durante l'invio del commento");
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleVote(value) {
    if (!isAuthenticated || !token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setVoteLoading(true);

      const updatedVotes = await voteMeme(id, value, token);
      setVotes(updatedVotes);
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

  useEffect(() => {
    if (!authLoaded) return;
    loadMemeDetail();
  }, [id, token, authLoaded]);

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

  if (!meme) {
    return (
      <Container size="md" py="xl">
        <Text>Meme non trovato.</Text>
      </Container>
    );
  }

  const tags = meme.Tags || [];

  const canDeleteMeme =
    isAuthenticated &&
    user &&
    (meme.userId === user.id || meme.User?.id === user.id || user.role === "admin");

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Button component={Link} to="/" variant="light">
          Torna alla Home
        </Button>

        {canDeleteMeme && (
          <Button
            color="red"
            variant="light"
            onClick={handleDeleteMeme}
            loading={deleteLoading}
          >
            Elimina meme
          </Button>
        )}
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Image src={meme.imageUrl} alt={meme.title} radius="md" />

        <Group justify="space-between" mt="lg">
          <Title order={1}>{meme.title}</Title>
          <Badge color="blue">Meme</Badge>
        </Group>

        <Text c="dimmed" mt="md">
          {meme.description || "Nessuna descrizione"}
        </Text>

        {tags.length > 0 && (
          <Group gap="xs" mt="md">
            {tags.map((tag) => (
              <Badge key={tag.id} color="violet" variant="light">
                {tag.name}
              </Badge>
            ))}
          </Group>
        )}

        {meme.User && (
          <Text size="sm" mt="sm">
            Pubblicato da: <strong>{meme.User.username}</strong>
          </Text>
        )}

        <Group mt="lg">
          <Badge color="green">Upvote: {votes.upvotes}</Badge>
          <Badge color="red">Downvote: {votes.downvotes}</Badge>
          <Badge color="gray">Score: {votes.score}</Badge>
        </Group>

        <Group mt="sm">
          <Button
            color="green"
            variant={votes.userVote === 1 ? "filled" : "light"}
            onClick={() => handleVote(1)}
            loading={voteLoading}
          >
            👍 Upvote
          </Button>

          <Button
            color="red"
            variant={votes.userVote === -1 ? "filled" : "light"}
            onClick={() => handleVote(-1)}
            loading={voteLoading}
          >
            👎 Downvote
          </Button>
        </Group>

        <Divider my="xl" />

        <Title order={3} mb="md">
          Commenti
        </Title>

        <form onSubmit={handleCreateComment}>
          <Stack mb="lg">
            {commentError && <Alert color="red">{commentError}</Alert>}

            <Textarea
              label="Scrivi un commento"
              placeholder="Inserisci il tuo commento..."
              value={commentText}
              onChange={(event) => setCommentText(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleCreateComment(event);
                }
              }}
              autosize
              minRows={2}
            />

            {isAuthenticated ? (
              <Button type="submit" loading={commentLoading}>
                Pubblica commento
              </Button>
            ) : (
              <Button
                variant="light"
                component={Link}
                to="/login"
                state={{ from: location.pathname }}
              >
                Accedi per commentare
              </Button>
            )}
          </Stack>
        </form>

        {comments.length === 0 ? (
          <Text c="dimmed">Nessun commento presente.</Text>
        ) : (
          <Stack>
            {comments.map((comment) => (
              <Card key={comment.id} withBorder padding="sm" radius="md">
                <Text>{comment.text}</Text>

                {comment.User && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Scritto da: {comment.User.username}
                  </Text>
                )}
              </Card>
            ))}
          </Stack>
        )}
      </Card>
    </Container>
  );
}

export default MemeDetailPage;