import { Link, useNavigate } from "react-router-dom";
import { Container, Group, Button, Text } from "@mantine/core";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/navbar.module.css"

function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function goToHomeTop() {
        navigate("/");

        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, 0);
    }

    function goToMyMemes() {
        if (!isAuthenticated || !user?.id) return;

        navigate("/my-memes");

        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, 0);
    }
    return (
        <div className={styles.container}>
            <Container size="lg" py="md">
                <Group justify="space-between">
                    <div className={styles.logo}>
                        <img 
                            src="/logo.png" 
                            alt="MemeMuseum Logo" 
                            onClick={goToHomeTop}
                            style={{ cursor: "pointer" }}
                        />
                        <Text
                            fw={700}
                            size="xl"
                            onClick={goToHomeTop}
                            style={{
                                textDecoration: "none",
                                color: "black",
                                cursor: "pointer",
                            }}
                        >
                            MemeMuseum
                        </Text>
                    </div>


                    <Group>
                        <Button onClick={goToHomeTop} variant="subtle">
                            Home
                        </Button>

                        {isAuthenticated ? (
                            <>

                                <Button color="violet" variant="light" onClick={goToMyMemes}>
                                    I miei meme
                                </Button>

                                <Text size="sm">Ciao, {user.username}</Text>

                                <Button color="red" variant="light" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button component={Link} to="/login" variant="subtle">
                                    Login
                                </Button>

                                <Button component={Link} to="/register">
                                    Registrati
                                </Button>
                            </>
                        )}
                    </Group>
                </Group>
            </Container>
        </div>
    );
}

export default Navbar;