import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import DoctorLogin from "./pages/DoctorLogin";
import PatientLogin from "./pages/PatientLogin";
import DoctorRegistration from "./pages/DoctorRegistration";
import PatientRegistration from "./pages/PatientRegistration";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";

import { ProtectedRoute } from "./protected/ProtectedRoutes";
import UserProfile from "./pages/UserProfile";
import { useLogin } from "./context/LoginContext";
import Navbar from "./components/Navbar";
import MakeAnAppointment from "./pages/MakeAnAppointment";
import AppointmentList from "./components/ApploinmentList";
import EnhancedAppointmentBooking from "./pages/EnhancedAppointmentBooking";
import VirtualizedAppointmentList from "./components/VirtualizedAppointmentList";
import AppointmentChat from "./components/AppointmentChat";
import AllAppointments from "./components/AllAppointments";
import { EnhancedAppointmentProvider } from "./context/EnhancedAppointmentContext";
import Error from "./pages/Error";
import BloodBank from "./pages/BloodBank";
import BloodInventory from "./pages/BloodInventory";
import BloodDonorList from "./pages/BloodDonorList";
import BloodRequest from "./pages/BloodRequest";
import Ambulance from "./pages/Ambulance";
import { useEffect } from "react";
import Contact from "./pages/Contact";
import HealthTips from "./pages/HealthTips";

const App = () => {
  const { isLoggedIn } = useLogin();
  const location = useLocation();

  // Check if the current path is "/dashboard"
  const isDashboard = location.pathname === "/dashboard";
  const isBloodBank = location.pathname === "/blood-bank";

  const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  };

  return (
    <EnhancedAppointmentProvider>
      <ScrollToTop />
      {!isDashboard && !isBloodBank && <Navbar />}
      <Routes>
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/doctor-register" element={<DoctorRegistration />} />
        <Route path="/patient-register" element={<PatientRegistration />} />
        {/* <Route path="/chat" element={<Chatbot />} /> */}
        <Route path="/health-tips" element={<HealthTips />} />
        <Route path="/" element={<Home />} />
        <Route 
            path="/ambulance" 
            element={<ProtectedRoute allowedRoles={['doctor']} />}
          >
            <Route index element={<Ambulance />} />
          </Route>
        <Route 
            path="/make-an-appointment" 
            element={<ProtectedRoute allowedRoles={['patient']} />}
          >
            <Route index element={<MakeAnAppointment />} />
          </Route>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<UserProfile />} />
        </Route>
        <Route path="/appointments" element={<ProtectedRoute />}>
          <Route index element={<EnhancedAppointmentBooking />} />
        </Route>
        <Route path="/enhanced-appointments" element={<ProtectedRoute />}>
          <Route index element={<VirtualizedAppointmentList />} />
        </Route>
        <Route path="/book-appointment" element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route index element={<EnhancedAppointmentBooking />} />
        </Route>
        <Route path="/allappointments" element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route index element={<AllAppointments />} />
        </Route>
        <Route path="/appointments/:id/chat" element={<ProtectedRoute />}>
          <Route index element={<AppointmentChat />} />
        </Route>
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Error />} />
        <Route path="/Blood" element={<BloodInventory />} />

        <Route 
            path="/blood-bank" 
            element={<ProtectedRoute allowedRoles={['doctor']} />}
          >
            <Route index element={<BloodBank />} />
            <Route path="inventory" element={<BloodInventory />} />
            <Route path="donors" element={<BloodDonorList />} />
            <Route path="requests" element={<BloodRequest />} />
          </Route>
      </Routes>
    </EnhancedAppointmentProvider>
  );
};

export default App;
