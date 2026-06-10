// src/components/MisVacantes/VacantesControls.jsx

const VacantesControls = ({ activeTab, setActiveTab, counts, query, setQuery }) => (
  <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
    <VacantesTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
    <div className="lg:w-64">
      <VacantesSearch query={query} setQuery={setQuery} />
    </div>
  </div>
);

export default VacantesControls;