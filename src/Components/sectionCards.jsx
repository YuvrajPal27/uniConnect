const SectionCards = ({ name, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className=" group border border-white/30  rounded-lg m-2 p-2 
                        cursor-pointer hover:scale-110 transition-all 
                        duration-400 hover:border-gray-00 flex flex-row md:flex-col items-center gap-2 w-full md:w-auto"
    >
      <img src={icon} alt={name} className="w-48 h-52 hidden md:block" />
      <div className="bg-white rounded-md w-full">
        <p className="font-semibold m-2 p-1 rounded-md flex justify-center items-center">
          {name}
        </p>
      </div>
    </div>
  );
};

export default SectionCards;
