import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
import { useEffect } from "react";
import AppContext from "../contexts/AppContext";

function App() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Invoke the hook. It's necessary to invoke the hook in both
  // components.
  const location = useLocation();

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
          navigate("/login");
        })
        .catch(console.error);
    }
  };

  const handleLogin = ({ username, password }) => {
    if (!username || !password) {
      return;
    }

    auth
      .authorize(username, password)
      .then((data) => {
        if (data.jwt) {
          setToken(data.jwt);
          setUserData(data.user);
          setIsLoggedIn(true);

          // After login, instead of navigating always to /ducks,
          // navigate to the location that is stored in state. If
          // there is no stored location, we default to
          // redirecting to /ducks.
          const redirectPath = location.state?.from?.pathname || "/ducks";
          navigate(redirectPath);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    const jwt = getToken();

    if (!jwt) {
      return;
    }

    api
      .getUserInfo(jwt)
      .then(({ username, email }) => {
        setIsLoggedIn(true);
        setUserData({ username, email });
        // Remove the call to the navigate() hook: it's not
        // necessary anymore.
      })
      .catch(console.error);
  }, []);

  return (
    <AppContext.Provider value={{ isLoggedIn }}>
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
            <ProtectedRoute>
              {" "}
              {/* When isLoggedIn is true, the Profile route will be rendered */}
              <MyProfile userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            <ProtectedRoute>
              <div className="loginContainer">
                <Login handleLogin={handleLogin} />
              </div>
            </ProtectedRoute>
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
    </AppContext.Provider>
  );
}

export default App;
