import { Button, Tooltip } from "@mantine/core";
import { ArrowUp, ArrowDown } from "lucide-react";

/**
 * Barra di voto condivisa tra MemeCard e MemeDetailPage.
 * Props:
 *   votes          — { upvotes, downvotes, userVote }
 *   onVote(value)  — chiamata con +1 o -1
 *   loading        — disabilita i pulsanti durante la chiamata API
 *   isAuthenticated — mostra tooltip se non loggato
 */
function VoteBar({ votes, onVote, loading, isAuthenticated }) {
  const tooltip = isAuthenticated ? undefined : "Accedi per votare";

  return (
    <>
      <Tooltip label={tooltip} withArrow disabled={isAuthenticated}>
        <Button
          variant={votes.userVote === 1 ? "filled" : "light"}
          color="green"
          size="sm"
          loading={loading}
          onClick={() => onVote(1)}
          leftSection={<ArrowUp size={16} />}
        >
          {votes.upvotes}
        </Button>
      </Tooltip>

      <Tooltip label={tooltip} withArrow disabled={isAuthenticated}>
        <Button
          variant={votes.userVote === -1 ? "filled" : "light"}
          color="red"
          size="sm"
          loading={loading}
          onClick={() => onVote(-1)}
          leftSection={<ArrowDown size={16} />}
        >
          {votes.downvotes}
        </Button>
      </Tooltip>
    </>
  );
}

export default VoteBar;
