import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Container, Title, Text, Image, Card,
  Loader, Center, Alert, Group, Badge,
  Button, ActionIcon, Divider, Tooltip,
} from "@mantine/core";
import { Trash2 } from "lucide-react";

import { useAuth }       from "../context/AuthContext";
import { useMemeDetail } from "../hooks/useMemeDetail";
import VoteBar           from "../components/VoteBar";
import CommentSection    from "../components/CommentSection";
import styles            from "../styles/memeDetailPage.module.css";

function MemeDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { token, user, isAuthenticated, authLoaded } = useAuth();

  const {
    meme, votes, comments, loading, error,
    voteLoading, deleteLoading,
    commentText, setCommentText, commentLoading, commentError,
    handleVote, handleDeleteMeme, handleCreateComment,
  } = useMemeDetail({ id, token, isAuthenticated, authLoaded, navigate, locationPath: location.pathname });

  if (loading) return <Center h="60vh"><Loader size="lg" /></Center>;
  if (error)   return <Container size="md" py="xl"><Alert color="red">{error}</Alert></Container>;
  if (!meme)   return <Container size="md" py="xl"><Text>Meme non trovato.</Text></Container>;

  const tags = meme.Tags || [];
  const canDelete = isAuthenticated && user &&
    (meme.userId === user.id || meme.User?.id === user.id || user.role === "admin");

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Button component={Link} to="/" variant="light">Torna alla Home</Button>
        {canDelete && (
          <Tooltip label="Elimina meme" withArrow color="red">
            <ActionIcon
              color="red" variant="light" size="lg" radius="xl"
              onClick={handleDeleteMeme} loading={deleteLoading}
              aria-label="Elimina meme"
            >
              <Trash2 size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Image 
          src={meme.imageUrl} 
          alt={meme.title} 
          radius="md" 
          mah={450} 
          fit="contain" 
          bg="var(--mantine-color-gray-0)"
        />

        <Title order={2} mt="md">{meme.title}</Title>

        <Text c="dimmed" mt="xs">{meme.description || "Nessuna descrizione"}</Text>

        {tags.length > 0 && (
          <Group gap="xs" mt="md">
            {tags.map((tag) => (
              <Badge
                key={tag.id} color="violet" variant="light"
                className={styles.clickableTag}
                onClick={() => navigate(`/?tag=${encodeURIComponent(tag.name)}`)}
              >
                {tag.name}
              </Badge>
            ))}
          </Group>
        )}

        {meme.User && (
          <Text size="sm" mt="sm">
            Pubblicato da:{" "}
            <Text
              span fw={600} c="violet"
              className={styles.clickableAuthor}
              onClick={() => navigate(`/?userId=${meme.User.id}&username=${encodeURIComponent(meme.User.username)}`)}
            >
              {meme.User.username}
            </Text>
          </Text>
        )}

        <Group mt="lg" gap="sm">
          <VoteBar
            votes={votes}
            onVote={handleVote}
            loading={voteLoading}
            isAuthenticated={isAuthenticated}
          />
          <Badge color="gray" size="lg">Score: {votes.score}</Badge>
        </Group>

        <Divider my="xl" />

        <Title order={3} mb="md">Commenti</Title>
        <CommentSection
          comments={comments}
          commentText={commentText} setCommentText={setCommentText}
          commentLoading={commentLoading} commentError={commentError}
          isAuthenticated={isAuthenticated}
          locationPath={location.pathname}
          onSubmit={handleCreateComment}
        />
      </Card>
    </Container>
  );
}

export default MemeDetailPage;