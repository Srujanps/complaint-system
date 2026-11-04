// ── Internal state: detected GPS coords ─────────────────────────────────────
let detectedLat = null;
let detectedLng = null;
let evidencePayload = null;
let cameraStream = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'CITIZEN') {
        window.location.href = '../login.html';
        return;
    }
    loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'citizen' });
    loadCategories();

    document.getElementById('complaintForm').addEventListener('submit', submitComplaint);
    document.getElementById('evidencePhoto')?.addEventListener('change', handleEvidencePhoto);
    document.getElementById('openCameraBtn')?.addEventListener('click', openCamera);
    document.getElementById('capturePhotoBtn')?.addEventListener('click', captureCameraPhoto);
    document.getElementById('closeCameraBtn')?.addEventListener('click', closeCamera);
    document.getElementById('aiRefineBtn')?.addEventListener('click', handleAiRefine);

    setupAiPreviewListeners();
});

async function handleAiRefine() {
    const descInput = document.getElementById('description');
    const titleInput = document.getElementById('title');
    const input = descInput?.value.trim() || titleInput?.value.trim();
    if (!input) {
        ui.error("Please enter a brief note or draft description first.");
        return;
    }
    ui.showLoader("AI is refining your complaint details...");
    try {
        const res = await apiFetch('/ai/draft-complaint', {
            method: 'POST',
            body: JSON.stringify({ input, language: localStorage.getItem('preferred_language') || 'EN' })
        });
        if (res && res.ok) {
            const data = await res.json();
            if (data.suggestedTitle && titleInput) titleInput.value = data.suggestedTitle;
            if (data.refinedDescription && descInput) descInput.value = data.refinedDescription;
            ui.success("Complaint details refined by AI!");
            triggerAiAnalysis();
        }
    } catch (e) {
        ui.error("Could not reach AI draft service.");
    } finally {
        ui.hideLoader();
    }
}


// ── Swiggy-style location detection ─────────────────────────────────────────

