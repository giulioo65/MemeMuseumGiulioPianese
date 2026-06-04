import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Text,
} from "@mantine/core";

import { registerUser } from "../api/authApi";

function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await registerUser({
        username,
        email,
        password,
      });

      setSuccess("Registrazione completata. Ora puoi effettuare il login.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 409) {
        setError("Email già registrata");
      } else {
        setError("Errore durante la registrazione");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size={420} py="xl">
      <Title ta="center" mb="lg">
        Registrazione
      </Title>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            {success && <Alert color="green">{success}</Alert>}

            <TextInput
              label="Username"
              placeholder="MarioRossi"
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value)}
              required
            />

            <TextInput
              label="Email"
              placeholder="mario@example.com"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Inserisci una password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
            />

            <Button type="submit" loading={loading}>
              Registrati
            </Button>

            <Text size="sm" ta="center">
              Hai già un account? <Link to="/login">Accedi</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default RegisterPage;