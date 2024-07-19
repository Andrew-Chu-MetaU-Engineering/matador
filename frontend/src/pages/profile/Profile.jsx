import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { TextInput, Paper, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import InterestItem from "./InterestItem";
import "./Profile.css";
import HomeButton from "../../components/HomeButton";

function Profile({ userId }) {
  const { VITE_EXPRESS_API } = import.meta.env;
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    fetchInterests();
  }, [userId]);

  async function fetchInterests() {
    if (userId == null) return;
    try {
      const response = await fetch(
        new URL(`user/${userId}/interests`, VITE_EXPRESS_API)
      );
      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      const data = await response.json();
      setInterests(data.interests);
    } catch (error) {
      console.error("Error fetching interests:", error);
    }
  }

  async function editInterests(interests) {
    try {
      const response = await fetch(
        new URL(`user/${userId}/interests`, VITE_EXPRESS_API),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interests: interests,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }

      fetchInterests();
      setInterestInput("");
    } catch (error) {
      console.error("Error editing interests:", error);
    }
  }

  async function addInterest() {
    if (interests.includes(interestInput)) return;
    await editInterests([...interests, interestInput]);
  }

  async function handleRemoveInterest(deletionInterest) {
    await editInterests(
      interests.filter((interest) => interest !== deletionInterest)
    );
  }

  return (
    <Paper id="profile-body">
      <HomeButton />
      <Paper id="profile-interest-body">
        <TextInput
          value={interestInput}
          onChange={(e) => setInterestInput(e.currentTarget.value)}
          id="profile-text-input"
          radius="xl"
          size="xl"
          placeholder="Add interests"
          rightSectionWidth={58}
          leftSection={
            <img id="profile-input-bull-icon" src="noun-project-bull.svg" />
          }
          rightSection={
            <ActionIcon
              onClick={addInterest}
              size="lg"
              radius="xl"
              variant="filled"
            >
              <IconPlus stroke={3} />
            </ActionIcon>
          }
        />

        {interests?.map((interest) => (
          <InterestItem
            key={interest}
            interest={interest}
            handleRemoveInterest={handleRemoveInterest}
          />
        ))}
      </Paper>
    </Paper>
  );
}

export default Profile;

Profile.propTypes = {
  userId: PropTypes.string,
};