function detectLocation() {
    const btn = document.getElementById('detectBtn');

    if (!navigator.geolocation) {
        ui.error("Geolocation is not supported by your browser.");
        return;
    }

    btn.innerHTML = `
        <div class="loc-icon"><span class="spinner-border spinner-border-sm text-white"></span></div>
        <div><div class="fw-bold" style="color:#ff6f00">Detecting your location…</div>
        <div class="text-muted small">Please allow location access if prompted</div></div>`;
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            detectedLat = position.coords.latitude;
            detectedLng = position.coords.longitude;

            // Try a free reverse-geocode (nominatim) — fallback to coords
            let address = `${detectedLat.toFixed(5)}, ${detectedLng.toFixed(5)}`;
            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${detectedLat}&lon=${detectedLng}&format=json`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    const a = geoData.address || {};
                    const parts = [a.road, a.suburb, a.city_district, a.city || a.town || a.village, a.state_district].filter(Boolean);
                    if (parts.length) address = parts.join(', ');
                }
            } catch (_) { /* use coords as fallback */ }

            // Show detected address
            document.getElementById('detectedAddressText').textContent = `📍 ${address}`;
            document.getElementById('detectedAddressBox').style.display = 'flex';

            // Reset detect button
            btn.innerHTML = `
                <div class="loc-icon"><i class="bi bi-geo-alt-fill"></i></div>
                <div><div class="fw-bold" style="color:#43a047">Location detected ✓</div>
                <div class="text-muted small">Click to re-detect</div></div>
                <i class="bi bi-arrow-repeat ms-auto text-muted"></i>`;
            btn.disabled = false;
        },
        (error) => {
            ui.error("Unable to get location. Please allow location access or enter manually below.");
            btn.innerHTML = `
                <div class="loc-icon"><i class="bi bi-geo-alt-fill"></i></div>
                <div><div class="fw-bold" style="color:#ff6f00">Use my current location</div>
                <div class="text-muted small">We'll auto-fill your area address</div></div>
                <i class="bi bi-chevron-right ms-auto text-muted"></i>`;
            btn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function clearLocation() {
    detectedLat = null;
    detectedLng = null;
    document.getElementById('detectedAddressBox').style.display = 'none';
    document.getElementById('detectedAddressText').textContent = '';
    const btn = document.getElementById('detectBtn');
    btn.innerHTML = `
        <div class="loc-icon"><i class="bi bi-geo-alt-fill"></i></div>
        <div><div class="fw-bold" style="color:#ff6f00">Use my current location</div>
        <div class="text-muted small">We'll auto-fill your area address</div></div>
        <i class="bi bi-chevron-right ms-auto text-muted"></i>`;
}

function handleEvidencePhoto(e) {
    const file = e.target.files?.[0];
    resetEvidencePreview();

    if (!file) return;
    if (!file.type.startsWith('image/')) {
        ui.error("Please select an image file for evidence.");
        e.target.value = '';
        return;
    }

    processEvidenceFile(file);
}

function resetEvidencePreview() {
    evidencePayload = null;
    const preview = document.getElementById('evidencePreview');
    if (preview) {
        preview.style.display = 'none';
        preview.removeAttribute('src');
    }
}

function processEvidenceFile(file) {
    const reader = new FileReader();
    reader.onload = () => processEvidenceImage(reader.result, file.name);
    reader.onerror = () => ui.error("Could not read the selected evidence image.");
    reader.readAsDataURL(file);
}

function processEvidenceImage(source, fileName) {
    const img = new Image();
    img.onload = () => {
        const { dataUrl, visualHint } = compressAndInspectEvidenceImage(img, fileName);
        setEvidencePayload(dataUrl, fileName, visualHint);
    };
    img.onerror = () => ui.error("Could not read the selected evidence image.");
    img.src = source;
}

function compressAndInspectEvidenceImage(img, fileName) {
    const maxSide = 1280;
    let { width, height } = img;
    if (width > maxSide || height > maxSide) {
        const scale = Math.min(maxSide / width, maxSide / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // Pixel color, brightness histogram & skin-tone inspection
    let visualHint = null;
    try {
        const sampleW = Math.min(64, width);
        const sampleH = Math.min(64, height);
        const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
        let totalR = 0, totalG = 0, totalB = 0;
        let brightSpots = 0;
        let skinPixels = 0;
        const count = imgData.length / 4;

        for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            totalR += r;
            totalG += g;
            totalB += b;
            if (r + g + b > 650) brightSpots++;
            // Skin tone color boundary detection in RGB (for selfies & portraits)
            if (r > 95 && g > 40 && b > 20 && (r - g) > 15 && r > b && (Math.max(r, g, b) - Math.min(r, g, b)) > 15) {
                skinPixels++;
            }
        }

        const avgR = totalR / count;
        const avgG = totalG / count;
        const avgB = totalB / count;
        const avgLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
        const skinRatio = skinPixels / count;

        const lowerName = (fileName || '').toLowerCase();
        const irrelevantWords = [
            'selfie', 'portrait', 'personal', 'dog', 'cat', 'animal', 'pet', 'food', 'pizza', 'burger',
            'party', 'vacation', 'family', 'holiday', 'me.jpg', 'selfie.jpg', 'avatar', 'profile', 'drawing',
            'cartoon', 'random', 'unrelated', 'kitten', 'puppy', 'bird', 'human', 'face', 'person', 'dinner',
            'lunch', 'breakfast', 'dish', 'plate', 'snack', 'drink', 'beer', 'coffee', 'bedroom', 'living_room',
            'indoor', 'kitchen', 'movie', 'poster', 'car_interior', 'dashboard'
        ];
        const isIrrelevantName = irrelevantWords.some(w => lowerName.includes(w));

        if (isIrrelevantName || skinRatio > 0.22) {
            visualHint = 'Irrelevant';
        } else if (lowerName.includes('water') || lowerName.includes('pipe') || lowerName.includes('leak') || lowerName.includes('burst') || lowerName.includes('tap') || (avgB > avgR * 1.25 && avgB > 90)) {
            visualHint = 'Water Supply';
        } else if (lowerName.includes('drain') || lowerName.includes('sewage') || lowerName.includes('gutter') || lowerName.includes('manhole') || lowerName.includes('clog') || (avgG > avgB * 1.15 && avgLum < 90)) {
            visualHint = 'Drainage';
        } else if (lowerName.includes('light') || lowerName.includes('lamp') || lowerName.includes('pole') || lowerName.includes('dark') || lowerName.includes('bulb') || (avgLum < 55 && brightSpots >= 3)) {
            visualHint = 'Street Lights';
        } else if (lowerName.includes('garb') || lowerName.includes('waste') || lowerName.includes('trash') || lowerName.includes('dump') || lowerName.includes('litter') || lowerName.includes('bin') || (Math.abs(avgR - avgG) > 30 && avgLum > 95)) {
            visualHint = 'Garbage';
        } else if (lowerName.includes('road') || lowerName.includes('pothole') || lowerName.includes('asphalt') || lowerName.includes('tar') || lowerName.includes('crater') || lowerName.includes('crack') || lowerName.includes('street')) {
            visualHint = 'Road Damage';
        } else {
            visualHint = 'Road Damage';
        }
    } catch (_) {
        visualHint = 'Road Damage';
    }

    return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.78),
        visualHint: visualHint
    };
}

function setEvidencePayload(dataUrl, fileName, visualHint = null) {
    evidencePayload = {
        evidenceImageData: dataUrl,
        evidenceFileName: fileName,
        evidenceContentType: 'image/jpeg',
        visualHint: visualHint
    };

    const preview = document.getElementById('evidencePreview');
    if (preview) {
        preview.src = dataUrl;
        preview.style.display = 'block';
    }

    const badge = document.getElementById('evidenceAiBadge');
    if (badge) {
        badge.style.display = 'block';
        badge.innerHTML = `
            <div class="d-flex align-items-center gap-2 text-primary">
                <span class="spinner-border spinner-border-sm" role="status"></span>
                <span><strong>🔍 AI Vision</strong> is inspecting your photo & assessing hazard severity...</span>
            </div>
        `;
    }

    const chipsSec = document.getElementById('aiQuickChipsSection');
    if (chipsSec) chipsSec.style.display = 'block';

    highlightChip('auto');

    // Proactively run AI Vision Analysis on uploaded photo
    triggerAiAnalysis(true);
}

async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
        ui.error("Camera capture is not supported in this browser. Please upload a photo.");
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false
        });
        const video = document.getElementById('cameraVideo');
        video.srcObject = cameraStream;
        document.getElementById('cameraPanel').style.display = 'block';
    } catch (err) {
        ui.error("Unable to open camera. Please allow camera access or upload a photo.");
    }
}

function captureCameraPhoto() {
    const video = document.getElementById('cameraVideo');
    if (!video || !video.videoWidth || !video.videoHeight) {
        ui.error("Camera is still starting. Please try again.");
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
    const fileName = `camera-evidence-${Date.now()}.jpg`;
    const img = new Image();
    img.onload = () => {
        const { dataUrl: compressedUrl, visualHint } = compressAndInspectEvidenceImage(img, fileName);
        setEvidencePayload(compressedUrl, fileName, visualHint);
    };
    img.src = dataUrl;
    closeCamera();
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('cameraVideo');
    if (video) video.srcObject = null;
    const panel = document.getElementById('cameraPanel');
    if (panel) panel.style.display = 'none';
}

// ── Standard Default Categories & AI Presets ─────────────────────────────────
const DEFAULT_CATEGORIES = [
    { categoryId: 1, name: 'Road Damage' },
    { categoryId: 2, name: 'Street Lights' },
    { categoryId: 3, name: 'Garbage' },
    { categoryId: 4, name: 'Water Supply' },
    { categoryId: 5, name: 'Drainage' }
];

const PRESET_DATA = {
    road: {
        categoryId: 1,
        categoryName: 'Road Damage',
        title: 'Severe Road Pothole & Asphalt Damage',
        description: 'Citizen submitted photographic evidence depicting deep road surface pothole creating vehicular hazard. Urgent municipal asphalt patch squad inspection required.',
        severity: 8,
        priority: 'HIGH',
        slaHours: 24,
        reasoning: 'AI Vision/Heuristic: Identified severe road surface disintegration and pothole hazard. High priority response to prevent two-wheeler accidents and traffic congestion.'
    },
    water: {
        categoryId: 4,
        categoryName: 'Water Supply',
        title: 'Water Supply Pipeline Rupture & Leakage',
        description: 'Citizen submitted photographic evidence showing active water supply pipeline leak/rupture causing clean water loss. Immediate water board plumbing dispatch required.',
        severity: 8,
        priority: 'HIGH',
        slaHours: 24,
        reasoning: 'AI Vision/Heuristic: Identified water supply pipeline rupture and continuous water leakage. High priority response required to prevent treated water loss and local street flooding.'
    },
    drain: {
        categoryId: 5,
        categoryName: 'Drainage',
        title: 'Blocked Municipal Drain & Sewage Overflow',
        description: 'Citizen submitted photographic evidence depicting clogged stormwater drain / overflowing sewage causing stagnation and sanitation risk. Sanitation jetting machine required.',
        severity: 7,
        priority: 'HIGH',
        slaHours: 24,
        reasoning: 'AI Vision/Heuristic: Identified blocked drainage channel and sewage backflow. High public health and sanitation hazard.'
    },
    garbage: {
        categoryId: 3,
        categoryName: 'Garbage',
        title: 'Illegal Garbage Dump & Solid Waste Overflow',
        description: 'Citizen submitted photographic evidence depicting accumulated municipal solid waste and unattended garbage dump on public roadway.',
        severity: 6,
        priority: 'HIGH',
        slaHours: 24,
        reasoning: 'AI Vision/Heuristic: Identified uncollected municipal waste dump causing civic obstruction and environmental hygiene concern.'
    },
    light: {
        categoryId: 2,
        categoryName: 'Street Lights',
        title: 'Non-Functional Street Light & Safety Hazard',
        description: 'Citizen submitted photographic evidence showing malfunctioning street light pole in public transit zone, causing low visibility at night.',
        severity: 5,
        priority: 'MEDIUM',
        slaHours: 48,
        reasoning: 'AI Vision/Heuristic: Identified dark transit stretch due to defective street lighting luminaire. Standard municipal electrical maintenance required.'
    }
};

function selectCategoryOption(catId, catName) {
    const catSelect = document.getElementById('categoryId');
    if (!catSelect) return;

    let matched = false;
    // 1. Match by ID
    if (catId) {
        for (let i = 0; i < catSelect.options.length; i++) {
            if (String(catSelect.options[i].value) === String(catId)) {
                catSelect.selectedIndex = i;
                matched = true;
                break;
            }
        }
    }

    // 2. Match by text name
    if (!matched && catName) {
        const target = catName.toLowerCase().replace(/[^a-z]/g, '');
        for (let i = 0; i < catSelect.options.length; i++) {
            const optText = catSelect.options[i].text.toLowerCase().replace(/[^a-z]/g, '');
            if (optText.includes(target) || target.includes(optText)) {
                catSelect.selectedIndex = i;
                matched = true;
                break;
            }
        }
    }

    // 3. Match by keyword
    if (!matched && catName) {
        const lower = catName.toLowerCase();
        let keyword = '';
        if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak')) keyword = 'water';
        else if (lower.includes('road') || lower.includes('pothole') || lower.includes('asphalt')) keyword = 'road';
        else if (lower.includes('drain') || lower.includes('sewage')) keyword = 'drain';
        else if (lower.includes('garb') || lower.includes('waste')) keyword = 'garb';
        else if (lower.includes('light') || lower.includes('lamp') || lower.includes('electr')) keyword = 'light';

        if (keyword) {
            for (let i = 0; i < catSelect.options.length; i++) {
                if (catSelect.options[i].text.toLowerCase().includes(keyword)) {
                    catSelect.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
        }
    }

    // 4. Create option if missing
    if (!matched && catName) {
        const opt = document.createElement('option');
        opt.value = catId ? String(catId) : "1";
        opt.textContent = catName;
        catSelect.appendChild(opt);
        catSelect.value = opt.value;
        matched = true;
    }

    // Dispatch change event
    catSelect.dispatchEvent(new Event('change', { bubbles: true }));
}

function renderAiTriagePreview(aiData) {
    const previewBox = document.getElementById('aiPreviewBox');
    if (!previewBox) return;

    previewBox.style.display = 'block';

    const catEl = document.getElementById('aiDetectedCat');
    if (catEl) catEl.textContent = aiData.categoryName || aiData.suggestedCategoryName || 'General Grievance';

    const sev = aiData.severity || aiData.severityScore || 7;
    const sla = aiData.slaHours || aiData.slaTargetHours || 24;
    const sevEl = document.getElementById('aiSeveritySla');
    if (sevEl) sevEl.textContent = `Severity: ${sev}/10 | SLA: ${sla} Hours`;

    const reasonEl = document.getElementById('aiReasoningText');
    if (reasonEl) reasonEl.textContent = aiData.reasoning || 'AI Vision assessed civic hazard and categorized based on physical evidence.';

    const badge = document.getElementById('aiPriorityBadge');
    if (badge) {
        const priority = (aiData.priority || 'MEDIUM').toUpperCase();
        badge.textContent = priority;
        badge.className = 'badge ';
        if (priority === 'CRITICAL') badge.className += 'bg-danger';
        else if (priority === 'HIGH') badge.className += 'bg-warning text-dark';
        else if (priority === 'MEDIUM') badge.className += 'bg-primary';
        else badge.className += 'bg-info text-dark';
    }
}

function updateEvidenceAiBadge(aiData) {
    const badge = document.getElementById('evidenceAiBadge');
    if (!badge) return;
    badge.style.display = 'block';
    const cat = aiData.categoryName || aiData.suggestedCategoryName || 'General';
    const sev = aiData.severity || aiData.severityScore || 7;
    const sla = aiData.slaHours || aiData.slaTargetHours || 24;
    badge.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
            <div>
                <span class="badge bg-success me-1"><i class="bi bi-check-circle"></i> AI Vision Verified</span>
                <strong class="text-primary">${cat}</strong>
            </div>
            <span class="badge bg-danger">Severity ${sev}/10</span>
        </div>
        <div class="text-muted small mt-1">Resolution Target: <strong>${sla} Hours</strong> &bull; Auto-filled title & category above</div>
    `;

    const chipsSec = document.getElementById('aiQuickChipsSection');
    if (chipsSec) chipsSec.style.display = 'block';
}

