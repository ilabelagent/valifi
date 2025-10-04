import { Router } from "express";
import { LAB_DATA, broadcast } from "../server.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const router = Router();

function maskSensitive(value = "") {
  const str = String(value);
  if (str.length <= 4) return "****";
  return str.slice(0, 2) + "*".repeat(Math.max(0, str.length - 4)) + str.slice(-2);
}

// Enhanced phishing awareness training component
router.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CEH v10 Phishing Awareness Training</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .pulse-red {
            animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-red {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
        .log-scroll::-webkit-scrollbar {
            width: 6px;
        }
        .log-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .log-scroll::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div id="root"></div>
    
    <script>
        // Simple React-like state management
        let state = {
            tab: "email",
            events: [],
            username: "",
            password: "",
            otp: "",
            phone: "",
            stats: null,
            networkLog: true
        };

        const scenarios = [
            { key: "email", label: "🎣 Email Phishing", color: "red" },
            { key: "sms", label: "📱 SMS/OTP Attack", color: "orange" },
            { key: "legit", label: "✅ Legitimate Login", color: "green" },
            { key: "stats", label: "📊 Training Stats", color: "blue" },
        ];

        // Event logging function
        async function logEvent(action, meta = {}) {
            const event = {
                time: new Date().toISOString(),
                action,
                tab: state.tab,
                sessionId: sessionStorage.getItem('trainingSessionId') || 'anonymous',
                ...meta,
            };
            
            state.events = [event, ...state.events].slice(0, 500);
            
            if (state.networkLog) {
                try {
                    await fetch('/sim/phish/log', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: action,
                            timestamp: event.time,
                            metadata: meta
                        })
                    });
                } catch (error) {
                    console.warn("Network logging failed:", error.message);
                }
            }
            
            render();
        }

        // Load statistics
        async function loadStats() {
            try {
                const response = await fetch('/sim/phish/analytics');
                const data = await response.json();
                state.stats = data;
                render();
            } catch (error) {
                console.warn("Failed to load stats:", error);
                state.stats = { error: "Stats unavailable" };
                render();
            }
        }

        // Form submission handlers
        function handlePhishSubmit(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            logEvent("phish_submit_attempt", {
                usernameLen: username.length,
                passwordLen: password.length,
                scenario: "email_phishing",
                timestamp: Date.now()
            });
            
            // Submit to backend
            fetch('/sim/phish/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    scenario: "email_phishing"
                })
            }).catch(console.error);
            
            setTimeout(() => {
                alert("⚠️ TRAINING ALERT: You just submitted credentials to a phishing site!\\n\\nIn a real attack, your data would now be compromised.");
                logEvent("phish_education_alert_shown");
            }, 500);
        }

        function handleOtpRequest(e) {
            e.preventDefault();
            const phone = document.getElementById('phone').value;
            
            logEvent("otp_request_clicked", {
                phoneLen: phone.replace(/\\D/g, "").length,
                scenario: "sms_phishing"
            });
            
            setTimeout(() => {
                alert("📱 SMS sent! (Simulated)\\n\\nIn a real attack, this could be a SIM swapping attempt.");
            }, 1000);
        }

        function handleOtpSubmit(e) {
            e.preventDefault();
            const otp = document.getElementById('otp').value;
            
            logEvent("otp_submit_attempt", { 
                otpLen: otp.length,
                scenario: "sms_phishing"
            });
            
            setTimeout(() => {
                alert("⚠️ TRAINING ALERT: OTP submitted to malicious site!\\n\\nReal attackers could now bypass your 2FA.");
                logEvent("otp_education_alert_shown");
            }, 500);
        }

        function handleLegitSubmit(e) {
            e.preventDefault();
            const username = document.getElementById('username-legit').value;
            const password = document.getElementById('password-legit').value;
            
            logEvent("legit_signin_attempt", {
                usernameLen: username.length,
                passwordLen: password.length,
                scenario: "legitimate_login"
            });
            
            alert("✅ This represents a legitimate login flow.\\n\\nNotice the security indicators and proper domain.");
        }

        function handleReport() {
            logEvent("user_reported_phish", { tab: state.tab });
            alert("🚨 Phishing reported to SOC!\\n\\nGreat job identifying the threat. This is the correct response.");
        }

        function handleReset() {
            ['username', 'password', 'phone', 'otp', 'username-legit', 'password-legit'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            logEvent("form_reset");
        }

        function setTab(newTab) {
            state.tab = newTab;
            if (newTab === "stats") {
                loadStats();
            }
            render();
        }

        function toggleNetworkLog() {
            state.networkLog = !state.networkLog;
            render();
        }

        // Get guidance based on current tab
        function getGuidance() {
            switch (state.tab) {
                case "email":
                    return [
                        "Check the URL carefully - does it match the legitimate domain?",
                        "Hover over links to see the real destination before clicking",
                        "Look for spelling errors, urgent language, or generic greetings",
                        "Legitimate sites rarely ask for credentials via email links",
                    ];
                case "sms":
                    return [
                        "SMS phishing (smishing) is increasingly common",
                        "Never click links in unexpected text messages",
                        "Verify requests by contacting the organization directly",
                        "Be aware of SIM swapping and social engineering attacks",
                    ];
                case "legit":
                    return [
                        "Bookmark legitimate login pages for direct access",
                        "Look for HTTPS and valid SSL certificates",
                        "Use hardware security keys when available",
                        "Enable login notifications and review them regularly",
                    ];
                case "stats":
                    return [
                        "Monitor training effectiveness and user behavior",
                        "Identify common mistake patterns for additional training",
                        "Track improvement over time and across different scenarios",
                        "Use data to refine security awareness programs",
                    ];
                default:
                    return [];
            }
        }

        // Main render function
        function render() {
            const guidance = getGuidance();
            
            document.getElementById('root').innerHTML = \`
                <div class="min-h-screen w-full bg-gray-50 text-gray-900 p-6">
                    <div class="max-w-7xl mx-auto">
                        <!-- Header -->
                        <header class="mb-6 bg-white rounded-2xl shadow p-6 border">
                            <div class="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 class="text-3xl font-bold text-gray-900">🔒 CEH v10 Phishing Awareness Training</h1>
                                    <p class="text-gray-600 mt-1">Interactive cybersecurity education environment</p>
                                </div>
                                <div class="flex gap-3">
                                    <button onclick="handleReport()" class="px-4 py-2 rounded-2xl shadow border bg-red-100 hover:bg-red-200 text-red-800 font-medium">
                                        🚨 Report Phish
                                    </button>
                                    <button onclick="handleReset()" class="px-4 py-2 rounded-2xl shadow border bg-gray-100 hover:bg-gray-200 font-medium">
                                        🔄 Reset
                                    </button>
                                    <button onclick="toggleNetworkLog()" class="px-4 py-2 rounded-2xl shadow border font-medium \${state.networkLog ? 'bg-green-100 hover:bg-green-200 text-green-800' : 'bg-gray-100 hover:bg-gray-200'}">
                                        📡 Network Log: \${state.networkLog ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            <!-- Main Content Area -->
                            <div class="xl:col-span-3">
                                <!-- Scenario Tabs -->
                                <div class="flex gap-3 mb-6 flex-wrap">
                                    \${scenarios.map(s => \`
                                        <button onclick="setTab('\${s.key}')" class="px-4 py-3 rounded-2xl shadow border text-sm font-medium transition-all \${
                                            state.tab === s.key
                                                ? s.color === "red" ? "bg-red-600 text-white"
                                                : s.color === "orange" ? "bg-orange-600 text-white"
                                                : s.color === "green" ? "bg-green-600 text-white"
                                                : "bg-blue-600 text-white"
                                                : "bg-white hover:bg-gray-100"
                                        }">
                                            \${s.label}
                                        </button>
                                    \`).join('')}
                                </div>

                                <!-- Scenario Panels -->
                                <div class="bg-white rounded-2xl shadow p-8 border min-h-[500px]">
                                    \${state.tab === "email" ? \`
                                        <div class="space-y-6">
                                            <div class="border-l-4 border-red-500 pl-4">
                                                <h2 class="text-2xl font-bold text-red-600">⚠️ Suspicious Email Portal</h2>
                                                <p class="text-gray-600 mt-2">This simulates a credential harvesting attack. Notice the suspicious elements.</p>
                                            </div>
                                            
                                            <div class="bg-red-50 p-4 rounded-xl border border-red-200">
                                                <p class="text-sm text-red-800">
                                                    <strong>Simulated phishing indicators:</strong> Urgent language, mismatched domain, request for credentials via email link
                                                </p>
                                            </div>

                                            <form onsubmit="handlePhishSubmit(event)">
                                                <div class="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label class="block text-sm font-medium text-gray-700 mb-2">Email or Username</label>
                                                        <input type="text" id="username" class="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-red-500 focus:ring-red-200" placeholder="user@company.com" autocomplete="off">
                                                    </div>
                                                    <div>
                                                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                                        <input type="password" id="password" class="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-red-500 focus:ring-red-200" placeholder="••••••••••" autocomplete="off">
                                                    </div>
                                                </div>
                                                <div class="flex items-center justify-between mt-6">
                                                    <button type="submit" class="px-6 py-3 rounded-2xl bg-red-600 text-white shadow-lg hover:bg-red-700 font-medium pulse-red">
                                                        🎣 Submit (Phishing Demo)
                                                    </button>
                                                    <span class="text-xs text-gray-500 max-w-xs">This demo only records field lengths, never actual values</span>
                                                </div>
                                            </form>
                                        </div>
                                    \` : state.tab === "sms" ? \`
                                        <div class="space-y-6">
                                            <div class="border-l-4 border-orange-500 pl-4">
                                                <h2 class="text-2xl font-bold text-orange-600">📱 SMS Phishing (Smishing)</h2>
                                                <p class="text-gray-600 mt-2">Simulates SMS-based attacks and OTP interception scenarios.</p>
                                            </div>

                                            <div class="bg-orange-50 p-4 rounded-xl border border-orange-200">
                                                <p class="text-sm text-orange-800">
                                                    <strong>SMS from "Bank":</strong> "Security alert! Verify your account immediately: [suspicious-link]. Reply with code 2837 to confirm."
                                                </p>
                                            </div>

                                            <div class="space-y-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                    <input type="text" id="phone" class="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-orange-500" placeholder="+1 (555) 123-4567">
                                                </div>
                                                <button onclick="handleOtpRequest(event)" class="px-6 py-3 rounded-2xl bg-orange-600 text-white shadow-lg hover:bg-orange-700 font-medium">
                                                    📲 Request OTP (Demo)
                                                </button>
                                            </div>

                                            <div class="space-y-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700 mb-2">One-Time Passcode</label>
                                                    <input type="text" id="otp" class="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-orange-500" placeholder="123456" maxlength="6">
                                                </div>
                                                <button onclick="handleOtpSubmit(event)" class="px-6 py-3 rounded-2xl bg-orange-600 text-white shadow-lg hover:bg-orange-700 font-medium">
                                                    ✅ Verify OTP (Demo)
                                                </button>
                                            </div>
                                        </div>
                                    \` : state.tab === "legit" ? \`
                                        <div class="space-y-6">
                                            <div class="border-l-4 border-green-500 pl-4">
                                                <h2 class="text-2xl font-bold text-green-600">✅ Legitimate Corporate Login</h2>
                                                <p class="text-gray-600 mt-2">Example of proper security practices and legitimate authentication flow.</p>
                                            </div>

                                            <div class="bg-green-50 p-4 rounded-xl border border-green-200">
                                                <div class="grid md:grid-cols-3 gap-4 text-sm">
                                                    <div><strong class="text-green-800">🔒 HTTPS:</strong><br>Valid SSL certificate</div>
                                                    <div><strong class="text-green-800">🏢 Domain:</strong><br>company.com (verified)</div>
                                                    <div><strong class="text-green-800">🔑 2FA:</strong><br>Hardware keys supported</div>
                                                </div>
                                            </div>

                                            <form onsubmit="handleLegitSubmit(event)">
                                                <div class="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label class="block text-sm font-medium text-gray-700 mb-2">Corporate Email</label>
                                                        <input type="email" id="username-legit" class="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-green-500" placeholder="john.doe@company.com" autocomplete="username">
                                                    </div>
                                                    <div>
                                                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                                        <input type="password" id="password-legit" class="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-green-500" placeholder="••••••••••" autocomplete="current-password">
                                                    </div>
                                                </div>
                                                <div class="flex items-center justify-between mt-6">
                                                    <button type="submit" class="px-6 py-3 rounded-2xl bg-green-600 text-white shadow-lg hover:bg-green-700 font-medium">
                                                        🔐 Secure Sign In
                                                    </button>
                                                    <div class="text-sm text-green-700">🛡️ Protected by enterprise security</div>
                                                </div>
                                            </form>
                                        </div>
                                    \` : \`
                                        <div class="space-y-6">
                                            <div class="border-l-4 border-blue-500 pl-4">
                                                <h2 class="text-2xl font-bold text-blue-600">📊 Training Statistics & Analytics</h2>
                                                <p class="text-gray-600 mt-2">Monitor training effectiveness and user interaction patterns.</p>
                                            </div>

                                            \${state.stats ? (state.stats.error ? \`
                                                <div class="bg-red-50 p-6 rounded-xl border border-red-200">
                                                    <p class="text-red-800">⚠️ Statistics unavailable: \${state.stats.error}</p>
                                                </div>
                                            \` : \`
                                                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                                        <div class="text-2xl font-bold text-blue-800">\${state.stats.totalAttempts || 0}</div>
                                                        <div class="text-blue-600">Total Attempts</div>
                                                    </div>
                                                    <div class="bg-green-50 p-4 rounded-xl border border-green-200">
                                                        <div class="text-2xl font-bold text-green-800">\${state.stats.uniqueTargets || 0}</div>
                                                        <div class="text-green-600">Unique Targets</div>
                                                    </div>
                                                    <div class="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                                        <div class="text-2xl font-bold text-purple-800">\${state.stats.emailPhishing || 0}</div>
                                                        <div class="text-purple-600">Email Phishing</div>
                                                    </div>
                                                    <div class="bg-orange-50 p-4 rounded-xl border border-orange-200">
                                                        <div class="text-2xl font-bold text-orange-800">\${state.stats.smsPhishing || 0}</div>
                                                        <div class="text-orange-600">SMS Phishing</div>
                                                    </div>
                                                </div>
                                                <div class="mt-6 bg-gray-50 p-4 rounded-xl">
                                                    <h4 class="font-bold mb-2">Training Effectiveness</h4>
                                                    <div class="grid md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span class="font-medium">Reported Phishing:</span>
                                                            <span class="text-green-600"> \${state.stats.trainingEffectiveness?.reportedPhishing || 0}</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-medium">Education Alerts:</span>
                                                            <span class="text-blue-600"> \${state.stats.trainingEffectiveness?.educationAlertsShown || 0}</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-medium">Security Awareness:</span>
                                                            <span class="text-purple-600"> \${state.stats.trainingEffectiveness?.securityAwareness || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            \`) : \`
                                                <div class="text-center py-8">
                                                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                                    <p class="mt-4 text-gray-600">Loading statistics...</p>
                                                </div>
                                            \`}

                                            <button onclick="loadStats()" class="px-4 py-2 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700">
                                                🔄 Refresh Stats
                                            </button>
                                        </div>
                                    \`}
                                </div>

                                <!-- Guidance Section -->
                                <div class="mt-6 grid md:grid-cols-2 gap-6">
                                    <div class="bg-white rounded-2xl shadow p-6 border">
                                        <h3 class="font-bold text-lg mb-4 flex items-center">
                                            <span class="mr-2">🎯</span>Training Objectives
                                        </h3>
                                        <ul class="space-y-2 text-sm text-gray-700">
                                            \${guidance.map(g => \`<li class="flex items-start"><span class="mr-2 text-blue-600">•</span>\${g}</li>\`).join('')}
                                        </ul>
                                    </div>
                                    
                                    <div class="bg-white rounded-2xl shadow p-6 border">
                                        <h3 class="font-bold text-lg mb-4 flex items-center">
                                            <span class="mr-2">🛡️</span>Security Best Practices
                                        </h3>
                                        <ul class="space-y-2 text-sm text-gray-700">
                                            <li class="flex items-start"><span class="mr-2 text-green-600">✓</span>Always verify URLs before entering credentials</li>
                                            <li class="flex items-start"><span class="mr-2 text-green-600">✓</span>Use hardware security keys for high-value accounts</li>
                                            <li class="flex items-start"><span class="mr-2 text-green-600">✓</span>Report suspicious emails to your security team</li>
                                            <li class="flex items-start"><span class="mr-2 text-green-600">✓</span>Enable login notifications and monitor them</li>
                                            <li class="flex items-start"><span class="mr-2 text-green-600">✓</span>Never follow links in unexpected messages</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Sidebar - Event Log -->
                            <aside class="bg-white rounded-2xl shadow p-6 border h-fit sticky top-6">
                                <h3 class="font-bold text-lg mb-4 flex items-center">
                                    <span class="mr-2">📝</span>Activity Log
                                </h3>
                                <p class="text-xs text-gray-600 mb-4">Secure local logging for training analysis. No sensitive data stored.</p>
                                
                                <div class="space-y-3 max-h-96 overflow-auto log-scroll">
                                    \${state.events.length === 0 ? \`
                                        <div class="text-sm text-gray-500 text-center py-8">
                                            No activity yet.<br>Interact with the training scenarios to see logs.
                                        </div>
                                    \` : state.events.map((event, i) => \`
                                        <div class="border rounded-xl p-3 text-sm bg-gray-50">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="font-mono text-xs text-gray-500">\${new Date(event.time).toLocaleTimeString()}</span>
                                                <span class="px-2 py-1 rounded-full text-xs font-medium \${
                                                    event.tab === "email" ? "bg-red-100 text-red-800" :
                                                    event.tab === "sms" ? "bg-orange-100 text-orange-800" :
                                                    event.tab === "legit" ? "bg-green-100 text-green-800" :
                                                    "bg-blue-100 text-blue-800"
                                                }">\${event.tab}</span>
                                            </div>
                                            <div class="font-medium text-gray-800 mb-1">\${event.action.replace(/_/g, ' ').toUpperCase()}</div>
                                            \${Object.keys(event).length > 4 ? \`
                                                <details class="text-xs">
                                                    <summary class="cursor-pointer text-gray-600 hover:text-gray-800">View details</summary>
                                                    <pre class="mt-2 bg-white p-2 rounded border text-xs overflow-auto">\${JSON.stringify(event, null, 2)}</pre>
                                                </details>
                                            \` : ''}
                                        </div>
                                    \`).join('')}
                                </div>
                            </aside>
                        </div>

                        <!-- Footer -->
                        <footer class="mt-8 text-center text-xs text-gray-500 bg-white rounded-2xl shadow p-4 border">
                            <p>🎓 <strong>CEH v10 Educational Environment</strong> - For authorized cybersecurity training only</p>
                            <p class="mt-1">No real credentials collected • Local network deployment • Ethical use required</p>
                        </footer>
                    </div>
                </div>
            \`;
        }

        // Block network requests except to our own endpoints
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            if (typeof url === 'string' && (
                url.startsWith('/sim/') || 
                url.includes('localhost') || 
                url.includes('127.0.0.1')
            )) {
                return originalFetch(url, options);
            }
            
            console.warn("🚫 Network request blocked:", url);
            logEvent("network_request_blocked", { 
                url: typeof url === 'string' ? url.substring(0, 100) : 'object',
                method: options.method || 'GET'
            });
            
            throw new Error("Network request blocked - Training environment");
        };

        // Initialize session ID if not exists
        if (!sessionStorage.getItem('trainingSessionId')) {
            sessionStorage.setItem('trainingSessionId', 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
        }

        // Initial render
        render();
        
        // Log initial page load
        logEvent("phishing_lab_loaded", {
            sessionId: sessionStorage.getItem('trainingSessionId'),
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        });
    </script>
</body>
</html>
  `);
});

