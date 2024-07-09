import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Paper, Box } from "@mantine/core";
import { useForm } from "@mantine/form";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TransitMap from "./TransitMap";
import Search from "./Search";
import SearchResult from "./SearchResult";
import "./Home.css";

export default function Home({ userId }) {
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
  const [mapBounds, setMapBounds] = useState(null);

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
      <Header />
      <Paper id="home-body">
        <section id="search-panel">
          <Search form={form} handleSearch={handleSearch} />
          <Box>
            {options?.length > 0 &&
              options.map((option) => (
                <SearchResult key={option.place.id} option={option} />
              ))}
          </Box>
        </section>
        <Box id="map-area">
          <TransitMap
            id="google-map"
            encodedPath={route?.polyline?.encodedPolyline}
            setMapBounds={setMapBounds}
          />
        </Box>
      </Paper>
      <Footer />
    </>
  );
}

Home.propTypes = {
  userId: PropTypes.string,
};
