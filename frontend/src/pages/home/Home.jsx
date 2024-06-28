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
import TransitMap from "./TransitMap";
import "./Home.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [route, setRoute] = useState(null);
  const EXPRESS_API = import.meta.env.VITE_EXPRESS_API;

  useEffect(() => {
    fetchPlaces("chinese restaurants in mountain view", {
      latitude: 37.3888,
      longitude: -122.0823,
    });
  }, []);

  useEffect(() => {
    if ((places?.length ?? 0) < 2) return;
    fetchRoute(places[0].formattedAddress, places[1].formattedAddress);
  }, [places]);

  async function fetchPlaces(searchQuery, center) {
    try {
      let url = new URL("gNearbyPlaces", EXPRESS_API);
      url.searchParams.append("searchQuery", searchQuery);
      url.searchParams.append("centerLatitude", center.latitude);
      url.searchParams.append("centerLongitude", center.longitude);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      const data = await response.json();
      setPlaces(data.places);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  }

  async function fetchRoute(origin, destination) {
    try {
      let url = new URL("gComputeRoutes", EXPRESS_API);
      url.searchParams.append("originAddress", origin);
      url.searchParams.append("destinationAddress", destination);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      const data = await response.json();
      setRoute(data.routes[0]);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }

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
          <Box>
            {places?.map((place) => (
                <p key={place.displayName.text}>{place.displayName.text}</p>
              ))}
          </Box>
        </Box>
        <Box id="map-area">
          {route?.polyline?.encodedPolyline && (
            <TransitMap id="google-map" encodedPath={route.polyline.encodedPolyline} />
          )}
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
