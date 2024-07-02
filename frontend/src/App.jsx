import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import Home from "./pages/home/Home";
import Authentication from "./pages/authentication/Authentication";

function App() {
  const [user, setUser] = useState(null);

  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route
            path="/login"
            element={<Authentication user={user} setUser={setUser} />}
          />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
