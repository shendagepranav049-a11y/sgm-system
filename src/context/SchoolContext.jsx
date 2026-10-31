import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { firestoreService } from "../services/firestoreService";
import { isFirebaseConfigured } from "../firebase/config";
import { paiseToRupees, formatRupees } from "../utils/currency";

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
      showToast("शाळा डेटा लोड करताना त्रुटी आली. कृपया रीफ्रेश करा.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 1. STUDENTS
  const addStudent = async (studentData) => {
    const created = await firestoreService.addStudent(studentData);
    setStudents((prev) => [created, ...prev]);
    const sfaList = await firestoreService.getStudentFeeAccounts();
    setStudentFeeAccounts(sfaList);
    showToast(`विद्यार्थी ${created.name} यशस्वीरीत्या जोडला गेला!`, "success");
    return created;
  };

  const updateStudent = async (id, studentData) => {
    await firestoreService.updateStudent(id, studentData);
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...studentData } : s)));
    showToast("विद्यार्थी प्रोफाईल अपडेट झाली.", "success");
  };

  const deleteStudent = async (id) => {
    await firestoreService.deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast("विद्यार्थी यशस्वीरीत्या हटवला गेला.", "info");
  };

  const promoteStudents = async (studentIds, toClassName, toAcademicYear) => {
    const updated = await firestoreService.promoteStudents(studentIds, toClassName, toAcademicYear);
    setStudents(updated);
    showToast(`${studentIds.length} विद्यार्थी ${toClassName} मध्ये पदोन्नत केले गेले!`, "success");
  };

  // 2. TEACHERS
  const addTeacher = async (teacherData) => {
    const created = await firestoreService.addTeacher(teacherData);
    setTeachers((prev) => [created, ...prev]);
    showToast(`शिक्षक ${created.name} यशस्वीरीत्या जोडले गेले!`, "success");
    return created;
  };

  const updateTeacher = async (id, data) => {
    await firestoreService.updateTeacher(id, data);
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    showToast("शिक्षक प्रोफाईल अपडेट झाली.", "success");
  };

  const deleteTeacher = async (id) => {
    await firestoreService.deleteTeacher(id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    showToast("शिक्षक हटवले गेले.", "info");
  };

  // 3. CLASSES & ACADEMIC
  const addClass = async (classData) => {
    const created = await firestoreService.addClass(classData);
    setClasses((prev) => [...prev, created]);
    showToast(`इयत्ता ${created.name} यशस्वीरीत्या जोडली!`, "success");
    return created;
  };

  const updateClass = async (id, classData) => {
    await firestoreService.updateClass(id, classData);
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...classData } : c)));
    showToast("वर्ग माहिती अपडेट झाली.", "success");
  };

  const deleteClass = async (id) => {
    await firestoreService.deleteClass(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    showToast("वर्ग हटवला गेला.", "info");
  };

  const addDivision = async (divData) => {
    const created = await firestoreService.addDivision(divData);
    setDivisions((prev) => [...prev, created]);
    showToast(`तुकडी ${created.division} जोडली गेली.`, "success");
    return created;
  };

  const deleteDivision = async (id) => {
    await firestoreService.deleteDivision(id);
    setDivisions((prev) => prev.filter((d) => d.id !== id));
    showToast("तुकडी हटवली गेली.", "info");
  };

  const addSubject = async (subData) => {
    const created = await firestoreService.addSubject(subData);
    setSubjects((prev) => [...prev, created]);
    showToast(`विषय ${created.name} जोडला गेला.`, "success");
    return created;
  };

  const deleteSubject = async (id) => {
    await firestoreService.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    showToast("विषय हटवला गेला.", "info");
  };

  // 4. FEES
  const recordFeePayment = async (payload) => {
    const res = await firestoreService.recordFeePayment(payload);
    setFeePayments((prev) => [res.payment, ...prev]);
    setFeeReceipts((prev) => [res.receipt, ...prev]);
    setStudentFeeAccounts((prev) => prev.map((a) => (a.studentId === payload.studentId ? res.account : a)));
    showToast(`₹${paiseToRupees(payload.amountPaise).toLocaleString()} फी जमा झाली! पावती #${res.payment.receiptNo}`, "success");
    return res;
  };

  const reversePayment = async (paymentId, reason, authorizedBy) => {
    const reversed = await firestoreService.reversePayment(paymentId, reason, authorizedBy);
    setFeePayments((prev) => prev.map((p) => (p.id === paymentId ? reversed : p)));
    const sfaList = await firestoreService.getStudentFeeAccounts();
    setStudentFeeAccounts(sfaList);
    showToast(`पावती #${reversed.receiptNo} रद्द केली गेली.`, "info");
    return reversed;
  };

  const addFeeStructure = async (structData) => {
    const created = await firestoreService.addFeeStructure(structData);
    setFeeStructures((prev) => [created, ...prev]);
    showToast(`फी स्ट्रक्चर तयार केले गेले.`, "success");
    return created;
  };

  const updateFeeStructure = async (id, structData) => {
    const updated = await firestoreService.updateFeeStructure(id, structData);
    setFeeStructures((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
    showToast("फी स्ट्रक्चर अपडेट झाले.", "success");
    return updated;
  };

  const deleteFeeStructure = async (id) => {
    await firestoreService.deleteFeeStructure(id);
    setFeeStructures((prev) => prev.filter((f) => f.id !== id));
    showToast("फी स्ट्रक्चर हटवले गेले.", "info");
  };

  // 5. HOMEWORK
  const addHomework = async (hwData) => {
    const created = await firestoreService.addHomework(hwData);
    setHomework((prev) => [created, ...prev]);
    showToast("गृहपाठ (Homework) नियुक्त केला गेला.", "success");
    return created;
  };

  const deleteHomework = async (id) => {
    await firestoreService.deleteHomework(id);
    setHomework((prev) => prev.filter((h) => h.id !== id));
    showToast("गृहपाठ हटवला गेला.", "info");
  };

  // 6. NOTICES
  const addNotice = async (noticeData) => {
    const created = await firestoreService.addNotice(noticeData);
    setNotices((prev) => [created, ...prev]);
    showToast(`सूचना '${created.title}' प्रसिद्ध झाली!`, "success");
    return created;
  };

  const deleteNotice = async (id) => {
    await firestoreService.deleteNotice(id);
    setNotices((prev) => prev.filter((n) => n.id !== id));
    showToast("सूचना हटवली गेली.", "info");
  };

  // 7. ATTENDANCE
  const markAttendance = async (records) => {
    await firestoreService.markAttendanceBatch(records);
    const updated = await firestoreService.getAttendance();
    setAttendance(updated);
    showToast(`${records.length} विद्यार्थ्यांची उपस्थिती सेव्ह झाली!`, "success");
    return records;
  };

  // 8. EXAMS & RESULTS
  const addExam = async (examData) => {
    const created = await firestoreService.addExam(examData);
    setExams((prev) => [created, ...prev]);
    showToast(`परीक्षा '${created.title}' शेड्युल झाली.`, "success");
    return created;
  };

  const deleteExam = async (id) => {
    await firestoreService.deleteExam(id);
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast("परीक्षा हटवली गेली.", "info");
  };

  const addResult = async (resultData) => {
    const created = await firestoreService.addResult(resultData);
    setResults((prev) => [created, ...prev]);
    showToast("विद्यार्थ्याचे गुण (Marks) सेव्ह झाले.", "success");
    return created;
  };

  const deleteResult = async (id) => {
    await firestoreService.deleteResult(id);
    setResults((prev) => prev.filter((r) => r.id !== id));
    showToast("गुण रेकॉर्ड हटवला गेला.", "info");
  };

  // 9. TIMETABLE
  const addTimetableSlot = async (slotData) => {
    const created = await firestoreService.addTimetableSlot(slotData);
    setTimetable((prev) => [...prev, created]);
    showToast("वेळापत्रक स्लॉट जोडला गेला.", "success");
    return created;
  };

  const deleteTimetableSlot = async (id) => {
    await firestoreService.deleteTimetableSlot(id);
    setTimetable((prev) => prev.filter((t) => t.id !== id));
    showToast("वेळापत्रक स्लॉट हटवला.", "info");
  };

  // 10. SETTINGS & PURGE
  const updateSettings = async (settingsData) => {
    const updated = await firestoreService.updateSettings(settingsData);
    setSettings(updated);
    showToast("शाळा सेटिंग्ज अपडेट झाल्या.", "success");
    return updated;
  };

  const clearAllDummyData = async () => {
    const res = await firestoreService.clearAllDummyData();
    await loadAllData();
    showToast(res.message, "success");
    return res;
  };

  // COMPUTED AGGREGATES IN PAISE & RUPEES
  const totalExpectedPaise = studentFeeAccounts.reduce((acc, a) => acc + (Number(a.totalPayablePaise) || 0), 0);
  const totalCollectedPaise = studentFeeAccounts.reduce((acc, a) => acc + (Number(a.totalPaidPaise) || 0), 0);
  const totalRemainingPaise = studentFeeAccounts.reduce((acc, a) => acc + (Number(a.remainingBalancePaise) || 0), 0);

  const totalFeesCollected = paiseToRupees(totalCollectedPaise);
  const totalPendingFees = paiseToRupees(totalRemainingPaise);
  const totalExpectedFees = paiseToRupees(totalExpectedPaise);

  const fullyPaidCount = studentFeeAccounts.filter((a) => a.paymentStatus === "Paid").length;
  const partiallyPaidCount = studentFeeAccounts.filter((a) => a.paymentStatus === "Partially Paid").length;
  const unpaidCount = studentFeeAccounts.filter((a) => a.paymentStatus === "Unpaid").length;
  const overdueCount = studentFeeAccounts.filter((a) => a.paymentStatus === "Overdue").length;

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
        // Monetary aggregates in paise & rupees
        totalExpectedPaise,
        totalCollectedPaise,
        totalRemainingPaise,
        totalFeesCollected,
        totalPendingFees,
        totalExpectedFees,
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
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addClass,
        updateClass,
        deleteClass,
        addDivision,
        deleteDivision,
        addSubject,
        deleteSubject,
        recordFeePayment,
        reversePayment,
        addFeeStructure,
        updateFeeStructure,
        deleteFeeStructure,
        addHomework,
        deleteHomework,
        addNotice,
        deleteNotice,
        markAttendance,
        addExam,
        deleteExam,
        addResult,
        deleteResult,
        addTimetableSlot,
        deleteTimetableSlot,
        updateSettings,
        clearAllDummyData,
        showToast
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => useContext(SchoolContext);
