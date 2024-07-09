import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import { auth } from "./pages/authentication/firebase-config";
import Home from "./pages/home/Home";
import Authentication from "./pages/authentication/Authentication";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
    <MantineProvider>
      <Router>
        <Header userId={userId} />
        <Routes>
          <Route path="/" element={<Home userId={userId} />} />
          <Route path="/authenticate" element={<Authentication />} />
        </Routes>
        <Footer />
      </Router>
    </MantineProvider>
  );
}

export default App;
