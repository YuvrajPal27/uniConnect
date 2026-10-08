import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Banner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = location.pathname === "/home";

  return (
    <header className="bg-slate-950 text-white px-5 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img src={logo} alt="University Connect" className="h-11 md:h-12 w-auto object-contain shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs tracking-[0.18em] text-slate-400 font-semibold">RAJBHAWAN UTTARAKHAND</p>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">UNIVERSITY CONNECT</h1>
            <p className="hidden sm:block text-xs text-slate-400">Centralized university data management platform</p>
          </div>
        </div>

        {!onDashboard && (
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="shrink-0 inline-flex items-center gap-2 rounded-md border border-slate-600 px-3.5 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <span aria-hidden="true">←</span>
            Dashboard
          </button>
        )}
      </div>
    </header>
  );
};

export default Banner;
