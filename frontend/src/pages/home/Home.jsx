import {
  Paper,
  Title,
  Group,
  Button,
  Box,
  ActionIcon,
  TextInput,
  NumberInput,
} from "@mantine/core";
import {
  IconSearch,
  IconAdjustments,
  IconArrowRight,
  IconBrandInstagram,
} from "@tabler/icons-react";
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
      <Paper id="home-body">
        <Box id="search-panel">
          <span id="searchbox-span">
            <TextInput
              radius="md"
              size="md"
              placeholder="Search"
              leftSection={<IconSearch stroke={1.5} />}
              rightSection={
                <ActionIcon radius="sm" variant="light">
                  <IconArrowRight stroke={1.5} />
                </ActionIcon>
              }
            />
            <ActionIcon variant="filled">
              <IconAdjustments stroke={1.5} />
            </ActionIcon>
          </span>
          <Box id="search-filters">
            <NumberInput
              label="Transit fare"
              prefix="< $"
              allowNegative={false}
              allowDecimal={false}
              thousandSeparator=","
            />
            <NumberInput
              label="Transit duration"
              prefix="< "
              suffix=" min"
              allowNegative={false}
              allowDecimal={false}
              thousandSeparator=","
            />
          </Box>
        </Box>
        <Box id="map-area">
          <h1>Map Area</h1>
        </Box>
      </Paper>
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
