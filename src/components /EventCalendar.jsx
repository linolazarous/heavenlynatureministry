import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Modal, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { 
  FaCalendarPlus, 
  FaEdit, 
  FaTrash, 
  FaSyncAlt,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import api from '../../services/api';
import ErrorMessage from '../ErrorMessage';
import LoadingSpinner from '../LoadingSpinner';
import './EventCalendar.css';

// Constants
const CALENDAR_VIEWS = {
  MONTH: 'dayGridMonth',
  WEEK: 'timeGridWeek',
  DAY: 'timeGridDay'
};

const EVENT_CATEGORIES = {
  SERVICE: 'service',
  MEETING: 'meeting',
  OUTREACH: 'outreach',
  SPECIAL: 'special',
  DEFAULT: 'default'
};

const CATEGORY_CONFIG = {
  [EVENT_CATEGORIES.SERVICE]: {
    color: '#4a6fa5',
    textColor: '#ffffff',
    className: 'event-service'
  },
  [EVENT_CATEGORIES.MEETING]: {
    color: '#6f42c1',
    textColor: '#ffffff',
    className: 'event-meeting'
  },
  [EVENT_CATEGORIES.OUTREACH]: {
    color: '#20c997',
    textColor: '#ffffff',
    className: 'event-outreach'
  },
  [EVENT_CATEGORIES.SPECIAL]: {
    color: '#fd7e14',
    textColor: '#ffffff',
    className: 'event-special'
  },
  [EVENT_CATEGORIES.DEFAULT]: {
    color: '#6c757d',
    textColor: '#ffffff',
    className: 'event-default'
  }
};

// Custom hook for event management
const useEventManager = () => {
  const [state, setState] = useState({
    events: [],
    loading: false,
    error: null,
    lastUpdated: null
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchEvents = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await api.get('/events', {
        timeout: 10000,
        params: {
          _: Date.now() // Cache busting
        }
      });
      
      const processedEvents = response.data.map(event => ({
        ...event,
        id: String(event.id),
        start: event.start,
        end: event.end,
        extendedProps: {
          description: event.description || '',
          category: event.category || EVENT_CATEGORIES.DEFAULT,
          location: event.location || '',
          contact: event.contact || ''
        },
        ...CATEGORY_CONFIG[event.category || EVENT_CATEGORIES.DEFAULT]
      }));

      updateState({ 
        events: processedEvents, 
        loading: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to fetch events:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to load events. Please check your connection.';
      updateState({ 
        error: errorMessage, 
        loading: false 
      });
    }
  }, [updateState]);

  const createEvent = useCallback(async (eventData) => {
    try {
      const response = await api.post('/events', {
        ...eventData,
        category: eventData.category || EVENT_CATEGORIES.DEFAULT
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create event');
    }
  }, []);

  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update event');
    }
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete event');
    }
  }, []);

  return {
    ...state,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateState
  };
};

// Custom hook for modal state management
const useEventModal = () => {
  const [state, setState] = useState({
    showModal: false,
    selectedEvent: null,
    isSubmitting: false,
    formData: {
      title: '',
      start: '',
      end: '',
      allDay: true,
      description: '',
      category: EVENT_CATEGORIES.DEFAULT,
      location: '',
      contact: ''
    }
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const openCreateModal = useCallback((dateInfo) => {
    const startDate = dateInfo.dateStr;
    const endDate = dateInfo.allDay ? startDate : new Date(dateInfo.date.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
    
    updateState({
      showModal: true,
      selectedEvent: null,
      formData: {
        title: '',
        start: startDate,
        end: endDate,
        allDay: dateInfo.allDay,
        description: '',
        category: EVENT_CATEGORIES.DEFAULT,
        location: '',
        contact: ''
      }
    });
  }, [updateState]);

  const openEditModal = useCallback((eventInfo) => {
    const event = eventInfo.event;
    updateState({
      showModal: true,
      selectedEvent: event,
      formData: {
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        allDay: event.allDay,
        description: event.extendedProps.description || '',
        category: event.extendedProps.category || EVENT_CATEGORIES.DEFAULT,
        location: event.extendedProps.location || '',
        contact: event.extendedProps.contact || ''
      }
    });
  }, [updateState]);

  const closeModal = useCallback(() => {
    updateState({ 
      showModal: false,
      isSubmitting: false 
    });
  }, [updateState]);

  const updateFormData = useCallback((updates) => {
    updateState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates }
    }));
  }, [updateState]);

  return {
    ...state,
    openCreateModal,
    openEditModal,
    closeModal,
    updateFormData,
    updateState
  };
};

