import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Default staff list — stored in localStorage so admin can manage it
const DEFAULT_STAFF = [
  { id: 'STAFF001', name: 'Ishita Singh', pin: '080803' },
];

const loadStaff = () => {
  try {
    const saved = localStorage.getItem('qf_staff');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF;
  } catch {
    return DEFAULT_STAFF;
  }
};

const saveStaff = (list) => {
  localStorage.setItem('qf_staff', JSON.stringify(list));
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem('qf_role') || null);
  const [currentStaff, setCurrentStaff] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qf_current_staff')) || null; }
    catch { return null; }
  });
  const [staffList, setStaffList] = useState(loadStaff);

  const loginAsStaff = (staffId, pin) => {
    const member = staffList.find(
      (s) => s.id.toLowerCase() === staffId.toLowerCase() && s.pin === pin
    );
    if (member) {
      localStorage.setItem('qf_role', 'staff');
      localStorage.setItem('qf_current_staff', JSON.stringify(member));
      setRole('staff');
      setCurrentStaff(member);
      return true;
    }
    return false;
  };

  const loginAsCustomer = () => {
    localStorage.setItem('qf_role', 'customer');
    setRole('customer');
  };

  const logout = () => {
    localStorage.removeItem('qf_role');
    localStorage.removeItem('qf_current_staff');
    setRole(null);
    setCurrentStaff(null);
  };

  // Admin: add new staff member
  const addStaffMember = (member) => {
    const updated = [...staffList, member];
    setStaffList(updated);
    saveStaff(updated);
  };

  // Admin: remove staff member
  const removeStaffMember = (id) => {
    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);
    saveStaff(updated);
  };

  // Admin: update staff PIN
  const updateStaffPin = (id, newPin) => {
    const updated = staffList.map((s) => s.id === id ? { ...s, pin: newPin } : s);
    setStaffList(updated);
    saveStaff(updated);
  };

  return (
    <AuthContext.Provider value={{
      role,
      currentStaff,
      staffList,
      loginAsStaff,
      loginAsCustomer,
      logout,
      addStaffMember,
      removeStaffMember,
      updateStaffPin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};