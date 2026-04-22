import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useLogin } from "./LoginContext";

const AppointmentContext = createContext();

export const useAppointment = () => useContext(AppointmentContext);

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const { user } = useLogin();

  useEffect(() => {
    if (user) {
      const isDoctor = user.role?.toLowerCase() === 'doctor';
      console.log("user>>>>>>>>>>>>>>>>>>>>>>>>>>>>", user)
      const queryParams = isDoctor ? `?doctor_id=${user._id}` : `?patient_id=${user._id}`;
      axios
        .get(`/api/appointments${queryParams}`)
        .then((response) => {
          const docs = response.data.appointments || response.data;
          setAppointments(Array.isArray(docs) ? docs : []);
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
          setAppointments([]);
        });
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      if (!user) return;
      const isDoctor = user.role?.toLowerCase() === 'doctor';
      const queryParams = isDoctor ? `?doctor_id=${user._id}` : `?patient_id=${user._id}`;
      const response = await axios.get(`/api/appointments${queryParams}`);
      const docs = response.data.appointments || response.data;
      setAllAppointments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleDelete = (id) => {
    axios
      .delete(`/api/appointments/deleteappointment/${id}`)
      .then((res) => {
        console.log(res);
        setAppointments(
          appointments.filter((appointment) => appointment._id !== id)
        );
        setAllAppointments(
          allAppointments.filter((appointment) => appointment._id !== id)
        );
      })
      .catch((err) => console.log(err));
  };

  const addAppointment = (appointment) => {
    setAppointments([...appointments, appointment]);
  };

  const handleEdit = (id, updatedAppointment) => {
    axios
      .put(`/api/appointments/editappointment/${id}`, updatedAppointment)
      .then((res) => {
        console.log(res);
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === id
              ? { ...appointment, ...updatedAppointment }
              : appointment
          )
        );
        setAllAppointments(
          allAppointments.map((appointment) =>
            appointment._id === id
              ? { ...appointment, ...updatedAppointment }
              : appointment
          )
        );
      })
      .catch((err) => console.log(err));
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        setAppointments,
        handleDelete,
        addAppointment,
        allAppointments,
        setAllAppointments,
        fetchAppointments,
        handleEdit,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};
