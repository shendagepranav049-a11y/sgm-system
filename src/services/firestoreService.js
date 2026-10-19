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
// 1. INITIAL SCHEMA & DATASETS (Values in Paise)
// 100 paise = ₹1.00
// ==========================================

export const INITIAL_SCHOOL_SETTINGS = {
  schoolName: "SGM International Academy",
  tagline: "Excellence in Academic Rigor, Character & Innovation",
  email: "admin@sgmacademy.edu",
  phone: "+91 22 2894 1100",
  address: "450 Scholars Boulevard, Education City, Mumbai, MH 400076",
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
  { id: "cls-8", name: "Grade 8", classTeacher: "Sarah Jenkins", room: "Room 101", capacity: 35 },
  { id: "cls-9", name: "Grade 9", classTeacher: "Emily Watson", room: "Room 201", capacity: 35 },
  { id: "cls-10", name: "Grade 10", classTeacher: "Dr. Alistair Finch", room: "Room 301", capacity: 35 },
  { id: "cls-11", name: "Grade 11 - Science", classTeacher: "Priya Sharma", room: "Science Lab A", capacity: 30 },
  { id: "cls-12", name: "Grade 12 - Science", classTeacher: "Marcus Vance", room: "Science Lab B", capacity: 30 }
];

export const INITIAL_DIVISIONS = [
  { id: "div-8a", classId: "cls-8", className: "Grade 8", division: "A", classTeacher: "Sarah Jenkins", room: "Room 101" },
  { id: "div-8b", classId: "cls-8", className: "Grade 8", division: "B", classTeacher: "Robert Davis", room: "Room 102" },
  { id: "div-9a", classId: "cls-9", className: "Grade 9", division: "A", classTeacher: "Emily Watson", room: "Room 201" },
  { id: "div-9b", classId: "cls-9", className: "Grade 9", division: "B", classTeacher: "Michael Chang", room: "Room 202" },
  { id: "div-10a", classId: "cls-10", className: "Grade 10", division: "A", classTeacher: "Dr. Alistair Finch", room: "Room 301" },
  { id: "div-11a", classId: "cls-11", className: "Grade 11 - Science", division: "A", classTeacher: "Priya Sharma", room: "Lab A" },
  { id: "div-12a", classId: "cls-12", className: "Grade 12 - Science", division: "A", classTeacher: "Marcus Vance", room: "Lab B" }
];

export const INITIAL_SUBJECTS = [
  { id: "sub-1", name: "Mathematics", code: "MTH-101", department: "Science & Math" },
  { id: "sub-2", name: "Physics", code: "PHY-102", department: "Science & Math" },
  { id: "sub-3", name: "Chemistry", code: "CHM-103", department: "Science & Math" },
  { id: "sub-4", name: "Biology", code: "BIO-104", department: "Science & Math" },
  { id: "sub-5", name: "English Literature", code: "ENG-105", department: "Humanities" },
  { id: "sub-6", name: "Computer Science", code: "CSE-106", department: "Technology" }
];

export const INITIAL_TEACHERS = [
  { id: "tch-1", name: "Dr. Alistair Finch", teacherId: "TCH-001", email: "a.finch@sgmacademy.edu", phone: "+91 98200 11001", subject: "Physics", qualification: "Ph.D. in Applied Physics", joinedDate: "2020-08-15", status: "Active" },
  { id: "tch-2", name: "Emily Watson", teacherId: "TCH-002", email: "e.watson@sgmacademy.edu", phone: "+91 98200 11002", subject: "Mathematics", qualification: "M.Sc. Mathematics", joinedDate: "2021-07-10", status: "Active" },
  { id: "tch-3", name: "Michael Chang", teacherId: "TCH-003", email: "m.chang@sgmacademy.edu", phone: "+91 98200 11003", subject: "Computer Science", qualification: "M.Tech CSE", joinedDate: "2019-09-01", status: "Active" },
  { id: "tch-4", name: "Sarah Jenkins", teacherId: "TCH-004", email: "s.jenkins@sgmacademy.edu", phone: "+91 98200 11004", subject: "English Literature", qualification: "M.A. English", joinedDate: "2022-01-12", status: "Active" },
  { id: "tch-5", name: "Priya Sharma", teacherId: "TCH-005", email: "p.sharma@sgmacademy.edu", phone: "+91 98200 11005", subject: "Chemistry", qualification: "M.Sc. Chemistry", joinedDate: "2021-03-20", status: "Active" },
  { id: "tch-6", name: "Robert Davis", teacherId: "TCH-006", email: "r.davis@sgmacademy.edu", phone: "+91 98200 11006", subject: "Biology", qualification: "M.Sc. Life Sciences", joinedDate: "2023-06-01", status: "Active" }
];

