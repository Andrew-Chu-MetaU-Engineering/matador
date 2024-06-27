import { useEffect, useState } from "react";
import { Paper, Box, ActionIcon, TextInput, NumberInput } from "@mantine/core";
import {
  IconSearch,
  IconAdjustments,
  IconArrowRight,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TransitMap from "./TransitMap";
import "./Home.css";

export default function Home() {
  const EXPRESS_API = import.meta.env.VITE_EXPRESS_API;
  const [places, setPlaces] = useState([]);
  const [route, setRoute] = useState(null);
  const [search, setSearch] = useState({
    query: "",
    fare: 0,
    duration: 0,
  });

  useEffect(() => {
    const { query } = search;
    if (!query) return;
    fetchPlaces(query, {
      latitude: 37.3888,
      longitude: -122.0823,
    });
  }, [search.query]);

  useEffect(() => {
    if (!places || places.length === 0) return;
    fetchRoute(places[0].formattedAddress, places[1].formattedAddress);
  }, [places]);

  useEffect(() => {
    console.log(route);
  }, [route]);

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
      setRoute(data.routes[0]); // TODO figure out why this works
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }

  function handleSearch(values) {
    setSearch({ ...values });
    // TODO implement UI interactions for search
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      query: "",
      fare: null, // null to display no value
      duration: null,
    },
  });

  return (
    <>
      <Header />
      <Paper id="home-body">
        <Box id="search-panel">
          <form onSubmit={form.onSubmit((values) => handleSearch(values))}>
            <span id="searchbox-span">
              <TextInput
                key={form.key("query")}
                {...form.getInputProps("query")}
                radius="md"
                size="md"
                placeholder="Search"
                leftSection={<IconSearch stroke={1.5} />}
                rightSection={
                  <ActionIcon type="submit" radius="sm" variant="light">
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
                key={form.key("fare")}
                {...form.getInputProps("fare")}
                label="Transit fare"
                prefix="< $"
                allowNegative={false}
                allowDecimal={false}
                thousandSeparator=","
              />
              <NumberInput
                key={form.key("duration")}
                {...form.getInputProps("duration")}
                label="Transit duration"
                prefix="< "
                suffix=" min"
                allowNegative={false}
                allowDecimal={false}
                thousandSeparator=","
              />
            </Box>
          </form>

          <Box>
            {places &&
              places.map((place) => (
                <p key={place.displayName.text}>{place.displayName.text}</p>
              ))}
          </Box>
        </Box>
        <Box id="map-area">
          {route?.polyline?.encodedPolyline && (
            <TransitMap
              id="google-map"
              encodedPath={route.polyline.encodedPolyline}
            />
          )}
        </Box>
      </Paper>
      <Footer />
    </>
  );
}
