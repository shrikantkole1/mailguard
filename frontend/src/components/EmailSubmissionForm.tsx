/**
 * EmailSubmissionForm — Apple/iOS Inspired Design
 * Vibrant gradients • Rounded corners • Premium inputs
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Paperclip, AlertCircle, X, Loader2, Zap, Shield, FileWarning } from 'lucide-react';

interface EmailFormData {
    sender_email: string;
    subject: string;
    body: string;
    attachments: Array<{ filename: string; mime_type: string }>;
}

interface EmailSubmissionFormProps {
    onSubmit: (data: EmailFormData) => void;
    isLoading?: boolean;
    prefillData?: EmailFormData | null;
}

export const EmailSubmissionForm: React.FC<EmailSubmissionFormProps> = ({ onSubmit, isLoading = false, prefillData }) => {
    const [formData, setFormData] = useState<EmailFormData>({ sender_email: '', subject: '', body: '', attachments: [] });
    const [attachmentInput, setAttachmentInput] = useState({ filename: '', mime_type: '' });

    // Populate form when prefillData changes
    if (prefillData && (prefillData.sender_email !== formData.sender_email || prefillData.subject !== formData.subject)) {
        setFormData(prefillData);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.sender_email && formData.subject && formData.body) onSubmit(formData);
    };

    const addAttachment = () => {
        if (attachmentInput.filename) {
            setFormData({ ...formData, attachments: [...formData.attachments, attachmentInput] });
            setAttachmentInput({ filename: '', mime_type: '' });
        }
    };

    const removeAttachment = (idx: number) => {
        setFormData({ ...formData, attachments: formData.attachments.filter((_, i) => i !== idx) });
    };

    const loadScenario = (type: 'safe' | 'phishing' | 'malware') => {
        const d = {
            safe: { sender_email: 'colleague@company.com', subject: 'Q4 Budget Review Meeting', body: 'Hi team,\n\nPlease join us for the quarterly budget review meeting on Friday at 2 PM.\n\nBest regards,\nFinance Team', attachments: [{ filename: 'budget_q4.pdf', mime_type: 'application/pdf' }] },
            phishing: { sender_email: 'support@paypa1-verify.com', subject: 'URGENT: Verify your account immediately', body: 'Dear valued customer,\n\nYour PayPal account has been temporarily suspended due to unusual activity. Click here to verify your identity within 24 hours or your account will be permanently closed.\n\nVerify Now: http://bit.ly/3xK9mP\n\nPayPal Security Team', attachments: [] as any[] },
            malware: { sender_email: 'hr@company-payro11.com', subject: 'Important: Updated Salary Information', body: 'Dear Employee,\n\nPlease review the attached updated salary document. You must enable macros to view the confidential information.\n\nHR Department', attachments: [{ filename: 'Salary_Update_2024.xlsm', mime_type: 'application/vnd.ms-excel.sheet.macroEnabled.12' }] },
        };
        setFormData(d[type]);
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-[13px] font-heading font-bold text-gray-900">Submit Email</h3>
                    <p className="text-[10px] text-gray-400">Paste suspicious email content</p>
                </div>
            </div>

            {/* Quick Tests */}
            <div className="mb-5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Quick Test Scenarios</p>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { type: 'safe' as const, label: 'Safe', icon: Shield, color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
                        { type: 'phishing' as const, label: 'Phishing', icon: AlertCircle, color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/20' },
                        { type: 'malware' as const, label: 'Malware', icon: FileWarning, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20' },
                    ].map((s) => (
                        <motion.button
                            key={s.type}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => loadScenario(s.type)}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-3 py-2.5 bg-gradient-to-br ${s.color} text-white rounded-xl text-[11px] font-bold shadow-lg ${s.shadow} disabled:opacity-40 transition-opacity`}
                        >
                            <s.icon className="w-3.5 h-3.5" />
                            {s.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Sender */}
                <div>
                    <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">Sender Email <span className="text-red-400">*</span></label>
                    <input
                        type="email" value={formData.sender_email} required disabled={isLoading}
                        onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                        placeholder="attacker@example.com"
                        className="w-full px-4 py-3 bg-[#F2F2F7] rounded-xl text-sm text-gray-900 placeholder-gray-300 font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-40"
                    />
                </div>

                {/* Subject */}
                <div>
                    <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">Subject <span className="text-red-400">*</span></label>
                    <input
                        type="text" value={formData.subject} required disabled={isLoading}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="URGENT: Verify your account"
                        className="w-full px-4 py-3 bg-[#F2F2F7] rounded-xl text-sm text-gray-900 placeholder-gray-300 font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-40"
                    />
                </div>

                {/* Body */}
                <div>
                    <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">Email Body <span className="text-red-400">*</span></label>
                    <textarea
                        value={formData.body} required disabled={isLoading} rows={4}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        placeholder="Paste email body content…"
                        className="w-full px-4 py-3 bg-[#F2F2F7] rounded-xl text-sm text-gray-900 placeholder-gray-300 font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none disabled:opacity-40"
                    />
                </div>

                {/* Attachments */}
                <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 mb-1.5">
                        <Paperclip className="w-3 h-3" /> Attachments <span className="text-gray-300 font-normal">(optional)</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text" value={attachmentInput.filename} disabled={isLoading}
                            onChange={(e) => setAttachmentInput({ ...attachmentInput, filename: e.target.value })}
                            placeholder="filename.xlsm"
                            className="flex-1 px-3 py-2.5 bg-[#F2F2F7] rounded-xl text-sm text-gray-900 placeholder-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-40"
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="button" onClick={addAttachment} disabled={!attachmentInput.filename || isLoading}
                            className="px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl disabled:opacity-30"
                        >+</motion.button>
                    </div>

                    <AnimatePresence>
                        {formData.attachments.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 space-y-1.5">
                                {formData.attachments.map((att, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center justify-between px-3 py-2 bg-[#F2F2F7] rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                                                <Paperclip className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">{att.filename}</span>
                                        </div>
                                        <button type="button" onClick={() => removeAttachment(idx)} disabled={isLoading} className="p-1 hover:bg-red-50 rounded-md transition-colors">
                                            <X className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Submit */}
                <motion.button
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    type="submit"
                    disabled={isLoading || !formData.sender_email || !formData.subject || !formData.body}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                    ) : (
                        <><Zap className="w-4 h-4" /> Analyze Email</>
                    )}
                </motion.button>
            </form>

            {/* Info */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-blue-600 leading-relaxed">
                    <strong>Demo</strong> — In production, emails are automatically ingested from your gateway.
                </p>
            </div>
        </div>
    );
};

