import React, { useState, useEffect, useRef } from 'react';
import { useLogin } from '../context/LoginContext';
import { Send, Paperclip, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

const AppointmentChat = ({ appointmentId }) => {
  const { user } = useLogin();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchAppointment();
    fetchMessages();
    startPolling();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startPolling = () => {
    // Poll for new messages every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(false);
    }, 5000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`/api/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const fetchMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await axios.get(`/api/appointments/${appointmentId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !appointment) return;

    // Check if messaging is allowed
    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      alert('Cannot send messages to completed or cancelled appointments');
      return;
    }

    try {
      setSendingMessage(true);
      
      const messageData = {
        sender_id: user._id,
        sender_type: user.role === 'doctor' ? 'Doctor' : 'Patient',
        message: newMessage.trim()
      };

      const response = await axios.post(
        `/api/appointments/${appointmentId}/messages`,
        messageData
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');

      // If doctor sent first message, update appointment status
      if (user.role === 'doctor' && appointment.status === 'Pending') {
        fetchAppointment();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Error sending message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'Active':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'Completed':
        return <CheckCircle className="text-blue-500" size={20} />;
      case 'Cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const canSendMessage = () => {
    return appointment && 
           ['Pending', 'Active'].includes(appointment.status) &&
           !sendingMessage;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Appointment not found</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const isDoctor = user.role === 'doctor';

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              {isDoctor ? appointment.patient_id?.name : `Dr. ${appointment.doctor_id?.name}`}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getStatusIcon(appointment.status)}
              <span>{appointment.status}</span>
            </div>
          </div>
          
          {/* Status controls for doctors */}
          {isDoctor && appointment.status === 'Active' && (
            <button
              onClick={() => {
                axios.put(`/api/appointments/${appointmentId}/status`, { status: 'Completed' })
                  .then(() => fetchAppointment())
                  .catch(console.error);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="text-center text-xs text-gray-500 my-2">
              {formatDate(new Date(date))}
            </div>
            {dateMessages.map((message, index) => {
              const isOwnMessage = message.sender_id._id === user._id;
              
              return (
                <div
                  key={message._id || index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{message.sender_id?.name}</span>
                      <span>•</span>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {canSendMessage() ? (
        <form onSubmit={sendMessage} className="border-t p-4">
          <div className="flex gap-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sendingMessage}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t p-4 bg-gray-50 text-center text-sm text-gray-600">
          {appointment.status === 'Completed' || appointment.status === 'Cancelled'
            ? 'Messaging is disabled for completed or cancelled appointments'
            : 'Loading...'}
        </div>
      )}
    </div>
  );
};

export default AppointmentChat;
