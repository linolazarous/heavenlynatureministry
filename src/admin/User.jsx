// src/admin/User.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Box,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Add, 
  Close, 
  Refresh,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

// Constants
const ROLE_OPTIONS = [
  { value: 'user', label: 'User', description: 'Basic access to public content' },
  { value: 'volunteer', label: 'Volunteer', description: 'Can access volunteer resources' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit ministry content' },
  { value: 'moderator', label: 'Moderator', description: 'Can moderate content and users' },
  { value: 'admin', label: 'Admin', description: 'Full administrative privileges' }
];

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Custom hook for user management
const useUserManagement = () => {
  const [state, setState] = useState({
    users: [],
    loading: true,
    error: null,
    openDialog: false,
    currentUser: null,
    snackbar: { 
      open: false, 
      message: '',
      severity: 'success' 
    },
    formData: {
      name: '',
      email: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    },
    formErrors: {},
    isSubmitting: false,
    searchTerm: '',
    filterRole: 'all'
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Mock current admin user
  const currentAdmin = { _id: 'admin-1', name: 'Admin User', role: 'admin' };

  const fetchUsers = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      // Mock API call - replace with actual API
      const mockUsers = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          createdAt: new Date().toISOString(),
          emailVerified: true,
          isActive: true,
          lastLogin: new Date().toISOString()
        },
        {
          _id: '2', 
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'volunteer',
          createdAt: new Date().toISOString(),
          emailVerified: false,
          isActive: true,
          lastLogin: new Date().toISOString()
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateState({ users: mockUsers, loading: false });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      updateState({ 
        error: 'Failed to fetch users',
        loading: false,
        snackbar: {
          open: true,
          message: 'Failed to load users',
          severity: 'error'
        }
      });
    }
  }, [updateState]);

  const validateForm = useCallback((formData, isEditing = false) => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!isEditing && !formData.password) {
      errors.password = 'Password is required for new users';
    } else if (formData.password && !PASSWORD_REGEX.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  }, []);

  // Mock API functions
  const handleCreateUser = useCallback(async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...userData, _id: Date.now().toString() };
  }, []);

  const handleUpdateUser = useCallback(async (userId, userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...userData, _id: userId };
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  const handlePasswordReset = useCallback(async (userId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { tempPassword: 'Temp123!' };
  }, []);

  return {
    ...state,
    updateState,
    fetchUsers,
    validateForm,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handlePasswordReset,
    currentAdmin
  };
};

// Simple Role Chip Component
const RoleChip = ({ role }) => {
  const getColor = () => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      case 'editor': return 'info';
      case 'volunteer': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontSize: '0.75rem',
        fontWeight: 'medium',
        backgroundColor: getColor() + '.light',
        color: getColor() + '.dark',
        textTransform: 'capitalize'
      }}
    >
      {role}
    </Box>
  );
};

// Simple User Avatar Component
const UserAvatar = ({ user, size = 40 }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 'bold'
      }}
    >
      {getInitials(user.name)}
    </Box>
  );
};

// Simple Loading Spinner Component
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
    <CircularProgress />
    <Typography variant="body2" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);

// Simple Error Message Component
const ErrorMessage = ({ message, onRetry, severity = 'error' }) => (
  <Alert 
    severity={severity} 
    action={
      onRetry && (
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      )
    }
    sx={{ mb: 2 }}
  >
    {message}
  </Alert>
);

// Simple Confirm Hook
const useConfirm = () => {
  return useCallback((options) => {
    return new Promise((resolve, reject) => {
      if (window.confirm(options.description || 'Are you sure?')) {
        resolve();
      } else {
        reject('cancel');
      }
    });
  }, []);
};

