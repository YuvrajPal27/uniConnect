import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="lg:text-7xl text-2xl font-extralight  text-center flex flex-col">
        Welcome to
        <span className="font-bold"> University Connect Uttarakhand</span>
      </h1>
      <button
        onClick={() => navigate("/signin")}
        className="block mx-auto mt-10 px-6 py-3 bg-white/20 text-white rounded-md hover:bg-white/30 transition duration-300"
      >
        Log In / Sign Up
      </button>
    </div>
  );
};

export default LandingPage;
