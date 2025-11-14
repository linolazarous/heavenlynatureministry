// src/pages/Events.jsx
import React from 'react';
import '../css/Events.css';

const Events = () => {
  const events = [
    { date: 'Nov 20, 2025', title: 'Community Prayer Meeting', location: 'Juba Central Church' },
    { date: 'Nov 28, 2025', title: 'Youth Outreach Program', location: 'Bahr el Ghazal' },
    { date: 'Dec 5, 2025', title: 'Christmas Charity Drive', location: 'South Sudan Ministries' },
  ];

  return (
    <div className="events-page">
      <h1>Upcoming Events</h1>
      <p>Join us in our mission to spread faith, hope, and love.</p>

      <section className="events-list">
        {events.map((event, idx) => (
          <div key={idx} className="event-card">
            <p className="event-date">{event.date}</p>
            <h3 className="event-title">{event.title}</h3>
            <p className="event-location">{event.location}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Events;
