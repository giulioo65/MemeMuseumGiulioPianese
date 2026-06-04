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

import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginUser({
        email,
        password,
      });

      login(data);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Credenziali non valide");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size={420} py="xl">
      <Title ta="center" mb="lg">
        Login
      </Title>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}

            <TextInput
              label="Email"
              placeholder="test@example.com"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
            />

            <Button type="submit" loading={loading}>
              Accedi
            </Button>

            <Text size="sm" ta="center">
              Non hai un account? <Link to="/register">Registrati</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default LoginPage;