import { Link } from "react-router-dom";
import {
  Container, Title, Text, SimpleGrid, Card,
  Button, ActionIcon, Loader, Center, Alert, Pagination, Tooltip,
} from "@mantine/core";
import { Trash2 } from "lucide-react";

import MemeCard      from "../components/MemeCard";
import { useAuth }   from "../context/AuthContext";
import { useMyMemes }from "../hooks/useMyMemes";
import styles        from "../styles/myMemesPage.module.css";

function MyMemesPage() {
  const { token, user, isAuthenticated, authLoaded } = useAuth();
  const {
    memes, deletingId, currentPage, setCurrentPage,
    totalPages, totalItems, loading, error, handleDelete,
  } = useMyMemes({ token, user, isAuthenticated, authLoaded });

  if (!authLoaded || loading) return <Center h="60vh"><Loader size="lg" /></Center>;

  if (!isAuthenticated) return (
    <Container size="md" py="xl">
      <Alert color="yellow" mb="md">Devi effettuare il login per vedere i tuoi meme.</Alert>
      <Button component={Link} to="/login">Vai al login</Button>
    </Container>
  );

  if (error) return <Container size="md" py="xl"><Alert color="red">{error}</Alert></Container>;

  return (
    <Container size="lg" py="xl">
      <div className={styles.pageHeader}>
        <div>
          <Title order={1}>I miei meme</Title>
          <Text c="dimmed" mt="xs">Qui trovi tutti i meme che hai pubblicato.</Text>
        </div>
        <Button component={Link} to="/memes/create">Crea nuovo meme</Button>
      </div>

      {memes.length === 0 ? (
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Text fw={600}>Non hai ancora pubblicato nessun meme.</Text>
          <Text c="dimmed" mt="xs">Crea il tuo primo meme per vederlo comparire in questa pagina.</Text>
          <Button component={Link} to="/memes/create" mt="md">Crea meme</Button>
        </Card>
      ) : (
        <>
          <Text size="sm" c="dimmed" mb="md">Meme pubblicati: {totalItems}</Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {memes.map((meme) => (
              <div key={meme.id} className={styles.cardWrapper}>
                <MemeCard meme={meme} />
                <Tooltip label="Elimina meme" withArrow color="red">
                  <ActionIcon
                    color="red" variant="filled" size="lg" radius="xl"
                    loading={deletingId === meme.id}
                    onClick={() => handleDelete(meme.id)}
                    aria-label="Elimina meme"
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Tooltip>
              </div>
            ))}
          </SimpleGrid>
          {totalPages > 1 && (
            <Center mt="xl">
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}

export default MyMemesPage;