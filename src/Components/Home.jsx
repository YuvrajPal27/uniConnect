import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { Data } from "./Data/data";
import SectionCards from "./sectionCards";
import Banner from "./Banner";
import { useFirebase } from "../context/FirebaseContext";

const Home = () => {
  const navigate = useNavigate();
  const { university } = useFirebase();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();

      alert("Signed out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800">
      <Banner />
                      
                      
      <div className="flex flex-col sm:flex-row justify-between m-6 mt-2 gap-4 sm:gap-0">
        <div>
          <h2 className="text-white text-2xl font-bold mb-4">Welcome {university}!</h2>
        </div>

        <div className="flex gap-5">
          <button className="h-10 w-25 border border-blue-200 bg-blue-400 my-1 p-2 rounded-md flex justify-center items-center hover:bg-blue-300">
            Contact
          </button>
          <button className="h-10 w-25 border border-blue-200 bg-blue-400 my-1 p-2 rounded-md flex justify-center items-center hover:bg-blue-300">
            Handbook
          </button>
          <button
            onClick={handleLogout}
            className="h-10 w-25 border border-blue-200 bg-blue-400 my-1 p-2 rounded-md flex justify-center items-center hover:bg-blue-300 "
          >
            Logout
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap justify-center items-center">
          {Data.map((Data) => {
            return (
              <SectionCards
                key={Data.id}
                name={Data.name}
                icon={Data.icon}
                onClick={() => navigate(`/${Data.id}`)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
