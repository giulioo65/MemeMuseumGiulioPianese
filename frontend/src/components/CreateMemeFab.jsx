import { Link, useLocation } from "react-router-dom";
import { Tooltip, ActionIcon } from "@mantine/core";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Pages where the FAB should not appear
const HIDDEN_ON = ["/login", "/register", "/memes/create"];

function CreateMemeFab() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) return null;
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <Tooltip label="Crea un nuovo meme" position="left" withArrow>
      <ActionIcon
        component={Link}
        to="/memes/create"
        size={56}
        radius="xl"
        variant="filled"
        color="blue"
        aria-label="Crea meme"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 200,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Plus size={28} />
      </ActionIcon>
    </Tooltip>
  );
}

export default CreateMemeFab;
