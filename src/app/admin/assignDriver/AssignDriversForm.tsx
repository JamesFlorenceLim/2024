"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';

interface Driver {
  id: number;
  firstname: string;
  lastname: string;
}

interface Assignment {
  id: number;
  Operator: {
    id: number;
    firstname: string;
    lastname: string;
  };
  Van: {
    id: number;
    plate_number: string;
  };
  driver_id: number | null;
  Driver?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  archived: boolean;
}

interface AssignDriversFormProps {
  drivers: Driver[];
}

const AssignDriversForm: React.FC<AssignDriversFormProps> = ({ drivers }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<number | null>(null);

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get('/api/assignments');
      console.log('Fetched assignments:', data); // Log the fetched data
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAssignDriver = async () => {
    if (selectedAssignment === null || selectedDriver === null) {
      alert('Please select an assignment and a driver.');
      return;
    }

    try {
      await axios.post('/api/assignments/assignDriver', {
        assignment_id: selectedAssignment,
        driver_id: selectedDriver,
      });
      alert('Driver assigned successfully');
      setEditingAssignment(null);
      fetchAssignments();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to assign driver');
      }
    }
  };

  const handleEditAssignment = (assignmentId: number) => {
    setEditingAssignment(assignmentId);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setSelectedAssignment(assignment.id);
      setSelectedDriver(assignment.driver_id);
    }
  };

  const handleArchiveAssignment = async (assignmentId: number) => {
    try {
      await axios.put('/api/assignments', {
        id: assignmentId,
        archived: true,
      });
      alert('Assignment archived successfully');
      fetchAssignments();
    } catch (error) {
      alert('Failed to archive assignment');
    }
  };

  // Filter out drivers who are already assigned to a van
  const assignedDriverIds = assignments.map(assignment => assignment.driver_id).filter(id => id !== null);
  const availableDrivers = drivers.filter(driver => !assignedDriverIds.includes(driver.id));

  // Filter assignments to only include those with a driver and not archived
  const assignmentsWithDrivers = assignments.filter(assignment => assignment.driver_id !== null && !assignment.archived);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-4 sm:p-6 lg:p-8" style={{ marginLeft: '-46.1rem', marginTop: '-2rem' }}>
        <h2 className="text-2xl font-normal text-gray-600">Assign Drivers to Vans</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage and Assign Drivers to Vans with Operators</p>
      </div>
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Assignment</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            onChange={(e) => setSelectedAssignment(parseInt(e.target.value, 10))}
            value={selectedAssignment || ''}
          >
            <option value="">Select Assignment</option>
            {assignments.map(assignment => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.Operator?.firstname} {assignment.Operator?.lastname} - {assignment.Van?.plate_number}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Driver</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            onChange={(e) => setSelectedDriver(parseInt(e.target.value, 10))}
            value={selectedDriver || ''}
          >
            <option value="">Select Driver</option>
            {availableDrivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.firstname} {driver.lastname}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAssignDriver}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          {editingAssignment ? 'Update Assignment' : 'Assign Driver'}
        </button>
      </div>
      {assignmentsWithDrivers.length > 0 && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-xl font-normal text-gray-600 mb-4">Vans with Assigned Drivers</h3>
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Van Plate Number</th>
                <th className="px-4 py-2 border">Driver Name</th>
                <th className="px-4 py-2 border">Operator Name</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignmentsWithDrivers.map(assignment => (
                <tr key={assignment.id}>
                  <td className="px-4 py-2 border">{assignment.Van.plate_number}</td>
                  <td className="px-4 py-2 border">{assignment.Driver?.firstname} {assignment.Driver?.lastname}</td>
                  <td className="px-4 py-2 border">{assignment.Operator.firstname} {assignment.Operator.lastname}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleEditAssignment(assignment.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                   
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignDriversForm;