// src/pages/Sermons.jsx
import React from 'react';
import '../css/Sermons.css';

const Sermons = () => {
  const sermons = [
    { title: 'Faith in Action', speaker: 'Pastor Lino', date: 'Nov 1, 2025', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_1' },
    { title: 'The Power of Prayer', speaker: 'Pastor Grace', date: 'Nov 8, 2025', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_2' },
    { title: 'Generosity and Giving', speaker: 'Pastor John', date: 'Nov 14, 2025', videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_3' },
  ];

  return (
    <div className="sermons-page">
      <h1>Latest Sermons</h1>
      <p>Watch our past sermons and be inspired by God's word.</p>

      <section className="sermons-list">
        {sermons.map((sermon, idx) => (
          <div key={idx} className="sermon-card">
            <iframe
              src={sermon.videoUrl}
              width="100%"
              height="300"
              title={sermon.title}
              allowFullScreen
            />
            <h3>{sermon.title}</h3>
            <p>By {sermon.speaker} | {sermon.date}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Sermons;
