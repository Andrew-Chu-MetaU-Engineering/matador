import PropTypes from "prop-types";
import { useState } from "react";
import {
  Paper,
  Group,
  Box,
  Text,
  Divider,
  ActionIcon,
  TextInput,
  NumberInput,
  Checkbox,
  Rating,
  SegmentedControl,
} from "@mantine/core";

import {
  IconMapSearch,
  IconMap2,
  IconAdjustments,
  IconArrowRight,
} from "@tabler/icons-react";
import "./Search.css";

export default function Search({ form, handleSearch }) {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <Paper id="search-pane" shadow="xs" radius="md">
      <form onSubmit={form.onSubmit((values) => handleSearch(values))}>
        <TextInput
          key={form.key("originAddress")}
          {...form.getInputProps("originAddress")}
          radius="md"
          size="md"
          mb="xs"
          placeholder="Origin address"
          leftSection={<IconMap2 stroke={1.5} />}
        />
        <span id="searchbar-span">
          <div id="searchbar-wrapper">
            <TextInput
              key={form.key("query")}
              {...form.getInputProps("query")}
              id="searchbar"
              radius="md"
              size="md"
              placeholder="Search"
              leftSection={<IconMapSearch stroke={1.5} />}
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
            <Divider my="md" />
            <Box id="transit-filters">
              <Group>
                <NumberInput
                  key={form.key("fare")}
                  {...form.getInputProps("fare")}
                  label="Transit fare"
                  prefix="< $"
                  allowNegative={false}
                  allowDecimal={false}
                  thousandSeparator=","
                />
                <Checkbox size="xs" label="No higher fares" />
              </Group>
              <Group>
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
                <Checkbox size="xs" label="No longer durations" />
              </Group>
            </Box>
            <Divider my="md" />
            <Box id="preference-filters">
              <Box id="star-rating-wrapper">
                <Text size="sm" fw={500}>
                  Minimum rating
                </Text>
                <Box id="star-rating-spacer">
                  <Rating fractions={2} size="md" />
                </Box>
              </Box>
              <Box id="budget-wrapper">
                <Text size="sm" fw={500}>
                  Budget
                </Text>
                <SegmentedControl
                  size="xs"
                  data={[
                    { label: "$", value: "1" },
                    { label: "$$", value: "2" },
                    { label: "$$$", value: "3" },
                    { label: "$$$$", value: "4" },
                  ]}
                />
              </Box>
            </Box>
            <Box id="misc-preferences">
              <Checkbox label="Good for children" />
              <Checkbox label="Good for groups" />
              <Checkbox label="Wheelchair accessible" />
            </Box>
          </Box>
        )}
      </form>
    </Paper>
  );
}

Search.propTypes = {
  form: PropTypes.object.isRequired,
  handleSearch: PropTypes.func.isRequired,
};
