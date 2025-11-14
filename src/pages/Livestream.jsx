// src/pages/Livestream.jsx
import React from 'react';
import '../css/Livestream.css';

const Livestream = () => {
  const streamPlatforms = [
    { name: 'YouTube', url: 'https://www.youtube.com/embed/YOUR_VIDEO_ID' },
    { name: 'Facebook', url: 'https://www.facebook.com/plugins/video.php?href=YOUR_FB_VIDEO_ID' }
  ];

  return (
    <div className="livestream-page">
      <header className="livestream-header">
        <h1>Ministry Livestream</h1>
        <p>Broadcast God&apos;s word to the world</p>
      </header>

      <main className="livestream-main">
        {streamPlatforms.map((platform, idx) => (
          <section key={idx} className="stream-section">
            <h2>{platform.name} Stream</h2>
            <iframe 
              src={platform.url} 
              width="100%" 
              height="400" 
              allowFullScreen 
              title={`${platform.name} livestream`}
            />
          </section>
        ))}

        <section className="livestream-info">
          <h2>Join Us in Prayer</h2>
          <p>Connect with our global community and receive spiritual guidance.</p>
        </section>
      </main>
    </div>
  );
};

export default Livestream;