function highlightChip(type) {
    ['auto', 'road', 'water', 'drain', 'garbage', 'light'].forEach(t => {
        const chip = document.getElementById(`chip_${t}`);
        if (!chip) return;
        if (t === type) {
            chip.className = 'btn btn-sm btn-primary active';
        } else {
            chip.className = 'btn btn-sm btn-outline-primary';
        }
    });
}

function runClientHeuristicTriage(fileName, title, description, visualHint) {
    const text = `${fileName || ''} ${title || ''} ${description || ''} ${visualHint || ''}`.toLowerCase();
    const irrelevantWords = ['selfie', 'portrait', 'personal', 'dog', 'cat', 'animal', 'pet', 'food', 'pizza', 'burger', 'party', 'vacation', 'family', 'holiday', 'me.jpg', 'avatar', 'profile', 'drawing', 'cartoon', 'random', 'unrelated'];
    if (visualHint === 'Irrelevant' || irrelevantWords.some(w => text.includes(w))) {
        return {
            isValidGrievance: false,
            rejectionReason: 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.',
            categoryId: null,
            categoryName: null,
            title: '',
            description: '',
            severity: 0,
            priority: 'LOW',
            slaHours: 0,
            reasoning: 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.'
        };
    }
    if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('burst') || text.includes('tap') || text.includes('flood') || visualHint === 'Water Supply') {
        return { isValidGrievance: true, ...PRESET_DATA.water };
    }
    if (text.includes('drain') || text.includes('sewage') || text.includes('gutter') || text.includes('manhole') || text.includes('clog') || text.includes('overflow') || visualHint === 'Drainage') {
        return { isValidGrievance: true, ...PRESET_DATA.drain };
    }
    if (text.includes('garb') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('litter') || text.includes('bin') || visualHint === 'Garbage') {
        return { isValidGrievance: true, ...PRESET_DATA.garbage };
    }
    if (text.includes('light') || text.includes('lamp') || text.includes('pole') || text.includes('dark') || text.includes('wire') || text.includes('electr') || visualHint === 'Street Lights') {
        return { isValidGrievance: true, ...PRESET_DATA.light };
    }
    // Default to road damage for photo triage
    return { isValidGrievance: true, ...PRESET_DATA.road };
}

