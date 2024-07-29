import { Title, Container, Text } from "@mantine/core";
import "./Footer.css";

export default function Footer() {
  return (
    <footer id="footer">
      <Container id="footer-inner">
        <Title order={3}>Matador</Title>
        <img src="noun-project-bull.svg" id="footer-icon" />
        <Text fw={600}>
          <Text fs="italic" span inherit>
            by{" "}
          </Text>
          andrewchu
        </Text>
      </Container>
    </footer>
  );
}
