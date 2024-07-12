import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Paper, Box, ScrollArea } from "@mantine/core";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";

import TransitMap from "./TransitMap";
import Search from "./Search";
import SearchResult from "./SearchResult";
import "./Home.css";

export default function Home({ userId }) {
  const { VITE_EXPRESS_API } = import.meta.env;
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState([]);
  const [activeOption, setActiveOption] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [isograph, setIsograph] = useState([]);

  useEffect(() => {
    if (userId != null) fetchProfile(userId);
  }, [userId]);

  useEffect(() => {
    fetchIsograph();
  }, []);

  async function fetchProfile(userId) {
    try {
      let url = new URL(`user/${userId}`, VITE_EXPRESS_API);

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

  async function fetchIsograph() {
    // TODO to be changed to user inputs
    const ORIGIN = [37.42, -122.10];
    const COST_TYPE = "duration";
    const DEPARTURE_TIME = new Date(Date.now()).toISOString();

    try {
      let url = new URL("isograph", VITE_EXPRESS_API);
      url.searchParams.append("origin", ORIGIN);
      url.searchParams.append("costType", COST_TYPE);
      url.searchParams.append("departureTime", DEPARTURE_TIME);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      setIsograph(await response.json());
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  async function fetchRecommendations(query, settings) {
    try {
      let url = new URL("recommend", VITE_EXPRESS_API);
      url.searchParams.append("userId", profile.id);
      url.searchParams.append("searchQuery", query);
      url.searchParams.append("settings", JSON.stringify(settings));

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      const recommendations = await response.json();
      setOptions(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }

  async function handleSearch(values) {
    setOptions(null);
    setActiveOption(null);

    const {
      query,
      originAddress,
      fare,
      strictFare,
      duration,
      strictDuration,
      departureTime,
      isCurrentDepartureTime,
      minRating,
      budget,
      goodForChildren,
      goodForGroups,
      isAccessible,
    } = values;

    const { north, south, east, west } = mapBounds;
    const settings = {
      originAddress: originAddress,
      locationBias: {
        low: { latitude: south, longitude: west },
        high: { latitude: north, longitude: east },
      },
      departureTime: isCurrentDepartureTime
        ? new Date(Date.now()).toISOString()
        : dayjs(departureTime).toISOString(),
      preferredFare: {
        fare: fare,
        isStrong: strictFare,
      },
      preferredDuration: {
        duration: duration,
        isStrong: strictDuration,
      },
      budget: budget,
      minRating: minRating,
      goodForChildren: goodForChildren,
      goodForGroups: goodForGroups,
      isAccessible: isAccessible,
    };
    await fetchRecommendations(query, settings);
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      query: "",
      originAddress: "",
      fare: null, // null to display no value
      strictFare: false,
      duration: null,
      strictDuration: false,
      departureTime: null,
      isCurrentDepartureTime: true,
      minRating: 0,
      budget: "1", // SegmentedControl component takes str vals
      goodForChildren: false,
      goodForGroups: false,
      isAccessible: false,
    },
  });

  return (
    <>
      <Paper id="home-body">
        <section id="search-panel">
          <Search form={form} handleSearch={handleSearch} />
          <ScrollArea id="results-scrollarea">
            {options?.length > 0 &&
              options.map((option) => (
                <SearchResult
                  key={option.place.id}
                  option={option}
                  active={activeOption?.id === option.place.id}
                  setActiveOption={setActiveOption}
                />
              ))}
          </ScrollArea>
        </section>
        <Box id="map-area">
          <TransitMap
            id="google-map"
            encodedPath={activeOption?.route}
            isograph={isograph}
            setMapBounds={setMapBounds}
          />
        </Box>
      </Paper>
    </>
  );
}

Home.propTypes = {
  userId: PropTypes.string,
};
