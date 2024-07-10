import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import { Title, Group, Button, Box } from "@mantine/core";
import "./Header.css";

export default function Header({ userId }) {
  const navigate = useNavigate();
  return (
    <Box>
      <header id="header">
        <Group id="header-spacing-group">
          <Title order={1}>Matador</Title>
          {userId == null ? (
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
          ) : (
            <Group>
              <Button onClick={() => navigate("/profile")} variant="outline">
                Profile
              </Button>
              <Button
                onClick={() =>
                  navigate("/authenticate", {
                    state: { isLogin: true, logout: true },
                  })
                }
                variant="light"
              >
                Sign out
              </Button>
            </Group>
          )}
        </Group>
      </header>
    </Box>
  );
}

Header.propTypes = {
  userId: PropTypes.string,
};
