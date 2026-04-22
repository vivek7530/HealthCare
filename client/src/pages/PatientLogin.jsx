import axios from "axios";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/userSlice';
import { toast } from 'react-toastify';

const PatientLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, currentUser } = useSelector((state) => state.user);

  axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginStart());
    
    axios
      .post(`/api/login`, { email, password, role: "patient" })
      .then((res) => {
        if (res.status === 200) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", "patient");
          dispatch(loginSuccess(res.data.user));
          toast.success("Patient login successful!");
          navigate("/");
        } else {
          dispatch(loginFailure("Login failed"));
          toast.error("Login failed. Please try again.");
        }
      })
      .catch((err) => {
        dispatch(loginFailure(err.message));
        toast.error("Login failed. Please check your credentials.");
      });
  };

  return (
    <div className="px-32 py-10 h-[90vh] flex items-center justify-center text-center">
      <form
        className="flex flex-col px-5 py-8 w-[60%] rounded-xl gap-3"
        onSubmit={handleSubmit}
        style={{ boxShadow: "0 1px 10px rgb(0,0,0,.3)" }}
      >
        <h1 className="font-bold mb-5 text-xl">Patient Login</h1>
        <input
          type="email"
          placeholder="Patient Email"
          value={email}
          className="input input-bordered"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="input input-bordered"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary text-secondary">Login as Patient</button>
        <p>
          Don't have an account?{" "}
          <Link to="/patient-register" className="text-primary underline">
            Signup
          </Link>{" "}
          Instead
        </p>
        <p>
          <Link to="/doctor-login" className="text-primary underline">
            Login as Doctor
          </Link>
        </p>
      </form>
    </div>
  );
};

export default PatientLogin;
