import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import { auth } from "./pages/authentication/firebase-config";
import Authentication from "./pages/authentication/Authentication";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MantineTheme from "./components/MantineTheme";

function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
      } else {
        setUserId(null);
      }
    });
  }, []);

  return (
    <MantineProvider theme={MantineTheme}>
      <Router>
        <Header userId={userId} />
        <Routes>
          <Route path="/" element={<Home userId={userId} />} />
          <Route path="/authenticate" element={<Authentication />} />
          <Route path="/profile" element={<Profile userId={userId} />} />
        </Routes>
        <Footer />
      </Router>
    </MantineProvider>
  );
}

export default App;