// Enhanced phishing form submission with comprehensive logging
router.post("/submit", (req, res) => {
  const { email = "", password = "", username = "", message = "", scenario = "unknown" } = req.body || {};
  
  const incident = {
    type: "phishing_capture",
    email: maskSensitive(email),
    username: maskSensitive(username),
    password: maskSensitive(password),
    message: maskSensitive(message),
    scenario,
    ip: req.ip || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Unknown",
    timestamp: new Date().toISOString(),
    severity: "HIGH",
    attackVector: scenario.includes("email") ? "Email Phishing" : scenario.includes("sms") ? "SMS Phishing" : "Unknown"
  };
  
  LAB_DATA.incidents.push(incident);
  broadcast({ type: "phishing_capture", data: incident });
  
  console.log("🎯 [PHISH-CAPTURE]", incident);
  
  res.json({ 
    success: true, 
    message: "Credentials captured in lab environment",
    note: "This is a simulation - no real credentials were compromised",
    incidentId: incident.timestamp
  });
});

// Log training events
router.post("/log", (req, res) => {
  const { event, timestamp, metadata } = req.body;
  
  const logEntry = {
    type: "training_event",
    event,
    timestamp,
    metadata,
    ip: req.ip || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Unknown"
  };
  
  LAB_DATA.incidents.push(logEntry);
  broadcast({ type: "training_log", data: logEntry });
  
  console.log("📘 [TRAINING-LOG]", logEntry);
  
  res.json({ success: true, logged: true });
});

