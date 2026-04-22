import React, { useState, useEffect, useMemo } from "react";
import { useLogin } from "../context/LoginContext";
import { useDebounce } from "../hooks/useDebounce";
import axios from "axios";
import { Search, Calendar, Clock, User, MessageSquare } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

 const EnhancedAppointmentBooking = () => {
  const { user, isLoggedIn } = useLogin();
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    if (selectedSpecialization) {
      fetchDoctors();
    }
  }, [selectedSpecialization, debouncedSearchTerm]);

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get('/api/specializations');
      setSpecializations(response.data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSpecialization) {
        params.append('specialization', selectedSpecialization);
      }
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      
      const response = await axios.get(`/api/doctors?${params}`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    generateAvailableSlots(date, selectedDoctor);
  };

  const generateAvailableSlots = (date, doctor) => {
    if (!doctor || !date) return;
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = doctor.availability?.find(slot => slot.day === dayOfWeek);
    
    if (dayAvailability) {
      const slots = generateTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime
      );
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  };

  const generateTimeSlots = (startTime, endTime, interval = 30) => {
    const slots = [];
    const start = new Date(`01/01/2000 ${startTime}`);
    const end = new Date(`01/01/2000 ${endTime}`);
    
    while (start < end) {
      const slotEnd = new Date(start.getTime() + interval * 60000);
      if (slotEnd <= end) {
        slots.push({
          startTime: start.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          endTime: slotEnd.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        });
      }
      start.setTime(slotEnd.getTime());
    }
    
    return slots;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast.error('Please login to book an appointment');
      return;
    }

    // Validate that all required fields are selected
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the appointment');
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        patient_id: user._id,
        doctor_id: selectedDoctor._id,
        patientName: user.name,
        doctorName: selectedDoctor.name,
        reason
      };

      console.log('Booking appointment with data:', appointmentData);
      const response = await axios.post('/api/appointments', appointmentData);
      console.log('Appointment booking response:', response);
      
      toast.success('Appointment booked successfully!');
      setCurrentStep(1);
      resetForm();
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      if (debouncedSearchTerm && !doctor.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [doctors, debouncedSearchTerm]);

  const resetForm = () => {
    setSelectedSpecialization("");
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedSlot(null);
    setReason("");
    setSearchTerm("");
    setAvailableSlots([]);
    setShowDoctorModal(false);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

      {/* Step 1: Select Specialization */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Specialization</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {specializations.map((spec) => (
              <button
                key={spec._id}
                onClick={() => {
                  setSelectedSpecialization(spec._id);
                  setShowDoctorModal(true);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedSpecialization === spec._id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium">{spec.name}</h3>
                {spec.description && (
                  <p className="text-sm text-gray-600 mt-1">{spec.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}



    {/* Step 2: Select Doctor */}
    {currentStep === 2 && selectedDoctor && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Doctor Selected</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-4">
            {selectedDoctor.imageUrl && (
              <img
                src={selectedDoctor.imageUrl}
                alt={selectedDoctor.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">Dr. {selectedDoctor.name}</h3>
              <p className="text-gray-600">{selectedDoctor.degree}</p>
              <p className="text-sm text-gray-500">{selectedDoctor.experience} experience</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    )}

    {/* Step 3: Add Reason */}
    {currentStep === 3 && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Appointment Reason</h2>
        
        <form onSubmit={handleBookingSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Please describe your reason for visit</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your symptoms or reason for appointment..."
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Doctor Selection Modal */}
    {showDoctorModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Doctor</h2>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {loading ? (
              <div className="text-center py-4">Loading doctors...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      handleDoctorSelect(doctor);
                      setShowDoctorModal(false);
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center space-x-4 mb-3">
                        {doctor.imageUrl && (
                          <img
                            src={doctor.imageUrl}
                            alt={doctor.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">Dr. {doctor.name}</h4>
                          <p className="text-gray-600">{doctor.degree}</p>
                          <p className="text-sm text-gray-500">{doctor.experience} experience</p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default EnhancedAppointmentBooking;