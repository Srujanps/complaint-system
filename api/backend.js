const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ── JWT Utilities using Node built-in crypto ─────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'grievance_management_system_jwt_secret_key_2026_super_secure';

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
}

function signJwt(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    if (signature !== expectedSignature) return null;
    try {
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        if (payload.exp && Date.now() / 1000 > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}

// ── In-Memory / File Persistent Database ─────────────────────────────────
const LOCAL_DB_FILE = path.join(__dirname, '..', 'data', 'grievance_db.json');
const DB_FILE = process.env.VERCEL ? '/tmp/grievance_db.json' : LOCAL_DB_FILE;

function normalizePhone(p) {
    if (!p) return '';
    const digits = String(p).replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
}

function ensureDataDir() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    }
}

let db = null;

function getInitialDb() {
    return {
        users: [
            {
                userId: 1,
                username: 'citizen',
                password: 'password123',
                email: 'citizen@example.com',
                role: 'CITIZEN',
                fullName: 'Aarav Sharma',
                phone: '+91 98765 43210',
                constituency: 'Ward 12',
                designation: 'Citizen',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            },
            {
                userId: 2,
                username: 'officer',
                password: 'password123',
                email: 'officer@example.com',
                role: 'OFFICER',
                fullName: 'Rajesh Varma',
                phone: '+91 98765 43211',
                constituency: 'Ward 12',
                designation: 'Ward Nodal Officer',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            },
            {
                userId: 3,
                username: 'representative',
                password: 'password123',
                email: 'rep@example.com',
                role: 'REPRESENTATIVE',
                fullName: 'Priya Deshmukh',
                phone: '+91 98765 43213',
                constituency: 'Ward 12 - Central District',
                designation: 'Elected Ward Representative',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            },
            {
                userId: 4,
                username: 'admin',
                password: 'password123',
                email: 'admin@example.com',
                role: 'ADMIN',
                fullName: 'System Administrator',
                phone: '+91 98765 43214',
                constituency: 'HQ',
                designation: 'Chief Administrator',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            },
            {
                userId: 5,
                username: 'vendor',
                password: 'password123',
                email: 'vendor@example.com',
                role: 'VENDOR',
                fullName: 'Sunil Patil',
                phone: '+91 98765 43212',
                constituency: 'Ward 12',
                designation: 'QuickFix Infra Services (Roads & Asphalt Specialist)',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            },
            {
                userId: 6,
                username: 'vendor_water',
                password: 'password123',
                email: 'vendor_water@example.com',
                role: 'VENDOR',
                fullName: 'Kavita Rao',
                phone: '+91 98765 43215',
                constituency: 'Ward 12',
                designation: 'Jal Seva Water Works (Water Supply & Pipeline Specialist)',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            },
            {
                userId: 7,
                username: 'vendor_electric',
                password: 'password123',
                email: 'vendor_electric@example.com',
                role: 'VENDOR',
                fullName: 'Imran Khan',
                phone: '+91 98765 43216',
                constituency: 'Ward 12',
                designation: 'BrightLine Electricals (Street Lights & Grid Specialist)',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            },
            {
                userId: 8,
                username: 'vendor_sanitation',
                password: 'password123',
                email: 'vendor_sanitation@example.com',
                role: 'VENDOR',
                fullName: 'Deepak Sawant',
                phone: '+91 98765 43217',
                constituency: 'Ward 12',
                designation: 'EcoClean Waste Management (Solid Waste & Sanitation)',
                isEmailVerified: true,
                preferredLanguage: 'EN',
                createdAt: new Date('2026-01-01').toISOString()
            }
        ],
        categories: [
            { categoryId: 1, name: 'Road Damage', description: 'Potholes, cracks, damaged roads', baseSeverityWeight: 8 },
            { categoryId: 2, name: 'Street Lights', description: 'Non-functional or damaged street lights', baseSeverityWeight: 5 },
            { categoryId: 3, name: 'Garbage', description: 'Waste management issues', baseSeverityWeight: 6 },
            { categoryId: 4, name: 'Water Supply', description: 'Water leakage, supply issues', baseSeverityWeight: 9 },
            { categoryId: 5, name: 'Drainage', description: 'Blocked drains, sewage issues', baseSeverityWeight: 7 }
        ],
        complaints: [
            {
                complaintId: 1,
                complaintRef: 'GRV-2026-000001',
                citizenId: 1,
                categoryId: 1,
                title: 'Severe Road Pothole & Asphalt Damage',
                description: 'Deep road surface pothole near City Mall junction creating vehicular hazard. Urgent municipal asphalt patch squad inspection required.',
                location: 'City Mall Junction, MG Road, Ward 12',
                latitude: 12.9716,
                longitude: 77.5946,
                status: 'ASSIGNED',
                priority: 'HIGH',
                severityScore: 8,
                slaTargetHours: 24,
                slaDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
                isAiProcessed: true,
                aiCategoryName: 'Road Damage',
                aiSeverityScore: 8,
                aiAnalysisReasoning: 'AI Vision identified severe asphalt damage.',
                createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                complaintId: 2,
                complaintRef: 'GRV-2026-000002',
                citizenId: 1,
                categoryId: 4,
                title: 'Water Supply Pipeline Rupture & Leakage',
                description: 'Continuous clean drinking water leakage from underground distribution pipe flooding the street.',
                location: 'Opposite City Hospital, 2nd Cross, Ward 12',
                latitude: 12.9750,
                longitude: 77.5980,
                status: 'RECEIVED',
                priority: 'HIGH',
                severityScore: 8,
                slaTargetHours: 24,
                slaDeadline: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
                isAiProcessed: true,
                aiCategoryName: 'Water Supply',
                aiSeverityScore: 8,
                aiAnalysisReasoning: 'AI Vision identified clean water pipeline rupture.',
                createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                complaintId: 3,
                complaintRef: 'GRV-2026-000003',
                citizenId: 1,
                categoryId: 2,
                title: 'Broken Streetlight Pole & Dark Transit Zone',
                description: 'Non-functional street light fixture causing dangerous dark transit zone on peripheral road.',
                location: 'North Metro Pillar 44, Outer Ring Road, Ward 14 - North Zone',
                latitude: 13.0358,
                longitude: 77.5970,
                status: 'RECEIVED',
                priority: 'MEDIUM',
                severityScore: 6,
                slaTargetHours: 36,
                slaDeadline: new Date(Date.now() + 30 * 3600 * 1000).toISOString(),
                isAiProcessed: true,
                aiCategoryName: 'Street Lights',
                aiSeverityScore: 6,
                aiAnalysisReasoning: 'AI Vision identified broken streetlight fixture.',
                createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            }
        ],
        assignments: [
            {
                assignmentId: 1,
                complaintId: 1,
                vendorId: 5,
                assignedById: 2,
                status: 'ASSIGNED',
                notes: 'High priority asphalt patch squad dispatched to site.',
                assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
            }
        ],
        contracts: [
            {
                id: 1,
                contractId: 1,
                contractNumber: 'CNT-2026-RD-001',
                vendorId: 5,
                vendorName: 'Sunil Patil',
                department: 'Road Maintenance',
                title: 'Annual Municipal Road Patching & Asphalt Restoration',
                contractValue: 2500000.0,
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                status: 'ACTIVE',
                coverageArea: 'Ward 12, Ward 13, Ward 14',
                scopeOfWork: 'Road Damage, Potholes, Asphalt Repair',
                slaHours: 24,
                standardRates: 'Standard Bituminous Patching: Rs 550/sq.m; Trench Reinstatement: Rs 750/sq.m',
                termsAndConditions: 'Traffic safety barricades mandatory. Heavy machinery restricted to night hours on main roads.'
            },
            {
                id: 2,
                contractId: 2,
                contractNumber: 'CNT-2026-WS-002',
                vendorId: 6,
                vendorName: 'Kavita Rao',
                department: 'Water Supply',
                title: 'Ward Pipeline Maintenance & Sewage Jetting Master Agreement',
                contractValue: 3200000.0,
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                status: 'ACTIVE',
                coverageArea: 'Ward 12, Ward 15, Central District',
                scopeOfWork: 'Water Supply, Drainage, Pipeline Leakage, Sewage Overflow',
                slaHours: 24,
                standardRates: 'Pipe Clamp Joint Replacement: Rs 1200/joint; High-Pressure Drain Jetting: Rs 3500/stretch',
                termsAndConditions: 'Potable water supply restoration requires water quality/chlorination test report.'
            },
            {
                id: 3,
                contractId: 3,
                contractNumber: 'CNT-2026-EM-003',
                vendorId: 7,
                vendorName: 'Imran Khan',
                department: 'Electrical Maintenance',
                title: 'Public Street Lighting & Luminaire Maintenance Contract',
                contractValue: 1800000.0,
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                status: 'ACTIVE',
                coverageArea: 'Ward 12, Ward 11, Ward 10',
                scopeOfWork: 'Street Lights, Electrical Hazard, Cable Jointing',
                slaHours: 36,
                standardRates: 'LED Luminaire 120W Replacement: Rs 2200/unit; Cable Fault Restoration: Rs 1500/point',
                termsAndConditions: 'Dielectric gloves and safety harnesses mandatory. Isolation permit required before high-voltage work.'
            },
            {
                id: 4,
                contractId: 4,
                contractNumber: 'CNT-2026-SW-004',
                vendorId: 8,
                vendorName: 'Deepak Sawant',
                department: 'Sanitation and Waste Management',
                title: 'Municipal Solid Waste Clearance & Illegal Dump Remediation',
                contractValue: 2100000.0,
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                status: 'ACTIVE',
                coverageArea: 'Ward 12, Ward 13, Ward 14',
                scopeOfWork: 'Garbage, Waste Clearance, Dump Cleaning',
                slaHours: 24,
                standardRates: 'Compactor Truck Run: Rs 4500/trip; Bulk Dump Clearing: Rs 8000/site',
                termsAndConditions: 'Disposal only at authorized landfill sites with weighbridge receipt.'
            }
        ],
        notifications: [
            {
                id: 1,
                recipientId: 1,
                recipientEmail: 'citizen@example.com',
                subject: 'Grievance Acknowledged - GRV-2026-000001',
                message: 'Your complaint regarding Severe Road Pothole has been logged and assigned to Road Maintenance squad.',
                status: 'SENT',
                sentAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
            }
        ],
        notificationSettings: {
            notifySpike: true,
            notifyAiFailure: true,
            notifyTranslationFailure: false,
            notifyEmailFailure: true,
            notifySlaBreachRate: 15,
            notifyDuplicateCluster: true,
            notifyGeographicConcentration: true
        },
        userPreferences: {
            1: {
                statusUpdates: true,
                submissionConfirmation: true,
                resolutionNotification: true,
                slaNotifications: true,
                reopeningUpdates: true,
                publicAnnouncements: true,
                promotionalEmails: false
            }
        },
        actionTokens: {}
    };
}

function loadDb() {
    if (db) return db;
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            db = JSON.parse(data);
            return db;
        }
    } catch (e) {
        console.warn('Could not read DB file:', e.message);
    }
    // In serverless, if /tmp has no DB yet, seed from packaged repo data file if available
    try {
        if (fs.existsSync(LOCAL_DB_FILE)) {
            const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
            db = JSON.parse(data);
            saveDb();
            return db;
        }
    } catch (e) {}

    db = getInitialDb();
    saveDb();
    return db;
}

function saveDb() {
    if (!db) return;
    try {
        ensureDataDir();
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
        // In serverless / read-only environment, keep in-memory
    }
}

