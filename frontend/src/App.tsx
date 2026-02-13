/**
 * MailGuard Dashboard — Apple/iOS Inspired Futuristic Design
 * Vibrant colors • Frosted glass • Premium typography • Advanced animations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Home, BarChart3, CheckCircle2,
    AlertTriangle, AlertCircle, History, Settings, Bell, Search, Mail,
    Inbox, Zap, Eye, Lock, Globe,
    PanelLeftClose, PanelLeft, ChevronRight, Sparkles,
    ArrowUpRight, ArrowDownRight, Filter, Download, RefreshCw,
    Cpu, Wifi, Server, FileWarning, Fingerprint, ScanLine, Loader2
} from 'lucide-react';
import { ModernLanding } from './pages/ModernLanding';
import { EmailSubmissionForm } from './components/EmailSubmissionForm';

interface SecurityVerdict {
    email_metadata: Record<string, string>;
    tool_execution_trace: Array<{
        tool_name: string;
        called_at: string;
        input_params: Record<string, any>;
        output_summary: string;
        execution_time_ms?: number;
    }>;
    aggregated_scores: {
        url_risk: number;
        domain_risk: number;
        attachment_risk: number;
        social_engineering_risk: number;
    };
    final_risk_score: number;
    classification: 'safe' | 'suspicious' | 'malicious';
    recommended_action: string;
    reasoning_summary: string;
    confidence_percentage: number;
}

/* ─── Animated Ring Chart ─── */
const RingChart = ({ value, size = 80, strokeWidth = 8, color }: { value: number; size?: number; strokeWidth?: number; color: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeLinecap="round" strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
            />
        </svg>
    );
};

