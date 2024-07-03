import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useToggle, upperFirst } from "@mantine/hooks";
import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Container,
  Group,
  Button,
} from "@mantine/core";
import { auth } from "./firebase-config";

export default function Authentication({ user, setUser }) {
  const navigate = useNavigate();
  const [type, toggle] = useToggle(["login", "register"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  async function authenticate() {
    try {
      if (type === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail("");
      setPassword("");
      navigate("/")
    } catch (error) {
      console.log(error.message);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <div>
      <Container size={420} my={40}>
        <Title ta="center">Welcome to Matador!</Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            label="Email"
            placeholder="hi@gmail.com"
            required
          />
          <PasswordInput
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            label="Password"
            placeholder="Password"
            required
            mt="md"
          />
          <Group justify="space-between" mt="xl">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={() => toggle()}
              size="xs"
            >
              {type === "register"
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Anchor>
            <Button onClick={authenticate} radius="md">
              {upperFirst(type)}
            </Button>
          </Group>
        </Paper>
      </Container>

      {/* TODO implement login page sign out*/}
      <h4> User Logged In: </h4>
      {user?.email}
      <button onClick={logout}> Sign Out </button>
    </div>
  );
}

Authentication.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};
