import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
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
  Avatar,
  Chip,
  Alert,
  Box,
  Card,
  CardContent
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Add, 
  Close, 
  VerifiedUser, 
  Person, 
  EditNote,
  Refresh,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useConfirm } from 'material-ui-confirm';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import RoleChip from '../components/RoleChip';
import UserAvatar from '../components/UserAvatar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { userAPI } from '../services/api';
import './Users.css';

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

  const { user: currentAdmin } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const response = await userAPI.getUsers({
        search: state.searchTerm,
        role: state.filterRole !== 'all' ? state.filterRole : undefined
      });
      updateState({ users: response.data, loading: false });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      updateState({ 
        error: err.response?.data?.message || 'Failed to fetch users',
        loading: false,
        snackbar: {
          open: true,
          message: 'Failed to load users',
          severity: 'error'
        }
      });
    }
  }, [state.searchTerm, state.filterRole, updateState]);

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

  const handleCreateUser = useCallback(async (userData) => {
    const response = await userAPI.createUser(userData);
    return response.data;
  }, []);

  const handleUpdateUser = useCallback(async (userId, userData) => {
    const response = await userAPI.updateUser(userId, userData);
    return response.data;
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    await userAPI.deleteUser(userId);
  }, []);

  const handleResetPassword = useCallback(async (userId) => {
    const response = await userAPI.resetPassword(userId);
    return response.data;
  }, []);

  return {
    ...state,
    updateState,
    fetchUsers,
    validateForm,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleResetPassword,
    currentAdmin
  };
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
    handleResetPassword,
    currentAdmin
  } = useUserManagement();

  const confirm = useConfirm();

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users, searchTerm]);

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
          message: err.response?.data?.message || 
                  (currentUser ? 'Failed to update user' : 'Failed to create user'),
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
        title: 'Confirm User Deletion',
        description: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone and will remove all user data.`,
        confirmationText: 'Delete User',
        confirmationButtonProps: { variant: 'contained', color: 'error' },
        cancellationButtonProps: { variant: 'outlined' }
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

  const handleResetPassword = useCallback(async (user) => {
    try {
      await confirm({
        title: 'Reset User Password',
        description: `This will generate a temporary password for ${user.name}. They will need to reset it on next login.`,
        confirmationText: 'Reset Password',
        confirmationButtonProps: { variant: 'contained', color: 'warning' }
      });

      const result = await handleResetPassword(user._id);
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
  }, [confirm, handleResetPassword, updateState]);

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
      <div className="users-admin-loading">
        <LoadingSpinner message="Loading users..." />
      </div>
    );
  }

  return (
    <div className={`users-admin-container ${className}`}>
      {/* Header */}
      <Card className="users-header-card">
        <CardContent>
          <div className="users-header">
            <div>
              <Typography variant="h4" component="h1" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage user accounts, roles, and permissions
              </Typography>
            </div>
            <div className="users-actions">
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
            </div>
          </div>

          {/* Search and Filter */}
          <div className="users-filters">
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
          </div>
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
      <TableContainer component={Paper} className="users-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <div className="user-cell">
                    <UserAvatar user={user} size={40} />
                    <div className="user-info">
                      <Typography variant="body1" fontWeight="medium">
                        {user.name}
                      </Typography>
                      {user._id === currentAdmin._id && (
                        <Chip 
                          size="small" 
                          label="You" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                      {user.lastLogin && (
                        <Typography variant="caption" color="textSecondary">
                          Last login: {formatDistanceToNow(new Date(user.lastLogin))} ago
                        </Typography>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                  {user.phone && (
                    <Typography variant="caption" color="textSecondary">
                      {user.phone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <RoleChip role={user.role} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell>
                  {user.emailVerified ? (
                    <Chip 
                      icon={<CheckCircle fontSize="small" />} 
                      label="Verified" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      icon={<Warning fontSize="small" />} 
                      label="Pending" 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                    />
                  )}
                  {user.isActive === false && (
                    <Chip 
                      icon={<Cancel fontSize="small" />} 
                      label="Inactive" 
                      size="small" 
                      color="error" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <div className="action-buttons">
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
                        onClick={() => handleResetPassword(user)}
                      >
                        <EditNote />
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
                  </div>
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
            {searchTerm || filterRole !== 'all' ? (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Try adjusting your search or filter criteria
              </Typography>
            ) : null}
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
                    <div className="role-option">
                      <Typography variant="body1">{option.label}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.description}
                      </Typography>
                    </div>
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
    </div>
  );
};

UsersAdmin.propTypes = {
  className: PropTypes.string
};

UsersAdmin.defaultProps = {
  className: ''
};

export default UsersAdmin;