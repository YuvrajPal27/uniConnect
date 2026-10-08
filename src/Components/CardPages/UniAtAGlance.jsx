import { useNavigate } from "react-router-dom";
import { useFirebase } from "../../context/FirebaseContext";

const websitesByUniversity = {
  HNB: "https://www.hnbumu.ac.in/",
  "HNB Garhwal University": "https://www.hnbumu.ac.in/",
  "Uttarakhand Technical University": "https://uktech.ac.in/en",
  "Doon University": "https://doonuniversity.ac.in/",
  "Sri Dev Suman Uttarakhand University": "https://www.sdsuv.ac.in/",
  "Soban Singh Jeena University": "https://www.ssju.ac.in/",
  "Kumaun University": "https://www.kunainital.ac.in/",
  "Uttarakhand Ayurved University": "https://www.uau.ac.in/",
  "Uttarakhand Open University": "https://www.uou.ac.in/",
  "GB Pant University": "https://www.gbpuat.ac.in/",
  "Uttarakhand University of Horticulture and Forestry": "https://www.uuhf.ac.in/",
  "Uttarakhand Sanskrit University": "https://usvv.ac.in/",
};

export default function UniAtAGlance() {
  const navigate = useNavigate();
  const { university } = useFirebase();
  const website = websitesByUniversity[university];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="bg-slate-950 text-white px-5 py-3 flex justify-between text-sm"><span className="font-semibold">University Connect</span><span className="text-slate-400">{university}</span></div>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <button onClick={() => navigate("/home")} className="mb-6 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3.5 py-2 text-sm font-medium bg-white hover:bg-slate-50 transition-colors">← Back to Dashboard</button>
        <div className="bg-white rounded-xl shadow-sm border p-8 md:p-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-xl bg-blue-50 flex items-center justify-center text-3xl">🌐</div>
          <p className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase mt-6">Official University Portal</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">{university}</h1>
          <p className="text-slate-500 max-w-2xl mx-auto mt-4">University at a Glance is a quick link to the institution's own official website. No duplicate university-profile data is stored here.</p>
          {website ? <a href={website} target="_blank" rel="noreferrer" className="inline-flex mt-8 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Visit Official Website ↗</a> : <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">The official website for this university has not been configured yet.</div>}
        </div>
      </main>
    </div>
  );
}
