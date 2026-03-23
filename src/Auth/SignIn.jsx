import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [university, setUniversity] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/home");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const uni = isLogin ? null : e.target[2].value;
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
        navigate("/home");
      } else {
        if (!uni) return alert("Please enter university name");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Store university in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          university: uni,
          email: email,
        });
        alert("Account created successfully!");
        navigate("/home");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-800 text-white">
      <form
        onSubmit={handleSubmit}
        className="border-2 rounded-2xl p-8 min-h-80 w-80 bg-white/10 flex flex-col justify-center items-center"
      >
        <h1 className="text-3xl mb-6">{isLogin ? "LogIn" : "Sign Up"}</h1>
        <div className="flex flex-col gap-4 w-full ">
          <input
            type="email"
            placeholder="Email"
            className="p-2 mb-2 border-4  border-white/40 rounded-xl focus-within:bg-black/60 transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 mb-2 border-4 border-white/40 rounded-xl focus-within:bg-black/60 transition-all"
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="University Name"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="p-2 mb-2 border-4 border-white/40 rounded-xl focus-within:bg-black/60 transition-all"
            />
          )}
        </div>

        <button
          type="submit"
          className="h-10 min-w-20 border border-white/40 bg-gray-600 hover:bg-gray-900 transition-all duration-300 my-4 p-2 rounded-md flex justify-center items-center"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          {isLogin
            ? "Don't have an account? Sign Up!"
            : "Already have an account? LogIn!"}
        </p>
      </form>
    </div>
  );
};

export default SignIn;
