import PropTypes from "prop-types";
import { useState } from "react";
import {
  Paper,
  Card,
  Text,
  Box,
  ActionIcon,
  TextInput,
  NumberInput,
} from "@mantine/core";

import {
  IconSearch,
  IconAdjustments,
  IconArrowRight,
} from "@tabler/icons-react";
import "./Search.css";

export function SearchResult({ option }) {
  return (
    <Card shadow="xs" padding="md" radius="md" mb="xs">
      <Text size="lg">{option.place.displayName.text}</Text>
      <Text size="md" c="dimmed" truncate="end">
        1h 26m &middot; $6.25
      </Text>
    </Card>
  );
}

export function Search({ form, handleSearch }) {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <Paper id="search-pane" shadow="xs" radius="md">
      <form onSubmit={form.onSubmit((values) => handleSearch(values))}>
        <span id="searchbar-span">
          <div id="searchbar-wrapper">
            <TextInput
              key={form.key("query")}
              {...form.getInputProps("query")}
              id="searchbar"
              radius="md"
              size="md"
              placeholder="Search"
              leftSection={<IconSearch stroke={1.5} />}
              rightSection={
                <ActionIcon type="submit" radius="sm" variant="light">
                  <IconArrowRight stroke={1.5} />
                </ActionIcon>
              }
            />
          </div>
          <ActionIcon
            id="filters-button"
            onClick={() => setShowFilters(!showFilters)}
            variant="filled"
          >
            <IconAdjustments stroke={1.5} />
          </ActionIcon>
        </span>
        {showFilters && (
          <Box id="search-filters">
            <NumberInput
              key={form.key("fare")}
              {...form.getInputProps("fare")}
              label="Transit fare"
              prefix="< $"
              allowNegative={false}
              allowDecimal={false}
              thousandSeparator=","
            />
            <NumberInput
              key={form.key("duration")}
              {...form.getInputProps("duration")}
              label="Transit duration"
              prefix="< "
              suffix=" min"
              allowNegative={false}
              allowDecimal={false}
              thousandSeparator=","
            />
          </Box>
        )}
      </form>
    </Paper>
  );
}

SearchResult.propTypes = {
  option: PropTypes.object.isRequired,
};
Search.propTypes = {
  form: PropTypes.object.isRequired,
  handleSearch: PropTypes.func.isRequired,
};
