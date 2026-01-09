import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import GuestLayout from "./layouts/GuestLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/home/Home";
import DestinationDetails from "./pages/home/DestinationDetails";
import './App.css';
import Profile from "./pages/home/Profile";
import ProfileEdit from "./pages/profile/ProfileEdit";
import TravelBuddy from "./pages/home/TravelBuddy";
import Guides from "./pages/home/Guides";
import Likes from "./pages/home/Likes";
import MyBookings from "./pages/MyBookings";
import PublicTripView from "./pages/PublicTripView";
import NotFound from "./pages/NotFound";
import TripDetailsPage from "./pages/TripDetailsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TripsManagement from "./pages/admin/TripsManagement";
import BookingsManagement from "./pages/admin/BookingsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import Analytics from "./pages/admin/Analytics";
import CategoryManagement from "./pages/admin/CategoryManagement";


function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Trip details page - standalone route */}
        <Route path="/trip/:tripId" element={<TripDetailsPage />} />

        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/myBookings" element={<MyBookings />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/buddy" element={<TravelBuddy />} />
          <Route path="/guides" element={<Guides />} />
          {/* <Route path="/virtualguide" element={<VirtualGuide />} /> */}
          <Route path="/details" element={<DestinationDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/trips" element={<TripsManagement />} />
          <Route path="/admin/bookings" element={<BookingsManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>

        {/* Catch-all 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const isLoggedIn = true; // Replace this with real auth logic

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}