const EventCalendar = () => {
  const {
    events,
    loading,
    error,
    lastUpdated,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateState
  } = useEventManager();

  const {
    showModal,
    selectedEvent,
    isSubmitting,
    formData,
    openCreateModal,
    openEditModal,
    closeModal,
    updateFormData
  } = useEventModal();

  // Initial data fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Event handlers
  const handleDateClick = useCallback((arg) => {
    openCreateModal(arg);
  }, [openCreateModal]);

  const handleEventClick = useCallback((info) => {
    openEditModal(info);
  }, [openEditModal]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      [name]: type === 'checkbox' ? checked : value
    });
  }, [updateFormData]);

  const handleSaveEvent = useCallback(async () => {
    updateState({ isSubmitting: true });
    
    try {
      let savedEvent;
      
      if (selectedEvent) {
        savedEvent = await updateEvent(selectedEvent.id, formData);
        updateState(prev => ({
          events: prev.events.map(event => 
            event.id === selectedEvent.id ? savedEvent : event
          )
        }));
      } else {
        savedEvent = await createEvent(formData);
        updateState(prev => ({
          events: [...prev.events, savedEvent]
        }));
      }
      
      closeModal();
    } catch (err) {
      updateState({ error: err.message });
    } finally {
      updateState({ isSubmitting: false });
    }
  }, [selectedEvent, formData, createEvent, updateEvent, closeModal, updateState]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent) return;
    
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    updateState({ isSubmitting: true });
    
    try {
      await deleteEvent(selectedEvent.id);
      updateState(prev => ({
        events: prev.events.filter(event => event.id !== selectedEvent.id)
      }));
      closeModal();
    } catch (err) {
      updateState({ error: err.message });
    } finally {
      updateState({ isSubmitting: false });
    }
  }, [selectedEvent, deleteEvent, closeModal, updateState]);

  const handleRefresh = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleErrorDismiss = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Memoized calendar configuration
  const calendarConfig = useMemo(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin],
    initialView: CALENDAR_VIEWS.MONTH,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events,
    dateClick: handleDateClick,
    eventClick: handleEventClick,
    editable: true,
    selectable: true,
    nowIndicator: true,
    eventDisplay: 'block',
    height: 'auto',
    themeSystem: 'bootstrap5',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: 'short'
    },
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    businessHours: {
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '20:00',
    }
  }), [events, handleDateClick, handleEventClick]);

  // Custom event content renderer
  const renderEventContent = useCallback((eventInfo) => (
    <div className="event-content">
      <div className="event-title">{eventInfo.event.title}</div>
      {eventInfo.event.extendedProps.description && (
        <div className="event-description">
          {eventInfo.event.extendedProps.description}
        </div>
      )}
      {eventInfo.event.extendedProps.location && (
        <div className="event-location">
          <FaInfoCircle /> {eventInfo.event.extendedProps.location}
        </div>
      )}
    </div>
  ), []);

  // Form validation
  const isFormValid = formData.title.trim() && formData.start;

  return (
    <div className="calendar-container">
      {/* Header with controls */}
      <div className="calendar-header">
        <h2>Ministry Events Calendar</h2>
        <div className="calendar-controls">
          {lastUpdated && (
            <Badge bg="light" text="dark" className="last-updated">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </Badge>
          )}
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? 'spinning' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={handleErrorDismiss}
          severity="error"
          showIcon
        />
      )}

      {/* Loading State */}
      {loading && !events.length ? (
        <div className="calendar-loading">
          <LoadingSpinner size="large" />
          <p>Loading ministry events...</p>
        </div>
      ) : (
        <>
          {/* Calendar Component */}
          <div className="calendar-wrapper">
            <FullCalendar
              {...calendarConfig}
              eventContent={renderEventContent}
              loading={(isLoading) => {
                if (isLoading && events.length > 0) {
                  updateState({ loading: true });
                }
              }}
            />
          </div>

          {/* Events Summary */}
          {events.length > 0 && (
            <div className="events-summary">
              <small>
                Showing {events.length} event{events.length !== 1 ? 's' : ''}
              </small>
            </div>
          )}
        </>
      )}

      {/* Event Modal */}
      <Modal 
        show={showModal} 
        onHide={closeModal}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEvent ? 'Edit Event' : 'Create New Event'}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Start Date/Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start"
                    value={formData.start}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>End Date/Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end"
                    value={formData.end}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value={EVENT_CATEGORIES.SERVICE}>Service</option>
                    <option value={EVENT_CATEGORIES.MEETING}>Meeting</option>
                    <option value={EVENT_CATEGORIES.OUTREACH}>Outreach</option>
                    <option value={EVENT_CATEGORIES.SPECIAL}>Special Event</option>
                    <option value={EVENT_CATEGORIES.DEFAULT}>Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="allDay"
                    label="All Day Event"
                    checked={formData.allDay}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Event location"
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact Information</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Contact person or phone"
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Event details and notes"
                disabled={isSubmitting}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          {selectedEvent && (
            <Button 
              variant="outline-danger" 
              onClick={handleDeleteEvent}
              disabled={isSubmitting}
            >
              <FaTrash /> Delete Event
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleSaveEvent}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : selectedEvent ? (
              <>
                <FaEdit /> Update Event
              </>
            ) : (
              <>
                <FaCalendarPlus /> Create Event
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

EventCalendar.propTypes = {
  // Add any props if needed
};

export default EventCalendar;