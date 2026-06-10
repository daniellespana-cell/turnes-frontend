const VacantesTableContainer = ({ children }) => (
  <div className="relative md:bg-zinc-900/20 md:border md:border-white/[0.03] rounded-[1.5rem] md:rounded-[2.5rem] p-0 md:p-8 md: md:backdrop-blur-sm">
    <div className="hidden md:block absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
    {children}
  </div>
);

export default VacantesTableContainer;