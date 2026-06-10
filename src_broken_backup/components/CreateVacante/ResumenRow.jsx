
const ResumenRow = ({ label, value, isHighlight, subLabel }) => (
  <div className="flex justify-between items-center py-1.5 animate-in fade-in duration-500">
    <div className="flex flex-col">
      <span className="text-zinc-500 text-[12px] font-medium">{label}</span>
      {subLabel && <span className="text-[9px] text-zinc-600 font-bold italic tracking-tight">{subLabel}</span>}
    </div>
    <span className={`${isHighlight ? 'text-emerald-500 font-black' : 'text-zinc-200 font-bold'} text-[13px] tracking-tight`}>
      {value}
    </span>
  </div>
);

export default ResumenRow;