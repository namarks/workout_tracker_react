import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import WorkoutList from './components/WorkoutList';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/signin" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/workouts" element={
            <PrivateRoute>
              <WorkoutList />
            </PrivateRoute>
          } />
          <Route path="/" element={<SignIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
