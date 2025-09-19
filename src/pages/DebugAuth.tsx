import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getRoleDashboardRoute } from '../store/slices/authSlice';

const DebugAuth: React.FC = () => {
  const { isAuthenticated, user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Authentication State</h2>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Token:</strong> {token ? 'Present' : 'None'}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          {user ? (
            <>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>First Name:</strong> {user.first_name}</p>
              <p><strong>Last Name:</strong> {user.last_name}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Full Name:</strong> {user.full_name}</p>
              <p><strong>Is Verified:</strong> {user.is_verified ? 'Yes' : 'No'}</p>
            </>
          ) : (
            <p>No user data</p>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Role-Based Routing</h2>
          {user && (
            <>
              <p><strong>User Role:</strong> {user.role}</p>
              <p><strong>Expected Dashboard:</strong> {getRoleDashboardRoute(user.role)}</p>
              <p><strong>Role Check Results:</strong></p>
              <ul className="ml-4">
                <li>Is Admin: {user.role === 'admin' ? 'Yes' : 'No'}</li>
                <li>Is Official: {user.role === 'official' ? 'Yes' : 'No'}</li>
                <li>Is Citizen: {user.role === 'citizen' ? 'Yes' : 'No'}</li>
              </ul>
            </>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Local Storage</h2>
          <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'None'}</p>
          <p><strong>Refresh Token:</strong> {localStorage.getItem('refreshToken') ? 'Present' : 'None'}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Raw User Object</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
