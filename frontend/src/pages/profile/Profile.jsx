import { TextInput, Paper, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import "./Profile.css";

function Profile() {
  return (
    <Paper id="profile-body">
      <TextInput
        id="profile-text-input"
        radius="xl"
        size="xl"
        placeholder="Add interests"
        rightSectionWidth={58}
        leftSection={
          <img id="profile-input-bull-icon" src="noun-project-bull.svg" />
        }
        rightSection={
          <ActionIcon size="lg" radius="xl" variant="filled">
            <IconPlus stroke={3} />
          </ActionIcon>
        }
      />
    </Paper>
  );
}

export default Profile;
