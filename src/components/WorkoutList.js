import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useTable, useSortBy, useFilters } from 'react-table';
import Plot from 'react-plotly.js';
import EditableCell from './EditableCell';

// DefaultColumnFilter component for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const q = query(collection(db, 'workouts'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const workoutsData = [];
        querySnapshot.forEach((doc) => {
          workoutsData.push({ id: doc.id, ...doc.data() });
        });
        setWorkouts(workoutsData);
      });

      return () => unsubscribe();
    }
  }, [auth.currentUser]);

  const handleAddOrUpdateWorkout = async (e) => {
    e.preventDefault();
    const workoutData = {
      date,
      exercise,
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseInt(weight, 10),
      userId: auth.currentUser.uid
    };

    if (editId) {
      // Update existing workout
      const workoutDoc = doc(db, 'workouts', editId);
      await updateDoc(workoutDoc, workoutData);
      setEditId(null);
    } else {
      // Add new workout
      await addDoc(collection(db, 'workouts'), workoutData);
    }

    setDate('');
    setExercise('');
    setSets('');
    setReps('');
    setWeight('');
  };

  const handleEdit = (workout) => {
    setEditId(workout.id);
    setDate(workout.date);
    setExercise(workout.exercise);
    setSets(workout.sets);
    setReps(workout.reps);
    setWeight(workout.weight);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'workouts', id));
    } catch (error) {
      console.error('Error deleting workout: ', error);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    alert('User signed out successfully');
  };

  const updateData = async (rowIndex, columnId, value) => {
    const workout = workouts[rowIndex];
    const newWorkout = { ...workout, [columnId]: value };

    setWorkouts(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return newWorkout;
        }
        return row;
      })
    );

    try {
      const workoutDoc = doc(db, 'workouts', workout.id);
      await updateDoc(workoutDoc, { [columnId]: value });
    } catch (error) {
      console.error('Error updating workout: ', error);
    }
  };

  const columns = useMemo(() => [
    {
      Header: 'Date',
      accessor: 'date',
      Cell: EditableCell,
    },
    {
      Header: 'Exercise',
      accessor: 'exercise',
      Cell: EditableCell,
    },
    {
      Header: 'Sets',
      accessor: 'sets',
      Cell: EditableCell,
    },
    {
      Header: 'Reps',
      accessor: 'reps',
      Cell: EditableCell,
    },
    {
      Header: 'Weight (kg)',
      accessor: 'weight',
      Cell: EditableCell,
    },
    {
      Header: 'Actions',
      Cell: ({ row }) => (
        <div>
          <button onClick={() => handleEdit(row.original)}>Edit</button>
          <button onClick={() => handleDelete(row.original.id)}>Delete</button>
        </div>
      ),
    },
  ], []);

  const data = useMemo(() => workouts, [workouts]);

  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
      Cell: EditableCell, // Set editable cell as the default
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Add default column filter
      updateData, // Custom function to handle data updates
    },
    useFilters, // Use filters!
    useSortBy // Use sorting!
  );

  const plotData = useMemo(() => {
    const aggregatedData = {};

    workouts.forEach(workout => {
      const date = workout.date;
      const totalWeight = workout.sets * workout.reps * workout.weight;

      if (!aggregatedData[date]) {
        aggregatedData[date] = 0;
      }
      aggregatedData[date] += totalWeight;
    });

    const sortedData = Object.entries(aggregatedData).sort(([a], [b]) => new Date(a) - new Date(b));
    return sortedData.map(([date, totalWeight]) => ({
      date,
      totalWeight,
    }));
  }, [workouts]);

  return (
    <div>
      <h1>Workout Tracker</h1>
      <button onClick={handleSignOut}>Sign Out</button>
      <form onSubmit={handleAddOrUpdateWorkout}>
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
        <button type="submit">{editId ? 'Update Workout' : 'Add Workout'}</button>
      </form>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <h2>Total Weight Lifted by Day</h2>
      <Plot
        data={[
          {
            x: plotData.map(d => d.date),
            y: plotData.map(d => d.totalWeight),
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
          },
        ]}
        layout={{
          title: 'Total Weight Lifted by Day',
          xaxis: {
            title: 'Date',
          },
          yaxis: {
            title: 'Total Weight',
          },
        }}
        config={{
          responsive: true,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default WorkoutList;
