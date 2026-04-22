import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const EnhancedAppointmentContext = createContext();

const appointmentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_APPOINTMENTS':
      return { 
        ...state, 
        appointments: action.payload.appointments,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    
    case 'ADD_APPOINTMENT':
      return { 
        ...state, 
        appointments: [action.payload, ...state.appointments],
        loading: false,
        error: null
      };
    
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt => 
          apt._id === action.payload._id ? action.payload : apt
        ),
        loading: false,
        error: null
      };
    
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt._id !== action.payload),
        loading: false,
        error: null
      };
    
    case 'SET_MESSAGES':
      return { 
        ...state, 
        messages: action.payload,
        loading: false,
        error: null
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...(state.messages || []), action.payload],
        loading: false,
        error: null
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

const initialState = {
  appointments: [],
  messages: [],
  pagination: null,
  loading: false,
  error: null
};

export const EnhancedAppointmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  // Fetch appointments with pagination and filters
  const fetchAppointments = async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...params
      });

      const response = await axios.get(`/api/appointments?${queryParams}`);
      
      dispatch({ 
        type: 'SET_APPOINTMENTS', 
        payload: {
          appointments: response.data.appointments,
          pagination: response.data.pagination
        }
      });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Create new appointment
  const createAppointment = async (appointmentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('/api/appointments', appointmentData);
      
      dispatch({ type: 'ADD_APPOINTMENT', payload: response.data });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.put(`/api/appointments/${appointmentId}/status`, { status });
      
      dispatch({ type: 'UPDATE_APPOINTMENT', payload: response.data });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  // Delete appointment
  const deleteAppointment = async (appointmentId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await axios.delete(`/api/appointments/${appointmentId}`);
      
      dispatch({ type: 'DELETE_APPOINTMENT', payload: appointmentId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  // Fetch appointment messages
  const fetchMessages = async (appointmentId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.get(`/api/appointments/${appointmentId}/messages`);
      
      dispatch({ type: 'SET_MESSAGES', payload: response.data });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Send message
  const sendMessage = async (appointmentId, messageData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`/api/appointments/${appointmentId}/messages`, messageData);
      
      dispatch({ type: 'ADD_MESSAGE', payload: response.data });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  // Get single appointment
  const getAppointment = async (appointmentId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.get(`/api/appointments/${appointmentId}`);
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    fetchMessages,
    sendMessage,
    getAppointment,
    clearError
  };

  return (
    <EnhancedAppointmentContext.Provider value={value}>
      {children}
    </EnhancedAppointmentContext.Provider>
  );
};

export const useEnhancedAppointment = () => {
  const context = useContext(EnhancedAppointmentContext);
  if (!context) {
    throw new Error('useEnhancedAppointment must be used within an EnhancedAppointmentProvider');
  }
  return context;
};
