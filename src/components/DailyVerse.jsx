import React, { useState, useEffect } from "react";
import { BibleAPI } from "../services/BibleAPI.jsx";

const DailyVerse = React.memo(() => {
  const [verse, setVerse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchVerse = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const cached = localStorage.getItem("dailyVerse");
        const cachedDate = localStorage.getItem("dailyVerseDate");
        
        if (cached && cachedDate === today) {
          setVerse(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
        
        // Use a rotating set of daily verses
        const dailyVerses = [
          "John 3:16",
          "Psalm 23:1",
          "Philippians 4:13", 
          "Romans 8:28",
          "Jeremiah 29:11",
          "Proverbs 3:5-6",
          "Isaiah 40:31",
          "Matthew 11:28"
        ];
        
        // Select verse based on day of week for variety
        const dayIndex = new Date().getDay();
        const verseReference = dailyVerses[dayIndex] || dailyVerses[0];
        
        const response = await BibleAPI.getVerse(verseReference, 'NIV');
        setVerse(response);
        
        localStorage.setItem("dailyVerse", JSON.stringify(response));
        localStorage.setItem("dailyVerseDate", today);
      } catch (err) {
        console.error("Error fetching daily verse:", err);
        setError("Could not load verse. Please try again later.");
        
        // Set fallback verse
        setVerse({
          text: "Trust in the LORD with all your heart and lean not on your own understanding.",
          reference: "Proverbs 3:5",
          version: "NIV",
          source: "fallback"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVerse();
  }, []);
  
  if (isLoading) {
    return (
      <div className="daily-verse loading">
        <p>Loading daily verse...</p>
      </div>
    );
  }
  
  if (error && !verse) {
    return (
      <div className="daily-verse error">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <blockquote className="daily-verse">
      <div className="verse-content">
        <p className="verse-text">"{verse?.text}"</p>
        <footer className="verse-reference">— {verse?.reference} ({verse?.version})</footer>
      </div>
      {verse?.source === 'fallback' && (
        <div className="verse-note">
          <small>Using fallback verse</small>
        </div>
      )}
    </blockquote>
  );
});

// Add CSS for styling (you can move this to a separate CSS file)
const dailyVerseStyles = `
.daily-verse {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 4px solid #1a4b8c;
  padding: 1.5rem;
  margin: 1rem 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.daily-verse.loading {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.daily-verse.error {
  background: #fef2f2;
  border-left-color: #dc2626;
  color: #dc2626;
}

.verse-content {
  text-align: center;
}

.verse-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.verse-reference {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
  font-style: normal;
}

.verse-note {
  margin-top: 0.5rem;
  text-align: center;
}

.verse-note small {
  color: #9ca3af;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .daily-verse {
    padding: 1rem;
    margin: 0.5rem 0;
  }
  
  .verse-text {
    font-size: 1rem;
  }
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = dailyVerseStyles;
document.head.appendChild(styleSheet);

export default DailyVerse;
