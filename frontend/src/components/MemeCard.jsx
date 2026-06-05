import { useState, useEffect } from "react";
import { Card, Image, Text, Group, Badge, ActionIcon, Tooltip, Divider } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { getMemeVotes, voteMeme } from "../api/voteApi";
import { useAuth }   from "../context/AuthContext";
import VoteBar       from "./VoteBar";
import styles        from "../styles/memeCard.module.css";

function MemeCard({ meme, featured = false }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { token, isAuthenticated } = useAuth();

  const tags = meme.Tags || [];

  const [votes, setVotes] = useState({
    upvotes:  meme.upvotes  ?? 0,
    downvotes:meme.downvotes?? 0,
    score:    meme.score    ?? 0,
    userVote: 0,
  });
  const [voteLoading, setVoteLoading] = useState(false);

  useEffect(() => {
    getMemeVotes(meme.id, token)
      .then(setVotes)
      .catch(() => {/* keep defaults */});
  }, [meme.id, token]);

  function goToDetail() { navigate(`/memes/${meme.id}`); }

  function openTagFilter(e, tagName) {
    e.stopPropagation();
    navigate(`/?tag=${encodeURIComponent(tagName)}`);
  }

  async function handleVote(value) {
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

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>

      {/* Immagine */}
      <Card.Section onClick={goToDetail} style={{ cursor: "pointer" }}>
        <Image
          src={meme.imageUrl}
          height={featured ? 320 : 220}
          fit={featured ? "contain" : "cover"}
          alt={meme.title}
          style={featured ? { background: "#f8f9fa" } : undefined}
        />
      </Card.Section>

      {/* Titolo e descrizione */}
      <div className={styles.titleAndDescription} onClick={goToDetail} style={{ cursor: "pointer" }}>
        <Text fw={700} size={featured ? "lg" : "md"} lineClamp={featured ? 0 : 2}>
          {meme.title}
        </Text>
        <Text size="sm" c="dimmed" lineClamp={featured ? 0 : 2} mt={4}>
          {meme.description || "Nessuna descrizione"}
        </Text>
      </div>

      {/* Tag */}
      {tags.length > 0 && (
        <Group gap="xs" mt="sm" wrap="wrap">
          {tags.map((tag) => (
            <Badge
              key={tag.id} color="violet" variant="light"
              style={{ cursor: "pointer" }}
              onClick={(e) => openTagFilter(e, tag.name)}
            >
              {tag.name}
            </Badge>
          ))}
        </Group>
      )}

      {/* Autore */}
      {meme.User && (
        <Text size="xs" c="dimmed" mt="xs">
          Pubblicato da:{" "}
          <Text
            span fw={500} c="violet"
            className={styles.clickableAuthor}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/?userId=${meme.User.id}&username=${encodeURIComponent(meme.User.username)}`);
            }}
          >
            {meme.User.username}
          </Text>
        </Text>
      )}

      <Divider my="sm" />

      {/* Voti + commenta */}
      <Group justify="start" gap="sm">
        <VoteBar
          votes={votes}
          onVote={handleVote}
          loading={voteLoading}
          isAuthenticated={isAuthenticated}
        />

        <Tooltip label="Commenta" withArrow>
          <ActionIcon
            variant="subtle" color="gray" size="lg" radius="xl"
            onClick={(e) => { e.stopPropagation(); goToDetail(); }}
            aria-label="Commenta"
          >
            <MessageCircle size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
}

export default MemeCard;