const SectionCards = ({ name, description, icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300/40"
    >
      <div className="h-28 bg-slate-100 overflow-hidden">
        <img src={icon} alt="" className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
        <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-700">Open module <span aria-hidden="true">→</span></span>
      </div>
    </button>
  );
};

export default SectionCards;
