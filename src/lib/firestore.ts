import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    Timestamp,
    DocumentData,
    QueryConstraint,
} from 'firebase/firestore';
import { db as getDb } from './firebase';

const dbInstance = () => getDb();

// ============ Generic Helpers ============

export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = doc(dbInstance(), collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
}

export async function setDocument(collectionName: string, docId: string, data: DocumentData): Promise<void> {
    const docRef = doc(dbInstance(), collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function addDocument(collectionName: string, data: DocumentData): Promise<string> {
    const colRef = collection(dbInstance(), collectionName);
    const docRef = await addDoc(colRef, { ...data, createdAt: Date.now(), updatedAt: Date.now() });
    return docRef.id;
}

export async function updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>): Promise<void> {
    const docRef = doc(dbInstance(), collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: Date.now() });
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(dbInstance(), collectionName, docId);
    await deleteDoc(docRef);
}

export async function queryDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[]
): Promise<T[]> {
    const colRef = collection(dbInstance(), collectionName);
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

// ============ Collection Names ============
export const COLLECTIONS = {
    USERS: 'users',
    LABOUR_PROFILES: 'labourProfiles',
    CONTRACTOR_PROFILES: 'contractorProfiles',
    PROJECTS: 'projects',
    PROJECT_APPLICATIONS: 'projectApplications',
    ATTENDANCE: 'attendance',
    DAILY_WORK_PHOTOS: 'dailyWorkPhotos',
    COMMISSION_RECORDS: 'commissionRecords',
    TRAVEL_BOOKINGS: 'travelBookings',
    VIDEO_VERIFICATION_LOGS: 'videoVerificationLogs',
    BOARDING_QR_LOGS: 'boardingQRLogs',
    RELIABILITY_SCORES: 'reliabilityScores',
    NO_SHOW_RECORDS: 'noShowRecords',
    QR_VERIFICATION_LOGS: 'qrVerificationLogs',
    SAVED_PROJECTS: 'savedProjects',
} as const;

// ============ Specific Queries ============

export async function getUserByUid(uid: string) {
    return getDocument(COLLECTIONS.USERS, uid);
}

export async function getLabourProfile(uid: string) {
    return getDocument(COLLECTIONS.LABOUR_PROFILES, uid);
}

export async function getContractorProfile(uid: string) {
    return getDocument(COLLECTIONS.CONTRACTOR_PROFILES, uid);
}

export async function getActiveProjects(limitCount = 20) {
    return queryDocuments(COLLECTIONS.PROJECTS, [
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount),
    ]);
}

export async function getProjectsByContractor(contractorId: string) {
    return queryDocuments(COLLECTIONS.PROJECTS, [
        where('contractorId', '==', contractorId),
        orderBy('createdAt', 'desc'),
    ]);
}

export async function getApplicationsByProject(projectId: string) {
    return queryDocuments(COLLECTIONS.PROJECT_APPLICATIONS, [
        where('projectId', '==', projectId),
        orderBy('appliedAt', 'desc'),
    ]);
}

export async function getApplicationsByLabour(labourId: string) {
    return queryDocuments(COLLECTIONS.PROJECT_APPLICATIONS, [
        where('labourId', '==', labourId),
        orderBy('appliedAt', 'desc'),
    ]);
}

export async function getAttendanceByLabour(labourId: string, limitCount = 30) {
    return queryDocuments(COLLECTIONS.ATTENDANCE, [
        where('labourId', '==', labourId),
        orderBy('createdAt', 'desc'),
        limit(limitCount),
    ]);
}

export async function getAttendanceByProject(projectId: string, date?: string) {
    const constraints: QueryConstraint[] = [where('projectId', '==', projectId)];
    if (date) constraints.push(where('date', '==', date));
    constraints.push(orderBy('createdAt', 'desc'));
    return queryDocuments(COLLECTIONS.ATTENDANCE, constraints);
}

export async function getPendingApprovals(role: 'labour' | 'contractor') {
    const col = role === 'labour' ? COLLECTIONS.LABOUR_PROFILES : COLLECTIONS.CONTRACTOR_PROFILES;
    return queryDocuments(col, [
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
    ]);
}
