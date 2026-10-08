import { useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";

const UNIVERSITIES = [
  "Kumaun University, Nainital",
  "G.B.Pant University of Agriculture & Technology, Pant Nagar",
  "Uttarakhand Sanskrit University, Haridwar",
  "Doon University, Dehradun",
  "Veer Madho Singh Bhandari Uttarakhand Technical University, Dehradun",
  "Uttarakhand Open University, Haldwani",
  "Uttarakhand Ayurved University, Dehradun",
  "Uttarakhand University of Horticulture & Forestry, Bharsar",
  "Shree Dev Suman Uttarakhand University, Badhsahithul, Tehri Garhwal",
  "Hemwati Nandan Bahuguna Medical Education University, Dehradun",
  "Soban Singh Jeena University, Almora",
];

const SignUp = () => {
  const navigate = useNavigate();
  const [university, setUniversity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableUniversities = useMemo(() => [...UNIVERSITIES].sort((a, b) => a.localeCompare(b)), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || loading) return;
      const snapshot = await getDoc(doc(db, "users", user.uid));
      if (snapshot.exists()) {
        const role = snapshot.data().role;
        if (role === "university") navigate("/home", { replace: true });
        if (role === "chancellor") navigate("/chancellor", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!university || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", credential.user.uid), {
        email: credential.user.email,
        university,
        role: "university",
      });
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists. Please sign in instead.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Use at least 6 characters.");
          break;
        default:
          setError("Unable to create the account. Please try again.");
      }
      try { await signOut(auth); } catch (_) { /* no-op */ }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white flex items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white/10 border border-white/20 rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create University Account</h1>
          <p className="text-gray-300 mt-2">Register an administrator account for a university.</p>
        </div>

        {error && <div className="mb-5 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-red-300">{error}</div>}

        <div className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-sm font-medium">University</label>
            <select value={university} onChange={(e) => setUniversity(e.target.value)} className="w-full rounded-lg bg-slate-700 border border-white/20 px-4 py-3 outline-none focus:border-blue-400" required>
              <option value="">Select your university</option>
              {availableUniversities.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="University administrator email" autoComplete="email" className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-blue-400" required />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-blue-400" required />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-blue-400" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full mt-7 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition">
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-300 mt-5">
          Already have an account? <Link to="/signin" className="text-blue-300 hover:text-blue-200 font-semibold">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
