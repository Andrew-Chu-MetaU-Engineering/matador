import { Title, Group, Button, Box, ActionIcon } from "@mantine/core";
import { IconBrandInstagram } from "@tabler/icons-react";
import "./Home.css";

export default function Home() {
  return (
    <>
      <Box>
        <header id="header">
          <Group id="header-spacing-group">
            <Title order={1}>Matador</Title>
            <Group>
              <Button variant="default">Log in</Button>
              <Button>Sign up</Button>
            </Group>
          </Group>
        </header>
      </Box>
      
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
    </>
  );
}