import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Ducks from "./Ducks";
import Login from "./Login";
import MyProfile from "./MyProfile";
import Register from "./Register";
import "./styles/App.css";
import { useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth";
import { setToken, getToken } from "../utils/token";
import * as api from "../utils/api";

function App() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  //check for token on initial page load
  useEffect(() => {
    const jwt = getToken();

    if (!jwt) {
      //if no token, end function
      return;
    }

    // Call the function, passing it the JWT.
    api
      .getUserInfo(jwt)
      .then(({ username, email }) => {
        // If the response is successful, log the user in, save their
        // data to state, and navigate them to /ducks.
        setIsLoggedIn(true);
        setUserData({ username, email });
        navigate("/ducks");
      })
      .catch(console.error);
    // TODO - handle JWT
  }, []);

  // New
  const handleRegistration = ({
    username,
    email,
    password,
    confirmPassword,
  }) => {
    if (password === confirmPassword) {
      auth
        .register(username, password, email)
        .then(() => {
          // TODO: handle succesful registration
          navigate("/login"); //Navigate user to login page
        })
        .catch(console.error);
    }
  };

  // handleLogin accepts one parameter: an object with two properties.
  const handleLogin = ({ username, password }) => {
    // If username or password empty, return without sending a request.
    if (!username || !password) {
      return;
    }

    // We pass the username and password as positional arguments. The
    // authorize function is set up to rename `username` to `identifier`
    // before sending a request to the server, because that is what the
    // API is expecting.
    auth
      .authorize(username, password)
      .then((data) => {
        console.log(data);
        // Verify that a jwt is included before logging the user in.
        if (data.jwt) {
          setToken(data.jwt); //save token to local storage
          console.log(data.jwt);
          setUserData(data.user); // save user's data to state
          setIsLoggedIn(true); // log the user in
          navigate("/ducks"); // send them to /ducks
        }
      })
      .catch(console.error);
  };

  return (
    <Routes>
      {/* Wrap Ducks in ProtectedRoute and pass isLoggedIn as a prop. */}
      <Route
        path="/ducks"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            {" "}
            {/* When isLogginIn is true, the Ducks route will be rendered */}
            <Ducks />
          </ProtectedRoute>
        }
      />

      {/* Wrap MyProfile in ProtectedRoute and pass isLoggedIn as a prop. */}
      <Route
        path="/my-profile"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            {" "}
            {/* When isLoggedIn is true, the Profile route will be rendered */}
            <MyProfile userData={userData} />
          </ProtectedRoute>
        }
      />

      <Route path="/my-profile" element={<MyProfile />} />
      <Route
        path="/login"
        element={
          <div className="loginContainer">
            <Login handleLogin={handleLogin} />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="registerContainer">
            <Register handleRegistration={handleRegistration} />
          </div>
        }
      />
      <Route
        path="*"
        element={
          isLoggedIn ? (
            <Navigate to="/ducks" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
