"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal"; // Import the Modal component
import { Operator } from "@/types";

const OperatorForm = () => {
  const [isDriver, setIsDriver] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    contact: "",
    region: "",
    city: "",
    brgy: "",
    street: "",
    type: "",
    emergency_name: "",
    emergency_address: "",
    emergency_contact: "",
    license_no: "",
    dl_codes: "",
    conditions: "",
    expiration_date: "",
  });

  const [operatorList, setOperatorList] = useState<Operator[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [driverList, setDriverList] = useState<Operator[]>([]);
  const [combinedList, setCombinedList] = useState<Operator[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(operatorList.length / rowsPerPage);
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message
  const [isRegisterAlertVisible, setIsRegisterAlertVisible] = useState(false); // State for register alert visibility
  const [operatorIdToArchive, setOperatorIdToArchive] = useState<number | null>(null);
  useEffect(() => {
    // Fetch operators and drivers from the database
    const fetchData = async () => {
      try {
        const [operatorResponse, driverResponse] = await Promise.all([
          fetch('/api/operators'),
          fetch('/api/drivers')
        ]);
  
        const operators = await operatorResponse.json();
        const drivers = await driverResponse.json();
  
        setOperatorList(operators);
        setDriverList(drivers);
        setCombinedList([...operators, ...drivers]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = isDriver ? "/api/drivers" : "/api/operators";
    const data = isDriver
      ? formData
      : {
          firstname: formData.firstname,
          middlename: formData.middlename,
          lastname: formData.lastname,
          contact: formData.contact,
          region: formData.region,
          city: formData.city,
          brgy: formData.brgy,
          street: formData.street,
          type: formData.type,
          emergency_name: formData.emergency_name,
          emergency_address: formData.emergency_address,
          emergency_contact: formData.emergency_contact,
        };

    try {
      await axios.post(url, data);
      alert(`${isDriver ? "Driver" : "Operator"} registered successfully`);
      setFormData({
        firstname: "",
        middlename: "",
        lastname: "",
        contact: "",
        region: "",
        city: "",
        brgy: "",
        street: "",
        type: "",
        emergency_name: "",
        emergency_address: "",
        emergency_contact: "",
        license_no: "",
        dl_codes: "",
        conditions: "",
        expiration_date: "",
      });
      const response = await axios.get("/api/operators");
      setOperatorList(response.data);
      setIsRegisterModalOpen(false); // Close the modal after successful submission
    } catch (error) {
      console.error("Failed to register:", error);
      alert("Failed to register");
    }
  };

  const handleRegisterModalClose = () => {
    setIsRegisterModalOpen(false);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setIsEditMode(false);
    setSelectedOperator(null);
  };

  const handleView = (operator: Operator) => {
    setSelectedOperator(operator);
    setIsViewModalOpen(true);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleArchive = (operator: Operator) => {
    setOperatorIdToArchive(operator.id);
    setIsConfirmArchiveOpen(true);
  };

  const confirmArchiveUser = async () => {
    if (operatorIdToArchive === null) return;

    try {
      // Perform the archive request
      const response = await axios.delete(`/api/operators`, {
        data: { id: operatorIdToArchive } // Include data if needed by your server
      });

      // Check the response status
      if (response.status === 200) {
        showAlert("User archived successfully"); // Show the alert
        setOperatorList((prev) =>
          prev.filter((op) => op.id !== operatorIdToArchive)
        );
        setIsConfirmArchiveOpen(false); // Close the confirmation dialog
      } else {
        console.error('Unexpected response status:', response.status);
        alert('Failed to archive operator');
      }
    } catch (error: any) {
      // Log error details
      console.error('Error during archive:', error.response?.data || error.message);
      alert('Failed to archive operator');
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertVisible(true);
    setTimeout(() => setIsAlertVisible(false), 3000);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <button onClick={() => setIsRegisterModalOpen(true)}
        className="bg-blue-500 text-white font-light text-sm px-2 
        py-2 rounded-md ml-auto flex items-center  sm:mb-6 
        hover:bg-blue-600 transition duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" className="mr-1">
          <path d="M12 8V16M16 12L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Add Operator
      </button>

      <button onClick={() => setIsDriver(!isDriver)} className="bg-gray-500 text-white font-light text-sm px-2 py-2 rounded-md ml-auto flex items-center sm:mb-6 hover:bg-gray-600 transition duration-300">
        Switch to {isDriver ? "Operator" : "Driver"} Registration
      </button>

      {/* Register Modal */}
      <Modal isOpen={isRegisterModalOpen} onClose={handleRegisterModalClose} title={`Register ${isDriver ? "Driver" : "Operator"}`}>
        <form onSubmit={handleFormSubmit} className="space-y-8 p-2 sm:p-2">
        <button onClick={() => setIsDriver(!isDriver)} className="bg-gray-500 text-white font-light text-sm px-2 py-2 rounded-md ml-auto flex items-center sm:mb-6 hover:bg-gray-600 transition duration-300">
        Switch to {isDriver ? "Operator" : "Driver"} Registration
      </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2" style={{ marginBottom: '-1.2rem' }}>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">First Name</label>
              <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="first name" />
            </div>

            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Middle Name</label>
              <input type="text" name="middlename" value={formData.middlename} onChange={handleInputChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="middle name" required />
            </div>
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Last Name</label>
              <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="last name" />
            </div>

            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Contact</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="contact no." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="Region" />
            </div>
            <div className="">
              <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900 uppercase">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="City" />
            </div>
            <div className="">
              <label htmlFor="brgy" className="block mb-2 text-sm font-medium text-gray-900 uppercase">Barangay</label>
              <input type="text" name="brgy" value={formData.brgy} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="Barangay" />
            </div>
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Street</label>
              <input type="text" name="street" value={formData.street} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="street name" />
            </div>
          </div>

          {/* EMERGENCY CONTACT  */}
          <div className="flex justify-between items-center pb-4 mb-4 rounded-t  border-b sm:mb-5 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900">License Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Emergency Contact Name</label>
              <input type="text" name="emergency_name" value={formData.emergency_name} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-56 p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="emergency name" />
            </div>
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Emergency Contact Address</label>
              <input type="text" name="emergency_address" value={formData.emergency_address} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-56 p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="emergency address" />
            </div>
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Emergency Contact Number</label>
              <input type="tel" name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange} required
                className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-64 p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="emergency contact number" />
            </div>
          </div>

          {isDriver && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="">
                  <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">License No</label>
                  <input type="text" name="license_no" value={formData.license_no} onChange={handleInputChange} required
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="license no." />
                </div>
                <div className="">
                  <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Type</label>
                  <input type="text" name="type" value={formData.type} onChange={handleInputChange} required
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="type" />
                </div>
                <div className="">
                  <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">DL Codes</label>
                  <input type="text" name="dl_codes" value={formData.dl_codes} onChange={handleInputChange} required
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="dl codes" />
                </div>
                <div className="">
                  <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Conditions</label>
                  <input type="text" name="conditions" value={formData.conditions} onChange={handleInputChange} required
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="conditions" />
                </div>
                <div className="">
                  <label className="block mb-2 text-sm font-medium text-gray-900 uppercase">Expiration Date</label>
                  <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleInputChange} required
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" placeholder="expiration date" />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4">
            <button type="submit" className="text-white inline-flex items-center bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:ring-green-500 font-medium rounded-lg text-sm px-5 py-2.5">
              Register {isDriver ? "Driver" : "Operator"}
            </button>
            <button type="button" onClick={handleRegisterModalClose} className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Rest of your component code for displaying operators, pagination, etc. */}
    {/* Table List */}
<div className="w-full mt-6">
<table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">First Name</th>
          <th className="py-2 px-4 border-b">Middle Name</th>
          <th className="py-2 px-4 border-b">Last Name</th>
          <th className="py-2 px-4 border-b">Contact</th>
          <th className="py-2 px-4 border-b">Role</th>
          <th className="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {combinedList.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((person) => (
          <tr key={person.id}>
            <td className="py-2 px-4 border-b">{person.firstname}</td>
            <td className="py-2 px-4 border-b">{person.middlename}</td>
            <td className="py-2 px-4 border-b">{person.lastname}</td>
            <td className="py-2 px-4 border-b">{person.contact}</td>
            <td className="py-2 px-4 border-b">{person.license_no ? 'Driver' : 'Operator'}</td>
            <td className="py-2 px-4 border-b">
              <button onClick={() => handleView(person)} className="text-blue-500 hover:underline">View</button>
              <button onClick={() => handleArchive(person)} className="text-red-500 hover:underline ml-2">Archive</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
</div>

{/* Pagination Controls */}
<div className="mt-4 flex justify-center">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l-md"
  >
    Previous
  </button>
  <span className="px-4 py-2 bg-gray-200 text-gray-700">
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r-md"
  >
    Next
  </button>
</div>
    </div>



  );
};

export default OperatorForm;