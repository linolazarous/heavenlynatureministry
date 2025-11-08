// heavenlynatureministry/components/CountdownTimer.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaStop, FaUndo, FaClock, FaChevronDown } from "react-icons/fa";
import { formatTime } from "../utils/timeUtils";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };
  
  const resetTimer = () => {
    stopTimer();
    setTimeLeft(600);
  };
  
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);
  
  return (
    <div className="countdown-timer">
      <div className="timer-display">
        <FaClock /> {formatTime(timeLeft)}
      </div>
      <div className="timer-controls">
        <button onClick={startTimer} disabled={isRunning} aria-label="Start timer">
          <FaPlay /> Start
        </button>
        <button onClick={stopTimer} disabled={!isRunning} aria-label="Stop timer">
          <FaStop /> Stop
        </button>
        <button onClick={resetTimer} aria-label="Reset timer">
          <FaUndo /> Reset
        </button>
      </div>
    </div>
  );
};

export default CountdownTimer;
