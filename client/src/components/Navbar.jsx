import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import Logout from "./Logout";

const Navbar = () => {
  const { isLoggedIn, currentUser } = useSelector((state) => state.user);

  console.log("currentUser", currentUser)
  const dispatch = useDispatch();
  return (
    <div className="navbar sticky top-0 z-40 h-[10vh] bg-base-100 px-32">
      <div className="navbar-start">
        <NavLink to="/" className="text-2xl font-bold">
          Patel
        </NavLink>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          {(!isLoggedIn || (currentUser && currentUser.role === 'patient')) && (
            <li>
              <NavLink to="/appointments">Book Appointment</NavLink>
            </li>
          )}
          {isLoggedIn && currentUser && currentUser.role === 'doctor' && (
            <li>
              <NavLink to="/ambulance">Ambulance</NavLink>
            </li>
          )}
          {isLoggedIn && currentUser && currentUser.role === 'doctor' && (
            <li>
              <NavLink to="/blood-bank">Blood Bank</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/health-tips">Heath Tips</NavLink>
          </li>
          {(!isLoggedIn || !currentUser || currentUser.role !== 'doctor') && (
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-end">
        {isLoggedIn && currentUser ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img src={currentUser.imageUrl} alt="User avatar" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-medium"
            >
              <li className="menu-title">
                <span>{currentUser.name}</span>
              </li>
              <li>
                <NavLink to="/profile" className="justify-between">
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/allappointments" className="justify-between">
                  Appointment List
                </NavLink>
              </li>
              <li>
                <Logout />
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-primary text-secondary">
                Login
              </button>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-48 font-medium"
              >
                <li>
                  <Link to="/doctor-login" className="justify-between">
                    Doctor Login
                  </Link>
                </li>
                <li>
                  <Link to="/patient-login" className="justify-between">
                    Patient Login
                  </Link>
                </li>
              </ul>
            </div>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-primary text-secondary">
                Register
              </button>
              <ul
                tabIndex={1}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-medium"
              >
                <li>
                  <Link to="/doctor-register" className="justify-between">
                    Register as Doctor
                  </Link>
                </li>
                <li>
                  <Link to="/patient-register" className="justify-between">
                    Register as Patient
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
