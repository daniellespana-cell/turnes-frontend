import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, CheckCircle, XCircle, ExternalLink, FileText, User, AlertTriangle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

import { useParams, useNavigate } from 'react-router-dom';
import { useVerificationDetail } from '../../hooks/admin/useVerificationDetail';
import { AssetResolver } from '../../utils/assetHelper';

const VerificationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        request, signedUrls, loading, actionLoading, actionDone,
        rejectionReason, setRejectionReason, showRejectForm, setShowRejectForm,
        handleApprove, handleReject, userName
    } = useVerificationDetail(id);

    // --- LOADING ---
    if (loading) return (
        <div className="w-full h-full min-h-[400px] bg-[#040404] flex items-center justify-center">
            <Spinner size="lg" variant="emerald" />
        </div>
    );

    // --- 404 ---
    if (!request) return (
        <div className="w-full h-full min-h-[400px] bg-[#040404] flex flex-col items-center justify-center text-zinc-500">
            <AlertTriangle size={48} className="mb-4 text-red-500/50" />
            <h2 className="text-xl font-bold text-white">404 - ID Corrupto</h2>
            <p className="text-sm">La solicitud no existe o violaste un perímetro rls.</p>
        </div>
    );

    // --- ACTION DONE ---
    if (actionDone) return (
        <div className="w-full h-full min-h-[400px] bg-[#040404] flex flex-col items-center justify-center p-6 text-center font-manrope">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border ${actionDone === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                {actionDone === 'approved' ? <CheckCircle size={48} className="text-emerald-400" /> : <XCircle size={48} className="text-red-400" />}
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-2">Auditoría {actionDone === 'approved' ? 'Aprobada' : 'Denegada'}</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-sm">
                {actionDone === 'approved' ? `El sello KYC fue emitido. ${userName} ya cuenta con rango de visibilidad.` : `El usuario ${userName} fue notificado.`}
            </p>
            <button
                onClick={() => navigate('/admin/verificaciones')}
                className="px-8 py-3 rounded-xl bg-white text-black font-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                type="button"
                aria-label="Acción">← RETORNAR A LA COLA</button>
        </div>
    );

    // --- MAIN VIEW ---
    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto font-manrope relative">
            {/* Mutation Lock */}
            {actionLoading && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex flex-col items-center shadow-2xl">
                        <Spinner size="lg" variant="emerald" />
                        <p className="text-sm font-bold text-white uppercase tracking-widest">Procesando Mutación Bancaria...</p>
                        <p className="text-[10px] text-zinc-500 mt-1">No cierres ni recargues la ventana.</p>
                    </div>
                </div>
            )}
            <div className={`max-w-4xl mx-auto space-y-8 ${actionLoading ? 'pointer-events-none opacity-50 blur-sm' : ''} transition-all duration-500`}>
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/verificaciones')}
                        className="p-3 bg-zinc-900/50 border border-white/5 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
                        type="button"
                        aria-label="Acción"><ArrowLeft size={18} /></button>
                    <div>
                        <h1 className="text-2xl font-black text-white">Inspección de <span className="text-blue-400">Identidad</span></h1>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Auditoría ID: <span className="text-zinc-400">{id?.slice(0,18)}</span></p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        <div className="w-24 h-24 rounded-3xl bg-zinc-800/80 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-1">
                            {request.perfiles?.avatar_url ? <img src={AssetResolver.getAvatar(request.perfiles.avatar_url)} className="w-full h-full object-cover rounded-2xl" alt={userName} /> : <User size={40} className="text-zinc-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl font-black text-white truncate">{userName}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${request.user_role === 'empresa' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                    {request.user_role === 'empresa' ? '🏢 Corporativo' : '👤 Talento Individual'}
                                </span>
                                {request.perfiles?.empresas?.sector_industrial && <span className="text-xs font-bold text-zinc-500">{request.perfiles.empresas.sector_industrial}</span>}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-white/5">
                                <div><p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Depósito</p><p className="font-black text-white text-lg">${(request.amount_paid || 0).toLocaleString()} <span className="text-xs text-zinc-500">COP</span></p></div>
                                <div><p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Fecha</p><p className="font-bold text-white text-sm">{new Date(request.created_at).toLocaleDateString('es-CO')}</p></div>
                                {request.perfiles?.empresas?.nit_rut && <div className="md:col-span-2"><p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">NIT / RUT</p><p className="font-mono text-zinc-300 font-bold text-sm bg-black/40 px-3 py-1 rounded-md inline-block border border-white/5">{request.perfiles.empresas.nit_rut}</p></div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evidence Vault */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Bóveda de Evidencias ({(request.documents || []).length})</h3>
                    {(request.documents || []).length === 0 ? (
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center text-zinc-500">
                            <FileText size={32} className="opacity-30 mb-2" /><p className="text-sm font-bold">Expediente vacío.</p><p className="text-xs">Este usuario no adjuntó archivos legales.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {request.documents.map(doc => (
                                <div key={doc.path} className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-colors group">
                                    <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center shrink-0 border border-white/5"><FileText size={20} className="text-zinc-400 group-hover:text-blue-400 transition-colors" /></div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{doc.type === 'cc' ? 'Cédula de Ciudadanía' : 'RUT / NIT Legal'}</p><p className="text-[10px] text-zinc-500 truncate">{doc.name}</p></div>
                                    {signedUrls[doc.path] ? (
                                        <a href={signedUrls[doc.path]} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shrink-0"><ExternalLink size={14} /></a>
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600"><Spinner size="sm" variant="muted" /></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Verdict Panel */}
                {['pending', 'in_review'].includes(request.status) && (
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-6">
                        <div><h3 className="text-sm font-black text-white">Veredicto Operativo</h3><p className="text-xs text-zinc-500">Confirma la decisión. Esta acción es inmutable.</p></div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleApprove}
                                disabled={!!actionLoading}
                                className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                type="button"
                                aria-label="Acción"><CheckCircle size={18} /> Otorgar Status KYC</button>
                            <button
                                onClick={() => setShowRejectForm(!showRejectForm)}
                                disabled={!!actionLoading}
                                className="flex-1 h-14 rounded-2xl bg-zinc-900 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                type="button"
                                aria-label="Acción"><XCircle size={18} /> Rechazar Identidad</button>
                        </div>
                        <AnimatePresence>
                            {showRejectForm && (
                                <motion.div initial={{
                                    opacity: 0
                                }} animate={{
                                    opacity: 1
                                }} exit={{
                                    opacity: 0
                                }} className="overflow-hidden">
                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                        <div><label htmlFor="rejectionInput" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Justificación Legal</label>
                                            <textarea id="rejectionInput" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Ejemplo: El documento provisto se encuentra ilegible..." className="w-full h-24 bg-red-500/5 border border-red-500/20 focus:border-red-500/50 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none resize-none transition-all" />
                                        </div>
                                        <button
                                            onClick={handleReject}
                                            disabled={!rejectionReason.trim() || !!actionLoading}
                                            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                            type="button"
                                            aria-label="Acción"><AlertTriangle size={16} /> Emitir Rechazo y Reembolsar</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Historical Status */}
                {['approved', 'rejected'].includes(request.status) && (
                    <div className={`rounded-3xl p-6 border flex items-start gap-4 ${request.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="shrink-0 mt-1">{request.status === 'approved' ? <Shield size={24} className="text-emerald-400" /> : <AlertTriangle size={24} className="text-red-400" />}</div>
                        <div>
                            <p className="text-sm font-black text-white">{request.status === 'approved' ? 'Expediente Cerrado: Verificado' : 'Expediente Cerrado: Rechazado'}</p>
                            {request.rejection_reason && <p className="text-xs text-zinc-400 mt-1">Razón: "{request.rejection_reason}"</p>}
                            {request.reviewed_at && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Auditoría: {new Date(request.reviewed_at).toLocaleString('es-CO')}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationDetailPage;
