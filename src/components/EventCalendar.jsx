// src/components/EventCalendar.jsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Typography, Chip } from '@mui/material';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Sample static events
const sampleEvents = [
  {
    id: '1',
    title: 'Sunday Service',
    start: '2025-11-17T10:00:00',
    end: '2025-11-17T12:00:00',
    extendedProps: {
      location: 'Main Hall',
      description: 'Weekly worship service'
    },
    backgroundColor: '#4a6fa5',
    borderColor: '#4a6fa5',
    textColor: '#fff'
  },
  {
    id: '2',
    title: 'Bible Study',
    start: '2025-11-19T18:00:00',
    end: '2025-11-19T19:30:00',
    extendedProps: {
      location: 'Room 101',
      description: 'Weekly Bible study'
    },
    backgroundColor: '#6f42c1',
    borderColor: '#6f42c1',
    textColor: '#fff'
  }
];

const EventCalendar = ({ compact = false }) => {
  // Calendar configuration
  const calendarConfig = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: compact ? 'timeGridWeek' : 'dayGridMonth',
    headerToolbar: compact
      ? false
      : {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
    events: sampleEvents,
    nowIndicator: true,
    editable: false,
    selectable: false,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: 'short'
    },
    height: compact ? '400px' : 'auto'
  };

  // Event rendering
  const renderEventContent = (eventInfo) => (
    <div>
      <div>{eventInfo.event.title}</div>
      {eventInfo.event.extendedProps.location && (
        <div style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center' }}>
          <FaMapMarkerAlt size={10} style={{ marginRight: 4 }} />
          {eventInfo.event.extendedProps.location}
        </div>
      )}
    </div>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Ministry Events Calendar
      </Typography>
      <Chip label={`Showing ${sampleEvents.length} event${sampleEvents.length !== 1 ? 's' : ''}`} sx={{ mb: 2 }} />
      <FullCalendar {...calendarConfig} eventContent={renderEventContent} />
    </Box>
  );
};

export default EventCalendar;
