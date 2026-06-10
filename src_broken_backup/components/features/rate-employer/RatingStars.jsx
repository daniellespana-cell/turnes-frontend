import { useState } from 'react';

const LABELS = ['Muy Mal', 'Regular', 'Bueno', 'Excelente', '¡Brillante!'];

export const RatingStars = ({ rating, onChange }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="p-1 group focus:outline-none"
                    >
                        <Star
                            size={38}
                            strokeWidth={1.5}
                            className={`transition-all duration-300 ${
                                (hover || rating) >= star
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                                    : 'text-zinc-800 group-hover:text-zinc-700'
                            }`}
                        />
                    </motion.button>
                ))}
            </div>
            
            <div className="h-4 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.span 
                        key={rating || hover}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em]"
                    >
                        {(hover || rating) === 0 ? 'Desliza para puntuar' : LABELS[(hover || rating) - 1]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
};
