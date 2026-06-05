import { Title } from "@mantine/core";
import MemeCard from "./MemeCard";
import styles from "../styles/homePage.module.css";

/**
 * Sezione "Meme del giorno" mostrata in cima alla HomePage
 * solo quando non ci sono filtri attivi e si è sulla prima pagina.
 */
function MemeOfTheDay({ meme }) {
  if (!meme) return null;

  return (
    <div className={styles.featuredSection}>
      <Title order={2} mb="md" className={styles.featuredSectionTitle}>
        🏆 Meme del giorno
      </Title>
      <div className={styles.featuredCardWrapper}>
        <MemeCard meme={meme} featured />
      </div>
    </div>
  );
}

export default MemeOfTheDay;
