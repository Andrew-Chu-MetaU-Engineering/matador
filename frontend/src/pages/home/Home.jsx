import { useEffect, useState } from "react";
import PropTypes from "prop-types";
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

export default function Home({ user }) {
  const {
    VITE_EXPRESS_API,
    VITE_ORIGIN_ADDRESS,
    VITE_DEFAULT_VIEW_LAT,
    VITE_DEFAULT_VIEW_LNG,
  } = import.meta.env;
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState({
    query: "",
    fare: 0,
    duration: 0,
  });
  const [options, setOptions] = useState([]);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (user != null) fetchProfile(user);
  }, [user]);

  async function fetchProfile(user) {
    try {
      let url = new URL(`user/${user.uid}`, VITE_EXPRESS_API);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      let profile = await response.json();
      setProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  useEffect(() => {
    const { query } = search;
    if (!query) return;
    fetchRecommendations(query, {
      latitude: VITE_DEFAULT_VIEW_LAT,
      longitude: VITE_DEFAULT_VIEW_LNG,
    });
  }, [search]);

  async function fetchRecommendations(searchQuery, center) {
    try {
      let url = new URL("recommend", VITE_EXPRESS_API);
      url.searchParams.append("user", profile.id);
      url.searchParams.append("originAddress", VITE_ORIGIN_ADDRESS);
      url.searchParams.append("searchQuery", searchQuery);
      url.searchParams.append("centerLatitude", center.latitude);
      url.searchParams.append("centerLongitude", center.longitude);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      const recommendations = await response.json();
      setOptions(recommendations);
      setRoute(recommendations[0].route);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
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
            {options &&
              options.map((option) => (
                <div key={option.place.id}>
                  <h4>{option.place.displayName.text}</h4>
                </div>
              ))}
          </Box>
        </Box>
        <Box id="map-area">
          <TransitMap
            id="google-map"
            encodedPath={route?.polyline?.encodedPolyline}
          />
        </Box>
      </Paper>
      <Footer />
    </>
  );
}

Home.propTypes = {
  user: PropTypes.object,
};
