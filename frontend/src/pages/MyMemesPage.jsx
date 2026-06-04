import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Button,
  Loader,
  Center,
  Alert,
  Pagination,
} from "@mantine/core";

import MemeCard from "../components/MemeCard";
import { getMemes } from "../api/memeApi";
import { useAuth } from "../context/AuthContext";

function MyMemesPage() {
  const { token, user, isAuthenticated, authLoaded } = useAuth();

  const [memes, setMemes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (err) {
      console.error("Errore caricamento miei meme:", err);
      setError("Errore durante il caricamento dei tuoi meme");
    } finally {
      setLoading(false);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <Title order={1}>I miei meme</Title>
          <Text c="dimmed" mt="xs">
            Qui trovi tutti i meme che hai pubblicato.
          </Text>
        </div>

        <Button component={Link} to="/memes/create">
          Crea nuovo meme
        </Button>
      </div>

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
              <MemeCard key={meme.id} meme={meme} />
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