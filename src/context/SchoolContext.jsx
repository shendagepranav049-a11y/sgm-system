import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { firestoreService } from "../services/firestoreService";
import { isFirebaseConfigured } from "../firebase/config";
import { paiseToRupees } from "../utils/currency";

const SchoolContext = createContext();

export const SchoolProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [studentFeeAccounts, setStudentFeeAccounts] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [feeReceipts, setFeeReceipts] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [homework, setHomework] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [firebaseActive, setFirebaseActive] = useState(isFirebaseConfigured());
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        stdList,
        sfaList,
        structList,
        payList,
        recList,
        ayList,
        clsList,
        divList,
        subList,
        tchList,
        hwList,
        attList,
        exList,
        resList,
        ttList,
        notList,
        sett
      ] = await Promise.all([
        firestoreService.getStudents(),
        firestoreService.getStudentFeeAccounts(),
        firestoreService.getFeeStructures(),
        firestoreService.getFeePayments(),
        firestoreService.getFeeReceipts(),
        firestoreService.getAcademicYears(),
        firestoreService.getClasses(),
        firestoreService.getDivisions(),
        firestoreService.getSubjects(),
        firestoreService.getTeachers(),
        firestoreService.getHomework(),
        firestoreService.getAttendance ? firestoreService.getAttendance() : [],
        firestoreService.getExams ? firestoreService.getExams() : [],
        firestoreService.getResults ? firestoreService.getResults() : [],
        firestoreService.getTimetable ? firestoreService.getTimetable() : [],
        firestoreService.getNotices ? firestoreService.getNotices() : [],
        firestoreService.getSettings()
      ]);

      setStudents(stdList || []);
      setStudentFeeAccounts(sfaList || []);
      setFeeStructures(structList || []);
      setFeePayments(payList || []);
      setFeeReceipts(recList || []);
      setAcademicYears(ayList || []);
      setClasses(clsList || []);
      setDivisions(divList || []);
      setSubjects(subList || []);
      setTeachers(tchList || []);
      setHomework(hwList || []);
      setAttendance(attList || []);
      setExams(exList || []);
      setResults(resList || []);
      setTimetable(ttList || []);
      setNotices(notList || []);
      setSettings(sett || {});
      setFirebaseActive(firestoreService.isLive());
    } catch (err) {
      console.error("Error loading school data:", err);
      showToast("Error loading school data. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // STUDENT ACTIONS
  const addStudent = async (studentData) => {
    const created = await firestoreService.addStudent(studentData);
    setStudents(prev => [created, ...prev]);
    // Refresh fee accounts
    const sfaList = await firestoreService.getStudentFeeAccounts();
    setStudentFeeAccounts(sfaList);
    showToast(`Student ${created.name} registered with GR #${created.grNumber}!`, "success");
    return created;
  };

  const updateStudent = async (id, studentData) => {
    await firestoreService.updateStudent(id, studentData);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
    showToast("Student profile updated.", "success");
  };

  const deleteStudent = async (id) => {
    await firestoreService.deleteStudent(id);
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast("Student removed from active directory.", "info");
  };

  const promoteStudents = async (studentIds, toClassName, toAcademicYear) => {
    const updated = await firestoreService.promoteStudents(studentIds, toClassName, toAcademicYear);
    setStudents(updated);
    showToast(`Successfully promoted ${studentIds.length} students to ${toClassName}!`, "success");
  };

  // FEE ACTIONS
  const recordFeePayment = async (payload) => {
    const res = await firestoreService.recordFeePayment(payload);
    setFeePayments(prev => [res.payment, ...prev]);
    setFeeReceipts(prev => [res.receipt, ...prev]);
    setStudentFeeAccounts(prev => prev.map(a => a.studentId === payload.studentId ? res.account : a));
    showToast(`Payment of ₹${paiseToRupees(payload.amountPaise).toLocaleString()} recorded! Receipt #${res.payment.receiptNo}`, "success");
    return res;
  };

  const reversePayment = async (paymentId, reason, authorizedBy) => {
    const reversed = await firestoreService.reversePayment(paymentId, reason, authorizedBy);
    setFeePayments(prev => prev.map(p => p.id === paymentId ? reversed : p));
    const sfaList = await firestoreService.getStudentFeeAccounts();
    setStudentFeeAccounts(sfaList);
    showToast(`Payment #${reversed.receiptNo} has been officially reversed.`, "info");
    return reversed;
  };

  const addFeeStructure = async (structData) => {
    const created = await firestoreService.addFeeStructure(structData);
    setFeeStructures(prev => [created, ...prev]);
    showToast(`Fee structure for ${created.className} configured.`, "success");
    return created;
  };

  const updateFeeStructure = async (id, structData) => {
    const updated = await firestoreService.updateFeeStructure(id, structData);
    setFeeStructures(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
    showToast("Fee structure updated successfully.", "success");
    return updated;
  };

  // HOMEWORK
  const addHomework = async (hwData) => {
    const created = await firestoreService.addHomework(hwData);
    setHomework(prev => [created, ...prev]);
    showToast("Homework assigned.", "success");
    return created;
  };

  // SETTINGS
  const updateSettings = async (settingsData) => {
    const updated = await firestoreService.updateSettings(settingsData);
    setSettings(updated);
    showToast("School settings updated.", "success");
    return updated;
  };

  // SEED FIRESTORE
  const seedFirestore = async () => {
    const res = await firestoreService.seedFirestore();
    if (res.success) {
      showToast(res.message, "success");
      await loadAllData();
    } else {
      showToast(res.message, "error");
    }
    return res;
  };

  // COMPUTED AGGREGATES IN PAISE
  const totalExpectedPaise = studentFeeAccounts.reduce((acc, a) => acc + (Number(a.totalPayablePaise) || 0), 0);
  const totalCollectedPaise = studentFeeAccounts.reduce((acc, a) => acc + (Number(a.totalPaidPaise) || 0), 0);
  const totalRemainingPaise = studentFeeAccounts.reduce((acc, a) => acc + (Number(a.remainingBalancePaise) || 0), 0);

  const fullyPaidCount = studentFeeAccounts.filter(a => a.paymentStatus === "Paid").length;
  const partiallyPaidCount = studentFeeAccounts.filter(a => a.paymentStatus === "Partially Paid").length;
  const unpaidCount = studentFeeAccounts.filter(a => a.paymentStatus === "Unpaid").length;
  const overdueCount = studentFeeAccounts.filter(a => a.paymentStatus === "Overdue").length;

  return (
    <SchoolContext.Provider
      value={{
        students,
        studentFeeAccounts,
        feeStructures,
        feePayments,
        feeReceipts,
        academicYears,
        classes,
        divisions,
        subjects,
        teachers,
        homework,
        attendance,
        exams,
        results,
        timetable,
        notices,
        settings,
        loading,
        firebaseActive,
        toast,
        // Monetary aggregates in paise
        totalExpectedPaise,
        totalCollectedPaise,
        totalRemainingPaise,
        fullyPaidCount,
        partiallyPaidCount,
        unpaidCount,
        overdueCount,
        // Handlers
        loadAllData,
        addStudent,
        updateStudent,
        deleteStudent,
        promoteStudents,
        recordFeePayment,
        reversePayment,
        addFeeStructure,
        updateFeeStructure,
        addHomework,
        updateSettings,
        seedFirestore,
        showToast
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => useContext(SchoolContext);
