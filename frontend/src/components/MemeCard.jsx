import { Card, Image, Text, Group, Badge } from "@mantine/core";
import { useNavigate } from "react-router-dom";

function MemeCard({ meme }) {
  const navigate = useNavigate();
  const tags = meme.Tags || [];

  function openMemeDetail() {
    navigate(`/memes/${meme.id}`);
  }

  function openTagFilter(event, tagName) {
    event.stopPropagation();
    navigate(`/?tag=${encodeURIComponent(tagName)}`);
  }

  return (
    <Card
      onClick={openMemeDetail}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      maw={360}
      style={{
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      <Card.Section>
        <Image
          src={meme.imageUrl}
          height={260}
          fit="cover"
          alt={meme.title}
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={700}>{meme.title}</Text>
        <Badge color="blue">Meme</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        {meme.description || "Nessuna descrizione"}
      </Text>

      {tags.length > 0 && (
        <Group gap="xs" mt="sm">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              color="violet"
              variant="light"
              style={{ cursor: "pointer" }}
              onClick={(event) => openTagFilter(event, tag.name)}
            >
              {tag.name}
            </Badge>
          ))}
        </Group>
      )}

      {meme.User && (
        <Text size="xs" c="dimmed" mt="sm">
          Pubblicato da: {meme.User.username}
        </Text>
      )}
    </Card>
  );
}

export default MemeCard;