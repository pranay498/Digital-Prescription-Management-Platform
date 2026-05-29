const StatCard = ({ icon: Icon, label, value, trend, trendText, bgClass, iconClass, trendClass }) => {
  return (
    <div className={`rounded-3xl p-6 flex flex-col justify-between h-full ${bgClass} shadow-lg relative overflow-hidden group`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-[0.02] rounded-full blur-2xl group-hover:opacity-[0.04] transition-opacity"></div>
      
      <div className="flex flex-col gap-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/20 ${iconClass}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        
        <div className="mt-2">
          <h3 className="text-[32px] font-bold text-white leading-none tracking-tight">{value}</h3>
          <p className="text-sm font-medium text-white/60 mt-2 leading-tight">{label}</p>
        </div>
      </div>
      
      {trend && (
        <div className={`mt-6 text-xs font-semibold flex items-center gap-1.5 ${trendClass}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
          {trend} {trendText}
        </div>
      )}
    </div>
  );
};

export default StatCard;
