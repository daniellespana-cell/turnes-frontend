import React from 'react';
import { Star } from 'lucide-react';

import { UI_STRINGS } from '../../domain/uiTranslations';
import { formatDateMY } from '../../utils/formatters';
import { AssetResolver } from '../../utils/assetHelper';

export const ReviewItem = ({ review }) => {
    const { rating, comment, created_at, author } = review;

    // Safe fallbacks
    const authorName = author?.nombre_display || UI_STRINGS.REVIEWS.ANONYMOUS_USER;
    const authorAvatar = AssetResolver.getAvatar(author?.avatar_url) || null;
    const authorRole = author?.rol || UI_STRINGS.REVIEWS.SYSTEM_ROLE;

    // Format Date
    const formattedDate = formatDateMY(created_at);

    return (
        <div className="py-5 border-b border-white/5 last:border-0 flex flex-col md:flex-row gap-4 justify-between items-start transition-colors">
            <div className="flex gap-4">
                {/* AVATAR AUTOR */}
                {authorAvatar ? (
                    <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover bg-zinc-800 shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {authorName.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* TEXTO Y META */}
                <div className="flex flex-col gap-1.5">
                    <div>
                        <p className="text-sm font-bold text-zinc-100 capitalize">
                            {authorName}
                        </p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">{authorRole}</p>
                    </div>

                    {comment ? (
                        <p className="text-sm text-zinc-300 leading-relaxed font-light max-w-xl">
                            "{comment}"
                        </p>
                    ) : (
                        <p className="text-xs text-zinc-500 italic font-light">
                            {UI_STRINGS.REVIEWS.NO_COMMENT}
                        </p>
                    )}
                </div>
            </div>

            {/* RATING (ALINEADO DERECHA O ABAJO EN MOBILE) */}
            <div className="flex flex-col md:items-end gap-1 shrink-0 ml-14 md:ml-0">
                <div className="flex items-center gap-0.5 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            size={12}
                            fill={i < Math.floor(rating) ? "currentColor" : "none"}
                            className={i < Math.floor(rating) ? "text-yellow-500" : "text-zinc-700"}
                        />
                    ))}
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">{formattedDate}</span>
            </div>
        </div>
    );
};

export default ReviewItem;
