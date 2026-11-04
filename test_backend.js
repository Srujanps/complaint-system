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
        const resReg = await mockCall('POST', '/api/auth/register', {
            username: newUsername,
            password: 'password123',
            email: `${newUsername}@example.com`,
            role: 'CITIZEN',
            fullName: 'Test Citizen User',
            phone: '1234567890'
        });
        assert(resReg.status === 201 && resReg.body.token, `POST /api/auth/register registers new user "${newUsername}"`);

        // 4. Admin Categories
        const resCats = await mockCall('GET', '/api/admin/categories', null, { authorization: `Bearer ${tokens['admin']}` });
        assert(resCats.status === 200 && Array.isArray(resCats.body) && resCats.body.length >= 5, `GET /api/admin/categories returns ${resCats.body ? resCats.body.length : 0} categories`);

        // 5. Admin Statistics
        const resStats = await mockCall('GET', '/api/admin/statistics', null, { authorization: `Bearer ${tokens['admin']}` });
        assert(resStats.status === 200 && resStats.body.complaints && resStats.body.users, 'GET /api/admin/statistics returns complaint and user analytics');

        // 6. Citizen creates complaint
        const resCreateComp = await mockCall('POST', '/api/complaints/create', {
            title: 'Broken water pipe leaking on main road',
            description: 'Massive water leakage creating pool and traffic obstruction.',
            categoryId: 4,
            location: 'Ward 12, Hospital Road',
            latitude: 12.9716,
            longitude: 77.5946
        }, { authorization: `Bearer ${tokens['citizen']}` });
        assert(resCreateComp.status === 201 && resCreateComp.body.complaintId && resCreateComp.body.complaintRef, `POST /api/complaints/create creates complaint with Ref: ${resCreateComp.body ? resCreateComp.body.complaintRef : ''}`);
        const complaintId = resCreateComp.body ? resCreateComp.body.complaintId : 1;

        // 7. Citizen fetches own complaints
        const resMyComplaints = await mockCall('GET', '/api/complaints/my', null, { authorization: `Bearer ${tokens['citizen']}` });
        assert(resMyComplaints.status === 200 && Array.isArray(resMyComplaints.body) && resMyComplaints.body.length > 0, `GET /api/complaints/my returns ${resMyComplaints.body ? resMyComplaints.body.length : 0} complaints`);

        // 8. Officer assigns complaint to vendor
        const resAssign = await mockCall('POST', '/api/officer/complaints/assign', {
            complaintId: complaintId,
            vendorId: 6, // vendor_water
            notes: 'Emergency water repair assignment'
        }, { authorization: `Bearer ${tokens['officer']}` });
        assert(resAssign.status === 201 && resAssign.body.assignmentId, `POST /api/officer/complaints/assign assigned complaint to vendor`);
        const assignmentId = resAssign.body ? resAssign.body.assignmentId : 1;

        // 9. Vendor views assignments & updates status
        const resVendorTasks = await mockCall('GET', '/api/vendor/assignments', null, { authorization: `Bearer ${tokens['vendor']}` });
        assert(resVendorTasks.status === 200 && Array.isArray(resVendorTasks.body), 'GET /api/vendor/assignments returns task list');

        const resUpdateTask = await mockCall('PUT', `/api/vendor/assignments/${assignmentId}/status`, {
            status: 'COMPLETED',
            notes: 'Pipeline clamped and asphalt restored.'
        }, { authorization: `Bearer ${tokens['vendor']}` });
        assert(resUpdateTask.status === 200 && resUpdateTask.body.status === 'COMPLETED', `PUT /api/vendor/assignments/${assignmentId}/status updated status to COMPLETED`);

        // 10. Representative views area stats
        const resRepStats = await mockCall('GET', '/api/representative/complaints/stats', null, { authorization: `Bearer ${tokens['representative']}` });
        assert(resRepStats.status === 200 && resRepStats.body.area, `GET /api/representative/complaints/stats returns area: "${resRepStats.body ? resRepStats.body.area : ''}"`);

        // 11. AI Triage & Vision Analysis
        const resAiAnalyze = await mockCall('POST', '/api/ai/analyze-complaint', {
            title: 'Deep road potholes near high school',
            description: 'Vehicles slipping due to rough gravel and large pothole.'
        });
        assert(resAiAnalyze.status === 200 && resAiAnalyze.body.suggestedCategoryName === 'Road Damage', `POST /api/ai/analyze-complaint correctly classified as "${resAiAnalyze.body ? resAiAnalyze.body.suggestedCategoryName : ''}"`);

        // 12. AI Conversational RAG Assistant
        const resAiChat = await mockCall('POST', '/api/ai/chat', {
            role: 'CITIZEN',
            message: 'What is the status of complaint GRV-2026-000001?'
        });
        assert(resAiChat.status === 200 && resAiChat.body.reply.includes('GRV-2026-000001'), 'POST /api/ai/chat retrieved real-time grievance tracking info');

        // 13. Public Portal endpoints
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