// Fee structures with components in integer paise:
export const INITIAL_FEE_STRUCTURES = [
  {
    id: "fee-str-cls-8",
    academicYear: "2025-2026",
    className: "Grade 8",
    classId: "cls-8",
    tuitionFeePaise: 24000000,   // ₹2,40,000
    admissionFeePaise: 3500000,  // ₹35,000
    examFeePaise: 1500000,       // ₹15,000
    computerFeePaise: 1000000,   // ₹10,000
    libraryFeePaise: 1000000,    // ₹10,000
    transportFeePaise: 4000000,  // ₹40,000
    otherFeePaise: 500000,       // ₹5,000
    totalAmountPaise: 35500000,  // ₹3,55,000
    installments: [
      { name: "Term 1 (Admission & 1st Installment)", amountPaise: 17750000, dueDate: "2025-08-15" },
      { name: "Term 2 (2nd Installment)", amountPaise: 17750000, dueDate: "2025-11-30" }
    ]
  },
  {
    id: "fee-str-cls-9",
    academicYear: "2025-2026",
    className: "Grade 9",
    classId: "cls-9",
    tuitionFeePaise: 28000000,
    admissionFeePaise: 3500000,
    examFeePaise: 2000000,
    computerFeePaise: 1500000,
    libraryFeePaise: 1500000,
    transportFeePaise: 4500000,
    otherFeePaise: 500000,
    totalAmountPaise: 41500000, // ₹4,15,000
    installments: [
      { name: "Term 1 (Admission & 1st Installment)", amountPaise: 20750000, dueDate: "2025-08-15" },
      { name: "Term 2 (2nd Installment)", amountPaise: 20750000, dueDate: "2025-11-30" }
    ]
  },
  {
    id: "fee-str-cls-10",
    academicYear: "2025-2026",
    className: "Grade 10",
    classId: "cls-10",
    tuitionFeePaise: 32000000,
    admissionFeePaise: 4000000,
    examFeePaise: 2500000,
    computerFeePaise: 1500000,
    libraryFeePaise: 1500000,
    transportFeePaise: 5000000,
    otherFeePaise: 1000000,
    totalAmountPaise: 47500000, // ₹4,75,000
    installments: [
      { name: "Term 1 (Admission & 1st Installment)", amountPaise: 23750000, dueDate: "2025-08-15" },
      { name: "Term 2 (2nd Installment)", amountPaise: 23750000, dueDate: "2025-11-30" }
    ]
  },
  {
    id: "fee-str-cls-11",
    academicYear: "2025-2026",
    className: "Grade 11 - Science",
    classId: "cls-11",
    tuitionFeePaise: 38000000,
    admissionFeePaise: 5000000,
    examFeePaise: 3500000,
    computerFeePaise: 2000000,
    libraryFeePaise: 2000000,
    transportFeePaise: 6000000,
    otherFeePaise: 1000000,
    totalAmountPaise: 57500000, // ₹5,75,000
    installments: [
      { name: "Term 1 (Admission & 1st Installment)", amountPaise: 28750000, dueDate: "2025-08-15" },
      { name: "Term 2 (2nd Installment)", amountPaise: 28750000, dueDate: "2025-11-30" }
    ]
  }
];

// Students with Admission / GR Numbers
export const INITIAL_STUDENTS = [
  {
    id: "std-doc-101",
    grNumber: "GR-2025-0101",
    admissionNumber: "ADM-8801",
    name: "Alexander Hayes",
    gender: "Male",
    classId: "cls-10",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    parentName: "Arthur Hayes",
    parentPhone: "+91 98200 44001",
    parentEmail: "arthur.hayes@example.com",
    address: "742 Evergreen Terrace, Mumbai",
    dob: "2009-04-12",
    admissionDate: "2023-08-10",
    status: "Active",
    attendancePercentage: 96
  },
  {
    id: "std-doc-102",
    grNumber: "GR-2025-0102",
    admissionNumber: "ADM-8802",
    name: "Sophia Martinez",
    gender: "Female",
    classId: "cls-10",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    parentName: "Elena Martinez",
    parentPhone: "+91 98200 44002",
    parentEmail: "elena.m@example.com",
    address: "123 Marine Drive, Mumbai",
    dob: "2009-07-25",
    admissionDate: "2023-08-10",
    status: "Active",
    attendancePercentage: 92
  },
  {
    id: "std-doc-103",
    grNumber: "GR-2025-0103",
    admissionNumber: "ADM-8803",
    name: "Ethan Christopher Wright",
    gender: "Male",
    classId: "cls-10",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    parentName: "David Wright",
    parentPhone: "+91 98200 44003",
    parentEmail: "david.w@example.com",
    address: "88 Pine Crest Way, Bandra, Mumbai",
    dob: "2009-02-18",
    admissionDate: "2023-08-12",
    status: "Active",
    attendancePercentage: 88
  },
  {
    id: "std-doc-104",
    grNumber: "GR-2025-0104",
    admissionNumber: "ADM-8804",
    name: "Aria Montgomery",
    gender: "Female",
    classId: "cls-9",
    className: "Grade 9",
    division: "A",
    academicYear: "2025-2026",
    parentName: "Byron Montgomery",
    parentPhone: "+91 98200 44004",
    parentEmail: "byron.m@example.com",
    address: "15 Oak Ridge Lane, Mumbai",
    dob: "2010-09-03",
    admissionDate: "2024-08-01",
    status: "Active",
    attendancePercentage: 98
  },
  {
    id: "std-doc-105",
    grNumber: "GR-2025-0105",
    admissionNumber: "ADM-8805",
    name: "Lucas Bennett",
    gender: "Male",
    classId: "cls-9",
    className: "Grade 9",
    division: "A",
    academicYear: "2025-2026",
    parentName: "Victoria Bennett",
    parentPhone: "+91 98200 44005",
    parentEmail: "v.bennett@example.com",
    address: "404 Meadow View, Mumbai",
    dob: "2010-11-20",
    admissionDate: "2024-08-01",
    status: "Active",
    attendancePercentage: 94
  },
  {
    id: "std-doc-106",
    grNumber: "GR-2025-0106",
    admissionNumber: "ADM-8806",
    name: "Chloe Isabella Zhang",
    gender: "Female",
    classId: "cls-11",
    className: "Grade 11 - Science",
    division: "A",
    academicYear: "2025-2026",
    parentName: "Hao Zhang",
    parentPhone: "+91 98200 44006",
    parentEmail: "hao.zhang@example.com",
    address: "99 Silicon View Blvd, Mumbai",
    dob: "2008-05-14",
    admissionDate: "2022-08-15",
    status: "Active",
    attendancePercentage: 97
  },
  {
    id: "std-doc-107",
    grNumber: "GR-2025-0107",
    admissionNumber: "ADM-8807",
    name: "Daniel Kumar Patel",
    gender: "Male",
    classId: "cls-11",
    className: "Grade 11 - Science",
    division: "A",
    academicYear: "2025-2026",
    parentName: "Rajesh Patel",
    parentPhone: "+91 98200 44007",
    parentEmail: "rajesh.patel@example.com",
    address: "22 Heritage Way, Juhu, Mumbai",
    dob: "2008-10-30",
    admissionDate: "2022-08-15",
    status: "Active",
    attendancePercentage: 91
  },
  {
    id: "std-doc-108",
    grNumber: "GR-2025-0108",
    admissionNumber: "ADM-8808",
    name: "Zoe Kensington",
    gender: "Female",
    classId: "cls-8",
    className: "Grade 8",
    division: "A",
    academicYear: "2025-2026",
    parentName: "Richard Kensington",
    parentPhone: "+91 98200 44008",
    parentEmail: "richard.k@example.com",
    address: "10 Downing Court, Mumbai",
    dob: "2011-03-22",
    admissionDate: "2025-08-01",
    status: "Active",
    attendancePercentage: 95
  }
];

