import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import PaymentsPage from './components/pages/PaymentPage';
import WorkPage from './components/pages/PortfolioPage';
import ContactPage from './components/pages/ContactPage';
import Topbar from './components/Topbar';

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const buttons = [
    { 
      id: 1, 
      label: "Payment", 
      color: "bg-stone-50", 
      url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200",
      path: "/payment" 
    },
    { 
      id: 2, 
      label: "Portfolio", 
      color: "bg-zinc-50", 
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
      path: "/portfolio"
    },
    { 
      id: 3, 
      label: "Contact", 
      color: "bg-neutral-50", 
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200",
      path: "/contact"
    }
  ];

  const clipPathStyle = { clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)' };

  return (
    <div className="bg-white w-screen h-screen relative flex flex-col items-center justify-center overflow-hidden select-none cursor-default font-sans">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center justify-center gap-4 sm:gap-8 lg:gap-16 w-full max-w-7xl px-4"
            >
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 lg:gap-8">
                {buttons.map((btn) => (
                  <div
                    key={btn.id}
                    className="relative w-[25vw] sm:w-[22vw] lg:w-[14rem] aspect-[3/5] transition-all duration-500 hover:-translate-y-2 group"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div 
                      onClick={() => navigate(btn.path)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-95"
                      style={{ 
                        ...clipPathStyle,
                        pointerEvents: 'auto' 
                      }}
                    >
                      <div 
                        className={`absolute inset-0 ${btn.color} grayscale transition-all duration-1000 group-hover:grayscale-0 opacity-40 group-hover:opacity-100 scale-110 group-hover:scale-125`}
                        style={{ 
                          backgroundImage: `url(${btn.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          ...clipPathStyle
                        }}
                      />
                      
                      <div 
                        className="absolute inset-0 bg-white opacity-0 active:opacity-30 transition-opacity duration-100 z-20"
                        style={clipPathStyle}
                      />

                      <div 
                        className="absolute inset-0 bg-black/40 transition-opacity duration-500 group-hover:opacity-20" 
                        style={clipPathStyle}
                      />

                      <span className="relative z-10 text-[2.2vw] sm:text-sm md:text-base lg:text-lg text-white font-bold font-mono tracking-wider uppercase transition-colors duration-500 px-1">
                        {btn.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          } />
          <Route path="/payment" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
              <Topbar />
              <PaymentsPage />
            </motion.div>
          } />
          <Route path="/portfolio" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
              <Topbar />
              <WorkPage />
            </motion.div>
          } />
          <Route path="/contact" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
              <Topbar />
              <ContactPage />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
