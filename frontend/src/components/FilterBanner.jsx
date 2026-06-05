import { Alert, Group, Text, Button } from "@mantine/core";

/**
 * Banner viola che mostra i filtri attivi nella HomePage.
 */
function FilterBanner({
  isMineFilter, selectedUserId, selectedUsername,
  selectedTag, selectedAuthor, selectedDateFrom, selectedDateTo, selectedSort,
  onReset,
}) {
  return (
    <Alert color="violet" mb="lg">
      <Group justify="space-between">
        <Text>
          Filtri attivi:
          {isMineFilter && <> <strong>I miei meme</strong></>}
          {!isMineFilter && selectedUserId && (
            <> creatore <strong>{selectedUsername || `ID ${selectedUserId}`}</strong></>
          )}
          {selectedTag      && <> tag <strong>{selectedTag}</strong></>}
          {selectedAuthor   && <> creatore <strong>{selectedAuthor}</strong></>}
          {selectedDateFrom && <> da <strong>{selectedDateFrom}</strong></>}
          {selectedDateTo   && <> a <strong>{selectedDateTo}</strong></>}
          {selectedSort     && <> ordinamento <strong>{selectedSort}</strong></>}
        </Text>
        <Button onClick={onReset} variant="light" size="xs">
          Rimuovi filtri
        </Button>
      </Group>
    </Alert>
  );
}

export default FilterBanner;
