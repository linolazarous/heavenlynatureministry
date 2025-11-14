import React, { useState, useEffect } from "react";

const DailyVerse = React.memo(() => {
  const [verse, setVerse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

      // Local set of daily verses
      const dailyVerses = [
        {
          text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
          reference: "John 3:16",
          version: "NIV"
        },
        {
          text: "The LORD is my shepherd; I shall not want.",
          reference: "Psalm 23:1",
          version: "NIV"
        },
        {
          text: "I can do all things through him who strengthens me.",
          reference: "Philippians 4:13",
          version: "NIV"
        },
        {
          text: "And we know that for those who love God all things work together for good.",
          reference: "Romans 8:28",
          version: "NIV"
        },
        {
          text: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
          reference: "Jeremiah 29:11",
          version: "NIV"
        },
        {
          text: "Trust in the LORD with all your heart, and do not lean on your own understanding.",
          reference: "Proverbs 3:5-6",
          version: "NIV"
        },
        {
          text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles.",
          reference: "Isaiah 40:31",
          version: "NIV"
        },
        {
          text: "Come to me, all who labor and are heavy laden, and I will give you rest.",
          reference: "Matthew 11:28",
          version: "NIV"
        }
      ];

      const dayIndex = new Date().getDay();
      const todayVerse = dailyVerses[dayIndex] || dailyVerses[0];

      setVerse(todayVerse);
      localStorage.setItem("dailyVerse", JSON.stringify(todayVerse));
      localStorage.setItem("dailyVerseDate", today);
    } catch (err) {
      console.error(err);
      setError("Could not load verse. Using fallback.");
      setVerse({
        text: "Trust in the LORD with all your heart and lean not on your own understanding.",
        reference: "Proverbs 3:5",
        version: "NIV"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="daily-verse loading">Loading daily verse...</div>;
  }

  return (
    <blockquote className="daily-verse">
      <p className="verse-text">"{verse?.text}"</p>
      <footer className="verse-reference">— {verse?.reference} ({verse?.version})</footer>
      {error && <small className="verse-note">{error}</small>}
    </blockquote>
  );
});

export default DailyVerse;
