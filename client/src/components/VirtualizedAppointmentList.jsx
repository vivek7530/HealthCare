import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLogin } from '../context/LoginContext';
import { MessageCircle, CheckCircle, XCircle, Clock, MoreVertical } from 'lucide-react';
import axios from 'axios';

const VirtualizedAppointmentList = ({ items = [], itemHeight = 120, containerHeight = 600 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useLogin();
  const containerRef = useRef(null);

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(user?.role === 'patient' && { patient_id: user._id }),
        ...(user?.role === 'doctor' && { doctor_id: user._id })
      });

      const response = await axios.get(`/api/appointments?${params}`);
      
      if (page === 1) {
        setAppointments(response.data.appointments);
      } else {
        setAppointments(prev => [...prev, ...response.data.appointments]);
      }
      
      setHasMore(response.data.pagination.current < response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setScrollTop(scrollTop);

    // Load more when near bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'Active':
        return <MessageCircle className="text-blue-500" size={20} />;
      case 'Completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'Cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Virtual scrolling calculation
  const { visibleItems, startIndex, endIndex } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      appointments.length
    );
    
    const visibleItems = appointments.slice(startIndex, endIndex);
    
    return { visibleItems, startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, appointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="w-full">
      {/* Status Filter */}
      <div className="mb-4 flex gap-2">
        {['', 'Pending', 'Active', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
              setAppointments([]);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="border rounded-lg overflow-auto"
        style={{ height: containerHeight }}
      >
        <div style={{ height: appointments.length * itemHeight, position: 'relative' }}>
          {visibleItems.map((appointment, index) => (
            <div
              key={appointment._id}
              style={{
                position: 'absolute',
                top: (startIndex + index) * itemHeight,
                width: '100%',
                height: itemHeight,
                padding: '1rem'
              }}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(appointment.status)}
                    <h3 className="font-semibold">
                      {user?.role === 'patient' 
                        ? `Dr. ${appointment.doctor_id?.name}`
                        : appointment.patient_id?.name
                      }
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="line-clamp-2">Reason: {appointment.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Action buttons based on user role and appointment status */}
                  {user?.role === 'doctor' && appointment.status === 'Pending' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'Active')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Accept
                    </button>
                  )}
                  
                  {user?.role === 'doctor' && appointment.status === 'Active' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'Completed')}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Complete
                    </button>
                  )}
                  
                  {(user?.role === 'doctor' || user?.role === 'patient') && 
                   ['Pending', 'Active'].includes(appointment.status) && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.location.href = `/appointments/${appointment._id}/chat`}
                    className="p-2 hover:bg-gray-200 rounded"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* No more items indicator */}
        {!hasMore && appointments.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            No more appointments
          </div>
        )}

        {/* Empty state */}
        {!loading && appointments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedAppointmentList;
