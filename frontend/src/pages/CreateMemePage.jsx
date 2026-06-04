import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  TextInput,
  Textarea,
  Button,
  Stack,
  Alert,
  Image,
  Text,
  FileInput,
  Divider,
} from "@mantine/core";

import { createMeme } from "../api/memeApi";
import { useAuth } from "../context/AuthContext";

function CreateMemePage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setFilePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setFilePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  function getTagsArray() {
    return [
      ...new Set(
        tagInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      ),
    ];
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      setError("Devi effettuare il login per creare un meme");
      return;
    }

    const tags = getTagsArray();

    if (!title.trim()) {
      setError("Inserisci un titolo");
      return;
    }

    if (!imageFile && !imageUrl.trim()) {
      setError("Inserisci un URL immagine oppure carica un file");
      return;
    }

    if (tags.length === 0) {
      setError("Inserisci almeno un tag");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("tags", tags.join(","));

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("imageUrl", imageUrl.trim());
      }

      const data = await createMeme(formData, token);

      navigate(`/memes/${data.meme.id}`);
    } catch (err) {
      console.error(err);
      setError("Errore durante la creazione del meme");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Container size="sm" py="xl">
        <Alert color="yellow" mb="md">
          Devi effettuare il login per creare un meme.
        </Alert>

        <Button component={Link} to="/login">
          Vai al login
        </Button>
      </Container>
    );
  }

  const previewSrc = filePreview || imageUrl;

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">
        Crea un nuovo meme
      </Title>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}

            <TextInput
              label="Titolo"
              placeholder="Es. Meme sulla programmazione"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              required
            />

            <Textarea
              label="Descrizione"
              placeholder="Descrivi brevemente il meme"
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              autosize
              minRows={3}
            />

            <TextInput
              label="Tag"
              placeholder="Es. Programming, Web Technologies, Gatto"
              value={tagInput}
              onChange={(event) => setTagInput(event.currentTarget.value)}
              autosize
              minRows={3}
            />

            <Text size="xs" c="dimmed">
              Inserisci uno o più tag separati da virgola.
            </Text>



            <FileInput
              label="Carica immagine dal PC"
              placeholder="Scegli un file immagine"
              value={imageFile}
              onChange={(file) => {
                setImageFile(file);
                if (file) {
                  setImageUrl("");
                }
              }}
              accept="image/png,image/jpeg,image/webp,image/gif"
              clearable
            />

            <Divider label="oppure" labelPosition="center" />

            <TextInput
              label="URL immagine"
              placeholder="https://example.com/meme.jpg"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.currentTarget.value);
                if (event.currentTarget.value.trim()) {
                  setImageFile(null);
                }
              }}
            />

            

            {previewSrc && (
              <>
                <Text size="sm" c="dimmed">
                  Anteprima immagine
                </Text>
                <Image src={previewSrc} radius="md" fit="contain" mah={300} />
              </>
            )}

            <Button type="submit" loading={loading}>
              Pubblica meme
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateMemePage;