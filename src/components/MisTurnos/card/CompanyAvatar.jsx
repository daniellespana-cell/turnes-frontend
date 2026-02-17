import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

export const CompanyAvatar = ({ logo, name, size = "md" }) => {
    const [imgError, setImgError] = useState(false);

    // Size mappings
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-10 h-10"
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden`}>
            {logo && !imgError ? (
                <img
                    src={logo}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <Building2 size={iconSizes[size]} className="text-zinc-500" />
            )}
        </div>
    );
};
