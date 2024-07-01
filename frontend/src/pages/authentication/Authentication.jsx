import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase-config";

export default function Authentication() {
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [user, setUser] = useState({});

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  async function register() {
    try {
      await createUserWithEmailAndPassword(
        auth,
        registrationEmail,
        registrationPassword
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <div className="App">
      <div>
        <h3> Register User </h3>
        <input
          placeholder="Email..."
          onChange={(event) => {
            setRegistrationEmail(event.target.value);
          }}
        />
        <input
          placeholder="Password..."
          onChange={(event) => {
            setRegistrationPassword(event.target.value);
          }}
        />

        <button onClick={register}> Create User</button>
      </div>

      <div>
        <h3> Login </h3>
        <input
          placeholder="Email..."
          onChange={(event) => {
            setLoginEmail(event.target.value);
          }}
        />
        <input
          placeholder="Password..."
          onChange={(event) => {
            setLoginPassword(event.target.value);
          }}
        />

        <button onClick={login}> Login</button>
      </div>

      <h4> User Logged In: </h4>
      {user?.email}

      <button onClick={logout}> Sign Out </button>
    </div>
  );
}
