import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Paper, Box, ScrollArea, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";

import SearchPane from "./search/SearchPane";
import RouteDetail from "./routedetail/RouteDetail";
import TransitMap from "../../components/TransitMap";
import Isograph from "./Isograph";
import "./Home.css";

export default function Home({ userId }) {
  const { VITE_EXPRESS_API } = import.meta.env;
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState([]);
  const [activeOption, setActiveOption] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [isographSettings, setIsographSettings] = useState({
    originAddress: "",
    costType: "",
    departureTime: "",
  });

  useEffect(() => {
    if (userId != null) fetchProfile(userId);
  }, [userId]);

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

  async function fetchRecommendations(query, settings) {
    try {
      setIsResultsLoading(true);
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
      setNoResultsFound(recommendations.length === 0);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
    setIsResultsLoading(false);
  }

  async function handleFormSubmit(values, e) {
    switch (
      e.nativeEvent.submitter.name // value from component name
    ) {
      case "search":
        await handleSearch(values);
        break;
      case "isograph":
        handleDisplayIsograph(values);
        break;
    }
  }

  async function handleSearch(values) {
    setOptions(null);
    setActiveOption(null);
    setNoResultsFound(false);

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

  function handleDisplayIsograph(values) {
    const { originAddress, departureTime, isCurrentDepartureTime, costType } =
      values;
    setIsographSettings({
      originAddress: originAddress,
      costType: costType.toLowerCase(),
      departureTime: isCurrentDepartureTime
        ? new Date(Date.now()).toISOString()
        : dayjs(departureTime).toISOString(),
    });
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
      costType: "Duration",
    },
    validate: {
      originAddress: (value) =>
        value.length < 1 ? "Enter an origin address" : null,
    },
  });

  return (
    <>
      <Paper id="home-body">
        <section id="search-panel">
          <Search form={form} handleFormSubmit={handleFormSubmit} />
          {isResultsLoading && (
            <div id="results-loading-wrapper">
              <Loader color="blue" size="xl" type="dots" />
            </div>
          )}
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
            {noResultsFound && (
              <p>No results found. Please try a different search.</p>
            )}
          </ScrollArea>
        </section>
        <Box id="map-area">
          <TransitMap
            id="google-map"
            encodedPath={activeOption?.route}
            setMapBounds={setMapBounds}
          >
            <Isograph isographSettings={isographSettings} />
          </TransitMap>
        </Box>
      </Paper>
    </>
  );
}

Home.propTypes = {
  userId: PropTypes.string,
};
