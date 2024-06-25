import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import Home from "./pages/home/Home";

function App() {
  return (
    <MantineProvider>
      <Home />
    </MantineProvider>
  );
}

export default App;
