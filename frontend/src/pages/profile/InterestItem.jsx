import PropTypes from "prop-types";
import { Card, Group, Text, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export default function InterestItem({ interest, handleRemoveInterest }) {
  return (
    <Card mt="xs" shadow="sm" p="sm" pl="lg" radius="lg" withBorder>
      <Group justify="space-between">
        <Text fw={500}>{interest}</Text>
        <ActionIcon
          onClick={() => handleRemoveInterest(interest)}
          variant="light"
        >
          <IconX stroke={1} />
        </ActionIcon>
      </Group>
    </Card>
  );
}

InterestItem.propTypes = {
  interest: PropTypes.string.isRequired,
  handleRemoveInterest: PropTypes.func.isRequired,
};
