const fs = require('fs');
const path = require('path');
const { handleRequest, loadDb } = require('./api/backend');

// Mock request / response helper
function mockCall(method, url, body = null, headers = {}) {
    return new Promise((resolve) => {
        const req = {
            method,
            url,
            headers: {
                host: 'localhost:3000',
                ...headers
            },
            body,
            [Symbol.asyncIterator]: async function* () {
                if (body) yield Buffer.from(JSON.stringify(body));
            }
        };

        let responseBody = '';
        let headersSent = {};
        const res = {
            statusCode: 200,
            setHeader: (key, val) => { headersSent[key.toLowerCase()] = val; },
            end: (data) => {
                if (data) responseBody += data;
                let parsed = responseBody;
                try { parsed = JSON.parse(responseBody); } catch (e) {}
                resolve({
                    status: res.statusCode,
                    headers: headersSent,
                    body: parsed,
                    raw: responseBody
                });
            }
        };

        handleRequest(req, res);
    });
}

async function runTests() {
    console.log('=== Running Automated Grievance Management System Tests ===\n');
    const dbPath = path.join(__dirname, 'data', 'grievance_db.json');
    if (fs.existsSync(dbPath)) {
        try { fs.unlinkSync(dbPath); } catch (e) {}
    }
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        // 1. Auth Test
        const resAuthTest = await mockCall('GET', '/api/auth/test');
        assert(resAuthTest.status === 200 && resAuthTest.raw.includes('working'), 'GET /api/auth/test responds with working status');

        // 2. Login all 5 roles
        const roles = ['admin', 'citizen', 'officer', 'vendor', 'representative'];
        const tokens = {};
        for (const r of roles) {
            const resLogin = await mockCall('POST', '/api/auth/login', { username: r, password: 'password123' });
            assert(resLogin.status === 200 && resLogin.body.token && resLogin.body.role === r.toUpperCase(), `POST /api/auth/login for ${r} returns valid token and role ${r.toUpperCase()}`);
            tokens[r] = resLogin.body.token;
        }

        // 3. Register a new user
        const newUsername = 'testuser_' + Date.now();
        const testPhone = '9876543299';
        const resReg = await mockCall('POST', '/api/auth/register', {
            username: newUsername,
            password: 'password123',
            email: `${newUsername}@example.com`,
            role: 'CITIZEN',
            fullName: 'Test Citizen User',
            phone: testPhone
        });
        assert(resReg.status === 201 && resReg.body.token, `POST /api/auth/register registers new user "${newUsername}"`);

        // 3a. Duplicate registration prevention (cannot be used again)
        // Same username rejected
        const resDupUsername = await mockCall('POST', '/api/auth/register', {
            username: newUsername,
            password: 'password123',
            email: `another_${Date.now()}@example.com`,
            phone: '9111122222'
        });
        assert(resDupUsername.status === 400 && resDupUsername.body.message.includes('Username is already taken'), 'Duplicate registration with same username rejected');

        // Same email rejected
        const resDupEmail = await mockCall('POST', '/api/auth/register', {
            username: `diffuser_${Date.now()}`,
            password: 'password123',
            email: `${newUsername}@example.com`,
            phone: '9222233333'
        });
        assert(resDupEmail.status === 400 && resDupEmail.body.message.includes('Email'), 'Duplicate registration with same email rejected');

        // Same mobile number rejected
        const resDupPhone = await mockCall('POST', '/api/auth/register', {
            username: `diffphone_${Date.now()}`,
            password: 'password123',
            email: `diffemail_${Date.now()}@example.com`,
            phone: testPhone
        });
        assert(resDupPhone.status === 400 && resDupPhone.body.message.includes('Mobile number is already registered'), 'Duplicate registration with same phone number rejected');

        // 3b. Cross-device login with Username, Email, OR Mobile Number
        const resLoginByUsername = await mockCall('POST', '/api/auth/login', { username: newUsername, password: 'password123' });
        assert(resLoginByUsername.status === 200 && resLoginByUsername.body.token, 'Login with username succeeds across devices');

        const resLoginByEmail = await mockCall('POST', '/api/auth/login', { username: `${newUsername}@example.com`, password: 'password123' });
        assert(resLoginByEmail.status === 200 && resLoginByEmail.body.token, 'Login with email succeeds across devices');

        const resLoginByPhone = await mockCall('POST', '/api/auth/login', { username: testPhone, password: 'password123' });
        assert(resLoginByPhone.status === 200 && resLoginByPhone.body.token, 'Login with mobile number succeeds across devices');

        // 4. Admin Categories
        const resCats = await mockCall('GET', '/api/admin/categories', null, { authorization: `Bearer ${tokens['admin']}` });
        assert(resCats.status === 200 && Array.isArray(resCats.body) && resCats.body.length >= 5, `GET /api/admin/categories returns ${resCats.body ? resCats.body.length : 0} categories`);

        // 5. Admin Statistics
        const resStats = await mockCall('GET', '/api/admin/statistics', null, { authorization: `Bearer ${tokens['admin']}` });
        assert(resStats.status === 200 && resStats.body.complaints && resStats.body.users, 'GET /api/admin/statistics returns complaint and user analytics');

        // 6. Citizen creates complaint & AI Grievance Image Validation
        // 6a. Reject irrelevant image
        const resRejectImage = await mockCall('POST', '/api/ai/analyze-complaint', {
            title: 'My pet dog photo',
            description: 'Look at my cute dog sitting on the couch',
            fileName: 'dog_selfie.jpg',
            visualHint: 'Irrelevant'
        });
        assert(resRejectImage.status === 200 && resRejectImage.body.isValidGrievance === false, 'POST /api/ai/analyze-complaint correctly rejects irrelevant image (selfie/pet)');
        assert(resRejectImage.body.rejectionReason && resRejectImage.body.rejectionReason.includes('public grievance'), 'POST /api/ai/analyze-complaint returns correct rejection message for irrelevant image');

        // 6b. Reject complaint creation with missing location
        const resMissingLoc = await mockCall('POST', '/api/complaints/create', {
            title: 'Road Damage with deep pothole',
            description: 'Asphalt worn out creating vehicular hazard',
            categoryId: 1,
            location: ''
        }, { authorization: `Bearer ${tokens['citizen']}` });
        assert(resMissingLoc.status === 400 && resMissingLoc.raw.includes('location is mandatory'), 'POST /api/complaints/create rejects submission when location is missing');

        // 6c. Reject complaint creation with irrelevant grievance image
        const resRejectCompCreate = await mockCall('POST', '/api/complaints/create', {
            title: 'Personal Selfie',
            description: 'My picture at the mall',
            location: 'Ward 12, Main St.',
            evidenceImageData: 'data:image/jpeg;base64,dGVzdA==',
            evidenceFileName: 'selfie.jpg',
            visualHint: 'Irrelevant'
        }, { authorization: `Bearer ${tokens['citizen']}` });
        assert(resRejectCompCreate.status === 400, 'POST /api/complaints/create blocks submission of irrelevant grievance photo');

        // 6d. Accept valid civic complaint with location & evidence
        const resCreateComp = await mockCall('POST', '/api/complaints/create', {
            title: 'Broken water pipe leaking on main road',
            description: 'Massive water leakage creating pool and traffic obstruction.',
            categoryId: 4,
            location: 'Ward 12, Hospital Road',
            latitude: 12.9716,
            longitude: 77.5946,
            evidenceImageData: 'data:image/jpeg;base64,Y2l2aWNfd2F0ZXJfcGlwZQ==',
            evidenceFileName: 'water_pipe_leak.jpg',
            visualHint: 'Water Supply'
        }, { authorization: `Bearer ${tokens['citizen']}` });
        assert(resCreateComp.status === 201 && resCreateComp.body.complaintId && resCreateComp.body.complaintRef, `POST /api/complaints/create creates valid civic complaint with Ref: ${resCreateComp.body ? resCreateComp.body.complaintRef : ''}`);
        const complaintId = resCreateComp.body ? resCreateComp.body.complaintId : 1;

        // 7. Citizen fetches own complaints
        const resMyComplaints = await mockCall('GET', '/api/complaints/my', null, { authorization: `Bearer ${tokens['citizen']}` });
        assert(resMyComplaints.status === 200 && Array.isArray(resMyComplaints.body) && resMyComplaints.body.length > 0, `GET /api/complaints/my returns ${resMyComplaints.body ? resMyComplaints.body.length : 0} complaints`);

        // 8. Officer assigns complaint to vendor
        const resAssign = await mockCall('POST', '/api/officer/complaints/assign', {
            complaintId: complaintId,
            vendorId: 5, // vendor (Sunil Patil)
            notes: 'High priority road & trench patch dispatch'
        }, { authorization: `Bearer ${tokens['officer']}` });
        assert(resAssign.status === 201 && resAssign.body.assignmentId, `POST /api/officer/complaints/assign assigned complaint to vendor`);
        const assignmentId = resAssign.body ? resAssign.body.assignmentId : 1;

        // 8b. Verify Officer Complaint view displays assigned contractor info
        const resOfficerComplaints = await mockCall('GET', '/api/officer/complaints', null, { authorization: `Bearer ${tokens['officer']}` });
        assert(resOfficerComplaints.status === 200 && Array.isArray(resOfficerComplaints.body.content), 'GET /api/officer/complaints returns list');
        const assignedComplaintInOfficer = resOfficerComplaints.body.content.find(c => c.complaintId === complaintId);
        assert(assignedComplaintInOfficer && (assignedComplaintInOfficer.assignedVendorName || assignedComplaintInOfficer.assignedVendorUsername), 'Officer dashboard displays assigned contractor name');

        // 9. Vendor Assignment Lifecycle (Accept / Reject & Two-Stage Field Execution)
        // 9a. Vendor views only their assigned tasks
        const resVendorTasks = await mockCall('GET', '/api/vendor/assignments', null, { authorization: `Bearer ${tokens['vendor']}` });
        assert(resVendorTasks.status === 200 && Array.isArray(resVendorTasks.body), 'GET /api/vendor/assignments returns task list for vendor');
        assert(resVendorTasks.body.every(a => a.vendorId === 5), 'GET /api/vendor/assignments filters strictly to complaints assigned to this vendor');

        // 9b. Vendor accepts work order
        const resAcceptWo = await mockCall('PUT', `/api/vendor/assignments/${assignmentId}/accept`, null, { authorization: `Bearer ${tokens['vendor']}` });
        assert(resAcceptWo.status === 200 && resAcceptWo.body.status === 'ACCEPTED', 'Vendor accepts assigned work order -> status becomes ACCEPTED');

        // 9c. Stage 1: Start Field Work requires notes, inspection image, and site GPS
        const resStage1Incomplete = await mockCall('PUT', `/api/vendor/assignments/${assignmentId}/status`, {
            status: 'IN_PROGRESS',
            notes: '' // missing notes and photo and GPS
        }, { authorization: `Bearer ${tokens['vendor']}` });
        assert(resStage1Incomplete.status === 400, 'Stage 1: Rejects IN_PROGRESS without field notes, site inspection image, and GPS');

        const resStage1Complete = await mockCall('PUT', `/api/vendor/assignments/${assignmentId}/status`, {
            status: 'IN_PROGRESS',
            notes: 'Field crew arrived on site with safety cones and pavement cutter.',
            evidenceImageData: 'data:image/jpeg;base64,c2l0ZV9pbnNwZWN0aW9uX3Bob3Rv',
            latitude: 12.9716,
            longitude: 77.5946
        }, { authorization: `Bearer ${tokens['vendor']}` });
        assert(resStage1Complete.status === 200 && resStage1Complete.body.status === 'IN_PROGRESS', 'Stage 1: IN_PROGRESS saved successfully with notes, inspection image, and site GPS');
        assert(resStage1Complete.body.history && resStage1Complete.body.history.length > 0, 'Stage 1: Assignment history logs START_FIELD_WORK with GPS and timestamp');

        // 9c. Stage 2: AI Vision Repair QA Check
        const resAiQaDuplicate = await mockCall('POST', '/api/ai/verify-resolution', {
            complaintId: complaintId,
            beforePhotoBase64: 'data:image/jpeg;base64,c2l0ZV9pbnNwZWN0aW9uX3Bob3Rv',
            afterPhotoBase64: 'data:image/jpeg;base64,c2l0ZV9pbnNwZWN0aW9uX3Bob3Rv' // duplicate
        });
        assert(resAiQaDuplicate.status === 200 && resAiQaDuplicate.body.passed === false, 'Stage 2: AI Vision Repair QA Check detects and rejects duplicate/identical image');

        const resAiQaPass = await mockCall('POST', '/api/ai/verify-resolution', {
            complaintId: complaintId,
            beforePhotoBase64: 'data:image/jpeg;base64,YmVmb3JlX3BvdGhvbGVfaW1hZ2U=',
            afterPhotoBase64: 'data:image/jpeg;base64,YWZ0ZXJfcmVwYWlyZWRfcGF0Y2hlZF9yb2Fk'
        });
        assert(resAiQaPass.status === 200 && resAiQaPass.body.passed === true && resAiQaPass.body.qualityScore >= 70, 'Stage 2: AI Vision Repair QA Check passes verified repair image');

        // 9d. Stage 2: Complete repair work with completion notes, proof image, GPS, and QA score
        const resStage2Complete = await mockCall('PUT', `/api/vendor/assignments/${assignmentId}/status`, {
            status: 'COMPLETED',
            notes: 'Hot bituminous asphalt patch laid, compacted with tandem roller, and road surface leveled.',
            evidenceImageData: 'data:image/jpeg;base64,YWZ0ZXJfcmVwYWlyZWRfcGF0Y2hlZF9yb2Fk',
            latitude: 12.9718,
            longitude: 77.5948,
            aiVerificationScore: resAiQaPass.body.qualityScore,
            aiVerificationNote: resAiQaPass.body.reason
        }, { authorization: `Bearer ${tokens['vendor']}` });
        assert(resStage2Complete.status === 200 && resStage2Complete.body.status === 'COMPLETED', 'Stage 2: COMPLETED status saved successfully with repair proof, GPS, and AI QA score');
        assert(resStage2Complete.body.history.some(h => h.stage === 'COMPLETE_REPAIR_WORK'), 'Stage 2: Assignment history logs COMPLETE_REPAIR_WORK with GPS, images, and notes');

        // 10. Representative Location-Based Access & Jurisdiction Isolation
        // 10a. Representative views strictly area-filtered complaints
        const resRepComplaints = await mockCall('GET', '/api/representative/complaints', null, { authorization: `Bearer ${tokens['representative']}` });
        assert(resRepComplaints.status === 200 && Array.isArray(resRepComplaints.body.content), 'GET /api/representative/complaints returns area complaints list');
        
        // Rep is assigned to "Ward 12 - Central District". All complaints returned must be in Ward 12!
        const allInWard12 = resRepComplaints.body.content.every(c => c.location && c.location.includes('Ward 12'));
        assert(allInWard12, 'GET /api/representative/complaints filters strictly to complaints in assigned Ward 12');
        
        // Complaint 3 is in "Ward 14 - North Zone", so Ward 12 representative must NOT see it!
        const seesWard14 = resRepComplaints.body.content.some(c => c.complaintId === 3);
        assert(!seesWard14, 'Representative for Ward 12 CANNOT see Complaint 3 from Ward 14');

        // 10b. Work done proof appears for completed work in representative jurisdiction
        const cInRep = resRepComplaints.body.content.find(c => c.complaintId === complaintId);
        assert(cInRep && cInRep.completionEvidenceImageData && cInRep.completionLatitude, 'Completed work proof (photo & GPS) appears in representative portal according to location');
        assert(cInRep && cInRep.assignedVendorName, 'Contractor details appear in representative complaint details');

        // 10c. Area-specific statistics
        const resRepStats = await mockCall('GET', '/api/representative/complaints/stats', null, { authorization: `Bearer ${tokens['representative']}` });
        assert(resRepStats.status === 200 && resRepStats.body.area.includes('Ward 12'), `GET /api/representative/complaints/stats returns area: "${resRepStats.body.area}"`);
        assert(resRepStats.body.total === resRepComplaints.body.content.length, 'GET /api/representative/complaints/stats calculates area-specific total matching jurisdiction count');
        assert(resRepStats.body.completed !== undefined, 'Representative stats include completed work count');

        // 10d. Backend Authorization: Attempting to modify a complaint outside jurisdiction returns 403 Forbidden!
        const resCrossWardEscalate = await mockCall('PUT', '/api/representative/complaints/3/escalate', null, { authorization: `Bearer ${tokens['representative']}` });
        assert(resCrossWardEscalate.status === 403, 'PUT /api/representative/complaints/3/escalate returns 403 Forbidden for cross-ward access attempt');

        const resWard12Escalate = await mockCall('PUT', '/api/representative/complaints/1/escalate', null, { authorization: `Bearer ${tokens['representative']}` });
        assert(resWard12Escalate.status === 200, 'PUT /api/representative/complaints/1/escalate succeeds for complaint inside representative jurisdiction');

        // 10e. Representative endorses completed work in their area
        const resEndorse = await mockCall('PUT', '/api/representative/complaints/1/endorse', null, { authorization: `Bearer ${tokens['representative']}` });
        assert(resEndorse.status === 200 && resEndorse.body.newStatus === 'CLOSED', 'Representative endorses completed work order inside jurisdiction');

        // 11. AI Triage & Vision Analysis - 100% Accurate Categorization for all 5 Civic Issue Types
        const resAiRoad = await mockCall('POST', '/api/ai/analyze-complaint', {
            title: 'Deep road potholes near high school',
            description: 'Vehicles slipping due to rough gravel and large pothole.'
        });
        assert(resAiRoad.status === 200 && resAiRoad.body.suggestedCategoryName === 'Road Damage', 'AI correctly categorized Road Damage');

        const resAiWater = await mockCall('POST', '/api/ai/analyze-complaint', {
            title: 'Main pipeline ruptured and water gushing',
            description: 'Drinking water pipe burst on 4th cross, clean water leaking continuously.'
        });
        assert(resAiWater.status === 200 && resAiWater.body.suggestedCategoryName === 'Water Supply', 'AI correctly categorized Water Supply');

        const resAiDrain = await mockCall('POST', '/api/ai/analyze-complaint', {
            title: 'Blocked stormwater gutter overflowing',
            description: 'Open sewer drain choked with black sewage water stagnation.'
        });
        assert(resAiDrain.status === 200 && resAiDrain.body.suggestedCategoryName === 'Drainage', 'AI correctly categorized Drainage');

        const resAiGarb = await mockCall('POST', '/api/ai/analyze-complaint', {
            title: 'Unattended municipal garbage dump on pavement',
            description: 'Rotting trash pile and solid waste debris causing bad smell.'
        });
        assert(resAiGarb.status === 200 && resAiGarb.body.suggestedCategoryName === 'Garbage', 'AI correctly categorized Garbage');

        const resAiLight = await mockCall('POST', '/api/ai/analyze-complaint', {
            title: 'Defective street light pole in dark transit lane',
            description: 'Electric lamp not glowing at night, dark street safety hazard.'
        });
        assert(resAiLight.status === 200 && resAiLight.body.suggestedCategoryName === 'Street Lights', 'AI correctly categorized Street Lights');

        // 12. Officer Duplicate Workflow: Move complaint to Duplicate Flagged section & verify
        const resMarkDup = await mockCall('PUT', '/api/officer/complaints/2/duplicate', { isDuplicate: true }, { authorization: `Bearer ${tokens['officer']}` });
        assert(resMarkDup.status === 200 && resMarkDup.body.complaint.isDuplicate === true, 'Officer marks complaint as duplicate and moves to Duplicate Flagged section');

        const resGetDups = await mockCall('GET', '/api/officer/complaints/duplicates', null, { authorization: `Bearer ${tokens['officer']}` });
        assert(resGetDups.status === 200 && resGetDups.body.content.some(d => d.complaintId === 2), 'GET /api/officer/complaints/duplicates includes flagged duplicate');

        const resUnflagDup = await mockCall('PUT', '/api/officer/complaints/2/unflag-duplicate', null, { authorization: `Bearer ${tokens['officer']}` });
        assert(resUnflagDup.status === 200 && resUnflagDup.body.complaint.isDuplicate === false, 'Officer unflags complaint and restores to active status');

        // 13. Representative Dynamic Area Filtering for Custom Constituency
        const resIndiraRep = await mockCall('GET', '/api/representative/complaints?area=Indiranagar', null, { authorization: `Bearer ${tokens['representative']}` });
        assert(resIndiraRep.status === 200 && Array.isArray(resIndiraRep.body.content), 'Representative queries area-specific grievances with custom constituency query');

        // 14. AI Conversational Assistant - Distinct Answers for Different Citizen Questions
        const resChatTrack = await mockCall('POST', '/api/ai/chat', { role: 'CITIZEN', message: 'What is the status of complaint GRV-2026-000001?' });
        assert(resChatTrack.status === 200 && resChatTrack.body.reply.includes('GRV-2026-000001'), 'Chatbot tracks specific complaint reference');

        const resChatPothole = await mockCall('POST', '/api/ai/chat', { role: 'CITIZEN', message: 'How do you fix potholes on the road?' });
        assert(resChatPothole.status === 200 && resChatPothole.body.reply.includes('Road Maintenance'), 'Chatbot gives specific road maintenance answer');

        const resChatWater = await mockCall('POST', '/api/ai/chat', { role: 'CITIZEN', message: 'There is a drinking water pipeline leak' });
        assert(resChatWater.status === 200 && resChatWater.body.reply.includes('Water Supply'), 'Chatbot gives specific water supply answer');

        const resChatSla = await mockCall('POST', '/api/ai/chat', { role: 'CITIZEN', message: 'What is the SLA deadline for repairs?' });
        assert(resChatSla.status === 200 && resChatSla.body.reply.includes('SLA'), 'Chatbot gives specific SLA deadline answer');

        const resChatPhoto = await mockCall('POST', '/api/ai/chat', { role: 'CITIZEN', message: 'Why was my photo rejected by AI Vision?' });
        assert(resChatPhoto.status === 200 && resChatPhoto.body.reply.includes('AI Vision'), 'Chatbot gives photo validation rules answer');

        const resChatHelpline = await mockCall('POST', '/api/ai/chat', { role: 'CITIZEN', message: 'What is the emergency helpline number?' });
        assert(resChatHelpline.status === 200 && resChatHelpline.body.reply.includes('1913'), 'Chatbot provides municipal emergency helplines');

        // 15. Public Portal endpoints
        const resPubStats = await mockCall('GET', '/api/public/stats');
        assert(resPubStats.status === 200 && resPubStats.body.totalComplaints > 0, 'GET /api/public/stats returns public landing stats');

        const resPubIssues = await mockCall('GET', '/api/public/issues');
        assert(resPubIssues.status === 200 && Array.isArray(resPubIssues.body), 'GET /api/public/issues returns public issue list');

        console.log(`\n===================================`);
        console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
        console.log(`===================================\n`);

        if (failed > 0) {
            process.exit(1);
        }
    } catch (err) {
        console.error('Fatal test error:', err);
        process.exit(1);
    }
}

runTests();

