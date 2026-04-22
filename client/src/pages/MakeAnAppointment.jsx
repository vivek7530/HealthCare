import React, { useState, useEffect } from "react";
import { useDoctor } from "../context/DoctorContext";
import DoctorArea from "../data/DoctorArea";
import Location from "../data/Location";
import { useLogin } from "../context/LoginContext";
import { useAppointment } from "../context/AppointmentContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const MakeAnAppointment = () => {
  const { user, isLoggedIn } = useLogin();
  const { doctors, generateTimeSlots } = useDoctor();
  const { addAppointment } = useAppointment();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [userId, setUserId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [reason, setReason] = useState("");
  const [goAppointment, setGoAppointment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // When the date changes, automatically trigger the search for doctors
    if (selectedDate) {
      handleDateChange(selectedDate);
    }
  }, [selectedDate]);



  const handleDateChange = (date) => {
    setSelectedDate(date);
    const day = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    setSelectedDay(day);
    setGoAppointment(true);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesDate = selectedDay
      ? doctor.availability.some((slot) => slot.day === selectedDay)
      : true;
    const matchesArea = selectedArea ? doctor.area === selectedArea : true;
    return matchesDate && matchesArea;
  });

  const AppointmentSubmit = (e) => {
    e.preventDefault();

    axios
      .post(`/api/appointments/add`, {
        patient_id: userId,
        patientName: patientName,
        doctor_id: doctorId,
        doctorName: doctorName,
        reason: reason
      })
      .then((result) => {
        console.log(result);
        addAppointment(result.data);
        navigate("/appointments");
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          alert("Appointment already exists for this slot.");
        } else {
          console.error(err);
        }
      });
  };

  return (
    <div className="px-32 min-h-[82vh]">
      <div className="bg-primary p-10 rounded-xl my-10">
        <div className="flex gap-3 items-center justify-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="form-control input"
          />
          <select
            value={selectedArea}
            className="input"
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="">Select Area</option>
            {DoctorArea.map((docarea, index) => (
              <option key={index} value={docarea}>
                {docarea}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {selectedDate ? (
          filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div key={doctor._id}>
                <div
                  className="flex items-center gap-5 p-3 rounded-xl mb-5"
                  style={{ boxShadow: "0 1px 10px rgb(0,0,0,.3)" }}
                >
                  <img
                    src={doctor.imageUrl}
                    alt=""
                    className="w-32 h-32 object-cover rounded-full"
                  />
                  <div>
                    <h2>
                      Name: {doctor.name} - {doctor.degree}
                    </h2>
                    <p>Specialization: {doctor.area}</p>
                    <p>Visit: {doctor.visit}</p>
                  </div>
                  {goAppointment && (
                    <>
                      {isLoggedIn ? (
                        <button
                          className="btn btn-success text-secondary ms-auto"
                          onClick={() => {
                            document.getElementById(`my_modal_${doctor._id}`).showModal();
                            setDoctorId(doctor._id);
                            setDoctorName(doctor.name);
                            setUserId(user._id);
                            setPatientName(user.name);
                            setReason("");
                          }}
                        >
                          Book an Appointment
                        </button>
                      ) : (
                        <Link
                          to="/patient-login"
                          className="btn btn-success text-secondary ms-auto"
                        >
                          {" "}
                          Book an Appointment
                        </Link>
                      )}
                    </>
                  )}
                </div>
                <dialog id={`my_modal_${doctor._id}`} className="modal">
                  <div className="modal-box">
                    <form method="dialog">
                      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                        ✕
                      </button>
                    </form>
                    <div className="mt-4">
                      <form onSubmit={AppointmentSubmit}>
                        <h3 className="font-bold text-lg mb-4">Book Appointment</h3>
                        <div className="form-control w-full mb-4">
                          <label className="label">
                            <span className="label-text">Reason for Visit</span>
                          </label>
                          <textarea
                            className="textarea textarea-bordered h-24"
                            placeholder="Please describe your symptoms or reason for the appointment"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                          ></textarea>
                        </div>
                        <div className="w-full text-center">
                          <button
                            type="submit"
                            className="btn btn-wide btn-primary"
                          >
                            Confirm Appointment
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </dialog>
              </div>
            ))
          ) : (
            <p className="text-red-500 text-center">
              No doctors available with the selected criteria.
            </p>
          )
        ) : (
          <p className="text-red-500 text-center">
            Please select a date to book an appointment.
          </p>
        )}
      </div>
    </div>
  );
};

export default MakeAnAppointment;