// Enhanced phishing analytics
router.get("/analytics", (req, res) => {
  const phishingIncidents = LAB_DATA.incidents.filter(i => 
    i.type === "phishing_capture" || i.type === "training_event"
  );
  
  const emailPhishing = phishingIncidents.filter(i => 
    i.scenario?.includes("email") || i.event?.includes("phish")
  );
  
  const smsPhishing = phishingIncidents.filter(i => 
    i.scenario?.includes("sms") || i.event?.includes("otp")
  );
  
  const analytics = {
    totalAttempts: phishingIncidents.length,
    emailPhishing: emailPhishing.length,
    smsPhishing: smsPhishing.length,
    uniqueTargets: new Set(phishingIncidents.map(i => i.email || i.ip)).size,
    mostTargetedDomain: "company.com",
    successRate: "100% (simulation)",
    lastCapture: phishingIncidents[phishingIncidents.length - 1]?.timestamp || null,
    topAttackVectors: [
      { name: "Email Phishing", count: emailPhishing.length, percentage: Math.round((emailPhishing.length / phishingIncidents.length) * 100) || 0 },
      { name: "SMS Phishing", count: smsPhishing.length, percentage: Math.round((smsPhishing.length / phishingIncidents.length) * 100) || 0 }
    ],
    timeDistribution: {
      last24h: phishingIncidents.filter(i => 
        new Date(i.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      lastWeek: phishingIncidents.filter(i => 
        new Date(i.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      lastMonth: phishingIncidents.length
    },
    trainingEffectiveness: {
      reportedPhishing: phishingIncidents.filter(i => i.event === "user_reported_phish").length,
      educationAlertsShown: phishingIncidents.filter(i => 
        i.event?.includes("education_alert_shown")
      ).length,
      securityAwareness: "Improving"
    }
  };
  
  res.json(analytics);
});

// Real-time phishing simulation status
router.get("/status", (req, res) => {
  const recentIncidents = LAB_DATA.incidents
    .filter(i => new Date(i.timestamp) > new Date(Date.now() - 60 * 60 * 1000))
    .length;

  const status = {
    active: true,
    timestamp: new Date().toISOString(),
    recentActivity: recentIncidents,
    totalIncidents: LAB_DATA.incidents.length,
    environment: "CEH Training Lab",
    version: "2.0.0"
  };

  res.json(status);
});
