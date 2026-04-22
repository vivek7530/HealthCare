import React from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="px-32 py-10 h-[90vh] flex items-center justify-center text-center">
      <div
        className="flex flex-col px-5 py-8 w-[60%] rounded-xl gap-6"
        style={{ boxShadow: "0 1px 10px rgb(0,0,0,.3)" }}
      >
        <h1 className="font-bold mb-5 text-2xl">Choose Your Registration Type</h1>
        
        <p className="text-gray-600 mb-4">
          Please select how you want to register with our healthcare platform
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/doctor-register"
            className="btn btn-primary text-secondary py-4 text-lg"
          >
            Register as Doctor
          </Link>
          
          <Link
            to="/patient-register"
            className="btn btn-secondary text-primary py-4 text-lg border-2 border-primary"
          >
            Register as Patient
          </Link>
        </div>

        <div className="mt-6 text-sm">
          <p className="text-gray-600">
            Already have an account?
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/doctor-login" className="text-primary underline">
              Doctor Login
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/patient-login" className="text-primary underline">
              Patient Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