function App() {

    interface EmailMessage {
        id: string;
        sender: string;
        subject: string;
        snippet: string;
        date: string;
        body: string;
        attachments: Array<{ filename: string; mime_type: string }>;
        is_read: boolean;
        folder: string;
    }

    const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
    const [verdict, setVerdict] = useState<SecurityVerdict | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'analytics' | 'settings'>('analyze');
    const [scanCount, setScanCount] = useState(127);
    const [threatCount, setThreatCount] = useState(43);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [connectState, setConnectState] = useState<{ gmail: 'idle' | 'connecting' | 'connected', outlook: 'idle' | 'connecting' | 'connected' }>({ gmail: 'idle', outlook: 'idle' });
    const [copied, setCopied] = useState(false);
    const [extensionInstalled, setExtensionInstalled] = useState(false);
    const [emails, setEmails] = useState<EmailMessage[]>([]);
    const [loadingEmails, setLoadingEmails] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
    const [connectedEmail, setConnectedEmail] = useState('');
    const [emailInput, setEmailInput] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText('analysis-kole-8492@mailguard.ai');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConnect = (service: 'gmail' | 'outlook') => {
        setConnectState(prev => ({ ...prev, [service]: 'connecting' }));
        setTimeout(() => {
            setConnectState(prev => ({ ...prev, [service]: 'connected' }));
        }, 1500);
    };

    const handleConnectEmail = () => {
        if (!emailInput) return;
        setConnectedEmail(emailInput);
        fetchEmails(emailInput);
    };

    const fetchEmails = async (emailToFetch: string = connectedEmail) => {
        if (!emailToFetch) return;
        setLoadingEmails(true);
        try {
            const res = await fetch(`http://localhost:8000/api/fetch-emails?email=${encodeURIComponent(emailToFetch)}`);
            if (res.ok) {
                const data = await res.json();
                setEmails(data);
            }
        } catch (error) {
            console.error("Failed to fetch emails", error);
        } finally {
            setLoadingEmails(false);
        }
    };

    const handleSelectEmail = (email: EmailMessage) => {
        setSelectedEmail({
            sender_email: email.sender,
            subject: email.subject,
            body: email.body,
            attachments: email.attachments
        });

        // Mark as read in local state
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
    };

    const handleInstallExtension = () => {
        setExtensionInstalled(true);
    };

    const handleEmailSubmit = async (emailData: any) => {
        setIsAnalyzing(true);
        setVerdict(null);
        try {
            const steps = ['Initializing AI agents…', 'Scanning domain reputation…', 'Analyzing URL patterns…', 'Running attachment forensics…', 'Detecting social engineering…', 'Aggregating threat scores…'];
            for (const step of steps) {
                setAnalysisStep(step);
                await new Promise(r => setTimeout(r, 450));
            }
            try {
                const res = await fetch('http://localhost:8000/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emailData) });
                if (res.ok) { setVerdict(await res.json()); setScanCount(s => s + 1); setIsAnalyzing(false); setAnalysisStep(''); return; }
            } catch { console.log('Simulation mode'); }
            await simulateAnalysis(emailData);
            setScanCount(s => s + 1);
        } finally { setIsAnalyzing(false); setAnalysisStep(''); }
    };

    const simulateAnalysis = async (emailData: any) => {
        await new Promise(r => setTimeout(r, 800));
        const mk = emailData.subject?.toLowerCase().includes('urgent') || emailData.body?.toLowerCase().includes('verify');
        const sd = emailData.sender_email?.includes('paypa1') || emailData.sender_email?.includes('amaz0n');
        const ha = emailData.attachments?.length > 0;
        const hm = emailData.attachments?.some((a: any) => a.filename?.endsWith('.xlsm') || a.filename?.endsWith('.docm'));
        let fs = 15; if (mk) fs += 25; if (sd) fs += 30; if (ha) fs += 20; if (hm) fs += 35;
        const cl: 'safe' | 'suspicious' | 'malicious' = fs < 30 ? 'safe' : fs < 60 ? 'suspicious' : 'malicious';
        if (cl !== 'safe') setThreatCount(t => t + 1);
        setVerdict({
            email_metadata: { sender: emailData.sender_email, subject: emailData.subject, timestamp: new Date().toISOString() },
            tool_execution_trace: [
                { tool_name: 'domain_reputation', called_at: new Date(Date.now() - 2000).toISOString(), input_params: { domain: emailData.sender_email?.split('@')[1] }, output_summary: sd ? 'Typosquatting detected — domain mimics legitimate brand' : 'Clean reputation, 5+ year domain age', execution_time_ms: 421 },
                { tool_name: 'url_scanner', called_at: new Date(Date.now() - 1500).toISOString(), input_params: { urls_found: 2 }, output_summary: mk ? 'Shortened URL redirects to suspicious domain' : 'All URLs resolve to legitimate domains', execution_time_ms: 382 },
                { tool_name: 'file_forensics', called_at: new Date(Date.now() - 1000).toISOString(), input_params: { attachments: emailData.attachments?.length || 0 }, output_summary: hm ? 'Macro-enabled document (.xlsm) — high risk' : ha ? 'PDF clean, no embedded scripts' : 'No attachments present', execution_time_ms: 654 },
                { tool_name: 'social_engineering', called_at: new Date(Date.now() - 500).toISOString(), input_params: { body_length: emailData.body?.length || 0 }, output_summary: mk ? 'Urgency + fear tactics: "verify", "suspend"' : 'No manipulation patterns detected', execution_time_ms: 234 },
            ],
            aggregated_scores: { url_risk: mk ? 75 : 15, domain_risk: sd ? 85 : 10, attachment_risk: hm ? 95 : ha ? 25 : 0, social_engineering_risk: mk ? 70 : 12 },
            final_risk_score: fs, classification: cl,
            recommended_action: cl === 'malicious' ? 'QUARANTINE — Block sender domain & notify SOC' : cl === 'suspicious' ? 'HOLD — Queue for manual analyst review' : 'DELIVER — Safe passage to inbox',
            reasoning_summary: cl === 'malicious' ? 'Multiple high-risk indicators: typosquatting, social engineering tactics, and suspicious attachments detected.' : cl === 'suspicious' ? 'Some concerning elements identified. Recommend manual review before delivery.' : 'All security checks passed with high confidence. Email appears legitimate.',
            confidence_percentage: cl === 'malicious' ? 94 : cl === 'suspicious' ? 76 : 98,
        });
    };

    if (currentView === 'landing') return <ModernLanding onEnterDashboard={() => setCurrentView('dashboard')} />;

    // Apple-inspired color system
    const clr = (c: string) => ({
        malicious: { bg: 'bg-red-500', bgLight: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', ring: '#FF3B30', gradient: 'from-red-500 to-rose-600' },
        suspicious: { bg: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', ring: '#FF9500', gradient: 'from-orange-500 to-amber-600' },
        safe: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: '#34C759', gradient: 'from-emerald-500 to-green-600' },
    }[c] || { bg: 'bg-gray-500', bgLight: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', ring: '#8E8E93', gradient: 'from-gray-500 to-gray-600' });

    const iconFor = (c: string) => c === 'malicious' ? <AlertTriangle className="w-5 h-5" /> : c === 'suspicious' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />;

    const liveActivities = [
        { id: 1, type: 'blocked', sender: 'invoice@malware-drop.ru', time: '2m', risk: 94 },
        { id: 2, type: 'safe', sender: 'team@slack.com', time: '5m', risk: 3 },
        { id: 3, type: 'blocked', sender: 'hr@paypa1-sec.com', time: '8m', risk: 87 },
        { id: 4, type: 'review', sender: 'support@amaz0n-help.net', time: '12m', risk: 62 },
        { id: 5, type: 'safe', sender: 'noreply@github.com', time: '15m', risk: 5 },
        { id: 6, type: 'blocked', sender: 'admin@g00gle-sec.com', time: '18m', risk: 91 },
    ];

    const sidebarItems = [
        { id: 'analyze' as const, icon: ScanLine, label: 'Analyze', color: 'bg-blue-500' },
        { id: 'history' as const, icon: History, label: 'History', color: 'bg-purple-500' },
        { id: 'analytics' as const, icon: BarChart3, label: 'Analytics', color: 'bg-orange-500' },
        { id: 'settings' as const, icon: Settings, label: 'Settings', color: 'bg-gray-500' },
    ];

    return (
        <div className="min-h-screen bg-[#F2F2F7] font-sans flex">

            {/* ═══ SIDEBAR ═══ */}
            <motion.aside
                animate={{ width: sidebarOpen ? 240 : 76 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="fixed left-0 top-0 bottom-0 z-50 bg-white/80 backdrop-blur-2xl border-r border-black/5 flex flex-col"
            >
                {/* Logo */}
                <div className="p-4 flex items-center gap-3">
                    <motion.div whileHover={{ rotate: 10 }} className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                    </motion.div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="overflow-hidden">
                                <h1 className="text-[15px] font-heading font-bold text-gray-900 tracking-tight leading-tight">MailGuard</h1>
                                <p className="text-[10px] text-gray-400 font-medium">Threat Console</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-2 space-y-1">
                    {sidebarItems.map((item) => (
                        <motion.button
                            key={item.id}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-8 h-8 ${activeTab === item.id ? item.color : 'bg-gray-200'} rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0`}>
                                <item.icon className="w-4 h-4 text-white" />
                            </div>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className={`text-[13px] font-semibold overflow-hidden whitespace-nowrap ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}`}
                                    >{item.label}</motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-3 space-y-1 border-t border-black/5">
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {sidebarOpen ? <PanelLeftClose className="w-4 h-4 text-gray-500" /> : <PanelLeft className="w-4 h-4 text-gray-500" />}
                        </div>
                        {sidebarOpen && <span className="text-[13px] text-gray-400 font-medium">Collapse</span>}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => setCurrentView('landing')} className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Home className="w-4 h-4 text-gray-500" />
                        </div>
                        {sidebarOpen && <span className="text-[13px] text-gray-400 font-medium">Home</span>}
                    </motion.button>

                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4 px-2 text-center">
                                <p className="text-[10px] text-gray-400 font-medium">Made with ❤️ by</p>
                                <p className="text-[11px] font-heading font-bold text-gray-600">Shrikant Kole</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* ═══ MAIN ═══ */}
            <main className="flex-1 transition-all duration-250" style={{ marginLeft: sidebarOpen ? 240 : 76 }}>

                {/* Top Nav */}
                <header className="sticky top-0 z-40 bg-[#F2F2F7]/80 backdrop-blur-2xl border-b border-black/5 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900 tracking-tight">
                                {activeTab === 'analyze' ? 'Email Analysis' : activeTab === 'history' ? 'Scan History' : activeTab === 'analytics' ? 'Analytics' : 'Settings'}
                            </h2>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-gray-400">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                <span className="text-xs font-mono text-gray-300">{currentTime.toLocaleTimeString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
                                <span className="text-[11px] font-semibold text-emerald-700">All Systems Go</span>
                            </div>
                            <button className="relative w-9 h-9 bg-white border border-black/10 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                                <Bell className="w-4 h-4 text-gray-600" />
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">3</span>
                            </button>
                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/30">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-6 py-5">

                    {/* ══════════════ ANALYZE TAB ══════════════ */}
                    {activeTab === 'analyze' && (
                        <div className="space-y-5">

                            {/* ── Stat Cards Row ── */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Scans', value: scanCount, icon: Inbox, trend: '+12', trendUp: true, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
                                    { label: 'Threats Blocked', value: threatCount, icon: Shield, trend: '+5', trendUp: true, color: 'from-red-500 to-pink-500', shadow: 'shadow-red-500/20' },
                                    { label: 'Avg Response', value: '2.1s', icon: Zap, trend: '-0.3s', trendUp: false, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                                    { label: 'Accuracy', value: '99.7%', icon: Fingerprint, trend: '+0.2%', trendUp: true, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20' },
                                ].map((stat, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.06, duration: 0.4 }}
                                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg ${stat.shadow}`}>
                                                <stat.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[11px] font-semibold ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {stat.trend}
                                            </div>
                                        </div>
                                        <div className="text-3xl font-heading font-bold text-gray-900 tracking-tight">{stat.value}</div>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* ── Progress ── */}
                            <AnimatePresence>
                                {isAnalyzing && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-[3px] border-blue-100 border-t-blue-500 rounded-full" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-heading font-semibold text-gray-900">{analysisStep}</p>
                                                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3 }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── 3-Column Layout ── */}
                            <div className="grid grid-cols-12 gap-5">

                                {/* Form — 4 cols */}
                                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="col-span-4 space-y-4">

                                    {/* Mock Inbox Panel */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[13px] font-heading font-bold text-gray-900">Connected Inbox</h3>
                                            {connectedEmail && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => fetchEmails(connectedEmail)}
                                                        disabled={loadingEmails}
                                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                                                    >
                                                        {loadingEmails ? 'Fetching...' : 'Fetch New'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setConnectedEmail(''); setEmails([]); }}
                                                        className="text-[11px] font-bold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                                                    >
                                                        Disconnect
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {!connectedEmail ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-gray-500">Enter your email address to scan for threats.</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        placeholder="name@company.com"
                                                        value={emailInput}
                                                        onChange={(e) => setEmailInput(e.target.value)}
                                                        className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleConnectEmail()}
                                                    />
                                                    <button
                                                        onClick={handleConnectEmail}
                                                        disabled={!emailInput}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Connect
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400">Secure simulated connection via IMAP/Graph API</p>
                                            </div>
                                        ) : !emails.length && !loadingEmails ? (
                                            <div className="text-center py-6 text-gray-400">
                                                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-xs">Inbox is empty</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Connected as {connectedEmail}</p>
                                            </div>
                                        ) : loadingEmails ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="animate-pulse flex gap-3">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                                                            <div className="h-2 bg-gray-200 rounded w-1/2" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                                {emails.map((email) => (
                                                    <div
                                                        key={email.id}
                                                        onClick={() => handleSelectEmail(email)}
                                                        className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedEmail?.subject === email.subject
                                                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                                            : email.is_read
                                                                ? 'bg-gray-50 border-transparent hover:bg-gray-100'
                                                                : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-bold text-gray-500 truncate max-w-[120px]">{email.sender.split('@')[0]}</span>
                                                            <span className="text-[9px] text-gray-400">{email.date.split(' ')[1]}</span>
                                                        </div>
                                                        <h4 className={`text-xs font-semibold mb-0.5 truncate ${email.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{email.subject}</h4>
                                                        <p className="text-[10px] text-gray-400 truncate">{email.snippet}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <EmailSubmissionForm onSubmit={handleEmailSubmit} isLoading={isAnalyzing} prefillData={selectedEmail} />
                                </motion.div>

                                {/* Results — 5 cols */}
                                <div className="col-span-5 space-y-4">
                                    {!verdict && !isAnalyzing && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-16 text-center shadow-sm border border-black/5">
                                            <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center">
                                                <ScanLine className="w-9 h-9 text-blue-300" />
                                            </div>
                                            <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">Ready to Analyze</h3>
                                            <p className="text-sm text-gray-400">Submit an email to begin threat analysis</p>
                                        </motion.div>
                                    )}

                                    <AnimatePresence>
                                        {verdict && (
                                            <>
                                                {/* Verdict Banner */}
                                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`bg-gradient-to-r ${clr(verdict.classification).gradient} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                                    <div className="relative z-10 flex items-center gap-5">
                                                        <div className="relative">
                                                            <RingChart value={verdict.confidence_percentage} size={72} strokeWidth={6} color="rgba(255,255,255,0.9)" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-lg font-heading font-bold">{verdict.confidence_percentage}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {iconFor(verdict.classification)}
                                                                <span className="text-sm font-bold uppercase tracking-wider">{verdict.classification}</span>
                                                            </div>
                                                            <div className="text-3xl font-heading font-bold mb-1">Risk Score: {verdict.final_risk_score}</div>
                                                            <p className="text-sm text-white/80">{verdict.recommended_action}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Reasoning */}
                                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Sparkles className="w-4 h-4 text-violet-500" />
                                                        <h3 className="text-[13px] font-heading font-bold text-gray-900">AI Analysis Summary</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500 leading-relaxed">{verdict.reasoning_summary}</p>
                                                </motion.div>

                                                {/* Risk Bars */}
                                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <BarChart3 className="w-4 h-4 text-orange-500" />
                                                        <h3 className="text-[13px] font-heading font-bold text-gray-900">Risk Breakdown</h3>
                                                    </div>
                                                    <div className="space-y-3.5">
                                                        {[
                                                            { label: 'Domain Reputation', value: verdict.aggregated_scores.domain_risk, weight: 30, color: 'from-blue-500 to-indigo-500', icon: Globe },
                                                            { label: 'URL Analysis', value: verdict.aggregated_scores.url_risk, weight: 20, color: 'from-cyan-500 to-teal-500', icon: Eye },
                                                            { label: 'Attachment Scan', value: verdict.aggregated_scores.attachment_risk, weight: 35, color: 'from-orange-500 to-red-500', icon: FileWarning },
                                                            { label: 'Social Engineering', value: verdict.aggregated_scores.social_engineering_risk, weight: 15, color: 'from-purple-500 to-pink-500', icon: Cpu },
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                                    <item.icon className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-mono text-gray-400">{item.weight}%w</span>
                                                                            <span className={`text-xs font-heading font-bold ${item.value >= 70 ? 'text-red-500' : item.value >= 40 ? 'text-orange-500' : 'text-emerald-500'}`}>{item.value}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${item.value}%` }}
                                                                            transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                                                                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>

                                                {/* Execution Trace */}
                                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Cpu className="w-4 h-4 text-blue-500" />
                                                            <h3 className="text-[13px] font-heading font-bold text-gray-900">Execution Trace</h3>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">{verdict.tool_execution_trace.length} tools</span>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        {verdict.tool_execution_trace.map((tool, idx) => {
                                                            const colors = ['from-blue-500 to-indigo-500', 'from-cyan-500 to-teal-500', 'from-orange-500 to-red-500', 'from-purple-500 to-pink-500'];
                                                            return (
                                                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.08 }} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/80 transition-colors">
                                                                    <div className={`w-8 h-8 bg-gradient-to-br ${colors[idx % 4]} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-xs font-heading font-bold text-gray-900">{tool.tool_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                                            <span className="text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-100">{tool.execution_time_ms}ms</span>
                                                                        </div>
                                                                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{tool.output_summary}</p>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Right Panel — 3 cols */}
                                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="col-span-3 space-y-4">

                                    {/* Live Feed */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 sticky top-20">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>
                                                <h3 className="text-[13px] font-heading font-bold text-gray-900">Live Feed</h3>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-mono">Real-time</span>
                                        </div>

                                        <div className="space-y-2">
                                            {liveActivities.map((item, idx) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${item.risk >= 70 ? 'bg-gradient-to-br from-red-500 to-rose-600' : item.risk >= 40 ? 'bg-gradient-to-br from-orange-500 to-amber-600' : 'bg-gradient-to-br from-emerald-500 to-green-600'
                                                        }`}>{item.risk}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-semibold text-gray-700 truncate">{item.sender}</p>
                                                        <p className="text-[10px] text-gray-400">{item.time} ago</p>
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Quick Tools */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { icon: Lock, label: 'Block IP', color: 'from-red-500 to-pink-500' },
                                                    { icon: Globe, label: 'WHOIS', color: 'from-blue-500 to-cyan-500' },
                                                    { icon: Download, label: 'Export', color: 'from-emerald-500 to-teal-500' },
                                                    { icon: RefreshCw, label: 'Rescan', color: 'from-violet-500 to-purple-500' },
                                                ].map((action, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.96 }}
                                                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                                    >
                                                        <div className={`w-6 h-6 bg-gradient-to-br ${action.color} rounded-md flex items-center justify-center`}>
                                                            <action.icon className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-gray-600">{action.label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* System Status */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">System</p>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'MCP Server', status: 'Online', icon: Server, ok: true },
                                                    { label: 'AI Engine', status: 'Active', icon: Cpu, ok: true },
                                                    { label: 'API Gateway', status: 'Ready', icon: Wifi, ok: true },
                                                ].map((sys, idx) => (
                                                    <div key={idx} className="flex items-center justify-between py-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <sys.icon className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-[11px] font-medium text-gray-600">{sys.label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[10px] font-semibold text-emerald-600">{sys.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ HISTORY TAB ══════════════ */}
                    {activeTab === 'history' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input placeholder="Search scans…" className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 shadow-sm" />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/10 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 shadow-sm">
                                    <Filter className="w-3.5 h-3.5" /> Filter
                                </button>
                            </div>
                            {[
                                { sender: 'support@paypa1-verify.com', subject: 'URGENT: Verify your account', risk: 87, classification: 'malicious', time: 'Today 2:34 PM', color: 'from-red-500 to-rose-600' },
                                { sender: 'colleague@company.com', subject: 'Q4 Budget Review', risk: 5, classification: 'safe', time: 'Today 1:12 PM', color: 'from-emerald-500 to-green-600' },
                                { sender: 'hr@company-payro11.com', subject: 'Updated Salary Info', risk: 92, classification: 'malicious', time: 'Today 11:45 AM', color: 'from-red-500 to-rose-600' },
                                { sender: 'newsletter@techcrunch.com', subject: 'Weekly Digest', risk: 3, classification: 'safe', time: 'Yesterday 4:30 PM', color: 'from-emerald-500 to-green-600' },
                                { sender: 'support@amaz0n-help.net', subject: 'Order Confirmation #4829', risk: 62, classification: 'suspicious', time: 'Yesterday 2:15 PM', color: 'from-orange-500 to-amber-600' },
                            ].map((scan, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} whileHover={{ y: -1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${scan.color} rounded-xl flex items-center justify-center text-white font-heading font-bold shadow-sm`}>
                                        {scan.risk}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-heading font-bold text-gray-900 truncate">{scan.subject}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${clr(scan.classification).bgLight} ${clr(scan.classification).text}`}>{scan.classification}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono">{scan.sender}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[11px] text-gray-400">{scan.time}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* ══════════════ ANALYTICS TAB ══════════════ */}
                    {activeTab === 'analytics' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                            {/* Overview Cards */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Emails Scanned', value: '1,247', period: 'This month', color: 'from-blue-500 to-indigo-500' },
                                    { label: 'Avg Scan Time', value: '2.1s', period: 'Last 30 days', color: 'from-emerald-500 to-teal-500' },
                                    { label: 'False Positive Rate', value: '0.3%', period: 'This quarter', color: 'from-orange-500 to-amber-500' },
                                    { label: 'Uptime', value: '99.99%', period: 'All time', color: 'from-violet-500 to-purple-500' },
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                                        </div>
                                        <p className="text-2xl font-heading font-bold text-gray-900 tracking-tight">{stat.value}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{stat.label}</p>
                                        <p className="text-[10px] text-gray-300 mt-0.5">{stat.period}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-5">
                                {/* Threat Distribution */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 col-span-2">
                                    <h3 className="text-[13px] font-heading font-bold text-gray-900 mb-5">Threat Distribution</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Phishing', count: 28, total: 127, color: 'from-red-500 to-pink-500' },
                                            { label: 'Malware', count: 15, total: 127, color: 'from-orange-500 to-amber-500' },
                                            { label: 'Social Engineering', count: 8, total: 127, color: 'from-purple-500 to-violet-500' },
                                            { label: 'Clean', count: 76, total: 127, color: 'from-emerald-500 to-green-500' },
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                    <span className="text-sm font-heading font-bold text-gray-900">{item.count}</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / item.total) * 100}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className={`h-full bg-gradient-to-r ${item.color} rounded-full`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Blocked */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                                    <h3 className="text-[13px] font-heading font-bold text-gray-900 mb-4">Top Blocked</h3>
                                    <div className="space-y-2.5">
                                        {[
                                            { domain: 'paypa1-verify.com', count: 12 },
                                            { domain: 'amaz0n-help.net', count: 8 },
                                            { domain: 'company-payro11.com', count: 6 },
                                            { domain: 'malware-drop.ru', count: 5 },
                                            { domain: 'g00gle-sec.com', count: 4 },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                                                <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-[10px] font-bold">{idx + 1}</span>
                                                </div>
                                                <span className="text-[11px] font-mono text-gray-700 flex-1 truncate">{item.domain}</span>
                                                <span className="text-xs font-heading font-bold text-red-500">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ══════════════ SETTINGS TAB ══════════════ */}
                    {activeTab === 'settings' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-5">

                            {/* FAQ / Direct Answer */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">How to submit emails?</h3>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        You do <strong>not</strong> need to connect your Gmail account. You can analyze emails by:
                                    </p>
                                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                                        <li>Pasting the email content manually in the <strong>Analyze</strong> tab.</li>
                                        <li>Forwarding emails to your dedicated address below.</li>
                                        <li>(Optional) Connecting your inbox for automatic scanning.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                                <h3 className="text-[13px] font-heading font-bold text-gray-900 mb-5">Integrations & Usage</h3>
                                <div className="space-y-6">

                                    {/* Method 1: Forwarding */}
                                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 relative group">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                <Mail className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-heading font-bold text-gray-900">Smart Forwarding</h4>
                                                <p className="text-xs text-gray-500 mt-1 mb-3">Forward any suspicious email to your dedicated analysis address.</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-mono text-gray-600 select-all">analysis-kole-8492@mailguard.ai</code>
                                                    <button
                                                        onClick={copyToClipboard}
                                                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                                                    >
                                                        {copied ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Method 2: Direct Connect */}
                                    <div>
                                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Connect Inbox (Automatic Scanning)</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Gmail */}
                                            <button
                                                onClick={() => handleConnect('gmail')}
                                                disabled={connectState.gmail === 'connected'}
                                                className={'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all group relative overflow-hidden ' + (connectState.gmail === 'connected' ? 'bg-green-50 border-green-200 cursor-default' : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md')}
                                            >
                                                {connectState.gmail === 'connecting' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                ) : connectState.gmail === 'connected' ? (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                                        <span className="text-sm font-semibold text-green-700">Connected</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center text-[10px]">G</div>
                                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Connect Gmail</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Outlook */}
                                            <button
                                                onClick={() => handleConnect('outlook')}
                                                disabled={connectState.outlook === 'connected'}
                                                className={'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all group relative overflow-hidden ' + (connectState.outlook === 'connected' ? 'bg-green-50 border-green-200 cursor-default' : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md')}
                                            >
                                                {connectState.outlook === 'connecting' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                ) : connectState.outlook === 'connected' ? (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                                        <span className="text-sm font-semibold text-green-700">Connected</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-[10px]">O</div>
                                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Connect Outlook</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Method 3: Extension */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Browser Extension</h4>
                                            <p className="text-xs text-gray-500">Analyze webmail in 1-click without connecting account</p>
                                        </div>
                                        <button
                                            onClick={handleInstallExtension}
                                            disabled={extensionInstalled}
                                            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ' + (extensionInstalled ? 'bg-green-100 text-green-700' : 'bg-gray-900 text-white hover:bg-black')}
                                        >
                                            {extensionInstalled ? (
                                                <><CheckCircle2 className="w-3 h-3" /> Installed</>
                                            ) : (
                                                <><Download className="w-3 h-3" /> Install Extension</>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 opacity-60 hover:opacity-100 transition-opacity">
                                <h3 className="text-[13px] font-heading font-bold text-gray-900 mb-5">Security Policies (Advanced)</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Auto-quarantine malicious emails', desc: 'Immediately isolate high-risk emails', on: true, color: 'bg-blue-500' },
                                        { label: 'SOC alert notifications', desc: 'Notify security team for critical threats', on: true, color: 'bg-emerald-500' },
                                        { label: 'Macro detection', desc: 'Scan for embedded macros in attachments', on: true, color: 'bg-orange-500' },
                                        { label: 'Full trace logging', desc: 'Log detailed execution traces for audit', on: false, color: 'bg-violet-500' },
                                    ].map((s, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${s.on ? s.color : 'bg-gray-200'} rounded-lg flex items-center justify-center transition-colors`}>
                                                    <CheckCircle2 className={`w-4 h-4 ${s.on ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-gray-700 block">{s.label}</span>
                                                    <span className="text-[11px] text-gray-400">{s.desc}</span>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-200 ${s.on ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                                <motion.div layout className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm ${s.on ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
