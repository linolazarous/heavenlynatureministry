// src/components/EventCalendar.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  FaCalendarPlus, 
  FaEdit, 
  FaTrash, 
  FaSyncAlt,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaUser
} from 'react-icons/fa';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress,
  Alert,
  Chip,
  Box,
  Typography
} from '@mui/material';
import { eventService } from '../services/eventService';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

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
      const eventsData = await eventService.getEvents();
      
      const processedEvents = eventsData.map(event => ({
        ...event,
        id: String(event.id),
        start: event.date,
        end: event.endDate || event.date,
        title: event.title,
        extendedProps: {
          description: event.description || '',
          category: event.category || EVENT_CATEGORIES.DEFAULT,
          location: event.location || '',
          contact: event.contact || '',
          time: event.time || ''
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
      updateState({ 
        error: err.message || 'Failed to load events', 
        loading: false 
      });
    }
  }, [updateState]);

  const createEvent = useCallback(async (eventData) => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      return newEvent;
    } catch (err) {
      throw new Error(err.message || 'Failed to create event');
    }
  }, []);

  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      const updatedEvent = await eventService.updateEvent(eventId, eventData);
      return updatedEvent;
    } catch (err) {
      throw new Error(err.message || 'Failed to update event');
    }
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
    } catch (err) {
      throw new Error(err.message || 'Failed to delete event');
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
      date: '',
      time: '',
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
    
    updateState({
      showModal: true,
      selectedEvent: null,
      formData: {
        title: '',
        date: startDate,
        time: '10:00',
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
        date: event.startStr.split('T')[0],
        time: event.startStr.includes('T') ? event.startStr.split('T')[1].substring(0, 5) : '10:00',
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

const EventCalendar = ({ compact = false, showRegisterButton = false, userId = null, mode = 'public' }) => {
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
    if (mode === 'admin') {
      openCreateModal(arg);
    }
  }, [openCreateModal, mode]);

  const handleEventClick = useCallback((info) => {
    openEditModal(info);
  }, [openEditModal]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    updateFormData({
      [name]: value
    });
  }, [updateFormData]);

  const handleSaveEvent = useCallback(async () => {
    updateState({ isSubmitting: true });
    
    try {
      const eventData = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        contact: formData.contact
      };

      let savedEvent;
      
      if (selectedEvent) {
        savedEvent = await updateEvent(selectedEvent.id, eventData);
        updateState(prev => ({
          events: prev.events.map(event => 
            event.id === selectedEvent.id ? { ...savedEvent, ...CATEGORY_CONFIG[savedEvent.category] } : event
          )
        }));
      } else {
        savedEvent = await createEvent(eventData);
        updateState(prev => ({
          events: [...prev.events, { ...savedEvent, ...CATEGORY_CONFIG[savedEvent.category] }]
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
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: compact ? 'listWeek' : CALENDAR_VIEWS.MONTH,
    headerToolbar: compact ? false : {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events,
    dateClick: mode === 'admin' ? handleDateClick : undefined,
    eventClick: mode === 'admin' ? handleEventClick : undefined,
    editable: mode === 'admin',
    selectable: mode === 'admin',
    nowIndicator: true,
    eventDisplay: 'block',
    height: compact ? '400px' : 'auto',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: 'short'
    },
    views: {
      listWeek: {
        type: 'list',
        duration: { weeks: 1 },
        buttonText: 'list'
      }
    }
  }), [events, handleDateClick, handleEventClick, compact, mode]);

  // Custom event content renderer
  const renderEventContent = useCallback((eventInfo) => (
    <div className="event-content">
      <div className="event-title">{eventInfo.event.title}</div>
      {!compact && eventInfo.event.extendedProps.location && (
        <div className="event-location">
          <FaMapMarkerAlt size={10} /> {eventInfo.event.extendedProps.location}
        </div>
      )}
    </div>
  ), [compact]);

  // Form validation
  const isFormValid = formData.title.trim() && formData.date;

  if (compact) {
    return (
      <Box className="event-calendar-compact">
        {loading ? (
          <LoadingSpinner size="small" message="Loading events..." />
        ) : (
          <FullCalendar
            {...calendarConfig}
            eventContent={renderEventContent}
          />
        )}
      </Box>
    );
  }

  return (
    <Box className="calendar-container">
      {/* Header with controls */}
      <Box className="calendar-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          Ministry Events Calendar
        </Typography>
        <Box className="calendar-controls" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {lastUpdated && (
            <Chip 
              label={`Updated: ${new Date(lastUpdated).toLocaleTimeString()}`}
              variant="outlined"
              size="small"
            />
          )}
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleRefresh}
            disabled={loading}
            startIcon={<FaSyncAlt />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

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
        <Box className="calendar-loading" sx={{ textAlign: 'center', py: 4 }}>
          <LoadingSpinner size="large" />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading ministry events...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Calendar Component */}
          <Box className="calendar-wrapper">
            <FullCalendar
              {...calendarConfig}
              eventContent={renderEventContent}
            />
          </Box>

          {/* Events Summary */}
          {events.length > 0 && (
            <Box className="events-summary" sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {events.length} event{events.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Event Modal - Only for admin mode */}
      {mode === 'admin' && (
        <Dialog 
          open={showModal} 
          onClose={closeModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                  disabled={isSubmitting}
                >
                  <MenuItem value={EVENT_CATEGORIES.SERVICE}>Service</MenuItem>
                  <MenuItem value={EVENT_CATEGORIES.MEETING}>Meeting</MenuItem>
                  <MenuItem value={EVENT_CATEGORIES.OUTREACH}>Outreach</MenuItem>
                  <MenuItem value={EVENT_CATEGORIES.SPECIAL}>Special Event</MenuItem>
                  <MenuItem value={EVENT_CATEGORIES.DEFAULT}>Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Contact Information"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />

              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </Box>
          </DialogContent>
          
          <DialogActions>
            {selectedEvent && (
              <Button 
                onClick={handleDeleteEvent}
                disabled={isSubmitting}
                color="error"
                startIcon={<FaTrash />}
              >
                Delete Event
              </Button>
            )}
            <Button 
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEvent}
              disabled={isSubmitting || !isFormValid}
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={16} /> : selectedEvent ? <FaEdit /> : <FaCalendarPlus />}
            >
              {isSubmitting ? 'Saving...' : selectedEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default EventCalendar;
