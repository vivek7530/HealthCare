import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CloudUpload } from "@mui/icons-material";
import { toast } from 'react-toastify';

const PatientRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [blood, setBlood] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number validation
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!validateEmail(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!validatePhone(value)) error = 'Invalid Indian mobile number (10 digits starting with 6-9)';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (name, value) => {
    // Update the field value
    switch (name) {
      case 'name': setName(value); break;
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'age': setAge(value); break;
      case 'sex': setSex(value); break;
      case 'blood': setBlood(value); break;
      case 'password': setPassword(value); break;
      default: break;
    }

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    // Validate on blur
    let value = '';
    switch (fieldName) {
      case 'name': value = name; break;
      case 'email': value = email; break;
      case 'phone': value = phone; break;
      case 'age': value = age; break;
      case 'sex': value = sex; break;
      case 'blood': value = blood; break;
      case 'password': value = password; break;
      default: break;
    }
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};

    // Validate all fields
    newErrors.name = validateField('name', name);
    newErrors.email = validateField('email', email);
    newErrors.phone = validateField('phone', phone);
    newErrors.password = validateField('password', password);

    // Mark all fields as touched
    Object.keys(newErrors).forEach(key => {
      newTouched[key] = true;
    });

    setErrors(newErrors);
    setTouched(newTouched);

    // Check if form is valid
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix validation errors in form");
      return;
    }

    if (!imageUrl) {
      toast.error("Please upload your profile image");
      return;
    }
    setSignupLoading(true);
    const formData = {
      name,
      email,
      phone,
      age,
      sex,
      blood,
      imageUrl,
      password,
      role: "patient",
    };
    try {
      await axios.post(`/api/register`, formData);
      toast.success("Patient registration successful! Please login.");
      navigate("/patient-login");
    } catch (error) {
      console.log(error);
      toast.error("Registration failed. Please try again.");
    }
    setSignupLoading(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImage(file);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      setLoading(true);
      const res = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });
      setLoading(false);

      const cloudData = await res.json();
      setImageUrl(cloudData.url);
      console.log("Image Upload Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="px-32 py-10 flex items-center justify-center text-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col px-5 py-8 w-[60%] rounded-xl gap-3"
        style={{ boxShadow: "0 1px 10px rgb(0,0,0,.3)" }}
      >
        <h1 className="font-bold mb-5 text-xl">Patient Registration</h1>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`input input-bordered col-span-2 ${touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            required
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center col-span-2">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.name}
            </p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`input input-bordered ${touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            required
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`input input-bordered ${touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            required
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.phone}
            </p>
          )}
          <input
            type="date"
            placeholder="Date of Birth"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="input input-bordered col-span-2"
            required
          />

          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="select w-full select-bordered"
            required
          >
            <option value="" disabled>
              Select Sex
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={blood}
            onChange={(e) => setBlood(e.target.value)}
            className="select w-full select-bordered"
            required
          >
            <option value="" disabled>
              Blood Group
            </option>
            <option value="O -">O -</option>
            <option value="O +">O +</option>
            <option value="A -">A -</option>
            <option value="A +">A +</option>
            <option value="B -">B -</option>
            <option value="B +">B +</option>
            <option value="AB -">AB -</option>
            <option value="AB +">AB +</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`input input-bordered col-span-2 ${touched.password && errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            required
          />
          {touched.password && errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center col-span-2">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block border-2 border-dashed border-gray-400 p-8 text-center rounded-lg"
        >
          {image ? (
            <img
              className="w-16 h-16 rounded-full object-cover mx-auto"
              src={URL.createObjectURL(image)}
              alt="Profile"
            />
          ) : (
            <>
              <CloudUpload />
              <br></br>
              Upload Profile Picture
            </>
          )}
        </label>
        <input
          id="file-upload"
          className="hidden"
          type="file"
          onChange={handleImageChange}
        />
        {loading ? (
          <button
            type="button"
            disabled
            className="btn btn-primary text-secondary"
          >
            Uploading image ...
          </button>
        ) : (
          <button
            type="submit"
            disabled={!imageUrl || signupLoading}
            className="btn btn-primary text-secondary"
          >
            {signupLoading ? "Registering..." : "Register as Patient"}
          </button>
        )}
        <p>
          Already have an account?{" "}
          <Link to="/patient-login" className="underline text-primary">
            Login as Patient
          </Link>{" "}
        </p>
        <p>
          <Link to="/doctor-register" className="text-primary underline">
            Register as Doctor
          </Link>
        </p>
      </form>
    </div>
  );
};

export default PatientRegistration;
