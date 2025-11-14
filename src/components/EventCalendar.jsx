// src/components/EventCalendar.jsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  FaCalendarPlus, 
  FaEdit, 
  FaTrash, 
  FaSyncAlt,
  FaMapMarkerAlt
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
  Box,
  Typography,
  Chip
} from '@mui/material';

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
  [EVENT_CATEGORIES.SERVICE]: { color: '#4a6fa5', textColor: '#ffffff' },
  [EVENT_CATEGORIES.MEETING]: { color: '#6f42c1', textColor: '#ffffff' },
  [EVENT_CATEGORIES.OUTREACH]: { color: '#20c997', textColor: '#ffffff' },
  [EVENT_CATEGORIES.SPECIAL]: { color: '#fd7e14', textColor: '#ffffff' },
  [EVENT_CATEGORIES.DEFAULT]: { color: '#6c757d', textColor: '#ffffff' }
};

// Sample static events
const SAMPLE_EVENTS = [
  {
    id: '1',
    title: 'Sunday Service',
    start: '2025-11-16T10:00:00',
    end: '2025-11-16T12:00:00',
    extendedProps: { category: EVENT_CATEGORIES.SERVICE, location: 'Main Hall' },
    ...CATEGORY_CONFIG[EVENT_CATEGORIES.SERVICE]
  },
  {
    id: '2',
    title: 'Youth Meeting',
    start: '2025-11-17T15:00:00',
    extendedProps: { category: EVENT_CATEGORIES.MEETING, location: 'Room 101' },
    ...CATEGORY_CONFIG[EVENT_CATEGORIES.MEETING]
  },
  {
    id: '3',
    title: 'Community Outreach',
    start: '2025-11-18T09:00:00',
    extendedProps: { category: EVENT_CATEGORIES.OUTREACH, location: 'City Park' },
    ...CATEGORY_CONFIG[EVENT_CATEGORIES.OUTREACH]
  }
];

const EventCalendar = ({ compact = false }) => {
  // Calendar config (static)
  const calendarConfig = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: compact ? 'listWeek' : CALENDAR_VIEWS.MONTH,
    headerToolbar: compact ? false : {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: SAMPLE_EVENTS,
    editable: false,
    selectable: false,
    nowIndicator: true,
    eventDisplay: 'block',
    height: compact ? '400px' : 'auto',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: 'short' },
    views: { listWeek: { type: 'list', duration: { weeks: 1 }, buttonText: 'list' } }
  };

  // Event content renderer
  const renderEventContent = (eventInfo) => (
    <div className="event-content">
      <div className="event-title">{eventInfo.event.title}</div>
      {eventInfo.event.extendedProps.location && (
        <div className="event-location">
          <FaMapMarkerAlt size={10} /> {eventInfo.event.extendedProps.location}
        </div>
      )}
    </div>
  );

  return (
    <Box className="calendar-container">
      <Box className="calendar-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          Ministry Events Calendar
        </Typography>
        <Chip label={`Static Data`} variant="outlined" size="small" />
      </Box>

      <Box className="calendar-wrapper">
        <FullCalendar {...calendarConfig} eventContent={renderEventContent} />
      </Box>
    </Box>
  );
};

export default EventCalendar;
