import { Title, Group, Button, Box } from "@mantine/core";
import "./Home.css";

export default function Home() {
  return (
    <Box pb={120}>
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
  );
}
