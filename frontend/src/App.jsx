import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";

// Move route guards **outside** App to avoid re-creating every render
const isSignedIn = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // Optional: uncomment to check expiration
    // const { exp } = jwtDecode(token);
    // if (Date.now() >= exp * 1000) {
    //   localStorage.removeItem("token");
    //   return false;
    // }
    return true;
  } catch (e) {
    return false;
  }
};

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  return isSignedIn() ? children : <Navigate to="/auth/sign-in" replace />;
};

// PublicRoute component
const PublicRoute = ({ children }) => {
  return isSignedIn() ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth/*"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
}

export default App;
