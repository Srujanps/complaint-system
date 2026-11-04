/**
 * Universal AI RAG Chatbot Assistant for All Roles & Pages
 * Docked floating copilot with Role-Specific RAG Grounding and 5-language support
 */

class UniversalAIBot {
    constructor() {
        this.role = (localStorage.getItem('role') || 'CITIZEN').toUpperCase();
        this.isOpen = false;
        this.init();
    }

    init() {
        if (document.getElementById('chatbotContainer')) return;

        const container = document.createElement('div');
        container.id = 'chatbotContainer';
        container.innerHTML = `
            <!-- Floating FAB Button docked bottom-right -->
            <button id="chatbotToggleBtn" class="chatbot-fab" title="AI Civic Assistant (RAG Grounded)">
                <i class="bi bi-robot"></i>
                <span class="pulse-dot"></span>
            </button>

            <!-- Chatbot Window -->
            <div id="chatbotWindow" class="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-header-title">
                        <i class="bi bi-cpu-fill text-warning fs-5"></i>
                        <div>
                            <h6 id="chatbotRoleTitle">Civic AI Copilot (${this.role})</h6>
                            <small id="chatbotOnlineSubtitle" class="text-white-50" style="font-size:0.7rem">
                                <i class="bi bi-shield-check text-success me-1"></i>Live DB Grounded | RAG Active
                            </small>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white btn-sm" id="chatbotCloseBtn"></button>
                </div>

                <div class="chatbot-body" id="chatbotBody">
                    <div class="chat-bubble chat-bubble-bot" id="chatbotGreetingBubble">
                        Namaste! I am your AI Civic Assistant powered by live municipal database retrieval. How can I assist you with your grievances or operations today?
                    </div>

                    <div class="chat-suggestions" id="chatbotSuggestions">
                        <!-- Populated dynamically by renderRoleSuggestions() -->
                    </div>
                </div>

                <div class="chatbot-footer">
                    <form id="chatbotForm" class="chatbot-input-group">
                        <input type="text" id="chatbotInput" class="form-control chatbot-input" placeholder="Ask about tickets, SLAs, or tasks..." required autocomplete="off">
                        <button type="submit" class="chatbot-send-btn" id="chatbotSendBtn">
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        const toggleBtn = document.getElementById('chatbotToggleBtn');
        const closeBtn = document.getElementById('chatbotCloseBtn');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat(false));

        const form = document.getElementById('chatbotForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('chatbotInput');
            const msg = input.value.trim();
            if (!msg) return;

            this.appendMessage(msg, 'user');
            input.value = '';
            await this.sendMessage(msg);
        });

        this.renderRoleSuggestions();
        this.applyLanguage();

        window.addEventListener('languageChanged', () => {
            this.applyLanguage();
        });
    }

    renderRoleSuggestions() {
        const container = document.getElementById('chatbotSuggestions');
        if (!container) return;

        let suggestions = [];

        switch (this.role) {
            case 'OFFICER':
                suggestions = [
                    { label: '⚡ Urgent / Near SLA Breach', query: 'Show open critical complaints nearing SLA breach' },
                    { label: '🔍 Flagged Duplicates', query: 'What flagged duplicate complaints are awaiting review?' },
                    { label: '👷 Best Vendor Match', query: 'Which vendor has the lowest workload to take a new assignment?' }
                ];
                break;
            case 'VENDOR':
                suggestions = [
                    { label: '🔧 My Pending Tasks', query: 'What tasks do I have assigned and what are their deadlines?' },
                    { label: '📦 Materials & Safety', query: 'What equipment and safety rules are required for my top task?' },
                    { label: '✅ How to Verify Repair?', query: 'How does the AI Vision photo verification work for completed repairs?' }
                ];
                break;
            case 'REPRESENTATIVE':
                suggestions = [
                    { label: '📊 Constituency Overview', query: 'Summarize the top complaints and resolution rate in my area' },
                    { label: '⚠️ Urgent Overdue Issues', query: 'Which grievances in my constituency have breached their SLA?' },
                    { label: '📝 Draft Escalation Memo', query: 'How can I escalate stalled water and road complaints to department heads?' }
                ];
                break;
            case 'ADMIN':
                suggestions = [
                    { label: '📈 Municipal Resolution Rate', query: 'What is our overall grievance resolution rate and system health?' },
                    { label: '⏱️ SLA Breach Analysis', query: 'Which categories have the highest SLA breaches?' },
                    { label: '📞 Emergency Protocols', query: 'What are the 24x7 municipal emergency dispatch protocols?' }
                ];
                break;
            case 'CITIZEN':
            default:
                suggestions = [
                    { label: '⏱️ Track My Complaints', query: 'What is the current status and SLA remaining on my complaints?' },
                    { label: '📝 How to Log a Problem?', query: 'How do I submit a new complaint with photo and GPS location?' },
                    { label: '📞 Emergency 1800 Helpline', query: 'What is the 24x7 emergency helpline for public safety hazards?' }
                ];
                break;
        }

        container.innerHTML = suggestions.map((s, idx) => `
            <button type="button" class="chip-btn" id="chipBtn_${idx}" onclick="window.aiBot.handleChipClick('${s.query.replace(/'/g, "\\'")}')">
                ${s.label}
            </button>
        `).join('');
    }

    applyLanguage() {
        if (!window.i18n) return;
        const title = window.i18n.get('chatbot_title');
        const online = window.i18n.get('chatbot_online');
        const placeholder = window.i18n.get('chatbot_placeholder');

        const titleElem = document.getElementById('chatbotRoleTitle');
        if (titleElem && title) titleElem.textContent = `${title} (${this.role})`;

        const onlineElem = document.getElementById('chatbotOnlineSubtitle');
        if (onlineElem && online) onlineElem.innerHTML = `<i class="bi bi-shield-check text-success me-1"></i>${online} | RAG Active`;

        const inputElem = document.getElementById('chatbotInput');
        if (inputElem && placeholder) inputElem.setAttribute('placeholder', placeholder);
    }

    toggleChat(show = !this.isOpen) {
        this.isOpen = show;
        const win = document.getElementById('chatbotWindow');
        if (!win) return;
        if (this.isOpen) {
            win.classList.add('active');
            document.getElementById('chatbotInput')?.focus();
        } else {
            win.classList.remove('active');
        }
    }

    async handleChipClick(text) {
        this.appendMessage(text, 'user');
        await this.sendMessage(text);
    }

    appendMessage(text, sender, isTyping = false) {
        const body = document.getElementById('chatbotBody');
        if (!body) return null;
        const div = document.createElement('div');
        div.className = `chat-bubble ${sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`;
        if (isTyping) {
            div.id = 'aiTypingIndicator';
            const thinkingText = (window.i18n ? window.i18n.get('chatbot_thinking') : null) || 'AI is retrieving facts from database...';
            div.innerHTML = `<span class="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>${thinkingText}`;
        } else {
            div.innerHTML = this.formatBotMessage(text);
        }
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        return div;
    }

    formatBotMessage(rawText) {
        if (!rawText) return '';
        // Escape basic HTML
        let sanitized = rawText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Markdown bold **text** -> <strong>text</strong>
        sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Ticket codes highlight GRV-2026-XXXXXX or #12
        sanitized = sanitized.replace(/(GRV-\d{4}-\d+|#\d+)/g, '<span class="badge bg-dark">$1</span>');
        // Newlines to <br>
        sanitized = sanitized.replace(/\n/g, '<br>');
        return sanitized;
    }

    removeTypingIndicator() {
        const elem = document.getElementById('aiTypingIndicator');
        if (elem) elem.remove();
    }

    async sendMessage(msg) {
        this.removeTypingIndicator();
        this.appendMessage('', 'bot', true);

        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : (window.location.protocol.startsWith('http') ? window.location.origin + '/api' : 'http://localhost:8080/api');
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : (localStorage.getItem('preferred_language') || 'en');

        try {
            const response = await fetch(`${baseUrl}/ai/chat`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    role: this.role,
                    message: msg,
                    language: currentLang,
                    username: localStorage.getItem('username') || ''
                })
            });

            this.removeTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                this.appendMessage(data.reply || "Grievance status retrieved. How else may I assist you?", 'bot');
            } else {
                this.appendMessage("AI Assistant: For emergency inquiries or status verification, please call municipal helpline 1800-11-2233 or visit 'My Complaints'.", 'bot');
            }
        } catch (err) {
            console.error("AI Bot Error:", err);
            this.removeTypingIndicator();
            this.appendMessage("AI Civic Assistant: You can track grievance status, inspect field tasks, or access emergency helplines anytime.", 'bot');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.aiBot = new UniversalAIBot();
});
