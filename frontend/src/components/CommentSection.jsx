import { Alert, Stack, Textarea, Button, Card, Text } from "@mantine/core";
import { Link } from "react-router-dom";

/**
 * Sezione commenti della MemeDetailPage.
 * Include il form di inserimento e la lista dei commenti esistenti.
 */
function CommentSection({
  comments,
  commentText, setCommentText,
  commentLoading, commentError,
  isAuthenticated,
  locationPath,
  onSubmit,
}) {
  return (
    <>
      <form onSubmit={onSubmit}>
        <Stack mb="lg">
          {commentError && <Alert color="red">{commentError}</Alert>}

          <Textarea
            label="Scrivi un commento"
            placeholder="Inserisci il tuo commento..."
            value={commentText}
            onChange={(e) => setCommentText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
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
            <Button variant="light" component={Link} to="/login" state={{ from: locationPath }}>
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
    </>
  );
}

export default CommentSection;
