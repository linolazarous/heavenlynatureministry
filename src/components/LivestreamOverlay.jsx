import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  FaStickyNote, 
  FaBible, 
  FaUser,
  FaExclamationTriangle 
} from 'react-icons/fa';
import './LivestreamOverlay.css';

// Custom hook for overlay animations and state management
const useOverlayManager = () => {
  const processNotes = useCallback((notes) => {
    if (!notes || typeof notes !== 'string') return [];
    
    return notes
      .split('\n')
      .filter(paragraph => paragraph.trim())
      .map(paragraph => {
        // Simple markdown-like formatting
        let processed = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/_(.*?)_/g, '<em>$1</em>');
        
        return {
          raw: paragraph,
          processed: processed,
          isHeading: paragraph.startsWith('#')
        };
      });
  }, []);

  const validateLowerThird = useCallback((lowerThird) => {
    if (!lowerThird || typeof lowerThird !== 'object') {
      return {
        visible: false,
        title: '',
        subtitle: '',
        color: '#1a4b8c'
      };
    }

    return {
      visible: Boolean(lowerThird.visible && lowerThird.title?.trim()),
      title: lowerThird.title?.trim() || '',
      subtitle: lowerThird.subtitle?.trim() || '',
      color: lowerThird.color || '#1a4b8c'
    };
  }, []);

  const formatBibleVerse = useCallback((bibleVerse, verseSearch, translation) => {
    if (!bibleVerse) return null;

    // Handle different bibleVerse formats (string or object)
    let verseText, verseReference;
    
    if (typeof bibleVerse === 'string') {
      verseText = bibleVerse;
      verseReference = verseSearch;
    } else if (bibleVerse.text && bibleVerse.reference) {
      verseText = bibleVerse.text;
      verseReference = bibleVerse.reference;
    } else {
      return null;
    }

    if (!verseText || !verseReference) return null;

    return {
      text: verseText,
      reference: verseReference,
      translation: translation || 'NIV'
    };
  }, []);

  return {
    processNotes,
    validateLowerThird,
    formatBibleVerse
  };
};

// Individual overlay components for better separation
const NotesOverlay = React.memo(({ notes, showNotes }) => {
  const { processNotes } = useOverlayManager();
  const processedNotes = useMemo(() => processNotes(notes), [notes, processNotes]);

  if (!showNotes || !processedNotes.length) return null;

  return (
    <div 
      className="overlay-section overlay-notes slide-in"
      role="region"
      aria-label="Livestream notes"
    >
      <div className="overlay-header" aria-hidden="true">
        <FaStickyNote className="overlay-icon" />
        <span className="overlay-title">Notes</span>
      </div>
      <div className="overlay-content notes-content">
        {processedNotes.map((paragraph, i) => (
          <div 
            key={i} 
            className={`notes-paragraph ${paragraph.isHeading ? 'heading' : ''}`}
            aria-live="polite"
            dangerouslySetInnerHTML={{ __html: paragraph.processed }}
          />
        ))}
      </div>
    </div>
  );
});

NotesOverlay.propTypes = {
  notes: PropTypes.string,
  showNotes: PropTypes.bool
};

const BibleVerseOverlay = React.memo(({ bibleVerse, verseSearch, translation, showBible }) => {
  const { formatBibleVerse } = useOverlayManager();
  const verseData = useMemo(() => 
    formatBibleVerse(bibleVerse, verseSearch, translation),
    [bibleVerse, verseSearch, translation, formatBibleVerse]
  );

  if (!showBible || !verseData) return null;

  return (
    <div 
      className="overlay-section overlay-bible fade-in"
      role="region"
      aria-label="Bible verse"
    >
      <div className="overlay-header" aria-hidden="true">
        <FaBible className="overlay-icon" />
        <span className="overlay-title">Scripture</span>
      </div>
      <div className="overlay-content bible-content">
        <blockquote className="bible-text" aria-live="polite">
          "{verseData.text}"
        </blockquote>
        <cite className="bible-reference">
          — {verseData.reference} ({verseData.translation})
        </cite>
      </div>
    </div>
  );
});

