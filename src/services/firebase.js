import { auth, db } from '../firebaseConfig';

// Function to create a new user
const createUser = async (email, password, name) => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  await user.updateProfile({ displayName: name });
  await db.collection('users').doc(user.uid).set({
    name,
    email
  });
  return user;
};

// Function to sign in a user
const signInUser = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};

// Function to sign out the current user
const signOutUser = () => {
  return auth.signOut();
};

// Function to add a workout
const addWorkout = (workout) => {
  return db.collection('workouts').add(workout);
};

// Function to get workouts for the current user
const getWorkouts = (userId) => {
  return db.collection('workouts').where('userId', '==', userId).get();
};

export { createUser, signInUser, signOutUser, addWorkout, getWorkouts };
