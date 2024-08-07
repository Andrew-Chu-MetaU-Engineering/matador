import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Paper, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
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
  const [isRouteDetailDisplayed, setIsRouteDetailDisplayed] = useState(null);

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

  async function handleLikePlace(placeId, isUnlike) {
    try {
      const response = await fetch(
        new URL(`user/${userId}/likeAndUpdateWeights`, VITE_EXPRESS_API),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            placeId: placeId,
            options: options,
            isUnlike: isUnlike,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      await fetchProfile(userId);
    } catch (error) {
      console.error("Error updating likes and weights:", error);
    }
  }

  return (
    <>
      <Paper id="home-body">
        <section id="home-panel">
          {isRouteDetailDisplayed ? (
            <RouteDetail
              option={activeOption}
              setIsRouteDetailDisplayed={setIsRouteDetailDisplayed}
            />
          ) : (
            <SearchPane
              form={form}
              handleFormSubmit={handleFormSubmit}
              options={options}
              isResultsLoading={isResultsLoading}
              noResultsFound={noResultsFound}
              activeOption={activeOption}
              setActiveOption={setActiveOption}
              setIsRouteDetailDisplayed={setIsRouteDetailDisplayed}
              likedPlaces={profile?.likedPlaces}
              handleLikePlace={handleLikePlace}
            />
          )}
        </section>
        <Box id="map-area">
          <TransitMap
            id="google-map"
            encodedPath={activeOption?.route.polyline.encodedPolyline}
            setMapBounds={setMapBounds}
          >
            {options?.map((option) => {
              const {
                id,
                location: { longitude, latitude },
              } = option.place;
              return (
                <AdvancedMarker
                  key={id}
                  position={{ lat: latitude, lng: longitude }}
                />
              );
            })}
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