BibleVerseOverlay.propTypes = {
  bibleVerse: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  verseSearch: PropTypes.string,
  translation: PropTypes.string,
  showBible: PropTypes.bool
};

const LowerThirdOverlay = React.memo(({ lowerThird }) => {
  const { validateLowerThird } = useOverlayManager();
  const validatedLowerThird = useMemo(() => 
    validateLowerThird(lowerThird),
    [lowerThird, validateLowerThird]
  );

  if (!validatedLowerThird.visible) return null;

  // Ensure color is valid, fallback to default
  const backgroundColor = validatedLowerThird.color || '#1a4b8c';

  return (
    <div 
      className="overlay-section overlay-lower-third slide-up"
      style={{ backgroundColor }}
      role="region"
      aria-label="Speaker information"
    >
      <div className="lower-third-content">
        <div className="lower-third-icon" aria-hidden="true">
          <FaUser />
        </div>
        <div className="lower-third-text">
          <h3 
            className="lower-third-title"
            aria-live="polite"
          >
            {validatedLowerThird.title}
          </h3>
          {validatedLowerThird.subtitle && (
            <p 
              className="lower-third-subtitle"
              aria-live="polite"
            >
              {validatedLowerThird.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

LowerThirdOverlay.propTypes = {
  lowerThird: PropTypes.shape({
    visible: PropTypes.bool,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    color: PropTypes.string
  })
};

const LivestreamOverlay = ({
  showNotes = false,
  notes = '',
  showBible = false,
  bibleVerse = null,
  translation = 'NIV',
  verseSearch = '',
  lowerThird = {},
  className = '',
  position = 'top-right',
  ...props
}) => {
  // Memoized props to prevent unnecessary re-renders
  const overlayProps = useMemo(() => ({
    showNotes,
    notes,
    showBible,
    bibleVerse,
    translation,
    verseSearch,
    lowerThird
  }), [showNotes, notes, showBible, bibleVerse, translation, verseSearch, lowerThird]);

  // Error boundary fallback
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Overlay error:', error);
      setHasError(true);
    };

    // Add error event listener
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className={`livestream-overlay error ${className}`} role="alert">
        <div className="overlay-error">
          <FaExclamationTriangle />
          <p>Overlay display error. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`livestream-overlay ${position} ${className}`}
      role="complementary"
      aria-live="polite"
      {...props}
    >
      <NotesOverlay 
        notes={overlayProps.notes}
        showNotes={overlayProps.showNotes}
      />
      
      <BibleVerseOverlay 
        bibleVerse={overlayProps.bibleVerse}
        verseSearch={overlayProps.verseSearch}
        translation={overlayProps.translation}
        showBible={overlayProps.showBible}
      />
      
      <LowerThirdOverlay 
        lowerThird={overlayProps.lowerThird}
      />
    </div>
  );
};

LivestreamOverlay.propTypes = {
  showNotes: PropTypes.bool,
  notes: PropTypes.string,
  showBible: PropTypes.bool,
  bibleVerse: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      text: PropTypes.string,
      reference: PropTypes.string
    })
  ]),
  translation: PropTypes.string,
  verseSearch: PropTypes.string,
  lowerThird: PropTypes.shape({
    visible: PropTypes.bool,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    color: PropTypes.string
  }),
  className: PropTypes.string,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left'])
};

LivestreamOverlay.defaultProps = {
  showNotes: false,
  notes: '',
  showBible: false,
  bibleVerse: null,
  translation: 'NIV',
  verseSearch: '',
  lowerThird: {
    visible: false,
    title: '',
    subtitle: '',
    color: '#1a4b8c'
  },
  className: '',
  position: 'top-right'
};

export default LivestreamOverlay;
