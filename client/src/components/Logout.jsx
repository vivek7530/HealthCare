import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

const Logout = ({ className, icon }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    axios
      .get(`/api/logout`, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        dispatch(logout());
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        navigate("/patient-login");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  return (
    <Link className={className} onClick={handleLogout}>
      {icon}Logout
    </Link>
  );
};

export default Logout;
