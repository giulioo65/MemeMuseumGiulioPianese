import { useState, useEffect } from "react";
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
  Tooltip,
  Divider,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react";

import { getMemeVotes, voteMeme } from "../api/voteApi";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/memeCard.module.css";

function MemeCard({ meme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();

  const tags = meme.Tags || [];

  const [votes, setVotes] = useState({
    upvotes: meme.upvotes ?? 0,
    downvotes: meme.downvotes ?? 0,
    score: meme.score ?? 0,
    userVote: 0,
  });
  const [voteLoading, setVoteLoading] = useState(false);

  useEffect(() => {
    async function loadVotes() {
      try {
        const data = await getMemeVotes(meme.id, token);
        setVotes(data);
      } catch {
        // keep defaults
      }
    }
    loadVotes();
  }, [meme.id, token]);

  function goToDetail() {
    navigate(`/memes/${meme.id}`);
  }

  function openTagFilter(event, tagName) {
    event.stopPropagation();
    navigate(`/?tag=${encodeURIComponent(tagName)}`);
  }

  async function handleVote(event, value) {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setVoteLoading(true);
      const updated = await voteMeme(meme.id, value, token);
      setVotes(updated);
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setVoteLoading(false);
    }
  }

  const tooltipLabel = isAuthenticated ? undefined : "Accedi per votare";

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>

      {/* Image — click → detail */}
      <Card.Section onClick={goToDetail} style={{ cursor: "pointer" }}>
        <Image src={meme.imageUrl} height={220} fit="cover" alt={meme.title} />
      </Card.Section>

      {/* Title & description — click → detail */}
      <div
        className={styles.titleAndDescription}
        onClick={goToDetail}
        style={{ cursor: "pointer" }}
      >
        <Text fw={700} size="md" lineClamp={2}>
          {meme.title}
        </Text>
        <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
          {meme.description || "Nessuna descrizione"}
        </Text>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <Group gap="xs" mt="sm" wrap="wrap">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              color="violet"
              variant="light"
              style={{ cursor: "pointer" }}
              onClick={(e) => openTagFilter(e, tag.name)}
            >
              {tag.name}
            </Badge>
          ))}
        </Group>
      )}

      {/* Author */}
      {meme.User && (
        <Text size="xs" c="dimmed" mt="xs">
          Pubblicato da:{" "}
          <Text span fw={500} c="dimmed">
            {meme.User.username}
          </Text>
        </Text>
      )}

      <Divider my="sm" />

      {/* Vote bar — contatore + icona nello stesso pulsante */}
      <Group justify="start" gap="sm">
        <Tooltip label={tooltipLabel} withArrow disabled={isAuthenticated}>
          <Button
            variant={votes.userVote === 1 ? "filled" : "light"}
            color="green"
            size="sm"
            loading={voteLoading}
            onClick={(e) => handleVote(e, 1)}
            leftSection={<ArrowUp size={16} />}
          >
            {votes.upvotes}
          </Button>
        </Tooltip>

        <Tooltip label={tooltipLabel} withArrow disabled={isAuthenticated}>
          <Button
            variant={votes.userVote === -1 ? "filled" : "light"}
            color="red"
            size="sm"
            loading={voteLoading}
            onClick={(e) => handleVote(e, -1)}
            leftSection={<ArrowDown size={16} />}
          >
            {votes.downvotes}
          </Button>
        </Tooltip>

        <Button
          variant="subtle"
          color="gray"
          size="sm"
          onClick={(e) => { e.stopPropagation(); goToDetail(); }}
          leftSection={<MessageCircle size={16} />}
        >
          Commenta
        </Button>
      </Group>
    </Card>
  );
}

export default MemeCard;