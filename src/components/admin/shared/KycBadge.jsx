import React from 'react';
import { Shield } from 'lucide-react';


/**
 * Badge de verificación KYC reutilizable.
 * @param {Object} props
 * @param {boolean} props.verified - Si el usuario está verificado
 */
const KycBadge = ({ verified }) => {
    if (verified) {
        return (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-400 w-auto inline-flex">
                <Shield size={10} /> Validado
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-500/10 border border-zinc-500/20 text-[10px] font-black uppercase text-zinc-400 w-auto inline-flex">
            Sin KYC
        </span>
    );
};

export default KycBadge;
