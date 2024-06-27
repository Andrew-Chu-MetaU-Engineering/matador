import { Title, Group, Button, Box } from "@mantine/core";
import "./Header.css";

export default function Header() {
  return (
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
  );
}