const UsersAdmin = ({ className = '' }) => {
  const {
    users,
    loading,
    error,
    openDialog,
    currentUser,
    snackbar,
    formData,
    formErrors,
    isSubmitting,
    searchTerm,
    filterRole,
    updateState,
    fetchUsers,
    validateForm,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handlePasswordReset, // This is from the hook
    currentAdmin
  } = useUserManagement();

  const confirm = useConfirm();

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users, searchTerm, filterRole]);

  // Event handlers
  const handleDialogOpen = useCallback((user = null) => {
    updateState({
      currentUser: user,
      formData: {
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'user',
        password: '',
        confirmPassword: ''
      },
      formErrors: {},
      openDialog: true
    });
  }, [updateState]);

  const handleDialogClose = useCallback(() => {
    if (!isSubmitting) {
      updateState({ openDialog: false });
    }
  }, [isSubmitting, updateState]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    updateState(prev => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
      formErrors: { ...prev.formErrors, [name]: null }
    }));
  }, [updateState]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData, !!currentUser);
    if (Object.keys(errors).length > 0) {
      updateState({ formErrors: errors });
      return;
    }

    updateState({ isSubmitting: true });

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        role: formData.role
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (currentUser) {
        await handleUpdateUser(currentUser._id, userData);
        updateState({
          snackbar: {
            open: true,
            message: 'User updated successfully',
            severity: 'success'
          }
        });
      } else {
        await handleCreateUser(userData);
        updateState({
          snackbar: {
            open: true,
            message: 'User created successfully',
            severity: 'success'
          }
        });
      }

      fetchUsers();
      handleDialogClose();
    } catch (err) {
      console.error('User operation failed:', err);
      updateState({
        snackbar: {
          open: true,
          message: currentUser ? 'Failed to update user' : 'Failed to create user',
          severity: 'error'
        }
      });
    } finally {
      updateState({ isSubmitting: false });
    }
  }, [
    formData, 
    currentUser, 
    validateForm, 
    handleCreateUser, 
    handleUpdateUser, 
    fetchUsers, 
    handleDialogClose, 
    updateState
  ]);

  const handleDelete = useCallback(async (user) => {
    try {
      await confirm({
        description: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`
      });

      await handleDeleteUser(user._id);
      updateState({
        snackbar: {
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        }
      });
      fetchUsers();
    } catch (err) {
      if (err !== 'cancel') {
        updateState({
          snackbar: {
            open: true,
            message: 'Failed to delete user',
            severity: 'error'
          }
        });
      }
    }
  }, [confirm, handleDeleteUser, fetchUsers, updateState]);

  // FIXED: Use the handlePasswordReset from the hook instead of redefining it
  const handlePasswordResetAction = useCallback(async (user) => {
    try {
      await confirm({
        description: `This will generate a temporary password for ${user.name}. They will need to reset it on next login.`
      });

      const result = await handlePasswordReset(user._id);
      updateState({
        snackbar: {
          open: true,
          message: `Password reset. Temporary password: ${result.tempPassword}`,
          severity: 'info',
          autoHideDuration: 10000
        }
      });
    } catch (err) {
      if (err !== 'cancel') {
        updateState({
          snackbar: {
            open: true,
            message: 'Failed to reset password',
            severity: 'error'
          }
        });
      }
    }
  }, [confirm, handlePasswordReset, updateState]);

  const handleSearchChange = useCallback((e) => {
    updateState({ searchTerm: e.target.value });
  }, [updateState]);

  const handleFilterChange = useCallback((e) => {
    updateState({ filterRole: e.target.value });
  }, [updateState]);

  const handleSnackbarClose = useCallback(() => {
    updateState(prev => ({
      ...prev,
      snackbar: { ...prev.snackbar, open: false }
    }));
  }, [updateState]);

  if (loading && users.length === 0) {
    return (
      <Box className="users-admin-loading">
        <LoadingSpinner message="Loading users..." />
      </Box>
    );
  }

  return (
    <Box className={`users-admin-container ${className}`} sx={{ p: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage user accounts, roles, and permissions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleDialogOpen()}
              >
                Add User
              </Button>
              <Tooltip title="Refresh users">
                <IconButton onClick={fetchUsers} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={filterRole}
                onChange={handleFilterChange}
                label="Filter by Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                {ROLE_OPTIONS.map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error}
          onRetry={fetchUsers}
          severity="error"
        />
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <UserAvatar user={user} size={40} />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {user.name}
                      </Typography>
                      {user._id === currentAdmin._id && (
                        <Typography variant="caption" color="primary">
                          (You)
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <RoleChip role={user.role} />
                </TableCell>
                <TableCell>
                  {user.emailVerified ? (
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle fontSize="small" color="success" />
                      <Typography variant="body2">Verified</Typography>
                    </Box>
                  ) : (
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Warning fontSize="small" color="warning" />
                      <Typography variant="body2">Pending</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit user">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleDialogOpen(user)}
                        disabled={user._id === currentAdmin._id}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset password">
                      <IconButton 
                        color="secondary"
                        onClick={() => handlePasswordResetAction(user)}
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete user">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(user)}
                        disabled={user._id === currentAdmin._id}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No users found
            </Typography>
            {(searchTerm || filterRole !== 'all') && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Try adjusting your search or filter criteria
              </Typography>
            )}
          </Box>
        )}
      </TableContainer>

      {/* User Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              margin="normal"
              name="name"
              label="Full Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
              disabled={isSubmitting}
            />
            
            <TextField
              margin="normal"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              required
              disabled={isSubmitting || !!currentUser}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
                required
                disabled={isSubmitting}
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box>
                      <Typography variant="body1">{option.label}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {!currentUser && (
              <>
                <TextField
                  margin="normal"
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'Minimum 8 characters with uppercase, lowercase, number and special character'}
                  required
                  disabled={isSubmitting}
                />
                
                <TextField
                  margin="normal"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  required
                  disabled={isSubmitting}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleDialogClose} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting 
                ? (currentUser ? 'Updating...' : 'Creating...')
                : (currentUser ? 'Update User' : 'Create User')
              }
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration || 6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleSnackbarClose}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersAdmin;
