import { Title, Group, Button, Box } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  return (
    <Box>
      <header id="header">
        <Group id="header-spacing-group">
          <Title order={1}>Matador</Title>
          <Group>
            <Button
              onClick={() =>
                navigate("/authenticate", { state: { isLogin: true } })
              }
              variant="default"
            >
              Log in
            </Button>
            <Button
              onClick={() =>
                navigate("/authenticate", { state: { isLogin: false } })
              }
            >
              Sign up
            </Button>
          </Group>
        </Group>
      </header>
    </Box>
  );
}
