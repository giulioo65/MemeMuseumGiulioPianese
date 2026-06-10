import { Container, Text, SimpleGrid, Loader, Center, Alert, Group, Button, Pagination } from "@mantine/core";

import { useAuth }        from "../context/AuthContext";
import { useHomeFilters } from "../hooks/useHomeFilters";
import { useMemeList }    from "../hooks/useMemeList";
import MemeCard           from "../components/MemeCard";
import FilterPanel        from "../components/FilterPanel";
import FilterBanner       from "../components/FilterBanner";
import MemeOfTheDay       from "../components/MemeOfTheDay";

function HomePage() {
  const { token, user, authLoaded } = useAuth();

  const filters = useHomeFilters();
  const {
    selectedTag, selectedAuthor, selectedUserId, selectedUsername,
    selectedDateFrom, selectedDateTo, selectedSort, selectedPage,
    hasActiveFilters,
    showFilters, setShowFilters,
    tagInput, setTagInput,
    authorInput, setAuthorInput,
    dateFromInput, setDateFromInput,
    sortInput, setSortInput,
    applyFilters, resetFilters, handlePageChange,
  } = filters;

  const isMineFilter = selectedUserId && user && String(selectedUserId) === String(user.id);

  const apiFilters = {
    page: selectedPage,
    ...(selectedTag      && { tag:      selectedTag }),
    ...(selectedAuthor   && { author:   selectedAuthor }),
    ...(selectedUserId   && { userId:   selectedUserId }),
    ...(selectedDateFrom && { dateFrom: selectedDateFrom }),
    ...(selectedDateTo   && { dateTo:   selectedDateTo }),
    ...(selectedSort     && { sort:     selectedSort }),
  };

  const { memes, memeOfTheDay, currentPage, totalPages, totalItems, loading, error } = useMemeList({
    token,
    authLoaded,
    filters: apiFilters,
    showMemeOfDay: !hasActiveFilters && selectedPage === 1,
  });

  if (loading) return <Center h="60vh"><Loader size="lg" /></Center>;
  if (error)   return <Container size="md" py="xl"><Alert color="red">{error}</Alert></Container>;

  return (
    <Container size="lg" py="xl">

      {/* Meme del giorno */}
      {!hasActiveFilters && selectedPage === 1 && (
        <MemeOfTheDay meme={memeOfTheDay} />
      )}

      {/* Controlli filtri */}
      <Group mb="md" mt="xl">
        <Button variant="light" onClick={() => setShowFilters((p) => !p)}>Filtra</Button>
        {hasActiveFilters && (
          <Button variant="subtle" color="gray" onClick={resetFilters}>Rimuovi filtri</Button>
        )}
      </Group>

      {showFilters && (
        <FilterPanel
          sortInput={sortInput} setSortInput={setSortInput}
          tagInput={tagInput}   setTagInput={setTagInput}
          authorInput={authorInput} setAuthorInput={setAuthorInput}
          dateFromInput={dateFromInput} setDateFromInput={setDateFromInput}
          onApply={applyFilters} onReset={resetFilters}
        />
      )}

      {hasActiveFilters && (
        <FilterBanner
          isMineFilter={isMineFilter}
          selectedUserId={selectedUserId} selectedUsername={selectedUsername}
          selectedTag={selectedTag} selectedAuthor={selectedAuthor}
          selectedDateFrom={selectedDateFrom} selectedDateTo={selectedDateTo}
          selectedSort={selectedSort}
          onReset={resetFilters}
        />
      )}

      {/* Griglia meme */}
      {memes.length === 0 ? (
        <Text>Nessun meme disponibile.</Text>
      ) : (
        <>
          <Text size="sm" c="dimmed" mb="md">Risultati: {totalItems}</Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {memes.map((meme) => <MemeCard key={meme.id} meme={meme} />)}
          </SimpleGrid>
          {totalPages > 1 && (
            <Center mt="xl">
              <Pagination total={totalPages} value={currentPage} onChange={handlePageChange} />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}

export default HomePage;