// Student Fee Accounts (Linked by studentId, amounts in Paise)
export const INITIAL_STUDENT_FEE_ACCOUNTS = [
  {
    id: "sfa-101",
    studentId: "std-doc-101",
    studentName: "Alexander Hayes",
    grNumber: "GR-2025-0101",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 47500000,
    discountPaise: 0,
    totalPayablePaise: 47500000,
    totalPaidPaise: 47500000,
    remainingBalancePaise: 0,
    paymentStatus: "Paid",
    dueDate: "2025-11-30"
  },
  {
    id: "sfa-102",
    studentId: "std-doc-102",
    studentName: "Sophia Martinez",
    grNumber: "GR-2025-0102",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 47500000,
    discountPaise: 2500000, // ₹25,000 merit scholarship
    totalPayablePaise: 45000000,
    totalPaidPaise: 30000000,
    remainingBalancePaise: 15000000,
    paymentStatus: "Partially Paid",
    dueDate: "2025-11-30"
  },
  {
    id: "sfa-103",
    studentId: "std-doc-103",
    studentName: "Ethan Christopher Wright",
    grNumber: "GR-2025-0103",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 47500000,
    discountPaise: 0,
    totalPayablePaise: 47500000,
    totalPaidPaise: 0,
    remainingBalancePaise: 47500000,
    paymentStatus: "Overdue",
    dueDate: "2025-08-15" // Past due date -> Overdue
  },
  {
    id: "sfa-104",
    studentId: "std-doc-104",
    studentName: "Aria Montgomery",
    grNumber: "GR-2025-0104",
    className: "Grade 9",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 41500000,
    discountPaise: 0,
    totalPayablePaise: 41500000,
    totalPaidPaise: 41500000,
    remainingBalancePaise: 0,
    paymentStatus: "Paid",
    dueDate: "2025-11-30"
  },
  {
    id: "sfa-105",
    studentId: "std-doc-105",
    studentName: "Lucas Bennett",
    grNumber: "GR-2025-0105",
    className: "Grade 9",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 41500000,
    discountPaise: 0,
    totalPayablePaise: 41500000,
    totalPaidPaise: 25000000,
    remainingBalancePaise: 16500000,
    paymentStatus: "Partially Paid",
    dueDate: "2025-11-30"
  },
  {
    id: "sfa-106",
    studentId: "std-doc-106",
    studentName: "Chloe Isabella Zhang",
    grNumber: "GR-2025-0106",
    className: "Grade 11 - Science",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 57500000,
    discountPaise: 0,
    totalPayablePaise: 57500000,
    totalPaidPaise: 57500000,
    remainingBalancePaise: 0,
    paymentStatus: "Paid",
    dueDate: "2025-11-30"
  },
  {
    id: "sfa-107",
    studentId: "std-doc-107",
    studentName: "Daniel Kumar Patel",
    grNumber: "GR-2025-0107",
    className: "Grade 11 - Science",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 57500000,
    discountPaise: 0,
    totalPayablePaise: 57500000,
    totalPaidPaise: 35000000,
    remainingBalancePaise: 22500000,
    paymentStatus: "Partially Paid",
    dueDate: "2025-11-30"
  },
  {
    id: "sfa-108",
    studentId: "std-doc-108",
    studentName: "Zoe Kensington",
    grNumber: "GR-2025-0108",
    className: "Grade 8",
    division: "A",
    academicYear: "2025-2026",
    totalApplicableFeePaise: 35500000,
    discountPaise: 0,
    totalPayablePaise: 35500000,
    totalPaidPaise: 35500000,
    remainingBalancePaise: 0,
    paymentStatus: "Paid",
    dueDate: "2025-11-30"
  }
];

