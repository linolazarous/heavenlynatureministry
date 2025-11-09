// heavenlynatureministry/components/DailyVerse.jsx
import React, { useState, useEffect } from "react";
import { getDailyVerse } from "../services/BibleAPI.jsx";

const DailyVerse = React.memo(() => {
  const [verse, setVerse] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const cached = localStorage.getItem("dailyVerse");
        const cachedDate = localStorage.getItem("dailyVerseDate");
        
        if (cached && cachedDate === today) {
          setVerse(JSON.parse(cached));
          return;
        }
        
        const response = await getDailyVerse();
        setVerse(response);
        localStorage.setItem("dailyVerse", JSON.stringify(response));
        localStorage.setItem("dailyVerseDate", today);
      } catch (err) {
        setError("Could not load verse. Please try again later.");
      }
    };
    
    fetchVerse();
  }, []);
  
  if (error) return <p className="error">{error}</p>;
  if (!verse) return <p>Loading daily verse...</p>;
  
  return (
    <blockquote className="daily-verse">
      <p>“{verse.text}”</p>
      <footer>— {verse.reference}</footer>
    </blockquote>
  );
});

export default DailyVerse;