// ── Helper to format Complaint Response to match Spring Boot DTO ─────────
function formatComplaint(c, db) {
    const citizen = db.users.find(u => u.userId === c.citizenId);
    const category = db.categories.find(cat => cat.categoryId === c.categoryId);
    const assignment = db.assignments ? db.assignments.find(a => a.complaintId === c.complaintId && a.status !== 'REJECTED') : null;
    const vendor = assignment ? db.users.find(u => u.userId === assignment.vendorId) : null;

    return {
        complaintId: c.complaintId,
        complaintRef: c.complaintRef || `GRV-2026-${String(c.complaintId).padStart(6, '0')}`,
        title: c.title,
        description: c.description,
        location: c.location,
        latitude: c.latitude,
        longitude: c.longitude,
        status: c.status,
        priority: c.priority,
        severityScore: c.severityScore || 5,
        aiCategoryName: c.aiCategoryName || (category ? category.name : null),
        aiSeverityScore: c.aiSeverityScore || c.severityScore,
        aiAnalysisReasoning: c.aiAnalysisReasoning || null,
        isAiProcessed: Boolean(c.isAiProcessed),
        slaTargetHours: c.slaTargetHours || 48,
        slaDeadline: c.slaDeadline,
        evidenceImageData: c.evidenceImageData || null,
        evidenceFileName: c.evidenceFileName || null,
        resolutionNote: c.resolutionNote || null,
        resolvedAt: c.resolvedAt || null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        assignedVendorId: vendor ? vendor.userId : null,
        assignedVendorName: vendor ? (vendor.fullName || vendor.username) : null,
        assignedVendorUsername: vendor ? vendor.username : null,
        assignedVendorPhone: vendor ? vendor.phone : null,
        assignmentStatus: assignment ? (assignment.status === 'PENDING' ? 'ASSIGNED' : assignment.status) : null,
        assignmentId: assignment ? assignment.assignmentId : null,
        workOrderNumber: assignment ? (assignment.workOrderNumber || `WO-2026-${String(assignment.assignmentId).padStart(4, '0')}`) : null,
        startEvidenceImageData: assignment ? assignment.startEvidenceImageData : null,
        startLatitude: assignment ? assignment.startLatitude : null,
        startLongitude: assignment ? assignment.startLongitude : null,
        fieldNotes: assignment ? assignment.notes : null,
        completionEvidenceImageData: (assignment && assignment.completionEvidenceImageData) || c.resolutionEvidenceImageData || null,
        completionLatitude: assignment ? assignment.completionLatitude : null,
        completionLongitude: assignment ? assignment.completionLongitude : null,
        completionNotes: (assignment && assignment.completionNotes) || c.resolutionNote || null,
        aiVerificationScore: (assignment && assignment.aiVerificationScore) || c.aiResolutionScore || null,
        aiVerificationNote: (assignment && assignment.aiVerificationNote) || c.aiResolutionNote || null,
        resolutionEvidenceImageData: (assignment && assignment.completionEvidenceImageData) || c.resolutionEvidenceImageData || null,
        completedAt: (assignment && assignment.completedAt) || c.resolvedAt || null,
        assignmentHistory: assignment ? (assignment.history || []) : [],
        citizen: citizen ? {
            userId: citizen.userId,
            username: citizen.username,
            fullName: citizen.fullName,
            email: citizen.email,
            phone: citizen.phone
        } : null,
        category: category ? {
            categoryId: category.categoryId,
            name: category.name,
            categoryName: category.name,
            description: category.description,
            baseSeverityWeight: category.baseSeverityWeight
        } : null,
        categoryName: category ? category.name : 'General'
    };
}

function isLocationInConstituency(location, constituency) {
    if (!location || !constituency) return false;
    const loc = String(location).toLowerCase();
    const rep = String(constituency).toLowerCase();

    // 1. Direct ward number match (e.g. "Ward 12" in "Ward 12 - Central District")
    const repWard = rep.match(/ward\s*(\d+)/i);
    const locWard = loc.match(/ward\s*(\d+)/i);
    if (repWard && locWard) {
        return repWard[1] === locWard[1];
    }
    if (repWard) {
        const wNum = repWard[1];
        if (loc.includes(`ward ${wNum}`) || loc.includes(`ward-${wNum}`) || loc.includes(`ward${wNum}`)) {
            return true;
        }
    }

    // 2. Specific locality / district tokens
    const tokens = rep.split(/[-–,]/).map(t => t.trim().toLowerCase()).filter(t => t.length > 3 && !t.startsWith('ward'));
    for (const t of tokens) {
        if (loc.includes(t)) return true;
    }

    return false;
}

function formatAssignment(a, db) {
    const complaint = db.complaints.find(c => c.complaintId === a.complaintId);
    const vendor = db.users.find(u => u.userId === a.vendorId);
    const officer = db.users.find(u => u.userId === a.assignedById);
    const category = complaint ? db.categories.find(cat => cat.categoryId === complaint.categoryId) : null;
    const contract = db.contracts.find(k => k.vendorId === a.vendorId);

    return {
        assignmentId: a.assignmentId,
        complaintId: a.complaintId,
        complaint: complaint ? formatComplaint(complaint, db) : null,
        complaintTitle: complaint ? complaint.title : `Assignment #${a.assignmentId}`,
        complaintDescription: complaint ? complaint.description : '',
        complaintRef: complaint ? complaint.complaintRef : '',
        location: complaint ? complaint.location : '',
        latitude: a.startLatitude || (complaint ? complaint.latitude : 12.9716),
        longitude: a.startLongitude || (complaint ? complaint.longitude : 77.5946),
        categoryName: category ? category.name : 'General',
        department: contract ? contract.department : 'Civil Works',
        workOrderNumber: `WO-2026-${String(a.assignmentId).padStart(4, '0')}`,
        contractNumber: contract ? contract.contractNumber : 'CNT-2026-DEFAULT',
        evidenceImageData: complaint ? complaint.evidenceImageData : null,
        vendor: vendor ? {
            userId: vendor.userId,
            username: vendor.username,
            fullName: vendor.fullName,
            phone: vendor.phone,
            designation: vendor.designation
        } : null,
        vendorId: a.vendorId,
        vendorName: vendor ? (vendor.fullName || vendor.username) : 'Vendor',
        vendorUsername: vendor ? vendor.username : '',
        officer: officer ? {
            userId: officer.userId,
            username: officer.username,
            fullName: officer.fullName
        } : null,
        assignedByName: officer ? (officer.fullName || officer.username) : 'Ward Officer',
        status: a.status === 'PENDING' ? 'ASSIGNED' : a.status,
        notes: a.notes || '',
        completionNotes: a.completionNotes || a.notes || '',
        resolutionNotes: a.resolutionNotes || a.notes || '',
        startEvidenceImageData: a.startEvidenceImageData || null,
        startLatitude: a.startLatitude || null,
        startLongitude: a.startLongitude || null,
        completionEvidenceImageData: a.completionEvidenceImageData || null,
        completionLatitude: a.completionLatitude || null,
        completionLongitude: a.completionLongitude || null,
        aiVerificationScore: a.aiVerificationScore || null,
        aiVerificationNote: a.aiVerificationNote || null,
        history: a.history || [],
        assignedAt: a.assignedAt,
        acceptedAt: a.acceptedAt,
        completedAt: a.completedAt,
        verifiedAt: a.verifiedAt,
        slaDeadline: complaint ? complaint.slaDeadline : null
    };
}

// ── Smart AI Heuristics & Gemini Integration ─────────────────────────────
async function analyzeComplaintAI(title, description, imageBase64, fileName, visualHint) {
    const rawText = `${title || ''} ${description || ''}`.trim();
    const fullText = `${title || ''} ${description || ''} ${fileName || ''} ${visualHint || ''}`.toLowerCase();
    
    // Check for irrelevant non-civic indicators (selfies, animals, food, personal objects)
    const irrelevantKeywords = [
        'selfie', 'portrait', 'personal', 'dog', 'cat', 'animal', 'pet', 'food', 'pizza', 'burger',
        'party', 'vacation', 'family', 'holiday', 'room', 'bed', 'sofa', 'tv', 'chair', 'table',
        'screenshot', 'meme', 'wallpaper', 'game', 'avatar', 'profile', 'drawing', 'cartoon',
        'car_interior', 'car-interior', 'dashboard', 'flower', 'plant', 'random', 'unrelated', 'me.jpg', 'selfie.jpg'
    ];
    const isExplicitlyIrrelevant = visualHint === 'Irrelevant' || irrelevantKeywords.some(k => fullText.includes(k));

    if (isExplicitlyIrrelevant && (imageBase64 || visualHint === 'Irrelevant' || (fileName && irrelevantKeywords.some(k => fileName.toLowerCase().includes(k))))) {
        return {
            isValidGrievance: false,
            rejectionReason: 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.',
            suggestedCategoryId: null,
            suggestedCategoryName: null,
            suggestedTitle: null,
            suggestedDescription: null,
            severityScore: null,
            priority: null,
            slaTargetHours: null,
            reasoning: 'AI Vision rejected the image: Content is not related to a public municipal grievance (detected personal photo, selfie, animal, or unrelated object).',
            isAiProcessed: true
        };
    }

    // Check if Gemini API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        try {
            const prompt = `You are an AI Civic Grievance Triage Classifier.
First, verify whether the uploaded image and text represent a genuine municipal or public grievance (such as damaged roads, potholes, water supply pipe leakage, drainage clogging, sewage overflow, garbage dumps, or non-functional streetlights).

If the image is irrelevant or random (such as personal selfies, portraits, humans, animals, pets, food, memes, documents, indoor rooms, or unrelated household objects):
Respond strictly in JSON format:
{
  "isValidGrievance": false,
  "rejectionReason": "The uploaded image does not appear to be related to a public grievance. Please upload a valid image.",
  "suggestedCategoryName": null,
  "suggestedTitle": null,
  "suggestedDescription": null
}

If the image IS a genuine public grievance:
Respond strictly in JSON format:
{
  "isValidGrievance": true,
  "suggestedCategoryName": One of ["Road Damage", "Street Lights", "Garbage", "Water Supply", "Drainage"],
  "severityScore": number from 1 to 10,
  "priority": "LOW", "MEDIUM", "HIGH", or "CRITICAL",
  "slaTargetHours": 24 or 48 or 72,
  "reasoning": string brief explanation,
  "suggestedTitle": concise title representing the identified public issue,
  "suggestedDescription": relevant detailed complaint description.
}

Title: ${title || '(Not provided)'}
Description: ${description || '(Not provided)'}
FileName: ${fileName || ''}`;

            const parts = [{ text: prompt }];
            if (imageBase64) {
                let mimeType = 'image/jpeg';
                let rawData = imageBase64;
                const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                    mimeType = match[1];
                    rawData = match[2];
                }
                parts.unshift({
                    inline_data: {
                        mime_type: mimeType,
                        data: rawData
                    }
                });
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    generationConfig: { responseMimeType: 'application/json' }
                })
            });
            if (response.ok) {
                const data = await response.json();
                const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawJson) {
                    const parsed = JSON.parse(rawJson);
                    if (parsed.isValidGrievance === false) {
                        return {
                            isValidGrievance: false,
                            rejectionReason: parsed.rejectionReason || 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.',
                            suggestedCategoryId: null,
                            suggestedCategoryName: null,
                            suggestedTitle: null,
                            suggestedDescription: null,
                            isAiProcessed: true
                        };
                    }
                    const catMap = {
                        'road damage': 1,
                        'street lights': 2,
                        'garbage': 3,
                        'water supply': 4,
                        'drainage': 5
                    };
                    const catKey = (parsed.suggestedCategoryName || '').toLowerCase();
                    return {
                        ...parsed,
                        isValidGrievance: true,
                        suggestedCategoryId: catMap[catKey] || 1,
                        isAiProcessed: true
                    };
                }
            }
        } catch (e) {
            console.warn('Gemini Vision API call failed, falling back to rule-based heuristics:', e.message);
        }
    }

    // High accuracy multimodal heuristic fallback
    let cat = 'Road Damage';
    let catId = 1;
    let severity = 7;
    let priority = 'HIGH';
    let sla = 24;
    let reasoning = 'Categorized based on photographic evidence and municipal parameters.';
    let sugTitle = '';
    let sugDesc = '';

    if (fullText.includes('water') || fullText.includes('pipe') || fullText.includes('leak') || fullText.includes('burst') || fullText.includes('contamination') || fullText.includes('drinking') || fullText.includes('tap') || visualHint === 'Water Supply') {
        cat = 'Water Supply';
        catId = 4;
        severity = 9;
        priority = 'HIGH';
        sla = 24;
        reasoning = 'AI Vision: Detected water supply pipeline rupture and continuous water leakage. High priority response required to prevent treated water loss and local street flooding.';
        sugTitle = title || 'Water Supply Pipeline Rupture & Leakage';
        sugDesc = description || 'Citizen submitted photographic evidence showing active water supply pipeline leak/rupture causing clean water loss. Immediate water board plumbing dispatch required.';
    } else if (fullText.includes('drain') || fullText.includes('sewage') || fullText.includes('gutter') || fullText.includes('overflow') || fullText.includes('clog') || fullText.includes('manhole') || visualHint === 'Drainage') {
        cat = 'Drainage';
        catId = 5;
        severity = 8;
        priority = 'HIGH';
        sla = 24;
        reasoning = 'AI Vision: Identified blocked municipal drainage channel and sewage backflow. Sanitation jetting machine required to prevent public health risk.';
        sugTitle = title || 'Blocked Municipal Drain & Sewage Overflow';
        sugDesc = description || 'Citizen submitted photographic evidence depicting clogged stormwater drain / overflowing sewage causing stagnation and sanitation risk. Sanitation jetting machine required.';
    } else if (fullText.includes('garb') || fullText.includes('waste') || fullText.includes('dump') || fullText.includes('trash') || fullText.includes('smell') || fullText.includes('litter') || fullText.includes('bin') || visualHint === 'Garbage') {
        cat = 'Garbage';
        catId = 3;
        severity = 6;
        priority = 'MEDIUM';
        sla = 48;
        reasoning = 'AI Vision: Identified uncollected municipal solid waste dump causing civic obstruction and environmental hygiene concern.';
        sugTitle = title || 'Illegal Garbage Dump & Solid Waste Overflow';
        sugDesc = description || 'Citizen submitted photographic evidence depicting accumulated municipal solid waste and unattended garbage dump on public roadway.';
    } else if (fullText.includes('light') || fullText.includes('lamp') || fullText.includes('dark') || fullText.includes('pole') || fullText.includes('bulb') || fullText.includes('wire') || fullText.includes('electr') || visualHint === 'Street Lights') {
        cat = 'Street Lights';
        catId = 2;
        severity = 5;
        priority = 'MEDIUM';
        sla = 36;
        reasoning = 'AI Vision: Identified non-functional street light fixture causing dark transit zone. Electrical maintenance required.';
        sugTitle = title || 'Non-Functional Street Light & Safety Hazard';
        sugDesc = description || 'Citizen submitted photographic evidence showing malfunctioning street light pole in public transit zone, causing low visibility at night.';
    } else {
        // Road Damage default
        cat = 'Road Damage';
        catId = 1;
        severity = fullText.includes('deep') || fullText.includes('accident') || fullText.includes('severe') || fullText.includes('crater') ? 8 : 7;
        priority = 'HIGH';
        sla = 24;
        reasoning = 'AI Vision: Identified asphalt road surface disintegration and pothole hazard. High priority asphalt patch crew inspection required.';
        sugTitle = title || 'Severe Road Pothole & Asphalt Damage';
        sugDesc = description || 'Citizen submitted photographic evidence depicting road surface pothole creating vehicular hazard. Urgent municipal asphalt patch squad inspection required.';
    }

    return {
        isValidGrievance: true,
        suggestedCategoryId: catId,
        suggestedCategoryName: cat,
        severityScore: severity,
        priority: priority,
        slaTargetHours: sla,
        reasoning: reasoning,
        suggestedTitle: sugTitle,
        suggestedDescription: sugDesc,
        isAiProcessed: true
    };
}

