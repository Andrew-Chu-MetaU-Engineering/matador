import PropTypes from "prop-types";
import {
  Group,
  Box,
  Text,
  Divider,
  NumberInput,
  Checkbox,
  Rating,
  SegmentedControl,
} from "@mantine/core";
import "./SearchFilter.css";

export default function SearchFilters({ form }) {
  return (
    <Box id="search-filters">
      <Divider mt="md" label="Transit" labelPosition="left" />
      <Box id="transit-filters">
        <Group>
          <NumberInput
            key={form.key("fare")}
            {...form.getInputProps("fare")}
            label="Fare"
            prefix="< $"
            allowNegative={false}
            allowDecimal={false}
            thousandSeparator=","
          />
          <Checkbox
            key={form.key("strictFare")}
            {...form.getInputProps("strictFare", { type: "checkbox" })}
            size="xs"
            label="No higher fares"
          />
        </Group>
        <Group>
          <NumberInput
            key={form.key("duration")}
            {...form.getInputProps("duration")}
            label="Travel duration"
            prefix="< "
            suffix=" min"
            allowNegative={false}
            allowDecimal={false}
            thousandSeparator=","
          />
          <Checkbox
            key={form.key("strictDuration")}
            {...form.getInputProps("strictDuration", {
              type: "checkbox",
            })}
            size="xs"
            label="No longer durations"
          />
        </Group>
      </Box>

      <Divider mt="md" mb="xs" label="Preferences" labelPosition="left" />
      <Box id="preference-filters">
        <Box id="star-rating-wrapper">
          <Text size="sm" fw={500}>
            Minimum rating
          </Text>
          <Box id="star-rating-spacer">
            <Rating
              key={form.key("minRating")}
              {...form.getInputProps("minRating")}
              fractions={2}
              size="md"
            />
          </Box>
        </Box>
        <Box id="budget-wrapper">
          <Text size="sm" fw={500}>
            Budget
          </Text>
          <SegmentedControl
            key={form.key("budget")}
            {...form.getInputProps("budget", { type: "checkbox" })}
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
        <Checkbox
          key={form.key("goodForChildren")}
          {...form.getInputProps("goodForChildren", {
            type: "checkbox",
          })}
          label="Good for children"
        />
        <Checkbox
          key={form.key("goodForGroups")}
          {...form.getInputProps("goodForGroups", {
            type: "checkbox",
          })}
          label="Good for groups"
        />
        <Checkbox
          key={form.key("isAccessible")}
          {...form.getInputProps("isAccessible", {
            type: "checkbox",
          })}
          label="Wheelchair accessible"
        />
      </Box>
    </Box>
  );
}

SearchFilters.propTypes = {
  form: PropTypes.object.isRequired,
};
