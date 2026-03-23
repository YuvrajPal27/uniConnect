import logo from "../assets/logo.png";

const Banner = () => {
  return (
    <div
        id="banner"
        className="bg-gray-700 m-2 p-2 rounded-md flex max-h-[35vh] justify-center items-center w-auto text-center lg:gap-10"
      >
        <div>
          <img
            src={logo}
            alt="Description"
            className="max-h-[30vh] hidden lg:block"
          />
        </div>
        <div className="text-white flex flex-col justify-center items-center">
          <span className="text-sm lg:text-xl tracking-widest">WELCOME TO</span>
          <div className="text-2xl lg:text-4xl font-bold">
            UNIVERSITY CONNECT UTTARAKHAND
          </div>
          <span className="text-sm tracking-widest lg:text-xl">
            RAJBHAWAN UTTARAKHAND
          </span>
        </div>
      </div>
  )
}

export default Banner