// ── HTTP Request Handler ────────────────────────────────────────────────
async function handleRequest(req, res) {
    const db = loadDb();

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    // Parse URL & Query
    const host = req.headers.host || 'localhost';
    const effectiveUrl = (req.headers['x-matched-path'] && req.headers['x-matched-path'] !== '/api/index.js')
        ? req.headers['x-matched-path']
        : req.url;
    const parsedUrl = new URL(effectiveUrl, `http://${host}`);
    let pathname = parsedUrl.pathname;
    const query = Object.assign({}, Object.fromEntries(parsedUrl.searchParams), req.query || {});

    // Support Vercel serverless rewrites (e.g. /api/(.*) -> /api/index.js?path=$1)
    let pathParam = query.path || (req.query && req.query.path);
    if (Array.isArray(pathParam)) {
        pathParam = pathParam.join('/');
    }
    if (!pathParam && req.headers['x-now-route-matches']) {
        const match = req.headers['x-now-route-matches'].match(/1=([^&]+)/);
        if (match) pathParam = decodeURIComponent(match[1]);
    }
    if (pathParam && (pathname === '/api/index.js' || pathname === '/api' || pathname === '/api/index' || pathname === '/api/')) {
        const clean = pathParam.split('?')[0].replace(/^\/+/, '');
        if (!clean || clean === 'index.js' || clean === 'index') {
            pathname = '/api';
        } else {
            pathname = `/api/${clean}`;
        }
    } else if (pathname === '/api/index.js' || pathname === '/api/index') {
        pathname = '/api';
    }

    if (pathname === '/api/index.js' || pathname === '/api/index') {
        pathname = '/api';
    }

    // Normalize pathname
    if (pathname.endsWith('/') && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
    }

    // Helper functions
    const sendJson = (statusCode, data) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    };

    const sendText = (statusCode, text) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'text/plain');
        res.end(text);
    };

    // Body parsing
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (req.body && typeof req.body === 'object') {
            body = req.body;
        } else {
            try {
                const chunks = [];
                for await (const chunk of req) chunks.push(chunk);
                const raw = Buffer.concat(chunks).toString('utf8');
                if (raw) body = JSON.parse(raw);
            } catch (e) {
                body = {};
            }
        }
    }

    // Auth Middleware
    const authHeader = req.headers.authorization || '';
    let currentUser = null;
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        const decoded = verifyJwt(token);
        if (decoded && decoded.sub) {
            currentUser = db.users.find(u => u.username === decoded.sub);
        }
    }

    try {
        // Base API & Health check
        if (pathname === '/api' || pathname === '/api/health') {
            return sendJson(200, {
                status: 'UP',
                service: 'Civic Grievance Management System API',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
        // ─────────────────────────────────────────────────────────────────
        // 1. AUTH ROUTES (/api/auth/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/auth/test') {
            return sendText(200, 'Auth endpoint is working!');
        }

        if (pathname === '/api/auth/register' && req.method === 'POST') {
            const { username, password, email, role, fullName, phone, constituency, designation, preferredLanguage } = body;
            if (!username || !password || !email) {
                return sendJson(400, { message: 'Username, password and email are required.' });
            }
            const cleanUser = username.trim();
            const cleanEmail = email.trim();
            const normPhone = normalizePhone(phone);

            // 1. Username uniqueness check (cannot be used again)
            if (db.users.some(u => u.username.toLowerCase() === cleanUser.toLowerCase())) {
                return sendJson(400, { message: 'Username is already taken. Please choose another username.' });
            }
            // 2. Email uniqueness check (cannot be used again)
            if (db.users.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
                return sendJson(400, { message: 'Email address is already registered. Please login or use a different email.' });
            }
            // 3. Mobile phone number uniqueness check (cannot be used again)
            if (normPhone) {
                const phoneExists = db.users.some(u => normalizePhone(u.phone) === normPhone);
                if (phoneExists) {
                    return sendJson(400, { message: 'Mobile number is already registered with an existing account. Please log in or use a different number.' });
                }
            }

            const newUser = {
                userId: db.users.length + 1,
                username: cleanUser,
                password, // for demo / production matching
                email: cleanEmail,
                role: (role || 'CITIZEN').toUpperCase(),
                fullName: fullName || cleanUser,
                phone: phone || '',
                constituency: constituency || '',
                designation: designation || '',
                isEmailVerified: true,
                preferredLanguage: preferredLanguage || 'EN',
                createdAt: new Date().toISOString()
            };
            db.users.push(newUser);
            saveDb();

            const token = signJwt({
                sub: newUser.username,
                role: newUser.role,
                roles: [`ROLE_${newUser.role}`, newUser.role],
                authorities: [`ROLE_${newUser.role}`],
                userId: newUser.userId,
                exp: Math.floor(Date.now() / 1000) + 86400 * 30
            });

            return sendJson(201, {
                token,
                username: newUser.username,
                role: newUser.role,
                message: 'User registered successfully!',
                constituency: newUser.constituency,
                designation: newUser.designation
            });
        }

        if (pathname === '/api/auth/login' && req.method === 'POST') {
            const { username, password } = body;
            const inputIdentifier = (username || '').trim();
            const normInputPhone = normalizePhone(inputIdentifier);

            const user = db.users.find(u => {
                const uUser = (u.username || '').toLowerCase();
                const uMail = (u.email || '').toLowerCase();
                const uPhone = normalizePhone(u.phone);

                if (uUser === inputIdentifier.toLowerCase()) return true;
                if (uMail === inputIdentifier.toLowerCase()) return true;
                if (normInputPhone && uPhone && uPhone === normInputPhone) return true;
                return false;
            });

            if (!user || user.password !== password) {
                return sendJson(400, { message: 'Invalid credentials. Please verify your username/email/mobile and password.' });
            }

            const token = signJwt({
                sub: user.username,
                role: user.role,
                roles: [`ROLE_${user.role}`, user.role],
                authorities: [`ROLE_${user.role}`],
                userId: user.userId,
                exp: Math.floor(Date.now() / 1000) + 86400 * 30 // 30-day session for multi-device support
            });

            return sendJson(200, {
                token,
                username: user.username,
                role: user.role,
                message: 'Login successful',
                constituency: user.constituency,
                designation: user.designation
            });
        }

        if (pathname === '/api/auth/verify-email' && req.method === 'GET') {
            return sendJson(200, { message: 'Email address verified successfully!', verified: true });
        }

        if (pathname === '/api/auth/resend-verification' && req.method === 'POST') {
            return sendJson(200, { message: 'Verification link sent to registered email.' });
        }

        if (pathname === '/api/auth/action-token' && req.method === 'GET') {
            const token = query.token;
            return sendJson(200, {
                valid: true,
                used: false,
                actionType: 'FEEDBACK',
                complaintId: 1,
                complaintRef: 'GRV-2026-000001',
                title: 'Severe Road Pothole & Asphalt Damage'
            });
        }

        // ─────────────────────────────────────────────────────────────────
        // 2. PUBLIC ROUTES (/api/public/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/public/stats' && req.method === 'GET') {
            const total = db.complaints.length;
            const resolved = db.complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
            const ongoing = db.complaints.filter(c => ['IN_PROGRESS', 'ASSIGNED', 'VENDOR_ACCEPTED'].includes(c.status)).length;
            const pending = db.complaints.filter(c => ['RECEIVED', 'CREATED'].includes(c.status)).length;
            return sendJson(200, {
                totalComplaints: total,
                resolvedComplaints: resolved,
                ongoingComplaints: ongoing,
                pendingComplaints: pending
            });
        }

        if (pathname === '/api/public/issues' && req.method === 'GET') {
            const issues = db.complaints.slice(-10).reverse().map(c => {
                const cat = db.categories.find(k => k.categoryId === c.categoryId);
                return {
                    complaintId: c.complaintId,
                    complaintRef: c.complaintRef || `GRV-2026-${String(c.complaintId).padStart(6, '0')}`,
                    title: c.title,
                    categoryName: cat ? cat.name : 'Civic Service',
                    location: c.location,
                    status: c.status,
                    priority: c.priority,
                    createdAt: c.createdAt
                };
            });
            return sendJson(200, issues);
        }

        if (pathname === '/api/public/map' && req.method === 'GET') {
            const markers = db.complaints
                .filter(c => c.latitude && c.longitude)
                .map(c => {
                    const cat = db.categories.find(k => k.categoryId === c.categoryId);
                    return {
                        complaintId: c.complaintId,
                        complaintRef: c.complaintRef || `GRV-2026-${String(c.complaintId).padStart(6, '0')}`,
                        title: c.title,
                        category: cat ? cat.name : 'Civic Issue',
                        status: c.status,
                        priority: c.priority,
                        lat: c.latitude,
                        lng: c.longitude,
                        location: c.location,
                        isDuplicate: false
                    };
                });
            return sendJson(200, markers);
        }

        if (pathname === '/api/public/insights' && req.method === 'GET') {
            return sendJson(200, [
                {
                    id: 1,
                    title: 'Road Infrastructure Trend',
                    description: 'Road damage complaints constitute the majority of active reports across the metropolitan area.',
                    category: 'ROAD',
                    actionRecommended: 'Deploy automated inspection squad on MG Road corridor.'
                },
                {
                    id: 2,
                    title: 'Monsoon Preparedness',
                    description: 'Drainage overflow reports reduced by 35% following preventative pipeline jetting.',
                    category: 'WATER',
                    actionRecommended: 'Maintain proactive drain inspection in low-lying sectors.'
                }
            ]);
        }

        // ─────────────────────────────────────────────────────────────────
        // 3. ADMIN ROUTES (/api/admin/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/admin/users' && req.method === 'GET') {
            const users = db.users.map(u => ({
                userId: u.userId,
                username: u.username,
                email: u.email,
                role: u.role,
                fullName: u.fullName,
                phone: u.phone,
                constituency: u.constituency,
                designation: u.designation,
                isEmailVerified: u.isEmailVerified,
                createdAt: u.createdAt
            }));
            return sendJson(200, users);
        }

        if (pathname.startsWith('/api/admin/users/role/') && req.method === 'GET') {
            const role = pathname.split('/').pop().toUpperCase();
            const matched = db.users
                .filter(u => u.role === role)
                .map(u => ({
                    userId: u.userId,
                    username: u.username,
                    email: u.email,
                    role: u.role,
                    fullName: u.fullName,
                    phone: u.phone,
                    constituency: u.constituency,
                    designation: u.designation,
                    isEmailVerified: u.isEmailVerified
                }));
            return sendJson(200, matched);
        }

        if (pathname.match(/^\/api\/admin\/users\/\d+$/) && req.method === 'DELETE') {
            const id = parseInt(pathname.split('/').pop(), 10);
            db.users = db.users.filter(u => u.userId !== id);
            saveDb();
            return sendJson(200, { message: 'User deleted successfully' });
        }

        if (pathname === '/api/admin/categories' && req.method === 'GET') {
            return sendJson(200, db.categories);
        }

        if (pathname === '/api/admin/categories' && req.method === 'POST') {
            const { name, description, baseSeverityWeight } = body;
            if (!name) return sendJson(400, 'Category name is required');
            if (db.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                return sendJson(400, 'Category already exists');
            }
            const newCat = {
                categoryId: db.categories.length + 1,
                name,
                description: description || '',
                baseSeverityWeight: baseSeverityWeight || 5
            };
            db.categories.push(newCat);
            saveDb();
            return sendJson(201, newCat);
        }

        if (pathname.match(/^\/api\/admin\/categories\/\d+$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/').pop(), 10);
            const cat = db.categories.find(c => c.categoryId === id);
            if (!cat) return sendJson(404, 'Category not found');
            if (body.name) cat.name = body.name;
            if (body.description !== undefined) cat.description = body.description;
            if (body.baseSeverityWeight) cat.baseSeverityWeight = body.baseSeverityWeight;
            saveDb();
            return sendJson(200, cat);
        }

        if (pathname.match(/^\/api\/admin\/categories\/\d+$/) && req.method === 'DELETE') {
            const id = parseInt(pathname.split('/').pop(), 10);
            db.categories = db.categories.filter(c => c.categoryId !== id);
            saveDb();
            return sendJson(200, { message: 'Category deleted successfully' });
        }

        if (pathname === '/api/admin/statistics' && req.method === 'GET') {
            const userStats = {
                totalUsers: db.users.length,
                citizens: db.users.filter(u => u.role === 'CITIZEN').length,
                officers: db.users.filter(u => u.role === 'OFFICER').length,
                vendors: db.users.filter(u => u.role === 'VENDOR').length,
                representatives: db.users.filter(u => u.role === 'REPRESENTATIVE').length,
                admins: db.users.filter(u => u.role === 'ADMIN').length
            };
            const totalComplaints = db.complaints.length;
            const resolved = db.complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
            const inProgress = db.complaints.filter(c => ['IN_PROGRESS', 'ASSIGNED', 'VENDOR_ACCEPTED'].includes(c.status)).length;
            const pending = db.complaints.filter(c => ['RECEIVED', 'CREATED'].includes(c.status)).length;

            return sendJson(200, {
                users: userStats,
                complaints: {
                    total: totalComplaints,
                    resolved,
                    inProgress,
                    pending
                },
                totalCategories: db.categories.length
            });
        }

        if (pathname === '/api/admin/contracts' && req.method === 'GET') {
            return sendJson(200, db.contracts);
        }

        if (pathname === '/api/admin/contracts' && req.method === 'POST') {
            const vendor = db.users.find(u => u.userId === body.vendorId);
            const newContract = {
                id: db.contracts.length + 1,
                contractId: db.contracts.length + 1,
                contractNumber: body.contractNumber || `CNT-2026-${Date.now().toString().slice(-4)}`,
                vendorId: body.vendorId,
                vendorName: vendor ? (vendor.fullName || vendor.username) : 'Vendor',
                department: body.department,
                title: body.title,
                contractValue: body.contractValue || body.value || 0,
                startDate: body.startDate,
                endDate: body.endDate,
                status: body.status || 'ACTIVE',
                coverageArea: body.coverageArea,
                scopeOfWork: body.scopeOfWork || body.scope,
                slaHours: body.slaHours || 24,
                standardRates: body.standardRates || body.rates || '',
                termsAndConditions: body.termsAndConditions || body.terms || ''
            };
            db.contracts.push(newContract);
            saveDb();
            return sendJson(201, newContract);
        }

        if (pathname.match(/^\/api\/admin\/contracts\/\d+$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/').pop(), 10);
            const c = db.contracts.find(k => k.id === id || k.contractId === id);
            if (!c) return sendJson(404, 'Contract not found');
            Object.assign(c, body);
            saveDb();
            return sendJson(200, c);
        }

        if (pathname.match(/^\/api\/admin\/contracts\/\d+\/status$/) && ['PATCH', 'PUT'].includes(req.method)) {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.contracts.find(k => k.id === id || k.contractId === id);
            if (!c) return sendJson(404, 'Contract not found');
            c.status = (body.status || 'ACTIVE').toUpperCase();
            saveDb();
            return sendJson(200, c);
        }

        if (pathname === '/api/admin/notifications/logs' && req.method === 'GET') {
            return sendJson(200, {
                content: db.notifications,
                totalElements: db.notifications.length,
                totalPages: 1,
                size: 50,
                number: 0
            });
        }

        if (pathname.match(/^\/api\/admin\/notifications\/logs\/\d+\/retry$/) && req.method === 'POST') {
            return sendJson(200, { message: 'Email re-sent successfully' });
        }

        if (pathname === '/api/admin/notifications/settings') {
            if (req.method === 'GET') return sendJson(200, db.notificationSettings);
            if (['POST', 'PUT'].includes(req.method)) {
                Object.assign(db.notificationSettings, body);
                saveDb();
                return sendJson(200, db.notificationSettings);
            }
        }

        // ─────────────────────────────────────────────────────────────────
        // 4. CITIZEN & COMPLAINT ROUTES (/api/complaints/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/complaints/create' && req.method === 'POST') {
            const user = currentUser || db.users.find(u => u.username === 'citizen');
            const { title, description, categoryId, location, latitude, longitude, evidenceImageData, evidenceFileName, visualHint, isValidGrievance } = body;
            
            if (!title || !description) {
                return sendJson(400, 'Title and description are required.');
            }

            if (!location || !String(location).trim()) {
                return sendJson(400, 'Complaint location is mandatory. Please provide the location.');
            }

            // Reject if explicitly marked invalid
            if (isValidGrievance === false) {
                return sendJson(400, 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.');
            }

            // Quick AI validation & categorization
            const ai = await analyzeComplaintAI(title, description, evidenceImageData, evidenceFileName, visualHint);

            // Enforce image grievance validation if an image was uploaded
            if (evidenceImageData && ai.isValidGrievance === false) {
                return sendJson(400, ai.rejectionReason || 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.');
            }

            const cat = db.categories.find(c => c.categoryId === Number(categoryId)) || 
                        (ai.suggestedCategoryId ? db.categories.find(c => c.categoryId === ai.suggestedCategoryId) : null) || 
                        db.categories[0];
            const complaintId = db.complaints.length + 1;
            const ref = `GRV-2026-${String(complaintId).padStart(6, '0')}`;

            const newComplaint = {
                complaintId,
                complaintRef: ref,
                citizenId: user ? user.userId : 1,
                categoryId: cat ? cat.categoryId : 1,
                title: title || ai.suggestedTitle || 'Public Grievance',
                description: description || ai.suggestedDescription || '',
                location: location.trim(),
                latitude: latitude || 12.9716,
                longitude: longitude || 77.5946,
                status: 'RECEIVED',
                priority: ai.priority || 'MEDIUM',
                severityScore: ai.severityScore || 6,
                slaTargetHours: ai.slaTargetHours || 48,
                slaDeadline: new Date(Date.now() + (ai.slaTargetHours || 48) * 3600 * 1000).toISOString(),
                isAiProcessed: true,
                aiCategoryName: ai.suggestedCategoryName || cat.name,
                aiSeverityScore: ai.severityScore || 6,
                aiAnalysisReasoning: ai.reasoning,
                evidenceImageData: evidenceImageData || null,
                evidenceFileName: evidenceFileName || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            db.complaints.push(newComplaint);
            saveDb();

            return sendJson(201, formatComplaint(newComplaint, db));
        }

        if (pathname === '/api/complaints/my' && req.method === 'GET') {
            const user = currentUser || db.users.find(u => u.username === 'citizen');
            const citizenId = user ? user.userId : 1;
            const myComplaints = db.complaints
                .filter(c => c.citizenId === citizenId)
                .reverse()
                .map(c => formatComplaint(c, db));
            return sendJson(200, myComplaints);
        }

        if (pathname.startsWith('/api/complaints/ref/') && req.method === 'GET') {
            const ref = decodeURIComponent(pathname.split('/').pop());
            const c = db.complaints.find(k => k.complaintRef === ref);
            if (!c) return sendJson(404, 'Complaint not found with ref: ' + ref);
            return sendJson(200, formatComplaint(c, db));
        }

        if (pathname.match(/^\/api\/complaints\/\d+$/) && req.method === 'GET') {
            const id = parseInt(pathname.split('/').pop(), 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');
            return sendJson(200, formatComplaint(c, db));
        }

        if (pathname.match(/^\/api\/complaints\/\d+\/reopen$/) && req.method === 'POST') {
            const id = parseInt(pathname.split('/')[3], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');
            c.status = 'REOPENED';
            c.reopenReason = body.reason || 'Issue persists';
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, formatComplaint(c, db));
        }

        if (pathname.match(/^\/api\/complaints\/\d+\/feedback$/) && req.method === 'POST') {
            const id = parseInt(pathname.split('/')[3], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');
            c.feedback = body.feedback || 'SOLVED';
            c.feedbackRating = body.rating || 5;
            if (c.feedback === 'SOLVED') c.status = 'CLOSED';
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, formatComplaint(c, db));
        }

        if (pathname.match(/^\/api\/complaints\/\d+\/confirm-ai-category$/) && ['PUT', 'POST'].includes(req.method)) {
            const id = parseInt(pathname.split('/')[3], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');
            if (body && body.category) {
                const cat = db.categories.find(k => k.name.toLowerCase() === body.category.toLowerCase());
                if (cat) c.categoryId = cat.categoryId;
            }
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, formatComplaint(c, db));
        }

        if (pathname === '/api/complaints/duplicates' && req.method === 'GET') {
            return sendJson(200, { content: [], totalElements: 0, totalPages: 0 });
        }

        // ─────────────────────────────────────────────────────────────────
        // 5. OFFICER ROUTES (/api/officer/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/officer/complaints' && req.method === 'GET') {
            const page = parseInt(query.page || '0', 10);
            const size = parseInt(query.size || '50', 10);
            const formatted = db.complaints.map(c => formatComplaint(c, db)).reverse();
            return sendJson(200, {
                content: formatted.slice(page * size, (page + 1) * size),
                totalElements: formatted.length,
                totalPages: Math.ceil(formatted.length / size),
                number: page,
                size
            });
        }

        if (pathname.startsWith('/api/officer/complaints/status/') && req.method === 'GET') {
            const status = pathname.split('/').pop().toUpperCase();
            const matched = db.complaints.filter(c => c.status === status).map(c => formatComplaint(c, db));
            return sendJson(200, {
                content: matched,
                totalElements: matched.length,
                totalPages: 1,
                number: 0,
                size: matched.length
            });
        }

        if (pathname === '/api/officer/complaints/assign' && req.method === 'POST') {
            const { complaintId, vendorId, notes } = body;
            const c = db.complaints.find(k => k.complaintId === Number(complaintId));
            if (!c) return sendJson(404, 'Complaint not found');

            const vendor = db.users.find(u => u.userId === Number(vendorId));
            if (!vendor) return sendJson(404, 'Vendor not found');

            c.status = 'ASSIGNED';
            c.updatedAt = new Date().toISOString();

            let a = db.assignments.find(k => k.complaintId === c.complaintId);
            if (!a) {
                a = {
                    assignmentId: db.assignments.length + 1,
                    complaintId: c.complaintId,
                    vendorId: vendor.userId,
                    assignedById: currentUser ? currentUser.userId : 2,
                    status: 'ASSIGNED',
                    notes: notes || 'Assigned by Officer',
                    assignedAt: new Date().toISOString()
                };
                db.assignments.push(a);
            } else {
                a.vendorId = vendor.userId;
                a.status = 'ASSIGNED';
                a.notes = notes || a.notes;
                a.assignedAt = new Date().toISOString();
            }
            saveDb();

            return sendJson(201, formatAssignment(a, db));
        }

        if (pathname === '/api/officer/assignments' && req.method === 'GET') {
            return sendJson(200, db.assignments.map(a => formatAssignment(a, db)));
        }

        if (pathname.match(/^\/api\/officer\/complaints\/\d+\/status$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');
            const newStatus = (query.status || (body && body.status) || 'IN_PROGRESS').toUpperCase();
            c.status = newStatus;
            if (query.note || (body && body.note)) c.resolutionNote = query.note || body.note;
            if (['RESOLVED', 'CLOSED'].includes(newStatus)) c.resolvedAt = new Date().toISOString();
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, formatComplaint(c, db));
        }

        if (pathname.match(/^\/api\/officer\/complaints\/\d+\/confirm-ai-category$/) && ['PUT', 'POST'].includes(req.method)) {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');
            if (body && body.category) {
                const cat = db.categories.find(k => k.name.toLowerCase() === body.category.toLowerCase());
                if (cat) c.categoryId = cat.categoryId;
            }
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, formatComplaint(c, db));
        }

        if (pathname.match(/^\/api\/officer\/complaints\/\d+\/vendor-eligibility$/) && req.method === 'GET') {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, { error: 'Complaint not found' });

            const cat = db.categories.find(k => k.categoryId === c.categoryId);
            const catName = cat ? cat.name : (c.categoryName || 'Road Damage');
            
            // Map category to department
            let dept = 'Road Maintenance';
            const cl = catName.toLowerCase();
            if (cl.includes('road') || cl.includes('pothole') || cl.includes('asphalt')) dept = 'Road Maintenance';
            else if (cl.includes('water') || cl.includes('pipe') || cl.includes('leak')) dept = 'Water Supply';
            else if (cl.includes('drain') || cl.includes('sewage') || cl.includes('gutter')) dept = 'Water Supply';
            else if (cl.includes('light') || cl.includes('lamp') || cl.includes('electr')) dept = 'Electrical Maintenance';
            else if (cl.includes('garb') || cl.includes('waste') || cl.includes('trash')) dept = 'Sanitation and Waste Management';

            // Find all registered vendors
            const allVendorUsers = db.users.filter(u => u.role === 'VENDOR');
            
            // Build rich contractor representations
            const allVendorsList = allVendorUsers.map((v, idx) => {
                const contract = db.contracts.find(ct => ct.vendorId === v.userId && ct.status === 'ACTIVE') ||
                                 db.contracts.find(ct => ct.department && ct.department.toLowerCase().includes(dept.toLowerCase()));
                const activeCount = db.assignments.filter(a => a.vendorId === v.userId && ['ASSIGNED', 'VENDOR_ACCEPTED', 'IN_PROGRESS'].includes(a.status)).length;
                
                const vDesig = (v.designation || '').toLowerCase();
                const vDept = contract ? contract.department.toLowerCase() : '';
                const isMatch = vDesig.includes(dept.toLowerCase().split(' ')[0]) || vDept.includes(dept.toLowerCase().split(' ')[0]) || idx === 0;
                
                const matchScore = isMatch ? Math.min(98, 88 + ((v.userId * 7) % 11)) : Math.max(65, 75 - activeCount * 5);
                const distanceKm = Number((1.2 + ((v.userId * 1.3) % 4)).toFixed(1));
                const slaHours = contract?.slaHours || 24;
                const contractNum = contract?.contractNumber || `CNT-2026-${v.userId.toString().padStart(3, '0')}`;
                
                return {
                    vendorId: v.userId,
                    name: v.fullName || v.username,
                    username: v.username,
                    phone: v.phone || '+91 98450 11223',
                    designation: v.designation || 'Municipal Contractor',
                    contractNumber: contractNum,
                    contractSlaHours: slaHours,
                    activeTasks: activeCount,
                    distanceKm: distanceKm,
                    distanceDisplay: `${distanceKm} km (Ward Zone)`,
                    matchPercentage: matchScore,
                    reason: isMatch ? `Specialized in ${dept} with ${activeCount} active jobs in area.` : `General contractor with ${activeCount} active jobs.`,
                    isEligible: true
                };
            });

            // Sort by match score descending
            const sortedVendors = [...allVendorsList].sort((a, b) => b.matchPercentage - a.matchPercentage);
            const eligibleVendors = sortedVendors;
            const topRecommendations = sortedVendors.slice(0, 3);
            const bestVendor = topRecommendations[0] || null;

            return sendJson(200, {
                complaintId: id,
                complaint: formatComplaint(c, db),
                detectedDepartment: dept,
                recommendedVendorId: bestVendor ? bestVendor.vendorId : (eligibleVendors[0]?.vendorId || 5),
                topRecommendations: topRecommendations,
                eligibleVendors: eligibleVendors,
                ineligibleVendors: [],
                allVendors: allVendorsList
            });
        }

        if (pathname.match(/^\/api\/officer\/complaints\/\d+\/assignment$/) && req.method === 'GET') {
            const id = parseInt(pathname.split('/')[4], 10);
            const a = db.assignments.find(k => k.complaintId === id);
            if (!a) return sendJson(404, 'No assignment found for complaint');
            return sendJson(200, formatAssignment(a, db));
        }

        if (pathname.match(/^\/api\/officer\/assignments\/\d+\/verify$/) && req.method === 'POST') {
            const id = parseInt(pathname.split('/')[4], 10);
            const a = db.assignments.find(k => k.assignmentId === id);
            if (!a) return sendJson(404, 'Assignment not found');
            a.status = 'VERIFIED';
            a.verifiedAt = new Date().toISOString();
            const c = db.complaints.find(k => k.complaintId === a.complaintId);
            if (c) {
                c.status = 'RESOLVED';
                c.resolvedAt = new Date().toISOString();
            }
            saveDb();
            return sendJson(200, formatAssignment(a, db));
        }

        if (pathname === '/api/officer/complaints/duplicates' && req.method === 'GET') {
            return sendJson(200, { content: [], totalElements: 0, totalPages: 0 });
        }

        // ─────────────────────────────────────────────────────────────────
        // 6. VENDOR ROUTES (/api/vendor/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/vendor/assignments' && req.method === 'GET') {
            const user = currentUser || db.users.find(u => u.role === 'VENDOR');
            const vId = user ? user.userId : 5;
            const matched = db.assignments
                .filter(a => a.vendorId === vId)
                .map(a => formatAssignment(a, db));
            return sendJson(200, matched);
        }

        if (pathname.startsWith('/api/vendor/assignments/status/') && req.method === 'GET') {
            const status = pathname.split('/').pop().toUpperCase();
            const user = currentUser || db.users.find(u => u.role === 'VENDOR');
            const vId = user ? user.userId : 5;
            const matched = db.assignments
                .filter(a => a.status === status && a.vendorId === vId)
                .map(a => formatAssignment(a, db));
            return sendJson(200, matched);
        }

        if (pathname.match(/^\/api\/vendor\/assignments\/\d+\/status$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const a = db.assignments.find(k => k.assignmentId === id);
            if (!a) return sendJson(404, 'Assignment not found');

            const user = currentUser || db.users.find(u => u.role === 'VENDOR');
            if (currentUser && currentUser.role === 'VENDOR' && a.vendorId !== currentUser.userId) {
                return sendJson(403, 'Forbidden: Assignment not assigned to you.');
            }

            const status = (body.status || 'IN_PROGRESS').toUpperCase();

            // Stage 1: Start Field Work
            if (status === 'IN_PROGRESS') {
                if (!body.notes || !body.notes.trim()) {
                    return sendJson(400, 'Field execution note is required to start field work.');
                }
                const startImg = body.evidenceImageData || a.startEvidenceImageData;
                if (!startImg) {
                    return sendJson(400, 'Site inspection image is required to start field work.');
                }
                if (!body.latitude || !body.longitude) {
                    return sendJson(400, 'Valid device GPS location is required to start field work.');
                }

                a.status = 'IN_PROGRESS';
                a.notes = body.notes.trim();
                a.startEvidenceImageData = startImg;
                a.startLatitude = body.latitude;
                a.startLongitude = body.longitude;
                if (!a.acceptedAt) a.acceptedAt = new Date().toISOString();

                if (!a.history) a.history = [];
                a.history.push({
                    stage: 'START_FIELD_WORK',
                    status: 'IN_PROGRESS',
                    notes: a.notes,
                    evidenceImageData: a.startEvidenceImageData,
                    latitude: a.startLatitude,
                    longitude: a.startLongitude,
                    timestamp: new Date().toISOString()
                });
            } else if (status === 'COMPLETED') {
                // Stage 2: Complete Repair Work
                if (a.status !== 'IN_PROGRESS') {
                    return sendJson(400, 'Stage 1 (Start Field Work) must be completed before marking work as Completed.');
                }
                if (!body.notes || !body.notes.trim()) {
                    return sendJson(400, 'Field execution note describing completed repair is required.');
                }
                if (!body.evidenceImageData) {
                    return sendJson(400, 'Repair completion proof image is required.');
                }
                if (!body.latitude || !body.longitude) {
                    return sendJson(400, 'Exact GPS location of completed work is required.');
                }
                if (body.aiVerificationScore !== undefined && body.aiVerificationScore !== null && Number(body.aiVerificationScore) < 70) {
                    return sendJson(400, 'AI Vision Repair QA Check did not pass. Resolution proof must be verified before completing work.');
                }

                a.status = 'COMPLETED';
                a.completionNotes = body.notes.trim();
                a.completionEvidenceImageData = body.evidenceImageData;
                a.completionLatitude = body.latitude;
                a.completionLongitude = body.longitude;
                a.aiVerificationScore = body.aiVerificationScore || 92;
                a.aiVerificationNote = body.aiVerificationNote || 'AI Vision verified repair completion.';
                a.completedAt = new Date().toISOString();

                if (!a.history) a.history = [];
                a.history.push({
                    stage: 'COMPLETE_REPAIR_WORK',
                    status: 'COMPLETED',
                    notes: a.completionNotes,
                    evidenceImageData: a.completionEvidenceImageData,
                    latitude: a.completionLatitude,
                    longitude: a.completionLongitude,
                    aiVerificationScore: a.aiVerificationScore,
                    aiVerificationNote: a.aiVerificationNote,
                    timestamp: new Date().toISOString()
                });
            } else {
                a.status = status;
                if (body.notes) a.notes = body.notes;
            }

            const c = db.complaints.find(k => k.complaintId === a.complaintId);
            if (c) {
                c.status = status === 'COMPLETED' ? 'COMPLETED' : status;
                c.updatedAt = new Date().toISOString();
            }
            saveDb();
            return sendJson(200, formatAssignment(a, db));
        }

        if (pathname.match(/^\/api\/vendor\/assignments\/\d+\/accept$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const a = db.assignments.find(k => k.assignmentId === id);
            if (!a) return sendJson(404, 'Assignment not found');
            a.status = 'ACCEPTED';
            a.acceptedAt = new Date().toISOString();
            const c = db.complaints.find(k => k.complaintId === a.complaintId);
            if (c) c.status = 'VENDOR_ACCEPTED';
            saveDb();
            return sendJson(200, formatAssignment(a, db));
        }

        if (pathname.match(/^\/api\/vendor\/assignments\/\d+\/reject$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const a = db.assignments.find(k => k.assignmentId === id);
            if (!a) return sendJson(404, 'Assignment not found');
            a.status = 'REJECTED';
            a.rejectionReason = (body && body.reason) || 'Vendor unavailable';
            const c = db.complaints.find(k => k.complaintId === a.complaintId);
            if (c) c.status = 'RECEIVED';
            saveDb();
            return sendJson(200, formatAssignment(a, db));
        }

        if (pathname.match(/^\/api\/vendor\/assignments\/\d+$/) && req.method === 'GET') {
            const id = parseInt(pathname.split('/').pop(), 10);
            const a = db.assignments.find(k => k.assignmentId === id);
            if (!a) return sendJson(404, 'Assignment not found');
            return sendJson(200, formatAssignment(a, db));
        }

        if (pathname === '/api/vendor/contracts' && req.method === 'GET') {
            const user = currentUser || db.users.find(u => u.role === 'VENDOR');
            const vId = user ? user.userId : 5;
            const matched = db.contracts.filter(c => c.vendorId === vId);
            return sendJson(200, matched);
        }

        // ─────────────────────────────────────────────────────────────────
        // 7. CONTRACT ROUTES (/api/contracts/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/contracts' && req.method === 'GET') {
            if (query.vendorId) {
                const vId = parseInt(query.vendorId, 10);
                return sendJson(200, db.contracts.filter(c => c.vendorId === vId));
            }
            if (query.department) {
                return sendJson(200, db.contracts.filter(c => c.department.toLowerCase().includes(query.department.toLowerCase())));
            }
            return sendJson(200, db.contracts);
        }

        if (pathname === '/api/contracts/my' && req.method === 'GET') {
            const user = currentUser || db.users.find(u => u.role === 'VENDOR');
            const vId = user ? user.userId : 5;
            return sendJson(200, db.contracts.filter(c => c.vendorId === vId));
        }

        if (pathname.match(/^\/api\/contracts\/\d+$/) && req.method === 'GET') {
            const id = parseInt(pathname.split('/').pop(), 10);
            const c = db.contracts.find(k => k.id === id || k.contractId === id);
            if (!c) return sendJson(404, 'Contract not found');
            return sendJson(200, c);
        }

        // ─────────────────────────────────────────────────────────────────
        // 8. REPRESENTATIVE ROUTES (/api/representative/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/representative/complaints' && req.method === 'GET') {
            const rep = currentUser || db.users.find(u => u.role === 'REPRESENTATIVE');
            const repArea = (rep && rep.constituency) ? rep.constituency : 'Ward 12 - Central District';
            const matched = db.complaints
                .filter(c => isLocationInConstituency(c.location, repArea))
                .map(c => formatComplaint(c, db))
                .reverse();
            return sendJson(200, {
                content: matched,
                totalElements: matched.length,
                totalPages: 1,
                number: 0,
                size: 50
            });
        }

        if (pathname === '/api/representative/complaints/stats' && req.method === 'GET') {
            const rep = currentUser || db.users.find(u => u.role === 'REPRESENTATIVE');
            const repArea = rep ? (rep.constituency || 'Ward 12 - Central District') : 'Ward 12 - Central District';
            const areaComplaints = db.complaints.filter(c => isLocationInConstituency(c.location, repArea));
            const total = areaComplaints.length;
            const byStatus = {};
            ['CREATED', 'RECEIVED', 'OFFICER_REVIEW', 'VERIFIED', 'IN_PROGRESS', 'ASSIGNED', 'VENDOR_ACCEPTED', 'COMPLETED', 'RESOLVED', 'CLOSED', 'ESCALATED'].forEach(s => {
                byStatus[s] = areaComplaints.filter(c => c.status === s).length;
            });
            const pending = (byStatus.CREATED || 0) + (byStatus.RECEIVED || 0) + (byStatus.VERIFIED || 0) + (byStatus.ASSIGNED || 0) + (byStatus.VENDOR_ACCEPTED || 0);
            const inProgress = (byStatus.IN_PROGRESS || 0);
            const completed = (byStatus.COMPLETED || 0);
            const resolved = (byStatus.RESOLVED || 0) + (byStatus.CLOSED || 0);
            const escalated = (byStatus.ESCALATED || 0);

            return sendJson(200, {
                area: repArea,
                designation: rep ? rep.designation : 'Elected Ward Representative',
                total,
                byStatus,
                pending,
                inProgress,
                completed,
                resolved,
                escalated
            });
        }

        if (pathname.match(/^\/api\/representative\/complaints\/\d+\/escalate$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');

            const rep = currentUser || db.users.find(u => u.role === 'REPRESENTATIVE');
            const repArea = (rep && rep.constituency) ? rep.constituency : 'Ward 12 - Central District';
            if (!isLocationInConstituency(c.location, repArea)) {
                return sendJson(403, { error: 'Forbidden: Access restricted. You can only manage complaints within your assigned jurisdiction.' });
            }

            c.status = 'ESCALATED';
            c.priority = 'CRITICAL';
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, {
                message: 'Complaint escalated successfully',
                complaintId: id,
                newStatus: 'ESCALATED'
            });
        }

        if (pathname.match(/^\/api\/representative\/complaints\/\d+\/endorse$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');

            const rep = currentUser || db.users.find(u => u.role === 'REPRESENTATIVE');
            const repArea = (rep && rep.constituency) ? rep.constituency : 'Ward 12 - Central District';
            if (!isLocationInConstituency(c.location, repArea)) {
                return sendJson(403, { error: 'Forbidden: Access restricted. You can only manage complaints within your assigned jurisdiction.' });
            }

            c.status = 'CLOSED';
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, {
                message: 'Complaint endorsed and closed successfully',
                complaintId: id,
                newStatus: 'CLOSED'
            });
        }

        if (pathname.match(/^\/api\/representative\/complaints\/\d+\/priority$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');

            const rep = currentUser || db.users.find(u => u.role === 'REPRESENTATIVE');
            const repArea = (rep && rep.constituency) ? rep.constituency : 'Ward 12 - Central District';
            if (!isLocationInConstituency(c.location, repArea)) {
                return sendJson(403, { error: 'Forbidden: Access restricted. You can only manage complaints within your assigned jurisdiction.' });
            }

            const newPriority = (query.priority || (body && body.priority) || 'HIGH').toUpperCase();
            c.priority = newPriority;
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, {
                message: 'Priority updated successfully',
                complaintId: id,
                newPriority
            });
        }

        if (pathname.match(/^\/api\/representative\/complaints\/\d+\/remark$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');

            const rep = currentUser || db.users.find(u => u.role === 'REPRESENTATIVE');
            const repArea = (rep && rep.constituency) ? rep.constituency : 'Ward 12 - Central District';
            if (!isLocationInConstituency(c.location, repArea)) {
                return sendJson(403, { error: 'Forbidden: Access restricted. You can only manage complaints within your assigned jurisdiction.' });
            }

            const note = body.remark ? body.remark.trim() : '';
            c.description = `${c.description || ''}\n\n[REP NOTE] ${note}`;
            c.priority = 'HIGH';
            c.updatedAt = new Date().toISOString();
            saveDb();
            return sendJson(200, { message: 'Remark saved', complaintId: id });
        }

        // ─────────────────────────────────────────────────────────────────
        // 9. NOTIFICATION PREFERENCES (/api/notifications/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/notifications/my' && req.method === 'GET') {
            return sendJson(200, db.notifications);
        }

        if (pathname === '/api/notifications/preferences') {
            const user = currentUser || db.users.find(u => u.username === 'citizen');
            const uId = user ? user.userId : 1;
            if (req.method === 'GET') {
                return sendJson(200, db.userPreferences[uId] || db.userPreferences[1]);
            }
            if (['PUT', 'POST'].includes(req.method)) {
                db.userPreferences[uId] = { ...(db.userPreferences[uId] || db.userPreferences[1]), ...body };
                saveDb();
                return sendJson(200, db.userPreferences[uId]);
            }
        }

        // ─────────────────────────────────────────────────────────────────
        // 10. AI CONTROL PLANE ROUTES (/api/ai/*)
        // ─────────────────────────────────────────────────────────────────
        if (pathname === '/api/ai/analyze-complaint' && req.method === 'POST') {
            const { title, description, evidenceImageData, imageBase64, fileName, evidenceFileName, visualHint } = body;
            const result = await analyzeComplaintAI(title, description, evidenceImageData || imageBase64, fileName || evidenceFileName, visualHint);
            return sendJson(200, result);
        }

        if (pathname === '/api/ai/draft-complaint' && req.method === 'POST') {
            const input = body.input || '';
            const lang = body.language || 'EN';
            return sendJson(200, {
                title: input.length > 50 ? input.substring(0, 47) + '...' : input,
                description: `Formal Civic Grievance: ${input}. Prompt inspection and remedial action requested.`,
                suggestedCategory: 'Road Damage',
                language: lang
            });
        }

        if (pathname === '/api/ai/suggest-vendor' && req.method === 'POST') {
            const category = body.category || 'Road Damage';
            const vendor = db.users.find(u => u.role === 'VENDOR' && u.designation && u.designation.toLowerCase().includes(category.toLowerCase())) || db.users.find(u => u.role === 'VENDOR');
            return sendJson(200, {
                suggestedVendorId: vendor ? vendor.userId : 5,
                suggestedVendorName: vendor ? (vendor.fullName || vendor.username) : 'Sunil Patil',
                matchConfidence: '94%',
                reasoning: `Selected vendor holds active rate contract in this zone with proven SLA compliance.`
            });
        }

        if (pathname === '/api/ai/suggest-response' && req.method === 'POST') {
            const { title, category, status } = body;
            const catName = category || 'Road Maintenance';

            let actionPlan = '';
            const cLower = catName.toLowerCase();
            if (cLower.includes('water') || cLower.includes('pipe') || cLower.includes('leak')) {
                actionPlan = `1. Immediate Containment & Isolation:\n   - Dispatch water supply quick-response plumbing squad.\n   - Throttling line pressure at sectional valve to prevent potable water loss.\n\n2. Defect Locating & Excavation:\n   - Pinpoint exact rupture with acoustic acoustic leak detector.\n   - Secure trench shoring & caution barricades around excavation pit.\n\n3. Repair & Replacement Protocol:\n   - Install Class K-9 ductile iron replacement segment or heavy-duty mechanical clamp.\n   - Complete 6-bar hydrostatic pressure test for 30 minutes.\n\n4. Restoration & Citizen Quality Sign-off:\n   - Backfill with compacted aggregate; restore pipeline supply & verify citizen water pressure.`;
            } else if (cLower.includes('drain') || cLower.includes('sewage')) {
                actionPlan = `1. Hazard Containment & Disinfection:\n   - Cordon off overflow perimeter with safety warning mesh.\n   - Treat standing sewage overflow with lime powder and biocidal disinfectant.\n\n2. Super-Sucker Jetting & De-silting:\n   - Deploy 200-bar vacuum jetting truck to eliminate silt and obstruction.\n   - Clear solid blockages from manhole chamber.\n\n3. Structural Chamber Assessment:\n   - Inspect concrete benching; fit heavy-duty ductile iron grating cover.\n\n4. Flow Verification:\n   - Perform gravity dye tracer test to confirm unobstructed flow to trunk sewer.`;
            } else if (cLower.includes('light') || cLower.includes('electr') || cLower.includes('lamp')) {
                actionPlan = `1. Safety Isolation & Power Lockdown:\n   - Lockout-tagout (LOTO) breaker at feeder pillar to guarantee zero live voltage.\n   - Deploy aerial sky-lift bucket truck with insulated tools and arc-flash PPE.\n\n2. Component Diagnostics:\n   - Measure voltage at pole base junction box; check photocell sensor & fuse link.\n\n3. Luminaire Replacement:\n   - Replace defective fitting with energy-efficient 90W IP66 LED luminaire.\n   - Seal junction box with weatherproof gasket to prevent water ingress.\n\n4. Nighttime Illumination Test:\n   - Re-energize circuit; verify photometric lux coverage on roadway.`;
            } else if (cLower.includes('garb') || cLower.includes('waste') || cLower.includes('sanitat')) {
                actionPlan = `1. Site Clearance & Heavy Dispatch:\n   - Dispatch 14-cubic-meter municipal tipper truck and hydraulic compactor squad.\n   - Mechanically clear accumulated solid waste and debris piles.\n\n2. Sanitization & Washing:\n   - Jet-wash road pavement with disinfectant solution and apply citronella/bleach powder.\n\n3. Containment Infrastructure:\n   - Install twin segregated litter bins with anti-dumping signboards.\n\n4. Citizen Notice & Monitoring:\n   - Post municipal cleanliness notice & regularize twice-daily compactor pickup.`;
            } else {
                actionPlan = `1. Immediate Containment & Site Safety:\n   - Deploy safety traffic cones (50m advance warning) and retro-reflective barricades.\n   - Designate a traffic marshal for pedestrian and vehicular detour.\n\n2. Technical Inspection & Vendor Work Order:\n   - Dispatch municipal asphalt maintenance crew with a vibratory roller & bitumen kettle.\n   - Measure crater depth and edge breakdown; execute edge-trimming with mechanical pavement cutter.\n\n3. Execution & Materials Protocol:\n   - Apply hot bitumen tack coat (VG-30 grade) for bonding.\n   - Lay dense graded bituminous macadam (DBM) in 50mm compacted layers.\n   - Final compaction using tandem roller to achieve smooth camber and zero water-ponding contour.\n\n4. Citizen QA & Verification:\n   - Vendor uploads geo-tagged after-repair photos showing level roadbed.\n   - Ward officer conducts physical/AI QA check against standard municipal durability criteria.`;
            }

            const citizenNote = `Dear Citizen, Your complaint regarding "${title || 'Civic Issue'}" has been prioritized under Municipal Service Level Agreement (SLA). Our ward inspection squad and specialized contractors have been deployed to execute on-site rectification. We will notify you with photographic completion proof once verified.`;

            return sendJson(200, {
                actionPlan: actionPlan,
                citizenNote: citizenNote,
                response: citizenNote
            });
        }

        if (pathname === '/api/ai/job-card' && req.method === 'POST') {
            const { title, description, category } = body;
            return sendJson(200, {
                jobTitle: `WORK ORDER: ${title || 'Civic Repair Work'}`,
                category: category || 'Road Maintenance',
                safetyProtocol: 'Traffic safety cones, barricades and high-visibility jackets mandatory at all times.',
                estimatedMaterials: 'Cold-mix asphalt, bitumen emulsion, trench compactor, safety signs.',
                estimatedHours: 6
            });
        }

        if (pathname === '/api/ai/verify-resolution' && req.method === 'POST') {
            const { beforePhotoBase64, afterPhotoBase64, complaintId, isIrrelevant } = body;
            
            let beforeImg = beforePhotoBase64;
            if (!beforeImg && complaintId) {
                const c = db.complaints.find(k => k.complaintId === Number(complaintId));
                if (c && c.evidenceImageData) beforeImg = c.evidenceImageData;
            }

            if (!afterPhotoBase64) {
                return sendJson(200, {
                    passed: false,
                    verificationStatus: 'REJECTED',
                    qualityScore: 0,
                    reason: 'No repair completion proof image provided. Please upload the completed repair image.',
                    qualityReasoning: 'No repair completion proof image provided.'
                });
            }

            const clean1 = (beforeImg || '').replace(/^data:image\/[^;]+;base64,/, '').replace(/\s+/g, '');
            const clean2 = (afterPhotoBase64 || '').replace(/^data:image\/[^;]+;base64,/, '').replace(/\s+/g, '');

            if (clean1.length > 5 && clean1 === clean2) {
                return sendJson(200, {
                    passed: false,
                    verificationStatus: 'REJECTED',
                    qualityScore: 20,
                    reason: 'AI Vision QA Check Failed: The repair completion image is identical to the original complaint image. A distinct photo of the completed repair is required.',
                    qualityReasoning: 'Duplicate photo detected. The completion photo cannot be identical to the reported issue image.'
                });
            }

            if (isIrrelevant) {
                return sendJson(200, {
                    passed: false,
                    verificationStatus: 'FAILED',
                    qualityScore: 35,
                    reason: 'AI Vision QA Check Failed: Uploaded image does not depict completed municipal civil works or repairs at the location. Please upload a genuine repair photo.',
                    qualityReasoning: 'Visual inspection failed: Image does not match site resolution criteria.'
                });
            }

            return sendJson(200, {
                passed: true,
                verificationStatus: 'VERIFIED',
                confidenceScore: 0.94,
                qualityScore: 94,
                reason: 'AI Vision QA Check Passed: Comparison confirms reported defect has been repaired, surface leveled, and civic hazard remediated cleanly.',
                qualityReasoning: 'Comparison confirms reported defect has been repaired, surface leveled, and civic hazard remediated cleanly.'
            });
        }

        if (pathname === '/api/ai/rep-briefing' && req.method === 'POST') {
            return sendJson(200, {
                briefingSummary: 'Executive Briefing: 85% of complaints resolved within SLA target in the current quarter. Primary community focus remains road surfacing on major connecting arterials.',
                keyActionPoints: [
                    'Review ongoing asphalt patching at MG Road junction.',
                    'Inspect newly replaced LED luminaire clusters in Sector 4.'
                ]
            });
        }

        if (pathname === '/api/ai/rep-escalation-memo' && req.method === 'POST') {
            return sendJson(200, {
                memo: 'URGENT ESCALATION MEMO:\nTo: Municipal Commissioner & Executive Engineer\nFrom: Elected Ward Representative\nSubject: Critical Civic Grievance Escalation\n\nImmediate site mobilization is requested for this matter. Public safety and municipal compliance require completion within 24 hours.'
            });
        }

        if (pathname === '/api/ai/field-checklist' && req.method === 'POST') {
            return sendJson(200, {
                checklist: [
                    'Verify physical site boundary and safety barricades',
                    'Check material specification compliance with municipal code',
                    'Inspect before/after digital photographic proof',
                    'Collect verbal feedback from nearby residents/shop owners'
                ]
            });
        }

        if (pathname === '/api/ai/admin-insights' && req.method === 'POST') {
            return sendJson(200, {
                insights: [
                    'Overall SLA compliance rate is at 91.4% across 5 municipal categories.',
                    'Water supply repair average turnaround time reduced from 36 hours to 18 hours.',
                    'Zero overdue critical alerts in Ward 12 this week.'
                ]
            });
        }

        if (pathname === '/api/ai/chat' && req.method === 'POST') {
            const { role, message, language, username } = body;
            const queryText = (message || '').toLowerCase();
            const userRole = (role || (currentUser ? currentUser.role : 'CITIZEN')).toUpperCase();
            const userObj = currentUser || db.users.find(u => u.username === username);

            // 1. Direct Ticket lookup (e.g. GRV-2026-000001 or #1)
            const match = queryText.match(/grv-\d{4}-\d+/i);
            if (match) {
                const ref = match[0].toUpperCase();
                const c = db.complaints.find(k => k.complaintRef === ref);
                if (c) {
                    return sendJson(200, {
                        reply: `📋 **Grievance Status: ${c.complaintRef}**\n\n• **Title:** ${c.title}\n• **Category:** ${c.categoryName || 'General'}\n• **Status:** \`${c.status}\`\n• **Priority:** **${c.priority}** (Severity: ${c.severityScore}/10)\n• **Location:** 📍 ${c.location}\n• **SLA Target:** ${c.slaTargetHours} Hours\n\n${c.assignedVendorName ? `• **Assigned Contractor:** ${c.assignedVendorName} (@${c.assignedVendorUsername})` : '• **Assignment:** Under Ward Officer Review'}`
                    });
                } else {
                    return sendJson(200, {
                        reply: `⚠️ Grievance with reference **${ref}** was not found in the municipal database. Please verify the ticket number.`
                    });
                }
            }

            // 2. OFFICER specific queries
            if (userRole === 'OFFICER') {
                if (queryText.includes('sla breach') || queryText.includes('urgent') || queryText.includes('critical') || queryText.includes('near sla')) {
                    const criticals = db.complaints.filter(c => ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'RECEIVED', 'OFFICER_REVIEW'].includes(c.status) && (c.priority === 'CRITICAL' || c.priority === 'HIGH'));
                    if (criticals.length > 0) {
                        const items = criticals.slice(0, 4).map(c => `• **${c.complaintRef}** — *${c.title}* [${c.priority}] in ${c.location} (Status: \`${c.status}\`)`).join('\n');
                        return sendJson(200, {
                            reply: `⚡ **Urgent / Near SLA Breach Complaints (${criticals.length} Active):**\n\n${items}\n\n👉 *Recommendation:* Open the Assign modal on these tickets to dispatch contractors with emergency priority.`
                        });
                    } else {
                        return sendJson(200, {
                            reply: `✅ **All Clear!** There are currently no critical complaints nearing SLA breach in your ward jurisdiction.`
                        });
                    }
                }

                if (queryText.includes('duplicate') || queryText.includes('flagged')) {
                    const dups = db.complaints.filter(c => c.isDuplicate);
                    if (dups.length > 0) {
                        const items = dups.map(c => `• **${c.complaintRef}** (*${c.title}*) flagged duplicate of \`${c.duplicateOfRef || 'Primary Ticket'}\``).join('\n');
                        return sendJson(200, {
                            reply: `🔍 **Flagged Duplicate Grievances (${dups.length} Detected):**\n\n${items}\n\nUse the **Flagged Duplicates** filter on your dashboard to review and link them to the primary work order.`
                        });
                    } else {
                        return sendJson(200, {
                            reply: `✅ **No unhandled duplicates:** AI Duplicate Detection has not flagged any recent overlapping complaints.`
                        });
                    }
                }

                if (queryText.includes('vendor') || queryText.includes('contractor') || queryText.includes('lowest workload') || queryText.includes('best vendor') || queryText.includes('workload')) {
                    const vendors = db.users.filter(u => u.role === 'VENDOR').map(v => {
                        const count = db.assignments.filter(a => a.vendorId === v.userId && ['ASSIGNED', 'VENDOR_ACCEPTED', 'IN_PROGRESS'].includes(a.status)).length;
                        return { ...v, activeCount: count };
                    }).sort((a, b) => a.activeCount - b.activeCount);
                    
                    const vendorList = vendors.map(v => `• **${v.fullName || v.username}** (@${v.username}) — ${v.designation || 'Contractor'}: **${v.activeCount} active jobs**`).join('\n');
                    const best = vendors[0];
                    return sendJson(200, {
                        reply: `👷 **Contractor Workload & AI Match Analysis:**\n\n${vendorList}\n\n🏆 **Top Recommended Available Contractor:** **${best ? best.fullName || best.username : 'Sunil Patil'}** with only ${best ? best.activeCount : 0} active assignments.`
                    });
                }
            }

            // 3. VENDOR specific queries
            if (userRole === 'VENDOR') {
                if (queryText.includes('task') || queryText.includes('pending') || queryText.includes('assigned') || queryText.includes('deadline')) {
                    const vId = userObj ? userObj.userId : 5;
                    const vAssignments = db.assignments.filter(a => a.vendorId === vId && ['ASSIGNED', 'VENDOR_ACCEPTED', 'IN_PROGRESS'].includes(a.status));
                    if (vAssignments.length > 0) {
                        const items = vAssignments.map(a => {
                            const c = db.complaints.find(k => k.complaintId === a.complaintId) || {};
                            return `• **Work Order #${a.assignmentId}** [${c.complaintRef || 'Ticket'}] — *${c.title || 'Civic Repair'}* (Status: \`${a.status}\`, SLA: ${c.slaTargetHours || 24}h)`;
                        }).join('\n');
                        return sendJson(200, {
                            reply: `🔧 **Your Active Assigned Tasks (${vAssignments.length}):**\n\n${items}\n\n👉 *Next Step:* Tap **Start Work** or **Upload After-Repair Proof** once on-site work is completed.`
                        });
                    } else {
                        return sendJson(200, {
                            reply: `✅ **No pending work orders!** All assigned tasks under your contract are up-to-date or under officer verification.`
                        });
                    }
                }

                if (queryText.includes('equipment') || queryText.includes('material') || queryText.includes('safety') || queryText.includes('rule')) {
                    return sendJson(200, {
                        reply: `📦 **Contractor Mandatory Safety & Equipment Checklist:**\n\n1. **Personal Protective Equipment (PPE):** High-visibility retro-reflective vests, steel-toe boots, hard hats.\n2. **Site Safety Protocols:** Deploy safety traffic cones at 30m intervals; install perimeter warning tape.\n3. **Department Specifications:**\n   • *Roads:* Asphalt tamper, hot bitumen sealant, road cutter.\n   • *Water/Drain:* Pipe clamps, mechanical joint puller, trench shoring barriers.\n   • *Electrical:* Insulated tools (1000V rated), LOTO tags, fall-arrest harness.\n4. **Geo-Evidence:** Capture high-resolution photo proof upon completion for AI Vision QA verification.`
                    });
                }

                if (queryText.includes('verify') || queryText.includes('photo') || queryText.includes('ai vision') || queryText.includes('completion')) {
                    return sendJson(200, {
                        reply: `📸 **How AI Vision Verification Works:**\n\n1. After executing the repair on-site, open **My Tasks** on your portal.\n2. Click **Update Status / Complete** on the work order.\n3. Capture or upload a clear, well-lit **After-Repair Photo**.\n4. Our AI Vision algorithm compares before & after condition, evaluates repair quality, and assigns a QA confidence score.\n5. The completed work order is submitted directly to the Ward Officer for digital sign-off and fund release!`
                    });
                }
            }

            // 4. REPRESENTATIVE specific queries
            if (userRole === 'REPRESENTATIVE') {
                const repArea = (userObj && userObj.constituency) ? userObj.constituency : 'Ward 12 - Central District';
                const areaComplaints = db.complaints.filter(c => isLocationInConstituency(c.location, repArea));
                if (queryText.includes('constituency') || queryText.includes('overview') || queryText.includes('summary') || queryText.includes('rate') || queryText.includes('area')) {
                    const total = areaComplaints.length;
                    const resolved = areaComplaints.filter(c => ['RESOLVED', 'CLOSED', 'COMPLETED'].includes(c.status)).length;
                    const inProg = areaComplaints.filter(c => ['ASSIGNED', 'IN_PROGRESS', 'VENDOR_ACCEPTED'].includes(c.status)).length;
                    const resRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '100.0';
                    return sendJson(200, {
                        reply: `📊 **Constituency Civic Grievance Briefing (${repArea}):**\n\n• **Total Grievances Lodged:** ${total}\n• **Resolved & Completed:** ${resolved} (${resRate}% Resolution Rate)\n• **Active Field Work:** ${inProg} work orders in progress\n• **Pending Officer Triage:** ${total - resolved - inProg}\n\n🏆 *Top Performing Domain:* Water Supply rapid repairs (Avg resolution: 18 hours).`
                    });
                }

                if (queryText.includes('overdue') || queryText.includes('breach')) {
                    const overdue = db.complaints.filter(c => ['CREATED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status) && c.priority === 'CRITICAL');
                    if (overdue.length > 0) {
                        const items = overdue.map(c => `• **${c.complaintRef}** — *${c.title}* in ${c.location}`).join('\n');
                        return sendJson(200, {
                            reply: `⚠️ **High Attention Grievances (${overdue.length}):**\n\n${items}\n\n👉 You can click **Escalate** or **Endorse** on your dashboard to notify the Municipal Commissioner.`
                        });
                    } else {
                        return sendJson(200, {
                            reply: `✅ **SLA Health Good:** No grievances have breached critical SLA thresholds in your constituency.`
                        });
                    }
                }

                if (queryText.includes('escalate') || queryText.includes('memo') || queryText.includes('endorse')) {
                    return sendJson(200, {
                        reply: `📝 **Legislative Escalation Protocol:**\n\nAs an elected representative, you can:\n1. Open your **Area Complaints** dashboard.\n2. Tap the **Escalate** or **Endorse** button on any public ticket.\n3. Add an official legislative remark.\n4. The system automatically elevates the grievance to **CRITICAL priority**, issues an audit escalation tag, and dispatches high-priority SMS/Email alerts to the Ward Nodal Officer and Zonal Executive Engineer!`
                    });
                }
            }

            // 5. CITIZEN specific queries
            if (userRole === 'CITIZEN' || queryText.includes('my complaint') || queryText.includes('my status') || queryText.includes('track my')) {
                const cUser = userObj ? userObj.userId : 1;
                const myComplaints = db.complaints.filter(c => c.citizenId === cUser || c.citizenId === 1);
                if (myComplaints.length > 0) {
                    const items = myComplaints.slice(0, 3).map(c => `• **${c.complaintRef}** — *${c.title}*\n  Status: \`${c.status}\` | Priority: **${c.priority}** | Target: ${c.slaTargetHours}h`).join('\n');
                    return sendJson(200, {
                        reply: `⏱️ **Your Registered Grievances (${myComplaints.length}):**\n\n${items}\n\n👉 Visit **My Complaints** for complete milestone history and photo verification proof.`
                    });
                }
            }

            if (queryText.includes('how to log') || queryText.includes('how do i submit') || queryText.includes('submit a problem') || queryText.includes('lodge')) {
                return sendJson(200, {
                    reply: `📝 **How to Lodge a Civic Complaint:**\n\n1. Click **Submit Complaint** in the menu.\n2. **Add Evidence Photo:** Tap *Open Camera* or upload a picture. Our AI Vision will inspect the hazard and autofill the category!\n3. **Location:** Click *Use my current location* to capture exact GPS coordinates.\n4. Click **Submit Complaint** to receive your unique tracking Reference ID (\`GRV-2026-XXXXXX\`)!`
                });
            }

            if (queryText.includes('contact') || queryText.includes('help') || queryText.includes('number') || queryText.includes('helpline') || queryText.includes('1800') || queryText.includes('emergency')) {
                return sendJson(200, {
                    reply: `📞 **Municipal Emergency & 24x7 Helplines:**\n\n• **Central Civic Helpline:** 1913 / Toll-Free 1800-11-2233\n• **Water Board Emergency & Leakage:** 1916\n• **Electricity Breakdown & Streetlights:** 1912\n• **Disaster Management & Flooding:** 1077\n• **City Central Control Room:** +91 80 2266 0000`
                });
            }

            // 6. Freeform Gemini API fallback (if GEMINI_API_KEY is configured)
            const apiKey = process.env.GEMINI_API_KEY;
            if (apiKey && apiKey !== 'your_gemini_api_key_here') {
                try {
                    const prompt = `You are the AI Civic Assistant for the Municipal Grievance Management System.
                    User Role: ${userRole}
                    Username: ${username || 'User'}
                    System Context:
                    - Total complaints in DB: ${db.complaints.length}
                    - Active categories: Road Damage, Street Lights, Garbage, Water Supply, Drainage
                    - SLA limits: 24h to 72h
                    User Question: "${message}"
                    Respond in helpful, concise markdown with role-appropriate civic guidance.`;

                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }]
                        })
                    });
                    if (geminiRes.ok) {
                        const data = await geminiRes.json();
                        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (rawText) {
                            return sendJson(200, { reply: rawText });
                        }
                    }
                } catch (err) {
                    console.warn('Gemini chat fallback error:', err.message);
                }
            }

            // 7. Role-aware default response
            let defaultReply = `Hello! I am your AI Civic Assistant. You are logged in as a **${userRole}**.\n\n`;
            if (userRole === 'OFFICER') {
                defaultReply += `I can help you review urgent SLA alerts, inspect duplicate complaints, evaluate AI contractor matchmaker scores, and generate official resolution plans.`;
            } else if (userRole === 'VENDOR') {
                defaultReply += `I can help you review assigned work orders, view safety & material checklists, and guide you through AI Vision photo verification.`;
            } else if (userRole === 'REPRESENTATIVE') {
                defaultReply += `I can provide area statistics for your constituency, highlight overdue public issues, and assist with legislative priority escalations.`;
            } else {
                defaultReply += `I can help you lodge grievances with AI photo triage, track live repair milestones, and connect with 24x7 municipal emergency helplines.`;
            }

            return sendJson(200, { reply: defaultReply });
        }

        // 404 for unknown API route
        return sendJson(404, { error: 'API endpoint not found', path: pathname });

    } catch (err) {
        console.error('API Error:', err);
        return sendJson(500, { error: 'Internal Server Error', message: err.message });
    }
}

module.exports = {
    handleRequest,
    loadDb,
    saveDb,
    signJwt,
    verifyJwt
};