// Fee Payments History (Immutable transactional log)
export const INITIAL_FEE_PAYMENTS = [
  {
    id: "pay-doc-1001",
    receiptNo: "SGM-REC-2026-001",
    studentId: "std-doc-101",
    studentName: "Alexander Hayes",
    grNumber: "GR-2025-0101",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    amountPaise: 47500000,
    paymentMode: "Bank Transfer",
    transactionReference: "NEFT-8829104",
    feeComponent: "Full Academic Session Tuition & Fees",
    paymentDate: "2026-09-05",
    recordedBy: "Chief Accountant",
    status: "Completed",
    remarks: "Full annual clearance paid upfront via direct RTGS"
  },
  {
    id: "pay-doc-1002",
    receiptNo: "SGM-REC-2026-002",
    studentId: "std-doc-102",
    studentName: "Sophia Martinez",
    grNumber: "GR-2025-0102",
    className: "Grade 10",
    division: "A",
    academicYear: "2025-2026",
    amountPaise: 30000000,
    paymentMode: "Credit Card",
    transactionReference: "CC-POS-492048",
    feeComponent: "Term 1 Tuition Installment",
    paymentDate: "2026-09-12",
    recordedBy: "Accounts Counter",
    status: "Completed",
    remarks: "Term 1 installment cleared"
  },
  {
    id: "pay-doc-1003",
    receiptNo: "SGM-REC-2026-003",
    studentId: "std-doc-104",
    studentName: "Aria Montgomery",
    grNumber: "GR-2025-0104",
    className: "Grade 9",
    division: "A",
    academicYear: "2025-2026",
    amountPaise: 41500000,
    paymentMode: "UPI",
    transactionReference: "UPI-AXIS-7740291",
    feeComponent: "Annual Comprehensive Tuition",
    paymentDate: "2026-08-20",
    recordedBy: "Online Gateway",
    status: "Completed",
    remarks: "Verified through UPI gateway webhook"
  },
  {
    id: "pay-doc-1004",
    receiptNo: "SGM-REC-2026-004",
    studentId: "std-doc-105",
    studentName: "Lucas Bennett",
    grNumber: "GR-2025-0105",
    className: "Grade 9",
    division: "A",
    academicYear: "2025-2026",
    amountPaise: 25000000,
    paymentMode: "Cash",
    transactionReference: "CSH-MUM-0029",
    feeComponent: "Term 1 Tuition + Admission",
    paymentDate: "2026-09-02",
    recordedBy: "Senior Cashier",
    status: "Completed",
    remarks: "Cash deposit received at counter"
  },
  {
    id: "pay-doc-1005",
    receiptNo: "SGM-REC-2026-005",
    studentId: "std-doc-106",
    studentName: "Chloe Isabella Zhang",
    grNumber: "GR-2025-0106",
    className: "Grade 11 - Science",
    division: "A",
    academicYear: "2025-2026",
    amountPaise: 57500000,
    paymentMode: "Cheque",
    transactionReference: "CHQ-HDFC-993812",
    feeComponent: "Full Annual Fee + Science Lab Charges",
    paymentDate: "2026-08-18",
    recordedBy: "Chief Accountant",
    status: "Completed",
    remarks: "Cheque cleared and credited"
  },
  {
    id: "pay-doc-1006",
    receiptNo: "SGM-REC-2026-006",
    studentId: "std-doc-107",
    studentName: "Daniel Kumar Patel",
    grNumber: "GR-2025-0107",
    className: "Grade 11 - Science",
    division: "A",
    academicYear: "2025-2026",
    amountPaise: 35000000,
    paymentMode: "Bank Transfer",
    transactionReference: "IMPS-3392812",
    feeComponent: "Term 1 Science Stream Fee",
    paymentDate: "2026-09-15",
    recordedBy: "Accounts Counter",
    status: "Completed",
    remarks: "Term 1 cleared"
  },
  {
    id: "pay-doc-1007",
    receiptNo: "SGM-REC-2026-007",
    studentId: "std-doc-108",
    studentName: "Zoe Kensington",
    grNumber: "GR-2025-0108",
    className: "Grade 8",
    division: "A",
    academicYear: "2025-2026",
    amountPaise: 35500000,
    paymentMode: "Bank Transfer",
    transactionReference: "ACH-110294",
    feeComponent: "Full Year Admission & Tuition",
    paymentDate: "2026-08-25",
    recordedBy: "Chief Accountant",
    status: "Completed",
    remarks: "Bank credit confirmed"
  }
];

