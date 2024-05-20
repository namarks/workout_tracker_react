import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { signOutUser, addWorkout, getWorkouts } from '../services/firebase';

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const workoutsSnapshot = await getWorkouts(userId);
        setWorkouts(workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    fetchWorkouts();
  }, []);

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    const newWorkout = {
      date,
      exercise,
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseInt(weight, 10),
      userId: auth.currentUser.uid
    };
    await addWorkout(newWorkout);
    setWorkouts([...workouts, newWorkout]);
    setDate('');
    setExercise('');
    setSets('');
    setReps('');
    setWeight('');
  };

  const handleSignOut = async () => {
    await signOutUser();
    alert('User signed out successfully');
  };

  return (
    <div>
      <h1>Workout Tracker</h1>
      <button onClick={handleSignOut}>Sign Out</button>
      <form onSubmit={handleAddWorkout}>
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Exercise:
          <input type="text" value={exercise} onChange={(e) => setExercise(e.target.value)} required />
        </label>
        <label>
          Sets:
          <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} required />
        </label>
        <label>
          Reps:
          <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} required />
        </label>
        <label>
          Weight:
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />
        </label>
        <button type="submit">Add Workout</button>
      </form>
      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            {workout.date}: {workout.exercise} - {workout.sets} sets of {workout.reps} reps at {workout.weight} kg
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutList;
