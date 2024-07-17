import PropTypes from "prop-types";
import { useState } from "react";
import {
  Paper,
  Group,
  ActionIcon,
  TextInput,
  Button,
  Checkbox,
  SegmentedControl,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import "@mantine/dates/styles.css";
import {
  IconMapSearch,
  IconMap2,
  IconAdjustments,
  IconArrowRight,
} from "@tabler/icons-react";
import SearchFilters from "./SearchFilters";
import "./Search.css";

export default function Search({ form, handleSearch }) {
  const [showFilters, setShowFilters] = useState(true);
  const [useCurrentAsDepartureTime, setUseCurrentAsDepartureTime] =
    useState(true);

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
        <DateTimePicker
          key={form.key("departureTime")}
          {...form.getInputProps("departureTime")}
          valueFormat="MMM DD, YYYY hh:mm A"
          disabled={useCurrentAsDepartureTime}
          label="Departure time"
          placeholder="Pick date and time"
          mt="xs"
        />
        <Checkbox
          key={form.key("isCurrentDepartureTime")}
          {...form.getInputProps("isCurrentDepartureTime", {
            type: "checkbox",
          })}
          onChange={(e) =>
            setUseCurrentAsDepartureTime(e.currentTarget.checked)
          }
          size="xs"
          label="Leave now"
          mt="xs"
        />
        <Group justify="space-between" mt="md" mb="md">
          <SegmentedControl data={["Duration", "Fare"]} />
          <Button variant="filled">Explore</Button>
        </Group>
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
                <ActionIcon type="submit" radius="sm" variant="filled">
                  <IconArrowRight stroke={1.5} />
                </ActionIcon>
              }
            />
          </div>
          <ActionIcon
            id="filters-button"
            onClick={() => setShowFilters(!showFilters)}
            variant="light"
          >
            <IconAdjustments stroke={1.5} />
          </ActionIcon>
        </span>
        {showFilters && <SearchFilters form={form} />}
      </form>
    </Paper>
  );
}

Search.propTypes = {
  form: PropTypes.object.isRequired,
  handleSearch: PropTypes.func.isRequired,
};
