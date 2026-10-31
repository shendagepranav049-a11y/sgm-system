import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import { rupeesToPaise, paiseToRupees } from "../utils/currency";

// ==========================================
// 1. DEFAULT CLEAN CONFIGURATION (NO DUMMY DATA)
// ==========================================

export const INITIAL_SCHOOL_SETTINGS = {
  schoolName: "SGM International Academy",
  tagline: "Excellence in Academic Rigor, Character & Innovation",
  email: "admin@sgmacademy.edu",
  phone: "+91 22 2894 1100",
  address: "SGM Campus, Karad, Maharashtra 415124",
  academicYear: "2025-2026",
  currency: "₹",
  logoUrl: "",
  principalName: "Dr. Eleanor Vance, Ph.D.",
  taxId: "GSTIN-27AAACS1234M1Z5",
  receiptPrefix: "SGM-REC-2026-"
};

export const INITIAL_ACADEMIC_YEARS = [
  { id: "ay-2024-25", name: "2024-2025", status: "Completed", isCurrent: false },
  { id: "ay-2025-26", name: "2025-2026", status: "Active", isCurrent: true },
  { id: "ay-2026-27", name: "2026-2027", status: "Upcoming", isCurrent: false }
];

export const INITIAL_CLASSES = [
  { id: "cls-8", name: "Grade 8", section: "A", classTeacher: "", room: "Room 101", capacity: 40 },
  { id: "cls-9", name: "Grade 9", section: "A", classTeacher: "", room: "Room 201", capacity: 40 },
  { id: "cls-10", name: "Grade 10", section: "A", classTeacher: "", room: "Room 301", capacity: 40 },
  { id: "cls-11", name: "Grade 11 - Science", section: "A", classTeacher: "", room: "Lab A", capacity: 35 },
  { id: "cls-12", name: "Grade 12 - Science", section: "A", classTeacher: "", room: "Lab B", capacity: 35 }
];

export const INITIAL_DIVISIONS = [
  { id: "div-8a", classId: "cls-8", className: "Grade 8", division: "A", classTeacher: "", room: "Room 101" },
  { id: "div-9a", classId: "cls-9", className: "Grade 9", division: "A", classTeacher: "", room: "Room 201" },
  { id: "div-10a", classId: "cls-10", className: "Grade 10", division: "A", classTeacher: "", room: "Room 301" },
  { id: "div-11a", classId: "cls-11", className: "Grade 11 - Science", division: "A", classTeacher: "", room: "Lab A" },
  { id: "div-12a", classId: "cls-12", className: "Grade 12 - Science", division: "A", classTeacher: "", room: "Lab B" }
];

export const INITIAL_SUBJECTS = [
  { id: "sub-1", name: "Mathematics", code: "MTH-101", department: "Science & Math" },
  { id: "sub-2", name: "Physics", code: "PHY-102", department: "Science & Math" },
  { id: "sub-3", name: "Chemistry", code: "CHM-103", department: "Science & Math" },
  { id: "sub-4", name: "Biology", code: "BIO-104", department: "Science & Math" },
  { id: "sub-5", name: "English Literature", code: "ENG-105", department: "Humanities" },
  { id: "sub-6", name: "Computer Science", code: "CSE-106", department: "Technology" }
];

// All transactional / member arrays are clean & empty by default
export const INITIAL_TEACHERS = [];
export const INITIAL_STUDENTS = [];
export const INITIAL_STUDENT_FEE_ACCOUNTS = [];
export const INITIAL_FEE_STRUCTURES = [];
export const INITIAL_FEE_PAYMENTS = [];
export const INITIAL_FEE_RECEIPTS = [];
export const INITIAL_HOMEWORK = [];
export const INITIAL_ATTENDANCE = [];
export const INITIAL_EXAMS = [];
export const INITIAL_RESULTS = [];
export const INITIAL_TIMETABLE = [];
export const INITIAL_NOTICES = [];

// Helper to get local data
const getLocal = (key, defaultData) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultData;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : defaultData;
  } catch (err) {
    return defaultData;
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Local storage write error for", key, err);
  }
};

