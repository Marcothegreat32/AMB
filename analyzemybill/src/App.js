// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import Contact from './pages/Contact'

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Chat from "./pages/Chat";
import Vault from "./pages/Vault";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PolicyUpload from "./pages/PolicyUpload";
import Pricing from './pages/Pricing';
import PrivateRoute from './PrivateRoute';
import ManageSubscription from './pages/ManageSubscription';
import SubscriptionRoute from './components/SubscriptionRoute';
import Help from './pages/Help';
import FAQ from './pages/FAQ';

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/manage"
          element={
            <SubscriptionRoute>
              <ManageSubscription />
            </SubscriptionRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/vault"
          element={
            <PrivateRoute>
              <Vault />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/upload-policy" element={
          <PrivateRoute><PolicyUpload /></PrivateRoute>
        } />

        {/* Fallback for unknown URLs */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
