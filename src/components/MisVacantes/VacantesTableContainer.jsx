const VacantesTableContainer = ({ children }) => (
  <div className="relative bg-zinc-900/20 border border-white/[0.03] rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl backdrop-blur-sm overflow-hidden">
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
    {children}
  </div>
);

export default VacantesTableContainer;