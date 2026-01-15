import PageWrapper from './PageWrapper';
import { useNavigate } from 'react-router';
import { MdOutlineOpenInNew } from "react-icons/md";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#FAF3E0] px-4">

        {/* Background Image */}
        <img
          src="/images/yoga-bg.png"
          alt="Yoga Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 bg-white/70 backdrop-blur-md 
                  px-6 sm:px-10 md:px-16 py-8 sm:py-10 md:py-12 
                  rounded-3xl shadow-xl w-full max-w-xl text-center">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-green-700 leading-tight">
            Welcome to Yogankan
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full 
                   bg-gradient-to-r from-green-600 to-green-500 
                   text-white shadow-lg flex items-center justify-center gap-2 
                   hover:scale-105 transition-all"
            >
              Login for Judge <MdOutlineOpenInNew />
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full 
                   bg-gradient-to-r from-yellow-500 to-orange-400 
                   text-white shadow-lg flex items-center justify-center gap-2 
                   hover:scale-105 transition-all"
            >
              Login for Admin <MdOutlineOpenInNew />
            </button>
          </div>

          <p className="italic text-gray-600 text-sm sm:text-base md:text-lg">
            Balance • Breathe • Perform
          </p>
        </div>

      </div>

    </PageWrapper>
  );
};

export default Landing;
