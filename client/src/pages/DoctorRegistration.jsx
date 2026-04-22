import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CloudUpload } from "@mui/icons-material";
import { toast } from 'react-toastify';

const DoctorRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch specializations from backend
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await axios.get('/api/specializations');
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.specializations || response.data.data || [];
        setSpecializations(data);
        console.log('Specializations loaded:', response.data);
      } catch (error) {
        console.error('Error fetching specializations:', error);
        // Set empty array to prevent infinite loading and allow form to render
        setSpecializations([]);
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, []);

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
      case 'specialization':
        if (!value) error = 'Specialization is required';
        break;
      case 'experience':
        if (!value) error = 'Experience is required';
        else if (value < 0) error = 'Experience cannot be negative';
        else if (value > 50) error = 'Experience seems too high';
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
      case 'specialization': setSpecialization(value); break;
      case 'experience': setExperience(value); break;
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
      case 'specialization': value = specialization; break;
      case 'experience': value = experience; break;
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
    newErrors.specialization = validateField('specialization', specialization);
    newErrors.experience = validateField('experience', experience);
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
      toast.error("Please fix the validation errors in the form");
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
      specialization,
      experience,
      imageUrl,
      password,
      role: "doctor",
    };
    try {
      await axios.post(`/api/register`, formData);
      toast.success("Doctor registration successful! Please login.");
      navigate("/doctor-login");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">Doctor Registration</h1>
            <p className="text-blue-100 text-center mt-2">Join our healthcare platform</p>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-[20px]">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  required
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  maxLength={10}
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  onBlur={() => handleBlur('specialization')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched.specialization && errors.specialization ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  required
                  disabled={loadingSpecializations}
                >
                  <option value="" disabled>
                    {loadingSpecializations ? "Loading specializations..." : "Select your specialization"}
                  </option>
                  {specializations.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                {touched.specialization && errors.specialization && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.specialization}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  placeholder="Enter years of experience"
                  value={experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  onBlur={() => handleBlur('experience')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched.experience && errors.experience ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  required
                />
                {touched.experience && errors.experience && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.experience}
                  </p>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${touched.password && errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  required
                />
                {touched.password && errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div className="col-span-1 md:col-span-2 px-[20px] pb-[20px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {image ? (
                      <img
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        src={URL.createObjectURL(image)}
                        alt="Profile"
                      />
                    ) : (
                      <>
                        <CloudUpload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> profile picture
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 2MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {loading && (
                <p className="mt-2 text-sm text-blue-600 text-center">Uploading image...</p>
              )}
            </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={!imageUrl || signupLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signupLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8H4z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Register as Doctor"
            )}
          </button>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/doctor-login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Login as Doctor
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Want to register as patient?{" "}
              <Link to="/patient-register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Register as Patient
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
    </div>
  );
};

export default DoctorRegistration;
