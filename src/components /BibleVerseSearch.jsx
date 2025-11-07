// heavenlynatureministry/components/BibleVerseSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";

const BibleVerseSearch = ({ onSelect }) => {
  const [verseSearch, setVerseSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Handle verse search with debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      if (verseSearch.trim()) handleVerseSearch();
      else setSuggestions([]);
    }, 600);
    return () => clearTimeout(delay);
  }, [verseSearch]);

  const handleVerseSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(verseSearch)}`
      );
      const data = await response.json();
      if (data.text) {
        setSuggestions([
          {
            reference: data.reference,
            text: data.text,
            translation: data.translation_name,
          },
        ]);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching verse:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (verse) => {
    onSelect(verse);
    setVerseSearch("");
    setSuggestions([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bible-verse-search" ref={dropdownRef}>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={verseSearch}
          placeholder="Search a Bible verse (e.g., John 3:16)"
          onChange={(e) => setVerseSearch(e.target.value)}
          aria-label="Bible verse search"
        />
        <FaChevronDown className="dropdown-icon" />
      </div>

      {loading && <div className="loading">Searching...</div>}

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((s, index) => (
            <li
              key={index}
              className="suggestion-item"
              onClick={() => handleSelect(s)}
            >
              <strong>{s.reference}</strong> — {s.text}
              <em> ({s.translation})</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BibleVerseSearch;