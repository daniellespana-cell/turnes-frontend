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
            className={`shrink-0 w-12 h-6 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
            <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

export default ToggleItem;
