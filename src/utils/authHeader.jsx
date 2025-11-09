// src/utils/authHeader.jsx
export function authHeader() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  
  return {};
}
