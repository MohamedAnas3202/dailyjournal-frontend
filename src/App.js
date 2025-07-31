import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import UserSearchPage from './pages/UserSearchPage';
import UserJournals from './pages/UserJournals';
import PublishedJournals from './pages/PublishedJournals';
import FriendRequests from './components/FriendRequests';
import { AuthProvider } from './context/AuthContext';
import MyAppBar from './components/AppBar';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <CssBaseline />
      {!hideHeader && <MyAppBar />}
      <Container maxWidth={hideHeader ? false : "lg"} sx={{ p: hideHeader ? 0 : 3 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/published-journals" element={<PrivateRoute />}>
              <Route path="" element={<PublishedJournals />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
            <Route path="/users/search" element={<PrivateRoute />}>
              <Route path="" element={<UserSearchPage />} />
            </Route>
            <Route path="/user-journals/:userId" element={<PrivateRoute />}>
              <Route path="" element={<UserJournals />} />
            </Route>
            <Route path="/friend-requests" element={<PrivateRoute />}>
              <Route path="" element={<FriendRequests />} />
            </Route>
            <Route path="/admin" element={<PrivateRoute requiredRole="ROLE_ADMIN" />}>
              <Route path="" element={<AdminDashboard />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;