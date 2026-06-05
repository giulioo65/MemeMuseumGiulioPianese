import { useNavigate, Link } from "react-router-dom";
import {
  Container, Paper, Title, TextInput, Textarea,
  Button, FileButton, Stack, Alert, Image, Text, Divider, Modal, Group,
} from "@mantine/core";
import { AlertCircle } from "lucide-react";

import { useAuth }       from "../context/AuthContext";
import { useCreateMeme } from "../hooks/useCreateMeme";
import styles            from "../styles/createMemePage.module.css";

function CreateMemePage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const {
    title, setTitle,
    description, setDescription,
    imageUrl, imageFile, filePreview,
    tagInput, setTagInput,
    resetRef,
    loading, error, errorModalOpen, setErrorModalOpen,
    handleFileChange, handleUrlChange, clearFile, handleSubmit,
  } = useCreateMeme({ token, isAuthenticated, navigate });

  if (!isAuthenticated) return (
    <Container size="sm" py="xl">
      <Alert color="yellow" mb="md">Devi effettuare il login per creare un meme.</Alert>
      <Button component={Link} to="/login">Vai al login</Button>
    </Container>
  );

  const previewSrc = filePreview || imageUrl;

  return (
    <Container size="sm" py="xl">
      {/* Modal errore validazione */}
      <Modal
        opened={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title={
          <Group gap="xs">
            <AlertCircle size={20} color="red" />
            <Text fw={700} c="red">Campi mancanti o non validi</Text>
          </Group>
        }
        centered radius="md"
      >
        <Text mb="lg">{error}</Text>
        <Button fullWidth onClick={() => setErrorModalOpen(false)}>
          Capito, torno al form
        </Button>
      </Modal>

      <Title order={1} mb="lg">Crea un nuovo meme</Title>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Titolo" placeholder="Es. Meme sulla programmazione"
              value={title} onChange={(e) => setTitle(e.currentTarget.value)}
              required
            />
            <Textarea
              label="Descrizione" placeholder="Descrivi brevemente il meme"
              value={description} onChange={(e) => setDescription(e.currentTarget.value)}
              autosize minRows={3}
            />
            <TextInput
              label="Tag" placeholder="Es. Programming, Web Technologies, Gatto"
              value={tagInput} onChange={(e) => setTagInput(e.currentTarget.value)}
              required
            />
            <Text size="xs" c="dimmed">Inserisci uno o più tag separati da virgola.</Text>

            {/* Upload file */}
            <div>
              <p className={styles.imageUploadLabel}>
                Carica immagine dal PC
                <span className={styles.requiredStar}>*</span>
              </p>
              <Group gap="sm">
                <FileButton resetRef={resetRef} onChange={handleFileChange} accept="image/png,image/jpeg,image/webp,image/gif">
                  {(props) => <Button variant="light" {...props}>Scegli file</Button>}
                </FileButton>
                <Button variant="light" color="red" disabled={!imageFile} onClick={clearFile}>
                  Rimuovi
                </Button>
              </Group>
              {imageFile && (
                <Text size="sm" c="dimmed" mt="xs">
                  File selezionato: <strong>{imageFile.name}</strong>
                </Text>
              )}
            </div>

            <Divider label="oppure" labelPosition="center" />

            <TextInput
              label="URL immagine" placeholder="https://example.com/meme.jpg"
              value={imageUrl} onChange={(e) => handleUrlChange(e.currentTarget.value)}
              withAsterisk
            />

            {previewSrc && (
              <>
                <Text size="sm" c="dimmed">Anteprima immagine</Text>
                <Image src={previewSrc} radius="md" fit="contain" mah={300} />
              </>
            )}

            <Button type="submit" loading={loading}>Pubblica meme</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateMemePage;