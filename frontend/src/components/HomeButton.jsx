import { useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";
import { IconMap, IconArrowLeft } from "@tabler/icons-react";

function HomeButton() {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate("/")}
      leftSection={<IconArrowLeft size={14} />}
      rightSection={<IconMap size={14} />}
      variant="filled"
      m="md"
      radius="lg"
    >
      Home
    </Button>
  );
}

export default HomeButton;