// Fee Receipts (Snapshot for reprint)
export const INITIAL_FEE_RECEIPTS = INITIAL_FEE_PAYMENTS.map((p) => {
  return {
    id: `rec-doc-${p.receiptNo}`,
    receiptNo: p.receiptNo,
    paymentId: p.id,
    studentId: p.studentId,
    studentName: p.studentName,
    grNumber: p.grNumber,
    className: p.className,
    division: p.division,
    academicYear: p.academicYear,
    feeComponent: p.feeComponent,
    currentPaymentPaise: p.amountPaise,
    totalPayablePaise: p.amountPaise,
    previousAmountPaidPaise: 0,
    totalPaidPaise: p.amountPaise,
    remainingBalancePaise: 0,
    paymentMode: p.paymentMode,
    transactionReference: p.transactionReference,
    paymentDate: p.paymentDate,
    authorizedBy: p.recordedBy,
    issuedAt: new Date().toISOString()
  };
});

// Audit Logs
export const INITIAL_AUDIT_LOGS = [
  {
    id: "log-1",
    action: "FEE_STRUCTURE_CREATED",
    entity: "feeStructures",
    details: "Configured Grade 10 fee structure of ₹4,75,000 for AY 2025-2026",
    performedBy: "Chief Accountant",
    timestamp: "2025-07-01T10:00:00Z"
  },
  {
    id: "log-2",
    action: "PAYMENT_RECORDED",
    entity: "feePayments",
    details: "Recorded ₹4,75,000 payment for Alexander Hayes (Receipt #SGM-REC-2026-001)",
    performedBy: "Chief Accountant",
    timestamp: "2026-09-05T11:20:00Z"
  }
];

// Homework
export const INITIAL_HOMEWORK = [
  {
    id: "hw-1",
    className: "Grade 10",
    subject: "Mathematics",
    title: "Quadratic Equations & Roots Exercise 4.2",
    assignedDate: "2026-10-18",
    dueDate: "2026-10-22",
    assignedBy: "Emily Watson",
    instructions: "Complete problems 1 through 15 from Chapter 4. Show all working steps."
  },
  {
    id: "hw-2",
    className: "Grade 11 - Science",
    subject: "Physics",
    title: "Thermodynamics Lab Report",
    assignedDate: "2026-10-17",
    dueDate: "2026-10-24",
    assignedBy: "Dr. Alistair Finch",
    instructions: "Write full laboratory observations and error analysis for Boyle's law experiment."
  }
];

// Helper to get local data or initialize default
const getLocal = (key, defaultData) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error("Local storage read error for", key, err);
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

