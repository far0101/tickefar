import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Box } from '@mui/material';
import { lazy, Suspense } from 'react';

const HomePage      = lazy(() => import('./pages/HomePage'));
const EventsPage    = lazy(() => import('./pages/EventsPage'));
const EventDetail   = lazy(() => import('./pages/EventDetailPage'));
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const RegisterPage  = lazy(() => import('./pages/RegisterPage'));
const MyTickets     = lazy(() => import('./pages/MyTicketsPage'));
const AdminPage     = lazy(() => import('./pages/AdminEventsPage'));

export default function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Box component="main" sx={{ width: '100%', minHeight: 'calc(100vh - 64px)', boxSizing: 'border-box' }}>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/"           element={<HomePage />} />
                <Route path="/events"     element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/login"      element={<LoginPage />} />
                <Route path="/register"   element={<RegisterPage />} />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute>
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </AppThemeProvider>
  );
}
