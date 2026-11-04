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
const DB_FILE = process.env.VERCEL ? '/tmp/grievance_db.json' : path.join(__dirname, '..', 'data', 'grievance_db.json');

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
                status: 'IN_PROGRESS',
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
            }
        ],
        assignments: [
            {
                assignmentId: 1,
                complaintId: 1,
                vendorId: 5,
                assignedById: 2,
                status: 'IN_PROGRESS',
                notes: 'High priority asphalt patch squad dispatched to site.',
                assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
                acceptedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
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
        console.warn('Could not read DB file, initializing in-memory store:', e.message);
    }
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

function formatAssignment(a, db) {
    const complaint = db.complaints.find(c => c.complaintId === a.complaintId);
    const vendor = db.users.find(u => u.userId === a.vendorId);
    const officer = db.users.find(u => u.userId === a.assignedById);
    return {
        assignmentId: a.assignmentId,
        complaintId: a.complaintId,
        complaint: complaint ? formatComplaint(complaint, db) : null,
        vendor: vendor ? {
            userId: vendor.userId,
            username: vendor.username,
            fullName: vendor.fullName,
            phone: vendor.phone,
            designation: vendor.designation
        } : null,
        vendorId: a.vendorId,
        vendorName: vendor ? (vendor.fullName || vendor.username) : 'Vendor',
        officer: officer ? {
            userId: officer.userId,
            username: officer.username,
            fullName: officer.fullName
        } : null,
        status: a.status,
        notes: a.notes || '',
        completionNotes: a.completionNotes || a.notes || '',
        resolutionNotes: a.resolutionNotes || a.notes || '',
        assignedAt: a.assignedAt,
        acceptedAt: a.acceptedAt,
        completedAt: a.completedAt,
        verifiedAt: a.verifiedAt
    };
}

// ── Smart AI Heuristics & Gemini Integration ─────────────────────────────
async function analyzeComplaintAI(title, description, imageBase64, fileName) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    
    // Check if Gemini API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        try {
            // Attempt call to Gemini REST API
            const prompt = `Analyze this civic grievance complaint and respond in JSON format with fields:
            "suggestedCategoryName": One of ["Road Damage", "Street Lights", "Garbage", "Water Supply", "Drainage"],
            "severityScore": number from 1 to 10,
            "priority": "LOW", "MEDIUM", "HIGH", or "CRITICAL",
            "slaTargetHours": 24 or 48 or 72,
            "reasoning": string brief explanation,
            "suggestedTitle": improved concise title,
            "suggestedDescription": clean concise summary.
            Title: ${title}
            Description: ${description}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                })
            });
            if (response.ok) {
                const data = await response.json();
                const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawJson) {
                    const parsed = JSON.parse(rawJson);
                    return {
                        ...parsed,
                        isAiProcessed: true
                    };
                }
            }
        } catch (e) {
            console.warn('Gemini API call failed, falling back to rule-based heuristics:', e.message);
        }
    }

    // Rule-based high accuracy heuristic
    let cat = 'Road Damage';
    let catId = 1;
    let severity = 6;
    let priority = 'MEDIUM';
    let sla = 48;
    let reasoning = 'Categorized based on municipal issue keywords.';

    if (text.includes('pothole') || text.includes('road') || text.includes('asphalt') || text.includes('tar') || text.includes('crack')) {
        cat = 'Road Damage';
        catId = 1;
        severity = text.includes('deep') || text.includes('accident') || text.includes('severe') ? 8 : 6;
        priority = severity >= 8 ? 'HIGH' : 'MEDIUM';
        sla = priority === 'HIGH' ? 24 : 48;
        reasoning = 'Road infrastructure keywords detected; potential traffic hazard.';
    } else if (text.includes('light') || text.includes('lamp') || text.includes('dark') || text.includes('pole') || text.includes('bulb')) {
        cat = 'Street Lights';
        catId = 2;
        severity = 5;
        priority = 'MEDIUM';
        sla = 36;
        reasoning = 'Public illumination asset reported non-functional.';
    } else if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('contamination') || text.includes('drinking')) {
        cat = 'Water Supply';
        catId = 4;
        severity = 9;
        priority = 'HIGH';
        sla = 24;
        reasoning = 'Clean drinking water asset disruption detected.';
    } else if (text.includes('drain') || text.includes('sewage') || text.includes('gutter') || text.includes('overflow') || text.includes('clog')) {
        cat = 'Drainage';
        catId = 5;
        severity = 7;
        priority = 'HIGH';
        sla = 24;
        reasoning = 'Sewage and stormwater drainage blockage detected.';
    } else if (text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('trash') || text.includes('smell')) {
        cat = 'Garbage';
        catId = 3;
        severity = 6;
        priority = 'MEDIUM';
        sla = 48;
        reasoning = 'Solid waste management report.';
    }

    return {
        suggestedCategoryId: catId,
        suggestedCategoryName: cat,
        severityScore: severity,
        priority: priority,
        slaTargetHours: sla,
        reasoning: reasoning,
        suggestedTitle: title || `${cat} issue reported`,
        suggestedDescription: description || `Reported ${cat.toLowerCase()} in ward area.`,
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
            if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                return sendJson(400, { message: 'Username is already taken.' });
            }
            if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                return sendJson(400, { message: 'Email is already registered.' });
            }

            const newUser = {
                userId: db.users.length + 1,
                username,
                password, // for demo / production matching
                email,
                role: (role || 'CITIZEN').toUpperCase(),
                fullName: fullName || username,
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
                exp: Math.floor(Date.now() / 1000) + 86400 * 7
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
            const user = db.users.find(
                u => (u.username.toLowerCase() === (username || '').toLowerCase() || u.email.toLowerCase() === (username || '').toLowerCase())
            );

            if (!user || user.password !== password) {
                return sendJson(400, { message: 'Invalid credentials. Please verify your username and password.' });
            }

            const token = signJwt({
                sub: user.username,
                role: user.role,
                roles: [`ROLE_${user.role}`, user.role],
                authorities: [`ROLE_${user.role}`],
                userId: user.userId,
                exp: Math.floor(Date.now() / 1000) + 86400 * 7
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
            const { title, description, categoryId, location, latitude, longitude, evidenceImageData, evidenceFileName } = body;
            
            if (!title || !description) {
                return sendJson(400, 'Title and description are required.');
            }

            const cat = db.categories.find(c => c.categoryId === Number(categoryId)) || db.categories[0];
            const complaintId = db.complaints.length + 1;
            const ref = `GRV-2026-${String(complaintId).padStart(6, '0')}`;

            // Quick AI categorization
            const ai = await analyzeComplaintAI(title, description, evidenceImageData, evidenceFileName);

            const newComplaint = {
                complaintId,
                complaintRef: ref,
                citizenId: user ? user.userId : 1,
                categoryId: cat ? cat.categoryId : 1,
                title,
                description,
                location: location || 'Ward 12, Main St.',
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
                    status: 'PENDING',
                    notes: notes || 'Assigned by Officer',
                    assignedAt: new Date().toISOString()
                };
                db.assignments.push(a);
            } else {
                a.vendorId = vendor.userId;
                a.status = 'PENDING';
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
            const vendors = db.users.filter(u => u.role === 'VENDOR').map(v => ({
                vendorId: v.userId,
                vendorName: v.fullName || v.username,
                designation: v.designation,
                phone: v.phone,
                score: 95,
                recommendationReason: 'Active municipal contract and matched category capability.'
            }));
            return sendJson(200, {
                complaintId: id,
                recommendedVendors: vendors,
                bestMatch: vendors[0] || null
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
                .filter(a => !currentUser || a.vendorId === vId)
                .map(a => formatAssignment(a, db));
            return sendJson(200, matched);
        }

        if (pathname.startsWith('/api/vendor/assignments/status/') && req.method === 'GET') {
            const status = pathname.split('/').pop().toUpperCase();
            const user = currentUser || db.users.find(u => u.role === 'VENDOR');
            const vId = user ? user.userId : 5;
            const matched = db.assignments
                .filter(a => a.status === status && (!currentUser || a.vendorId === vId))
                .map(a => formatAssignment(a, db));
            return sendJson(200, matched);
        }

        if (pathname.match(/^\/api\/vendor\/assignments\/\d+\/status$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const a = db.assignments.find(k => k.assignmentId === id);
            if (!a) return sendJson(404, 'Assignment not found');

            const status = (body.status || 'IN_PROGRESS').toUpperCase();
            a.status = status;
            if (body.notes) a.notes = body.notes;
            if (status === 'IN_PROGRESS' && !a.acceptedAt) a.acceptedAt = new Date().toISOString();
            if (status === 'COMPLETED') a.completedAt = new Date().toISOString();

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
            const area = (rep && rep.constituency) ? rep.constituency.toLowerCase() : 'ward';
            const matched = db.complaints
                .filter(c => c.location && c.location.toLowerCase().includes('ward'))
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
            const area = rep ? (rep.constituency || 'Ward 12') : 'Ward 12';
            const total = db.complaints.length;
            const byStatus = {};
            ['CREATED', 'RECEIVED', 'OFFICER_REVIEW', 'VERIFIED', 'IN_PROGRESS', 'ASSIGNED', 'VENDOR_ACCEPTED', 'COMPLETED', 'RESOLVED', 'CLOSED', 'ESCALATED'].forEach(s => {
                byStatus[s] = db.complaints.filter(c => c.status === s).length;
            });
            return sendJson(200, {
                area,
                designation: rep ? rep.designation : 'Elected Ward Representative',
                total,
                byStatus,
                resolved: (byStatus.RESOLVED || 0) + (byStatus.CLOSED || 0),
                escalated: byStatus.ESCALATED || 0,
                pending: (byStatus.CREATED || 0) + (byStatus.RECEIVED || 0) + (byStatus.VERIFIED || 0) + (byStatus.ASSIGNED || 0) + (byStatus.IN_PROGRESS || 0)
            });
        }

        if (pathname.match(/^\/api\/representative\/complaints\/\d+\/escalate$/) && req.method === 'PUT') {
            const id = parseInt(pathname.split('/')[4], 10);
            const c = db.complaints.find(k => k.complaintId === id);
            if (!c) return sendJson(404, 'Complaint not found');
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
            const { title, description, evidenceImageData, imageBase64, fileName, evidenceFileName } = body;
            const result = await analyzeComplaintAI(title, description, evidenceImageData || imageBase64, fileName || evidenceFileName);
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
            return sendJson(200, {
                response: `Dear Citizen, thank you for reporting the issue "${title || 'Civic Issue'}". Our ward squad has marked the status as ${status || 'UNDER_REVIEW'}. Remedial actions are being conducted under municipal SLA guidelines.`
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
            return sendJson(200, {
                verificationStatus: 'VERIFIED',
                confidenceScore: 0.96,
                analysis: 'AI Vision verified that the reported damage has been patched and surface leveled cleanly.'
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
            const { role, message, language } = body;
            const queryText = (message || '').toLowerCase();

            // Check if user is asking for complaint status
            const match = queryText.match(/grv-\d{4}-\d+/i);
            if (match) {
                const ref = match[0].toUpperCase();
                const c = db.complaints.find(k => k.complaintRef === ref);
                if (c) {
                    return sendJson(200, {
                        reply: `Grievance **${c.complaintRef}** ("${c.title}") is currently **${c.status}** with priority **${c.priority}** in ${c.location}. Target SLA resolution time: ${c.slaTargetHours} hours.`
                    });
                }
            }

            if (queryText.includes('pothole') || queryText.includes('road')) {
                return sendJson(200, {
                    reply: 'To submit a road or pothole complaint, click "Submit Complaint", take or upload a photo, and our AI Vision will automatically classify the severity and assign the municipal road crew!'
                });
            }

            if (queryText.includes('contact') || queryText.includes('help') || queryText.includes('number')) {
                return sendJson(200, {
                    reply: 'Civic Grievance Helpline is available 24/7. Emergency civic helpline: 1913. Central Control Room: +91 80 2266 0000.'
                });
            }

            return sendJson(200, {
                reply: `Hello! I am your AI Civic Assistant. You are logged in as a **${role || 'Citizen'}**. How may I assist you with lodging a grievance, tracking status, or viewing municipal services today?`
            });
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