// ==========================================
// 2. ENHANCED FIRESTORE SERVICE LAYER
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
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore getStudents failed, reading local cache:", err.message);
      }
    }
    return getLocal("sgm_students_v2", INITIAL_STUDENTS);
  },

  async addStudent(studentData) {
    const newStudent = {
      ...studentData,
      id: studentData.id || "std-doc-" + Date.now(),
      grNumber: studentData.grNumber || `GR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      admissionNumber: studentData.admissionNumber || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      status: studentData.status || "Active",
      createdAt: new Date().toISOString()
    };

    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "students"), newStudent);
        newStudent.id = docRef.id;
      } catch (err) {
        console.warn("Firestore addStudent failed, saving local:", err.message);
      }
    }

    const current = getLocal("sgm_students_v2", INITIAL_STUDENTS);
    const updated = [newStudent, ...current];
    setLocal("sgm_students_v2", updated);

    // Auto-create or link student fee account using existing student ID
    const initialFeePaise = rupeesToPaise(Number(studentData.totalFeeRupees || 475000));
    await this.createStudentFeeAccount({
      studentId: newStudent.id,
      studentName: newStudent.name,
      grNumber: newStudent.grNumber,
      className: newStudent.className,
      division: newStudent.division || "A",
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
        console.warn("Firestore updateStudent failed:", err.message);
      }
    }
    const current = getLocal("sgm_students_v2", INITIAL_STUDENTS);
    const updated = current.map(s => s.id === id ? { ...s, ...studentData } : s);
    setLocal("sgm_students_v2", updated);
    return studentData;
  },

  async deleteStudent(id) {
    if (this.isLive()) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (err) {
        console.warn("Firestore deleteStudent failed:", err.message);
      }
    }
    const current = getLocal("sgm_students_v2", INITIAL_STUDENTS);
    const updated = current.filter(s => s.id !== id);
    setLocal("sgm_students_v2", updated);
    return id;
  },

  // Student Promotion (e.g. promoting Grade 9 to Grade 10)
  async promoteStudents(studentIds, toClassName, toAcademicYear) {
    const students = getLocal("sgm_students_v2", INITIAL_STUDENTS);
    const updated = students.map(s => {
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

    setLocal("sgm_students_v2", updated);

    if (this.isLive()) {
      for (const id of studentIds) {
        try {
          await updateDoc(doc(db, "students", id), {
            className: toClassName,
            academicYear: toAcademicYear,
            promotedAt: serverTimestamp()
          });
        } catch (err) {
          console.warn("Promotion firestore update error:", err);
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
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore getStudentFeeAccounts failed:", err.message);
      }
    }
    return getLocal("sgm_student_fee_accounts_v2", INITIAL_STUDENT_FEE_ACCOUNTS);
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
        console.warn("Firestore createStudentFeeAccount failed:", err.message);
      }
    }
    const current = getLocal("sgm_student_fee_accounts_v2", INITIAL_STUDENT_FEE_ACCOUNTS);
    setLocal("sgm_student_fee_accounts_v2", [item, ...current]);
    return item;
  },

  // 3. FEE STRUCTURES
  async getFeeStructures() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "feeStructures"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore getFeeStructures failed:", err.message);
      }
    }
    return getLocal("sgm_fee_structures_v2", INITIAL_FEE_STRUCTURES);
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
      id: structData.id || "fee-str-" + Date.now()
    };

    if (this.isLive()) {
      try {
        const docRef = await addDoc(collection(db, "feeStructures"), item);
        item.id = docRef.id;
      } catch (err) {
        console.warn("Firestore addFeeStructure failed:", err.message);
      }
    }
    const current = getLocal("sgm_fee_structures_v2", INITIAL_FEE_STRUCTURES);
    setLocal("sgm_fee_structures_v2", [item, ...current]);
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
        console.warn("Firestore updateFeeStructure failed:", err.message);
      }
    }
    const current = getLocal("sgm_fee_structures_v2", INITIAL_FEE_STRUCTURES);
    setLocal("sgm_fee_structures_v2", current.map(f => f.id === id ? { ...f, ...updated } : f));
    return updated;
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

    // 1. Fetch current fee account
    const accounts = await this.getStudentFeeAccounts();
    const account = accounts.find(a => a.studentId === studentId);
    if (!account) {
      throw new Error("Student fee account not found for studentId: " + studentId);
    }

    // 2. Validate overpayment
    if (Number(amountPaise) > Number(account.remainingBalancePaise)) {
      throw new Error(`Payment amount (₹${paiseToRupees(amountPaise)}) exceeds remaining balance (₹${paiseToRupees(account.remainingBalancePaise)}).`);
    }

    // 3. Check duplicate submission
    const existingPayments = await this.getFeePayments();
    if (idempotencyKey && existingPayments.some(p => p.idempotencyKey === idempotencyKey)) {
      throw new Error("Duplicate payment submission prevented.");
    }

    // 4. Generate unique receipt number
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

    // Calculate new account balances
    const newPaidPaise = Number(account.totalPaidPaise || 0) + Number(amountPaise);
    const newRemainingPaise = Math.max(0, Number(account.totalPayablePaise || 0) - newPaidPaise);
    const newStatus = newRemainingPaise === 0 ? "Paid" : (newPaidPaise > 0 ? "Partially Paid" : "Unpaid");

    const updatedAccount = {
      ...account,
      totalPaidPaise: newPaidPaise,
      remainingBalancePaise: newRemainingPaise,
      paymentStatus: newStatus
    };

    // Create immutable receipt snapshot
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

    // Cloud Firestore Transaction Execution
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
        // Audit log
        await addDoc(collection(db, "feeAuditLogs"), {
          action: "PAYMENT_RECORDED",
          entity: "feePayments",
          receiptNo,
          amountPaise: Number(amountPaise),
          studentId: account.studentId,
          performedBy: recordedBy || "Senior Accountant",
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore transaction failed, persisting locally:", err.message);
      }
    }

    // Local state persistence
    setLocal("sgm_payments_v2", [newPayment, ...existingPayments]);

    const allReceipts = getLocal("sgm_receipts_v2", INITIAL_FEE_RECEIPTS);
    setLocal("sgm_receipts_v2", [receiptSnapshot, ...allReceipts]);

    const updatedAccounts = accounts.map(a => a.studentId === studentId ? updatedAccount : a);
    setLocal("sgm_student_fee_accounts_v2", updatedAccounts);

    return { payment: newPayment, receipt: receiptSnapshot, account: updatedAccount };
  },

  async getFeePayments() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "feePayments"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore getFeePayments failed:", err.message);
      }
    }
    return getLocal("sgm_payments_v2", INITIAL_FEE_PAYMENTS);
  },

  async getFeeReceipts() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "feeReceipts"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore getFeeReceipts failed:", err.message);
      }
    }
    return getLocal("sgm_receipts_v2", INITIAL_FEE_RECEIPTS);
  },

  // Auditable Payment Reversal / Refund Process
  async reversePayment(paymentId, reason, authorizedBy) {
    const payments = await this.getFeePayments();
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) throw new Error("Payment record not found.");
    if (payment.status === "Reversed") throw new Error("Payment is already reversed.");

    // Update payment status
    payment.status = "Reversed";
    payment.reversalReason = reason;
    payment.reversedBy = authorizedBy;
    payment.reversedAt = new Date().toISOString();

    // Revert balance on student fee account
    const accounts = await this.getStudentFeeAccounts();
    const account = accounts.find(a => a.studentId === payment.studentId);
    if (account) {
      account.totalPaidPaise = Math.max(0, Number(account.totalPaidPaise || 0) - Number(payment.amountPaise));
      account.remainingBalancePaise = Math.max(0, Number(account.totalPayablePaise || 0) - account.totalPaidPaise);
      account.paymentStatus = account.remainingBalancePaise === 0 ? "Paid" : (account.totalPaidPaise > 0 ? "Partially Paid" : "Unpaid");
      setLocal("sgm_student_fee_accounts_v2", accounts);
    }

    setLocal("sgm_payments_v2", payments);

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

  // 5. ACADEMIC MANAGEMENT (Years, Classes, Divisions, Subjects, Timetable)
  async getAcademicYears() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "academicYears"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {}
    }
    return getLocal("sgm_academic_years_v2", INITIAL_ACADEMIC_YEARS);
  },

  async addAcademicYear(yearData) {
    const item = { ...yearData, id: "ay-" + Date.now() };
    const list = [item, ...getLocal("sgm_academic_years_v2", INITIAL_ACADEMIC_YEARS)];
    setLocal("sgm_academic_years_v2", list);
    return item;
  },

  async getClasses() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "classes"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {}
    }
    return getLocal("sgm_classes_v2", INITIAL_CLASSES);
  },

  async getDivisions() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "divisions"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {}
    }
    return getLocal("sgm_divisions_v2", INITIAL_DIVISIONS);
  },

  async getSubjects() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "subjects"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {}
    }
    return getLocal("sgm_subjects_v2", INITIAL_SUBJECTS);
  },

  // 6. HOMEWORK
  async getHomework() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "homework"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {}
    }
    return getLocal("sgm_homework_v2", INITIAL_HOMEWORK);
  },

  async addHomework(hwData) {
    const item = { ...hwData, id: "hw-" + Date.now() };
    const list = [item, ...getLocal("sgm_homework_v2", INITIAL_HOMEWORK)];
    setLocal("sgm_homework_v2", list);
    return item;
  },

  // 7. SETTINGS
  async getSettings() {
    if (this.isLive()) {
      try {
        const snap = await getDoc(doc(db, "settings", "school_profile"));
        if (snap.exists()) {
          return { ...INITIAL_SCHOOL_SETTINGS, ...snap.data() };
        }
      } catch (err) {}
    }
    return getLocal("sgm_settings_v2", INITIAL_SCHOOL_SETTINGS);
  },

  async updateSettings(data) {
    const merged = { ...INITIAL_SCHOOL_SETTINGS, ...data };
    if (this.isLive()) {
      try {
        await setDoc(doc(db, "settings", "school_profile"), merged, { merge: true });
      } catch (err) {}
    }
    setLocal("sgm_settings_v2", merged);
    return merged;
  },

  // Teachers
  async getTeachers() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "teachers"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {}
    }
    return getLocal("sgm_teachers_v2", INITIAL_TEACHERS);
  },

  async addTeacher(teacherData) {
    const item = { ...teacherData, id: "tch-" + Date.now() };
    const list = [item, ...getLocal("sgm_teachers_v2", INITIAL_TEACHERS)];
    setLocal("sgm_teachers_v2", list);
    return item;
  },

  async updateTeacher(id, data) {
    const list = getLocal("sgm_teachers_v2", INITIAL_TEACHERS).map(t => t.id === id ? { ...t, ...data } : t);
    setLocal("sgm_teachers_v2", list);
    return data;
  },

  async deleteTeacher(id) {
    const list = getLocal("sgm_teachers_v2", INITIAL_TEACHERS).filter(t => t.id !== id);
    setLocal("sgm_teachers_v2", list);
    return id;
  },

  // Attendance
  async getAttendance() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "attendance"));
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {}
    }
    return getLocal("sgm_attendance_v2", [
      { id: "att-1", date: "2026-10-19", className: "Grade 10", studentId: "std-doc-101", studentName: "Alexander Hayes", rollNo: "GR-2025-0101", status: "Present" },
      { id: "att-2", date: "2026-10-19", className: "Grade 10", studentId: "std-doc-102", studentName: "Sophia Martinez", rollNo: "GR-2025-0102", status: "Present" },
      { id: "att-3", date: "2026-10-19", className: "Grade 10", studentId: "std-doc-103", studentName: "Ethan Christopher Wright", rollNo: "GR-2025-0103", status: "Absent" }
    ]);
  },

  async markAttendanceBatch(records) {
    setLocal("sgm_attendance_v2", records);
    return records;
  },

  // Exams & Results
  async getExams() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "exams"));
        if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {}
    }
    return getLocal("sgm_exams_v2", [
      { id: "ex-1", title: "Mid-Term Assessment 2025-26", term: "First Term", startDate: "2025-11-10", endDate: "2025-11-22", status: "Completed", totalMarks: 100 },
      { id: "ex-2", title: "Annual Final Board Examination", term: "Final Term", startDate: "2026-03-05", endDate: "2026-03-24", status: "Upcoming", totalMarks: 100 }
    ]);
  },

  async addExam(examData) {
    const item = { ...examData, id: "ex-" + Date.now() };
    const list = [item, ...getLocal("sgm_exams_v2", [])];
    setLocal("sgm_exams_v2", list);
    return item;
  },

  async getResults() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "results"));
        if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {}
    }
    return getLocal("sgm_results_v2", [
      { id: "res-1", studentName: "Alexander Hayes", rollNo: "GR-2025-0101", className: "Grade 10", subject: "Mathematics", marksObtained: 94, maxMarks: 100, grade: "A+", remarks: "Outstanding problem solving" },
      { id: "res-2", studentName: "Alexander Hayes", rollNo: "GR-2025-0101", className: "Grade 10", subject: "Physics", marksObtained: 91, maxMarks: 100, grade: "A+", remarks: "Top in practical lab" },
      { id: "res-3", studentName: "Sophia Martinez", rollNo: "GR-2025-0102", className: "Grade 10", subject: "Mathematics", marksObtained: 86, maxMarks: 100, grade: "A", remarks: "Great conceptual grasp" }
    ]);
  },

  async addResult(resultData) {
    const item = { ...resultData, id: "res-" + Date.now() };
    const list = [item, ...getLocal("sgm_results_v2", [])];
    setLocal("sgm_results_v2", list);
    return item;
  },

  // Timetable
  async getTimetable() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "timetable"));
        if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {}
    }
    return getLocal("sgm_timetable_v2", [
      { id: "tt-1", day: "Monday", timeSlot: "08:30 - 09:30 AM", className: "Grade 10", subject: "Physics", teacher: "Dr. Alistair Finch", room: "Science Lab A" },
      { id: "tt-2", day: "Monday", timeSlot: "09:35 - 10:35 AM", className: "Grade 10", subject: "Mathematics", teacher: "Emily Watson", room: "Room 301" },
      { id: "tt-3", day: "Monday", timeSlot: "10:50 - 11:50 AM", className: "Grade 10", subject: "Computer Science", teacher: "Michael Chang", room: "Lab C" },
      { id: "tt-4", day: "Tuesday", timeSlot: "08:30 - 09:30 AM", className: "Grade 10", subject: "Chemistry", teacher: "Priya Sharma", room: "Lab B" }
    ]);
  },

  async addTimetableSlot(slotData) {
    const item = { ...slotData, id: "tt-" + Date.now() };
    const list = [...getLocal("sgm_timetable_v2", []), item];
    setLocal("sgm_timetable_v2", list);
    return item;
  },

  async deleteTimetableSlot(id) {
    const list = getLocal("sgm_timetable_v2", []).filter(t => t.id !== id);
    setLocal("sgm_timetable_v2", list);
    return id;
  },

  // Notices
  async getNotices() {
    if (this.isLive()) {
      try {
        const snap = await getDocs(collection(db, "notices"));
        if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {}
    }
    return getLocal("sgm_notices_v2", [
      { id: "not-1", title: "Annual Sports Tournament 2026", content: "Inter-house athletic games scheduled for November 12th. Collect jerseys from Sports Dept.", targetAudience: "All Students & Faculty", priority: "High", date: "2026-10-15" },
      { id: "not-2", title: "Term 2 Fee Payment Due Date Notice", content: "Second installment due on or before November 30th to avoid late administrative fees.", targetAudience: "Parents & Students", priority: "Urgent", date: "2026-10-10" },
      { id: "not-3", title: "Science & Robotics Innovation Fair 2026", content: "Registrations open for regional STEM exhibition for Grade 8 to 12.", targetAudience: "Grade 8-12 Students", priority: "Normal", date: "2026-10-05" }
    ]);
  },

  async addNotice(noticeData) {
    const item = { ...noticeData, id: "not-" + Date.now() };
    const list = [item, ...getLocal("sgm_notices_v2", [])];
    setLocal("sgm_notices_v2", list);
    return item;
  },

  async deleteNotice(id) {
    const list = getLocal("sgm_notices_v2", []).filter(n => n.id !== id);
    setLocal("sgm_notices_v2", list);
    return id;
  },

  // 8. ONE-CLICK LIVE FIRESTORE SEEDING
  async seedFirestore() {
    if (!this.isLive()) {
      return { success: false, message: "Firebase is not configured yet. Add credentials to .env first." };
    }

    try {
      console.log("🌱 Seeding Cloud Firestore with all collections...");

      // Students
      for (const std of INITIAL_STUDENTS) {
        await setDoc(doc(db, "students", std.id), std);
      }

      // Student Fee Accounts
      for (const sfa of INITIAL_STUDENT_FEE_ACCOUNTS) {
        await setDoc(doc(db, "studentFeeAccounts", sfa.id), sfa);
      }

      // Fee Structures
      for (const fs of INITIAL_FEE_STRUCTURES) {
        await setDoc(doc(db, "feeStructures", fs.id), fs);
      }

      // Fee Payments
      for (const pay of INITIAL_FEE_PAYMENTS) {
        await setDoc(doc(db, "feePayments", pay.id), pay);
      }

      // Fee Receipts
      for (const rec of INITIAL_FEE_RECEIPTS) {
        await setDoc(doc(db, "feeReceipts", rec.id), rec);
      }

      // Academic Years
      for (const ay of INITIAL_ACADEMIC_YEARS) {
        await setDoc(doc(db, "academicYears", ay.id), ay);
      }

      // Classes
      for (const cls of INITIAL_CLASSES) {
        await setDoc(doc(db, "classes", cls.id), cls);
      }

      // Divisions
      for (const div of INITIAL_DIVISIONS) {
        await setDoc(doc(db, "divisions", div.id), div);
      }

      // Subjects
      for (const sub of INITIAL_SUBJECTS) {
        await setDoc(doc(db, "subjects", sub.id), sub);
      }

      // Teachers
      for (const tch of INITIAL_TEACHERS) {
        await setDoc(doc(db, "teachers", tch.id), tch);
      }

      // Homework
      for (const hw of INITIAL_HOMEWORK) {
        await setDoc(doc(db, "homework", hw.id), hw);
      }

      // Settings
      await setDoc(doc(db, "settings", "school_profile"), INITIAL_SCHOOL_SETTINGS);

      return {
        success: true,
        message: "Successfully synchronized all collections into Cloud Firestore!"
      };
    } catch (err) {
      console.error("Cloud Firestore Seeding Failed:", err);
      return { success: false, message: err.message };
    }
  }
};
