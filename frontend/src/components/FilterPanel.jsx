import { Card, SimpleGrid, TextInput, Select, Button, Group } from "@mantine/core";

const SORT_OPTIONS = [
  { value: "newest",    label: "Data: più recenti" },
  { value: "oldest",   label: "Data: più vecchi" },
  { value: "titleAsc", label: "Titolo: A-Z" },
  { value: "titleDesc",label: "Titolo: Z-A" },
  { value: "upvotes",  label: "Più upvoted" },
  { value: "downvotes",label: "Più downvoted" },
];

/**
 * Pannello a scomparsa con i campi filtro per la HomePage.
 */
function FilterPanel({
  sortInput, setSortInput,
  tagInput, setTagInput,
  authorInput, setAuthorInput,
  dateFromInput, setDateFromInput,
  onApply, onReset,
}) {
  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder mb="md">
      <form onSubmit={onApply}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="sm">
          <Select
            label="Ordina per"
            placeholder="Scegli"
            size="xs"
            value={sortInput || null}
            onChange={(value) => setSortInput(value || "")}
            clearable
            data={SORT_OPTIONS}
          />
          <TextInput
            label="Tag"
            placeholder="Es. calcio"
            size="xs"
            value={tagInput}
            onChange={(e) => setTagInput(e.currentTarget.value)}
          />
          <TextInput
            label="Creatore"
            placeholder="Es. mario"
            size="xs"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.currentTarget.value)}
          />
          <TextInput
            label="Data da"
            type="date"
            size="xs"
            value={dateFromInput}
            onChange={(e) => setDateFromInput(e.currentTarget.value)}
          />
        </SimpleGrid>

        <Group mt="sm">
          <Button type="submit" size="xs">Applica filtri</Button>
          <Button type="button" variant="light" color="gray" size="xs" onClick={onReset}>
            Reset
          </Button>
        </Group>
      </form>
    </Card>
  );
}

export default FilterPanel;