// Known dummy ID prefixes to filter out if any leftover exists
const DUMMY_ID_PATTERNS = [
  "Alexander Hayes",
  "Sophia Martinez",
  "Ethan Christopher",
  "Aria Montgomery",
  "Lucas Bennett",
  "Chloe Isabella",
  "Daniel Kumar Patel",
  "Zoe Kensington",
  "Dr. Alistair Finch",
  "Emily Watson",
  "Michael Chang",
  "Sarah Jenkins",
  "Priya Sharma",
  "Robert Davis"
];

const isDummyRecord = (item) => {
  if (!item) return false;
  const name = item.name || item.studentName || item.title || "";
  return DUMMY_ID_PATTERNS.some((pat) => name.includes(pat));
};

// ==========================================
// 2. FIRESTORE SERVICE LAYER WITH LIVE SYNC
// ==========================================

export const firestoreService = {
  isLive() {
    return isFirebaseConfigured() && Boolean(db);
  },

  // 1. STUDENTS
  async getStudents() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "students"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const clean = list.filter((s) => !isDummyRecord(s));
        setLocal("sgm_clean_students", clean);
        return clean;
      } catch (err) {
        console.warn("Firestore getStudents fallback:", err.message);
      }
    }
    return getLocal("sgm_clean_students", []).filter((s) => !isDummyRecord(s));
  },

  async addStudent(studentData) {
    const newStudent = {
      ...studentData,
      id: studentData.id || "std-" + Date.now(),
      grNumber: studentData.grNumber || studentData.rollNo || `GR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      admissionNumber: studentData.admissionNumber || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      status: studentData.status || "Active",
      createdAt: new Date().toISOString()
    };

    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "students"), newStudent);
        newStudent.id = docRef.id;
      } catch (err) {
        console.warn("Firestore addStudent error:", err.message);
      }
    }

    const current = getLocal("sgm_clean_students", []).filter((s) => !isDummyRecord(s));
    const updated = [newStudent, ...current];
    setLocal("sgm_clean_students", updated);

    // Auto-create student fee account
    const initialFeePaise = rupeesToPaise(Number(studentData.totalFee || studentData.totalFeeRupees || 25000));
    await this.createStudentFeeAccount({
      studentId: newStudent.id,
      studentName: newStudent.name,
      grNumber: newStudent.grNumber,
      className: newStudent.className,
      division: newStudent.division || newStudent.section || "A",
      academicYear: newStudent.academicYear || "2025-2026",
      totalApplicableFeePaise: initialFeePaise,
      discountPaise: 0,
      totalPayablePaise: initialFeePaise,
      totalPaidPaise: 0,
      remainingBalancePaise: initialFeePaise,
      paymentStatus: "Unpaid",
      dueDate: "2025-11-30"
    });

    return newStudent;
  },

  async updateStudent(id, studentData) {
    if (this.isLive()) {
      try {
        await updateDoc(doc(db, "students", id), studentData);
      } catch (err) {
        console.warn("Firestore updateStudent error:", err.message);
      }
    }
    const current = getLocal("sgm_clean_students", []);
    const updated = current.map((s) => (s.id === id ? { ...s, ...studentData } : s));
    setLocal("sgm_clean_students", updated);
    return studentData;
  },

  async deleteStudent(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (err) {
        console.warn("Firestore deleteStudent error:", err.message);
      }
    }
    const current = getLocal("sgm_clean_students", []);
    const updated = current.filter((s) => s.id !== id);
    setLocal("sgm_clean_students", updated);
    return id;
  },

  async promoteStudents(studentIds, toClassName, toAcademicYear) {
    const current = getLocal("sgm_clean_students", []);
    const updated = current.map((s) => {
      if (studentIds.includes(s.id)) {
        return {
          ...s,
          className: toClassName,
          academicYear: toAcademicYear,
          promotedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setLocal("sgm_clean_students", updated);

    if (this.isLive()) {
      for (const id of studentIds) {
        try {
          await updateDoc(doc(db, "students", id), {
            className: toClassName,
            academicYear: toAcademicYear,
            promotedAt: serverTimestamp()
          });
        } catch (err) {
          console.warn("Promotion firestore error:", err);
        }
      }
    }
    return updated;
  },

  // 2. STUDENT FEE ACCOUNTS
  async getStudentFeeAccounts() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "studentFeeAccounts"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const clean = list.filter((a) => !isDummyRecord(a));
        setLocal("sgm_clean_fee_accounts", clean);
        return clean;
      } catch (err) {
        console.warn("Firestore getStudentFeeAccounts fallback:", err.message);
      }
    }
    return getLocal("sgm_clean_fee_accounts", []).filter((a) => !isDummyRecord(a));
  },

  async createStudentFeeAccount(accountData) {
    const item = {
      ...accountData,
      id: accountData.id || "sfa-" + Date.now(),
      createdAt: new Date().toISOString()
    };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "studentFeeAccounts"), item);
        item.id = docRef.id;
      } catch (err) {
        console.warn("Firestore createStudentFeeAccount error:", err.message);
      }
    }
    const current = getLocal("sgm_clean_fee_accounts", []);
    setLocal("sgm_clean_fee_accounts", [item, ...current]);
    return item;
  },

  // 3. FEE STRUCTURES
  async getFeeStructures() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "feeStructures"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLocal("sgm_clean_fee_structures", list);
        return list;
      } catch (err) {
        console.warn("Firestore getFeeStructures fallback:", err.message);
      }
    }
    return getLocal("sgm_clean_fee_structures", []);
  },

  async addFeeStructure(structData) {
    const totalPaise =
      Number(structData.tuitionFeePaise || 0) +
      Number(structData.admissionFeePaise || 0) +
      Number(structData.examFeePaise || 0) +
      Number(structData.computerFeePaise || 0) +
      Number(structData.libraryFeePaise || 0) +
      Number(structData.transportFeePaise || 0) +
      Number(structData.otherFeePaise || 0);

    const item = {
      ...structData,
      totalAmountPaise: totalPaise,
      id: structData.id || "fee-str-" + Date.now(),
      createdAt: new Date().toISOString()
    };

    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "feeStructures"), item);
        item.id = docRef.id;
      } catch (err) {
        console.warn("Firestore addFeeStructure error:", err.message);
      }
    }
    const current = getLocal("sgm_clean_fee_structures", []);
    setLocal("sgm_clean_fee_structures", [item, ...current]);
    return item;
  },

  async updateFeeStructure(id, structData) {
    const totalPaise =
      Number(structData.tuitionFeePaise || 0) +
      Number(structData.admissionFeePaise || 0) +
      Number(structData.examFeePaise || 0) +
      Number(structData.computerFeePaise || 0) +
      Number(structData.libraryFeePaise || 0) +
      Number(structData.transportFeePaise || 0) +
      Number(structData.otherFeePaise || 0);

    const updated = { ...structData, totalAmountPaise: totalPaise };

    if (this.isLive()) {
      try {
        await updateDoc(doc(db, "feeStructures", id), updated);
      } catch (err) {
        console.warn("Firestore updateFeeStructure error:", err.message);
      }
    }
    const current = getLocal("sgm_clean_fee_structures", []);
    setLocal(
      "sgm_clean_fee_structures",
      current.map((f) => (f.id === id ? { ...f, ...updated } : f))
    );
    return updated;
  },

  async deleteFeeStructure(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "feeStructures", id));
      } catch (err) {
        console.warn("Firestore deleteFeeStructure error:", err.message);
      }
    }
    const current = getLocal("sgm_clean_fee_structures", []);
    setLocal("sgm_clean_fee_structures", current.filter((f) => f.id !== id));
    return id;
  },

  // 4. ATOMIC FEE COLLECTION & RECEIPT GENERATION
  async recordFeePayment(paymentPayload) {
    const {
      studentId,
      amountPaise,
      paymentMode,
      transactionReference,
      feeComponent,
      recordedBy,
      remarks,
      paymentDate,
      idempotencyKey
    } = paymentPayload;

    const accounts = await this.getStudentFeeAccounts();
    const account = accounts.find((a) => a.studentId === studentId);
    if (!account) {
      throw new Error("Student fee account not found for studentId: " + studentId);
    }

    if (Number(amountPaise) > Number(account.remainingBalancePaise)) {
      throw new Error(
        `Payment amount (₹${paiseToRupees(amountPaise)}) exceeds remaining balance (₹${paiseToRupees(
          account.remainingBalancePaise
        )}).`
      );
    }

    const year = new Date().getFullYear();
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const receiptNo = `SGM-REC-${year}-${uniqueNum}`;

    const newPayment = {
      id: "pay-doc-" + Date.now(),
      receiptNo,
      studentId: account.studentId,
      studentName: account.studentName,
      grNumber: account.grNumber,
      className: account.className,
      division: account.division || "A",
      academicYear: account.academicYear,
      amountPaise: Number(amountPaise),
      paymentMode,
      transactionReference: transactionReference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      feeComponent: feeComponent || "Tuition & Institutional Dues",
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      recordedBy: recordedBy || "Senior Accountant",
      status: "Completed",
      remarks: remarks || "",
      idempotencyKey: idempotencyKey || null,
      createdAt: new Date().toISOString()
    };

    const newPaidPaise = Number(account.totalPaidPaise || 0) + Number(amountPaise);
    const newRemainingPaise = Math.max(0, Number(account.totalPayablePaise || 0) - newPaidPaise);
    const newStatus = newRemainingPaise === 0 ? "Paid" : newPaidPaise > 0 ? "Partially Paid" : "Unpaid";

    const updatedAccount = {
      ...account,
      totalPaidPaise: newPaidPaise,
      remainingBalancePaise: newRemainingPaise,
      paymentStatus: newStatus
    };

    const receiptSnapshot = {
      id: `rec-doc-${receiptNo}`,
      receiptNo,
      paymentId: newPayment.id,
      studentId: account.studentId,
      studentName: account.studentName,
      grNumber: account.grNumber,
      className: account.className,
      division: account.division || "A",
      academicYear: account.academicYear,
      feeComponent: newPayment.feeComponent,
      totalPayablePaise: account.totalPayablePaise,
      previousAmountPaidPaise: account.totalPaidPaise,
      currentPaymentPaise: Number(amountPaise),
      totalPaidPaise: newPaidPaise,
      remainingBalancePaise: newRemainingPaise,
      paymentMode,
      transactionReference: newPayment.transactionReference,
      paymentDate: newPayment.paymentDate,
      authorizedBy: newPayment.recordedBy,
      remarks: newPayment.remarks,
      issuedAt: new Date().toISOString()
    };

    if (this.isLive()) {
      try {
        await addDoc(collection(db, "feePayments"), newPayment);
        await setDoc(doc(db, "feeReceipts", receiptSnapshot.id), receiptSnapshot);
        if (account.id) {
          await updateDoc(doc(db, "studentFeeAccounts", account.id), {
            totalPaidPaise: newPaidPaise,
            remainingBalancePaise: newRemainingPaise,
            paymentStatus: newStatus
          });
        }
      } catch (err) {
        console.warn("Firestore record payment error:", err.message);
      }
    }

    const existingPayments = getLocal("sgm_clean_payments", []).filter((p) => !isDummyRecord(p));
    setLocal("sgm_clean_payments", [newPayment, ...existingPayments]);

    const allReceipts = getLocal("sgm_clean_receipts", []).filter((r) => !isDummyRecord(r));
    setLocal("sgm_clean_receipts", [receiptSnapshot, ...allReceipts]);

    const updatedAccounts = accounts.map((a) => (a.studentId === studentId ? updatedAccount : a));
    setLocal("sgm_clean_fee_accounts", updatedAccounts);

    return { payment: newPayment, receipt: receiptSnapshot, account: updatedAccount };
  },

  async getFeePayments() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "feePayments"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const clean = list.filter((p) => !isDummyRecord(p));
        setLocal("sgm_clean_payments", clean);
        return clean;
      } catch (err) {
        console.warn("Firestore getFeePayments fallback:", err.message);
      }
    }
    return getLocal("sgm_clean_payments", []).filter((p) => !isDummyRecord(p));
  },

  async getFeeReceipts() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "feeReceipts"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const clean = list.filter((r) => !isDummyRecord(r));
        setLocal("sgm_clean_receipts", clean);
        return clean;
      } catch (err) {
        console.warn("Firestore getFeeReceipts fallback:", err.message);
      }
    }
    return getLocal("sgm_clean_receipts", []).filter((r) => !isDummyRecord(r));
  },

  async reversePayment(paymentId, reason, authorizedBy) {
    const payments = await this.getFeePayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("Payment record not found.");
    if (payment.status === "Reversed") throw new Error("Payment is already reversed.");

    payment.status = "Reversed";
    payment.reversalReason = reason;
    payment.reversedBy = authorizedBy;
    payment.reversedAt = new Date().toISOString();

    const accounts = await this.getStudentFeeAccounts();
    const account = accounts.find((a) => a.studentId === payment.studentId);
    if (account) {
      account.totalPaidPaise = Math.max(0, Number(account.totalPaidPaise || 0) - Number(payment.amountPaise));
      account.remainingBalancePaise = Math.max(0, Number(account.totalPayablePaise || 0) - account.totalPaidPaise);
      account.paymentStatus =
        account.remainingBalancePaise === 0 ? "Paid" : account.totalPaidPaise > 0 ? "Partially Paid" : "Unpaid";
      setLocal("sgm_clean_fee_accounts", accounts);
    }

    setLocal("sgm_clean_payments", payments);

    if (this.isLive()) {
      try {
        await updateDoc(doc(db, "feePayments", paymentId), {
          status: "Reversed",
          reversalReason: reason,
          reversedBy: authorizedBy,
          reversedAt: serverTimestamp()
        });
        if (account && account.id) {
          await updateDoc(doc(db, "studentFeeAccounts", account.id), {
            totalPaidPaise: account.totalPaidPaise,
            remainingBalancePaise: account.remainingBalancePaise,
            paymentStatus: account.paymentStatus
          });
        }
      } catch (err) {
        console.warn("Firestore reversePayment error:", err);
      }
    }

    return payment;
  },

  // 5. ACADEMIC MANAGEMENT
  async getAcademicYears() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "academicYears"));
        if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (err) {}
    }
    return getLocal("sgm_clean_academic_years", INITIAL_ACADEMIC_YEARS);
  },

  async addAcademicYear(yearData) {
    const item = { ...yearData, id: "ay-" + Date.now() };
    if (this.isLive()) {
      try {
        await addDoc(collection(db, "academicYears"), item);
      } catch (err) {}
    }
    const list = [item, ...getLocal("sgm_clean_academic_years", INITIAL_ACADEMIC_YEARS)];
    setLocal("sgm_clean_academic_years", list);
    return item;
  },

  async getClasses() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "classes"));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocal("sgm_clean_classes", list);
          return list;
        }
      } catch (err) {}
    }
    return getLocal("sgm_clean_classes", INITIAL_CLASSES);
  },

  async addClass(classData) {
    const item = { ...classData, id: "cls-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "classes"), item);
        item.id = docRef.id;
      } catch (err) {
        console.warn("Firestore addClass error:", err);
      }
    }
    const current = getLocal("sgm_clean_classes", INITIAL_CLASSES);
    const updated = [...current, item];
    setLocal("sgm_clean_classes", updated);
    return item;
  },

  async updateClass(id, classData) {
    if (this.isLive()) {
      try {
        await updateDoc(doc(db, "classes", id), classData);
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_classes", INITIAL_CLASSES);
    const updated = current.map((c) => (c.id === id ? { ...c, ...classData } : c));
    setLocal("sgm_clean_classes", updated);
    return classData;
  },

  async deleteClass(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "classes", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_classes", INITIAL_CLASSES);
    const updated = current.filter((c) => c.id !== id);
    setLocal("sgm_clean_classes", updated);
    return id;
  },

  async getDivisions() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "divisions"));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocal("sgm_clean_divisions", list);
          return list;
        }
      } catch (err) {}
    }
    return getLocal("sgm_clean_divisions", INITIAL_DIVISIONS);
  },

  async addDivision(divData) {
    const item = { ...divData, id: "div-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "divisions"), item);
        item.id = docRef.id;
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_divisions", INITIAL_DIVISIONS);
    const updated = [...current, item];
    setLocal("sgm_clean_divisions", updated);
    return item;
  },

  async deleteDivision(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "divisions", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_divisions", INITIAL_DIVISIONS);
    const updated = current.filter((d) => d.id !== id);
    setLocal("sgm_clean_divisions", updated);
    return id;
  },

  async getSubjects() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "subjects"));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocal("sgm_clean_subjects", list);
          return list;
        }
      } catch (err) {}
    }
    return getLocal("sgm_clean_subjects", INITIAL_SUBJECTS);
  },

  async addSubject(subData) {
    const item = { ...subData, id: "sub-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "subjects"), item);
        item.id = docRef.id;
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_subjects", INITIAL_SUBJECTS);
    const updated = [...current, item];
    setLocal("sgm_clean_subjects", updated);
    return item;
  },

  async deleteSubject(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "subjects", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_subjects", INITIAL_SUBJECTS);
    const updated = current.filter((s) => s.id !== id);
    setLocal("sgm_clean_subjects", updated);
    return id;
  },

  // 6. TEACHERS
  async getTeachers() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "teachers"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const clean = list.filter((t) => !isDummyRecord(t));
        setLocal("sgm_clean_teachers", clean);
        return clean;
      } catch (err) {}
    }
    return getLocal("sgm_clean_teachers", []).filter((t) => !isDummyRecord(t));
  },

  async addTeacher(teacherData) {
    const item = {
      ...teacherData,
      id: teacherData.id || "tch-" + Date.now(),
      teacherId: teacherData.teacherId || `TCH-${Math.floor(100 + Math.random() * 900)}`,
      status: teacherData.status || "Active",
      createdAt: new Date().toISOString()
    };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "teachers"), item);
        item.id = docRef.id;
      } catch (err) {
        console.warn("Firestore addTeacher error:", err);
      }
    }
    const current = getLocal("sgm_clean_teachers", []).filter((t) => !isDummyRecord(t));
    const updated = [item, ...current];
    setLocal("sgm_clean_teachers", updated);
    return item;
  },

  async updateTeacher(id, data) {
    if (this.isLive()) {
      try {
        await updateDoc(doc(db, "teachers", id), data);
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_teachers", []);
    const updated = current.map((t) => (t.id === id ? { ...t, ...data } : t));
    setLocal("sgm_clean_teachers", updated);
    return data;
  },

  async deleteTeacher(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "teachers", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_teachers", []);
    const updated = current.filter((t) => t.id !== id);
    setLocal("sgm_clean_teachers", updated);
    return id;
  },

  // 7. HOMEWORK
  async getHomework() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "homework"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLocal("sgm_clean_homework", list);
        return list;
      } catch (err) {}
    }
    return getLocal("sgm_clean_homework", []);
  },

  async addHomework(hwData) {
    const item = { ...hwData, id: "hw-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "homework"), item);
        item.id = docRef.id;
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_homework", []);
    const updated = [item, ...current];
    setLocal("sgm_clean_homework", updated);
    return item;
  },

  async deleteHomework(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "homework", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_homework", []);
    const updated = current.filter((h) => h.id !== id);
    setLocal("sgm_clean_homework", updated);
    return id;
  },

  // 8. NOTICES
  async getNotices() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "notices"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLocal("sgm_clean_notices", list);
        return list;
      } catch (err) {}
    }
    return getLocal("sgm_clean_notices", []);
  },

  async addNotice(noticeData) {
    const item = { ...noticeData, id: "not-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "notices"), item);
        item.id = docRef.id;
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_notices", []);
    const updated = [item, ...current];
    setLocal("sgm_clean_notices", updated);
    return item;
  },

  async deleteNotice(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "notices", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_notices", []);
    const updated = current.filter((n) => n.id !== id);
    setLocal("sgm_clean_notices", updated);
    return id;
  },

  // 9. ATTENDANCE
  async getAttendance() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "attendance"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLocal("sgm_clean_attendance", list);
        return list;
      } catch (err) {}
    }
    return getLocal("sgm_clean_attendance", []);
  },

  async markAttendanceBatch(records) {
    if (this.isLive()) {
      for (const rec of records) {
        try {
          const customId = `att-${rec.date}-${rec.studentId}`;
          await setDoc(doc(db, "attendance", customId), { ...rec, id: customId });
        } catch (err) {}
      }
    }
    const existing = getLocal("sgm_clean_attendance", []);
    const newDates = new Set(records.map((r) => `${r.date}-${r.studentId}`));
    const filteredOld = existing.filter((e) => !newDates.has(`${e.date}-${e.studentId}`));
    const combined = [...records, ...filteredOld];
    setLocal("sgm_clean_attendance", combined);
    return records;
  },

  // 10. EXAMS & RESULTS
  async getExams() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "exams"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLocal("sgm_clean_exams", list);
        return list;
      } catch (err) {}
    }
    return getLocal("sgm_clean_exams", []);
  },

  async addExam(examData) {
    const item = { ...examData, id: "ex-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "exams"), item);
        item.id = docRef.id;
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_exams", []);
    const updated = [item, ...current];
    setLocal("sgm_clean_exams", updated);
    return item;
  },

  async deleteExam(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "exams", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_exams", []);
    const updated = current.filter((e) => e.id !== id);
    setLocal("sgm_clean_exams", updated);
    return id;
  },

  async getResults() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "results"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLocal("sgm_clean_results", list);
        return list;
      } catch (err) {}
    }
    return getLocal("sgm_clean_results", []);
  },

  async addResult(resultData) {
    const item = { ...resultData, id: "res-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "results"), item);
        item.id = docRef.id;
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_results", []);
    const updated = [item, ...current];
    setLocal("sgm_clean_results", updated);
    return item;
  },

  async deleteResult(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "results", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_results", []);
    const updated = current.filter((r) => r.id !== id);
    setLocal("sgm_clean_results", updated);
    return id;
  },

  // 11. TIMETABLE
  async getTimetable() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "timetable"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLocal("sgm_clean_timetable", list);
        return list;
      } catch (err) {}
    }
    return getLocal("sgm_clean_timetable", []);
  },

  async addTimetableSlot(slotData) {
    const item = { ...slotData, id: "tt-" + Date.now(), createdAt: new Date().toISOString() };
    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "timetable"), item);
        item.id = docRef.id;
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_timetable", []);
    const updated = [...current, item];
    setLocal("sgm_clean_timetable", updated);
    return item;
  },

  async deleteTimetableSlot(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "timetable", id));
      } catch (err) {}
    }
    const current = getLocal("sgm_clean_timetable", []);
    const updated = current.filter((t) => t.id !== id);
    setLocal("sgm_clean_timetable", updated);
    return id;
  },

  // 12. SETTINGS
  async getSettings() {
    if (this.isLive()) {
      try {
        const snap = await getDoc(doc(db, "settings", "school_profile"));
        if (snap.exists()) {
          return { ...INITIAL_SCHOOL_SETTINGS, ...snap.data() };
        }
      } catch (err) {}
    }
    return getLocal("sgm_clean_settings", INITIAL_SCHOOL_SETTINGS);
  },

  async updateSettings(data) {
    const merged = { ...INITIAL_SCHOOL_SETTINGS, ...data };
    if (this.isLive()) {
      try {
        await setDoc(doc(db, "settings", "school_profile"), merged, { merge: true });
      } catch (err) {}
    }
    setLocal("sgm_clean_settings", merged);
    return merged;
  },

  // 13. MASTER PURGE: REMOVE ALL DUMMY DATA & RESET
  async clearAllDummyData() {
    // 1. Clear all local storage keys
    const keysToRemove = [
      "sgm_students_v2",
      "sgm_student_fee_accounts_v2",
      "sgm_payments_v2",
      "sgm_receipts_v2",
      "sgm_teachers_v2",
      "sgm_homework_v2",
      "sgm_notices_v2",
      "sgm_attendance_v2",
      "sgm_exams_v2",
      "sgm_results_v2",
      "sgm_timetable_v2",
      "sgm_clean_students",
      "sgm_clean_fee_accounts",
      "sgm_clean_payments",
      "sgm_clean_receipts",
      "sgm_clean_teachers",
      "sgm_clean_homework",
      "sgm_clean_notices",
      "sgm_clean_attendance",
      "sgm_clean_exams",
      "sgm_clean_results",
      "sgm_clean_timetable"
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 2. If live Firestore, delete dummy docs
    if (this.isLive()) {
      const collectionsToCheck = [
        "students",
        "studentFeeAccounts",
        "feePayments",
        "feeReceipts",
        "teachers",
        "notices",
        "homework",
        "attendance",
        "exams",
        "results",
        "timetable"
      ];

      for (const colName of collectionsToCheck) {
        try {
          const snap = await getDocs(collection(db, colName));
          for (const docSnap of snap.docs) {
            const data = docSnap.data();
            if (isDummyRecord(data)) {
              await deleteDoc(docSnap.ref);
            }
          }
        } catch (err) {
          console.warn(`Error cleaning collection ${colName}:`, err);
        }
      }
    }

    return { success: true, message: "सर्व डमी डेटा यशस्वीरीत्या हटवला गेला आहे. (All dummy data removed!)" };
  }
};
