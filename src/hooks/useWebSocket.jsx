import { useState, useEffect, useRef, useCallback } from 'react';

// WebSocket connection status
export const WS_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  STREAM_STATUS: 'stream-status',
  VIEWER_COUNT: 'viewer-count',
  STREAM_STATS: 'stream-stats',
  CHAT_MESSAGE: 'chat-message',
  COMMAND: 'command',
  ERROR: 'error'
};

export const useWebSocket = (token = null) => {
  const [status, setStatus] = useState(WS_STATUS.DISCONNECTED);
  const [streamStatus, setStreamStatus] = useState('offline');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamStats, setStreamStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket URL construction
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.REACT_APP_WS_URL || `${protocol}//${window.location.host}`;
    const url = token ? `${baseUrl}?token=${token}` : baseUrl;
    return url;
  }, [token]);

  // Message handlers
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case WS_MESSAGE_TYPES.STREAM_STATUS:
          setStreamStatus(data.payload.status);
          break;
          
        case WS_MESSAGE_TYPES.VIEWER_COUNT:
          setViewerCount(data.payload.count);
          break;
          
        case WS_MESSAGE_TYPES.STREAM_STATS:
          setStreamStats(data.payload.stats);
          break;
          
        case WS_MESSAGE_TYPES.CHAT_MESSAGE:
          setMessages(prev => [...prev.slice(-99), data.payload]); // Keep last 100 messages
          break;
          
        case WS_MESSAGE_TYPES.ERROR:
          setError(data.payload.message);
          console.error('WebSocket error:', data.payload.message);
          break;
          
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
      setError('Failed to parse server message');
    }
  }, []);

  const handleOpen = useCallback(() => {
    console.log('WebSocket connected');
    setStatus(WS_STATUS.CONNECTED);
    setError(null);
    reconnectAttempts.current = 0;
    
    // Clear any pending reconnect timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
  }, []);

  const handleClose = useCallback((event) => {
    console.log('WebSocket disconnected:', event.code, event.reason);
    setStatus(WS_STATUS.DISCONNECTED);
    
    // Attempt reconnect unless closed normally
    if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
      reconnectTimeout.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, 3000 * reconnectAttempts.current); // Exponential backoff
    }
  }, []);

  const handleError = useCallback((error) => {
    console.error('WebSocket error:', error);
    setStatus(WS_STATUS.ERROR);
    setError('WebSocket connection failed');
  }, []);

  // Connection management
  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setStatus(WS_STATUS.CONNECTING);
      const url = getWebSocketUrl();
      ws.current = new WebSocket(url);
      
      ws.current.onopen = handleOpen;
      ws.current.onclose = handleClose;
      ws.current.onerror = handleError;
      ws.current.onmessage = handleMessage;
      
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setStatus(WS_STATUS.ERROR);
      setError('Failed to establish WebSocket connection');
    }
  }, [getWebSocketUrl, handleOpen, handleClose, handleError, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
    
    setStatus(WS_STATUS.DISCONNECTED);
    reconnectAttempts.current = 0;
  }, []);

  // Send message to WebSocket
  const sendMessage = useCallback((type, payload = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify({ type, payload });
        ws.current.send(message);
        return true;
      } catch (err) {
        console.error('Failed to send WebSocket message:', err);
        setError('Failed to send message');
        return false;
      }
    } else {
      console.warn('WebSocket not connected, cannot send message');
      setError('WebSocket not connected');
      return false;
    }
  }, []);

  // Send chat message
  const sendChatMessage = useCallback((message, user = 'Broadcaster') => {
    return sendMessage(WS_MESSAGE_TYPES.CHAT_MESSAGE, {
      user,
      message,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  // Send command to stream
  const sendStreamCommand = useCallback((command, parameters = {}) => {
    return sendMessage(WS_MESSAGE_TYPES.COMMAND, {
      command,
      parameters,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  // Request stream status update
  const requestStatusUpdate = useCallback(() => {
    return sendMessage('status-request');
  }, [sendMessage]);

  // Auto-connect on mount and when token changes
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Auto-reconnect when token changes
  useEffect(() => {
    if (token && status === WS_STATUS.DISCONNECTED) {
      connect();
    }
  }, [token, status, connect]);

  // Health check - ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (status !== WS_STATUS.CONNECTED) return;
    
    const interval = setInterval(() => {
      sendMessage('ping');
    }, 30000);
    
    return () => clearInterval(interval);
  }, [status, sendMessage]);

  return {
    // Connection state
    isConnected: status === WS_STATUS.CONNECTED,
    connectionStatus: status,
    
    // Stream data
    streamStatus,
    viewerCount,
    streamStats,
    messages,
    
    // Error handling
    error,
    clearError: () => setError(null),
    
    // Methods
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    sendStreamCommand,
    requestStatusUpdate,
    
    // Reconnection info
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts
  };
};

export default useWebSocket;
