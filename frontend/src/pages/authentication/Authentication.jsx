import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
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
import "./Authentication.css";

export default function Authentication() {
  const navigate = useNavigate();
  const isLoginPage = useLocation().state?.isLogin;
  const isLoggingOut = useLocation().state?.logout;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isLoggingOut) {
      const logout = async () => {
        await signOut(auth);
      };
      logout();
    }
  }, []);

  useEffect(() => {
    if (isLoginPage != null) {
      setIsLogin(isLoginPage);
    }
  }, [isLoginPage]);

  async function authenticate() {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <Paper id="authentication-body">
      <Container size={420} my={40}>
        <Title ta="center">Welcome to Matador!</Title>

        <Paper id="auth-form" withBorder shadow="md" radius="md">
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
              onClick={() => setIsLogin((prev) => !prev)}
              size="xs"
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Anchor>
            <Button onClick={authenticate} radius="md">
              {isLogin ? "Login" : "Register"}
            </Button>
          </Group>
        </Paper>
      </Container>
    </Paper>
  );
}