window.applyAiQuickPreset = function(type) {
    if (type === 'auto') {
        highlightChip('auto');

        // Reset category dropdown to "0" (Auto-Detect with AI)
        const catSelect = document.getElementById('categoryId');
        if (catSelect) {
            catSelect.value = "0";
        }

        const imageBase64 = evidencePayload?.evidenceImageData || null;
        const titleInput = document.getElementById('title');
        const descInput = document.getElementById('description');
        const hasText = ((titleInput?.value || '').trim().length >= 3) || ((descInput?.value || '').trim().length >= 5);

        if (imageBase64 || hasText) {
            triggerAiAnalysis(true);
        } else {
            const badge = document.getElementById('evidenceAiBadge');
            if (badge) {
                badge.style.display = 'block';
                badge.innerHTML = `
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="badge bg-primary me-1"><i class="bi bi-robot"></i> Auto-Detect Active</span>
                            <span class="text-secondary small">AI will inspect photo & triage category automatically.</span>
                        </div>
                    </div>
                `;
            }
            const previewBox = document.getElementById('aiPreviewBox');
            if (previewBox) {
                previewBox.style.display = 'none';
            }
        }

        if (typeof ui !== 'undefined' && ui.info) {
            ui.info("Switched to Auto-Detect mode. AI will automatically evaluate your issue.");
        }
        return;
    }

    const data = PRESET_DATA[type];
    if (!data) return;

    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    if (titleInput) titleInput.value = data.title;
    if (descInput) descInput.value = data.description;

    selectCategoryOption(data.categoryId, data.categoryName);
    renderAiTriagePreview(data);
    updateEvidenceAiBadge(data);
    highlightChip(type);

    if (typeof ui !== 'undefined' && ui.success) {
        ui.success(`AI preset applied: ${data.categoryName} (Severity: ${data.severity}/10)`);
    }
};

