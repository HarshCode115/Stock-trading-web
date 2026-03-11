import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getCurrentUser, logout, clearError } from '../store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state?.auth || {});
  const { user = null, token = null, isAuthenticated = false, loading = false, error = null } = authState;

  // Initialize auth state on app load
  useEffect(() => {
    if (token && !user && !loading && dispatch) {
      dispatch(getCurrentUser());
    }
  }, [token, user, loading, dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error && dispatch) {
        dispatch(clearError());
      }
    };
  }, [error, dispatch]);

  const handleLogout = () => {
    if (dispatch) dispatch(logout());
  };

  const clearAuthError = () => {
    if (dispatch) dispatch(clearError());
  };

  return {
    user: user || null,
    token: token || null,
    isAuthenticated: isAuthenticated || false,
    loading: loading || false,
    error: error || null,
    logout: handleLogout,
    clearError: clearAuthError,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
  };
};

export default useAuth;
