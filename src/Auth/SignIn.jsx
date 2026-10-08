import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/config";

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }

      try {
        const userSnapshot = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!userSnapshot.exists()) {
          return;
        }

        const userData = userSnapshot.data();

        if (userData.role === "chancellor") {
          navigate("/chancellor", { replace: true });
        } else if (userData.role === "university") {
          navigate("/home", { replace: true });
        } else {
          await signOut(auth);
          setError("This account does not have a valid application role.");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      const userSnapshot = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userSnapshot.exists()) {
        setError("User profile not found.");
        return;
      }

      const userData = userSnapshot.data();

      if (userData.role === "chancellor") {
        navigate("/chancellor", { replace: true });
      } else if (userData.role === "university") {
        navigate("/home", { replace: true });
      } else {
        await signOut(auth);
        setError("This account does not have a valid application role.");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/wrong-password":
          setError("Invalid email or password.");
          break;

        case "auth/too-many-requests":
          setError(
            "Too many failed attempts. Please try again later."
          );
          break;

        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;

        default:
          setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 border border-white/20 rounded-xl p-8 shadow-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="text-gray-300 mt-2">
            Sign in to manage your university data.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-7 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      <p className="text-center text-sm text-gray-300 mt-5">
          Need a university account? <Link to="/signup" className="text-blue-300 hover:text-blue-200 font-semibold">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;