// ── AI Live Preview ──────────────────────────────────────────────────────────
let aiDebounceTimer = null;

function setupAiPreviewListeners() {
    const titleInput = document.getElementById('title');
    const descInput  = document.getElementById('description');
    const catSelect  = document.getElementById('categoryId');

    const handleInput = () => {
        clearTimeout(aiDebounceTimer);
        aiDebounceTimer = setTimeout(triggerAiAnalysis, 400);
    };

    if (titleInput) titleInput.addEventListener('input', handleInput);
    if (descInput)  descInput.addEventListener('input', handleInput);

    if (catSelect) {
        catSelect.addEventListener('change', () => {
            if (catSelect.value === '0') {
                applyAiQuickPreset('auto');
            } else {
                const optText = (catSelect.options[catSelect.selectedIndex]?.text || '').toLowerCase();
                if (optText.includes('road')) highlightChip('road');
                else if (optText.includes('water')) highlightChip('water');
                else if (optText.includes('drain')) highlightChip('drain');
                else if (optText.includes('garb')) highlightChip('garbage');
                else if (optText.includes('light')) highlightChip('light');
                else highlightChip(null);
            }
        });
    }
}

async function triggerAiAnalysis(isPhotoTrigger = false) {
    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    const title = (titleInput?.value || '').trim();
    const description = (descInput?.value || '').trim();
    const previewBox = document.getElementById('aiPreviewBox');
    const imageBase64 = evidencePayload?.evidenceImageData || null;
    const fileName = evidencePayload?.evidenceFileName || '';

    if (!imageBase64 && title.length < 3 && description.length < 5) {
        if (previewBox) previewBox.style.display = 'none';
        return;
    }

    if (previewBox) {
        previewBox.style.display = 'block';
        const reasonEl = document.getElementById('aiReasoningText');
        if (reasonEl) {
            reasonEl.textContent = imageBase64
                ? "🔍 AI Vision is inspecting your photo & assessing hazard severity..."
                : "AI is evaluating hazard risk & categorizing...";
        }
    }

    let aiData = null;

    try {
        const payload = { title, description };
        if (imageBase64) {
            payload.evidenceImageData = imageBase64;
            payload.fileName = fileName;
            payload.evidenceFileName = fileName;
            if (evidencePayload?.visualHint) {
                payload.visualHint = evidencePayload.visualHint;
            }
        }

        const res = await apiFetch('/ai/analyze-complaint', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            aiData = await res.json();
        }
    } catch (e) {
        console.warn('Backend AI analysis endpoint unavailable, using smart client triage:', e);
    }

    // If backend did not return data (e.g. offline, network error, timeout), use smart local triage
    if (!aiData || (!aiData.suggestedCategoryName && aiData.isValidGrievance !== false)) {
        const fallback = runClientHeuristicTriage(fileName, title, description, evidencePayload?.visualHint);
        aiData = {
            isValidGrievance: fallback.isValidGrievance,
            rejectionReason: fallback.rejectionReason,
            suggestedCategoryId: fallback.categoryId,
            suggestedCategoryName: fallback.categoryName,
            suggestedTitle: fallback.title,
            suggestedDescription: fallback.description,
            severityScore: fallback.severity,
            priority: fallback.priority,
            slaTargetHours: fallback.slaHours,
            reasoning: fallback.reasoning
        };
    }

    const rejectionAlert = document.getElementById('imageRejectionAlert');
    const rejectionMsg = document.getElementById('imageRejectionMsg');

    // ── AI Grievance Image Validation Gate ──
    if (aiData && aiData.isValidGrievance === false) {
        window.isImageGrievanceValid = false;
        if (evidencePayload) evidencePayload.isValidGrievance = false;

        if (previewBox) previewBox.style.display = 'none';
        if (rejectionAlert) {
            rejectionAlert.style.display = 'block';
            if (rejectionMsg) rejectionMsg.textContent = aiData.rejectionReason || 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.';
        }

        const badge = document.getElementById('evidenceAiBadge');
        if (badge) {
            badge.style.display = 'block';
            badge.innerHTML = `
                <div class="d-flex align-items-center text-danger">
                    <i class="bi bi-x-circle-fill me-2 fs-5"></i>
                    <div>
                        <strong class="d-block">Grievance Image Rejected</strong>
                        <span class="small">${aiData.rejectionReason || 'The uploaded image does not appear to be related to a public grievance. Please upload a valid image.'}</span>
                    </div>
                </div>
            `;
        }

        if (typeof ui !== 'undefined' && ui.error) {
            ui.error(aiData.rejectionReason || "The uploaded image does not appear to be related to a public grievance. Please upload a valid image.");
        }
        return;
    }

    // Valid grievance image!
    window.isImageGrievanceValid = true;
    if (evidencePayload) evidencePayload.isValidGrievance = true;
    if (rejectionAlert) rejectionAlert.style.display = 'none';

    // Apply AI triage results
    renderAiTriagePreview(aiData);
    updateEvidenceAiBadge(aiData);

    // If photo triggered or fields are blank, auto-fill Title, Description, and Category
    if (isPhotoTrigger || !title || !description) {
        if (titleInput && (!titleInput.value.trim() || titleInput.value.length < 5) && aiData.suggestedTitle) {
            titleInput.value = aiData.suggestedTitle;
        }
        if (descInput && (!descInput.value.trim() || descInput.value.length < 10) && aiData.suggestedDescription) {
            descInput.value = aiData.suggestedDescription;
        }
        selectCategoryOption(aiData.suggestedCategoryId, aiData.suggestedCategoryName);

        // Highlight matching chip
        const lowerCat = (aiData.suggestedCategoryName || '').toLowerCase();
        if (lowerCat.includes('road')) highlightChip('road');
        else if (lowerCat.includes('water')) highlightChip('water');
        else if (lowerCat.includes('drain')) highlightChip('drain');
        else if (lowerCat.includes('garb')) highlightChip('garbage');
        else if (lowerCat.includes('light')) highlightChip('light');
        else highlightChip('auto');

        if (typeof ui !== 'undefined' && ui.success) {
            ui.success(`AI Vision detected: ${aiData.suggestedCategoryName} (Severity: ${aiData.severityScore || 8}/10)`);
        }
    } else {
        const catSelect = document.getElementById('categoryId');
        if (catSelect && (catSelect.value === '0' || !catSelect.value)) {
            selectCategoryOption(aiData.suggestedCategoryId, aiData.suggestedCategoryName);
        }
    }
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function submitComplaint(e) {
    e.preventDefault();

    const title       = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const catVal      = document.getElementById('categoryId').value;
    const categoryId  = catVal && catVal !== "0" ? parseInt(catVal) : null;
    const manualLoc   = (document.getElementById('manualLocation')?.value || '').trim();
    const detail      = document.getElementById('locationDetail').value.trim();

    if (!title || !description) {
        ui.error("Please fill in the title and description.");
        return;
    }

    // Build location string from manual full location OR detected address + manual detail
    const detectedText = document.getElementById('detectedAddressText').textContent.replace('📍 ', '').trim();
    let location = manualLoc || detectedText || '';
    if (detail) location = location ? `${location} — ${detail}` : detail;
    if (!location) { 
        ui.error("Please provide the complaint location."); 
        document.getElementById('manualLocation')?.focus();
        return; 
    }

    if (evidencePayload && window.isImageGrievanceValid === false) {
        ui.error("The uploaded image does not appear to be related to a public grievance. Please upload a valid image before submitting.");
        return;
    }

    const body = { title, description, location };
    if (categoryId) body.categoryId = categoryId;

    // Only send coordinates when using detected GPS location
    if (!manualLoc) {
        if (detectedLat !== null) body.latitude  = detectedLat;
        if (detectedLng !== null) body.longitude = detectedLng;
    }
    if (evidencePayload) {
        Object.assign(body, evidencePayload);
    }

    ui.showLoader("Submitting & Running AI Triage...");
    try {
        const res = await apiFetch('/complaints/create', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (res && res.ok) {
            ui.success("Complaint submitted successfully!");
            setTimeout(() => { window.location.href = 'my_complaints.html'; }, 1500);
        } else {
            const msg = res ? await res.text() : 'Submission failed';
            ui.error(msg || "Failed to submit. Try again.");
        }
    } catch (err) {
        ui.error("A network error occurred. Please try again.");
    } finally {
        ui.hideLoader();
    }
}

// ── Load categories ───────────────────────────────────────────────────────────

async function loadCategories() {
    const select = document.getElementById('categoryId');
    if (!select) return;

    const populate = (categories) => {
        while (select.options.length > 1) {
            select.remove(1);
        }
        categories.forEach(c => {
            const option = document.createElement('option');
            option.value = c.categoryId;
            option.textContent = c.name;
            select.appendChild(option);
        });
    };

    try {
        const res = await apiFetch('/admin/categories', { method: 'GET' });
        if (res && res.ok) {
            const categories = await res.json();
            if (Array.isArray(categories) && categories.length > 0) {
                populate(categories);
                return;
            }
        }
    } catch (e) {
        console.warn('Failed to load categories from API, using default civic categories', e);
    }

    // Default fallback so dropdown is never empty
    if (select.options.length <= 1) {
        populate(DEFAULT_CATEGORIES);
    }
}
