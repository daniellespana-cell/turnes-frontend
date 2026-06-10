import React from 'react';


const ToggleItem = ({ icon: Icon, title, desc, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-transparent rounded-xl  transition-colors shadow-none group cursor-pointer" onClick={onChange}>
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-zinc-900 rounded-lg text-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
                <Icon size={18} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{title}</h3>
                <p className="text-xs text-zinc-500">{desc}</p>
            </div>
        </div>

        {/* IOS Style Toggle */}
        <button
            type="button"
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

export default ToggleItem;
