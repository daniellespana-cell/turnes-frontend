
const FormField = ({ icon: Icon, children, className = "" }) => (
  <div className={`flex items-center gap-3 bg-zinc-900/30 rounded-xl px-4 py-3 transition-all duration-300 focus-within:bg-zinc-900/60 focus-within:shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)] ${className}`}>
    {Icon && <Icon size={16} className="text-zinc-600 shrink-0" />}
    {children}
  </div>
);

export default FormField;