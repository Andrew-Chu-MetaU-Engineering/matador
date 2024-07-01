import { Title, Group, Box, ActionIcon } from "@mantine/core";
import { IconBrandInstagram } from "@tabler/icons-react";
import "./Footer.css";

export default function Footer() {
  return (
    <Box>
      <footer id="footer">
        <Group id="footer-spacing-group">
          <Title order={2}>Matador</Title>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandInstagram stroke={1.5} />
          </ActionIcon>
        </Group>
      </footer>
    </Box>
  );
}
