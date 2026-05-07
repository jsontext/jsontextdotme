import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';

// 定義專案資料結構
interface Project {
  id: string;
  title: string;
  description: string;
  logoUrl: string;
  images: string[];
  robloxUrl: string;
  discordUrl: string;
  codeUrl: string;
}

// 主型專案數據 (Hero Cards)
const MAIN_PROJECTS: Project[] = [
  {
    id: 'bloxtype',
    title: "BLOXTYPE",
    description: "A competitive typing game. Challenge your friends and strangers in high-stakes typing duels or climb the global leaderboard. Master your rhythm and prove your accuracy in the ultimate test of keystrokes.",
    logoUrl: "/img/bloxtype/logo.png",
    images: [
      "/img/bloxtype/scene1.png",
      "/img/bloxtype/scene2.png",
      "/img/bloxtype/scene3.png",
      "/img/bloxtype/scene4.png",
    ],
    robloxUrl: "https://www.roblox.com/games/your-game-id",
    discordUrl: "https://discord.gg/your-invite-code",
    codeUrl: "https://github.com/your-repo"
  },
  {
    id: 'haliford',
    title: "HALIFORD",
    description: "An immersive survival experience. Explore the vast landscapes of Haliford and build your legacy in this expansive open-world adventure.",
    logoUrl: "/img/haliford/logo.png",
    images: [
      "/img/haliford/scene1.png",
      "/img/haliford/scene2.png",
      "/img/haliford/scene3.png",
      "/img/haliford/scene4.png",
    ],
    robloxUrl: "https://www.roblox.com/games/haliford-id",
    discordUrl: "https://discord.gg/haliford",
    codeUrl: "https://github.com/haliford-repo"
  }
];

// 小型專案數據 (Grid Row)
const SMALL_PROJECTS: Project[] = [
  {
    id: 'small-1',
    title: "Project A",
    description: "Short description of a thin project focusing on specialized mechanics.",
    logoUrl: "/img/small1/logo.png",
    images: ["/img/small1/scene1.png"],
    robloxUrl: "#",
    discordUrl: "#",
    codeUrl: "#"
  },
  {
    id: 'small-2',
    title: "Project B",
    description: "Another innovative project exploring unique visual styles and shaders.",
    logoUrl: "/img/small2/logo.png",
    images: ["/img/small2/scene1.png"],
    robloxUrl: "#",
    discordUrl: "#",
    codeUrl: "#"
  },
  {
    id: 'medium-1',
    title: "Medium Project",
    description: "A slightly wider display for a medium-sized project that bridges multiple gameplay systems.",
    logoUrl: "/img/medium1/logo.png",
    images: ["/img/medium1/scene1.png"],
    robloxUrl: "#",
    discordUrl: "#",
    codeUrl: "#"
  }
];

// 圖標組件
const RobloxIcon = () => (
  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M18.926 23.568L1.432 18.061 5.074 1.432 22.568 6.939l-3.642 16.629zM8.034 10.354l2.121 6.579 6.579-2.121-2.121-6.579-6.579 2.121z" /></svg>
);
const DiscordIcon = () => (
  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.252-.192.37-.29a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.29a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" /></svg>
);
const CodeIcon = () => (
  <svg className="w-3 h-3 fill-none stroke-white" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);

/**
 * 優化後的通用輪播組件
 */
const CarouselLayer = ({ project, isSmall = false }: { project: Project, isSmall?: boolean }) => {
  const carouselControls = useAnimationControls();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const imagesWithWrap = [...project.images, project.images[0]];
  const allImagesLoaded = imagesLoaded >= project.images.length;

  useEffect(() => {
    if (!allImagesLoaded || isPanelOpen || project.images.length <= 1) return;
    let currentIndex = 0;
    let intervalId: NodeJS.Timeout;

    const startAnimation = () => {
      intervalId = setInterval(async () => {
        if (document.hidden || !isTabActive || isPanelOpen) return;
        currentIndex++;
        await carouselControls.start({
          x: `-${currentIndex * 100}%`,
          transition: { duration: 0.8, ease: [0.45, 0, 0.55, 1] }
        });
        if (currentIndex >= project.images.length) {
          currentIndex = 0;
          carouselControls.set({ x: "0%" });
        }
      }, 3000);
    };

    startAnimation();
    const handleVisibilityChange = () => setIsTabActive(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [carouselControls, project.images.length, allImagesLoaded, isTabActive, isPanelOpen]);

  const openPanel = useCallback(() => {
    if (isTransitioning || isPanelOpen) return;
    setIsTransitioning(true);
    setIsPanelOpen(true);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isPanelOpen, isTransitioning]);

  const closePanel = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isTransitioning || !isPanelOpen) return;
    setIsTransitioning(true);
    setIsLogoVisible(true);
    setIsPanelOpen(false);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isPanelOpen, isTransitioning]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsLogoVisible(false);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="w-full h-full relative group font-['Montserrat',_sans-serif] bg-transparent rounded-sm overflow-hidden shadow-2xl">
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 z-[80] flex flex-row items-center gap-3 pointer-events-auto"
          >
            <div className="flex flex-row items-center gap-2.5 drop-shadow-md">
              <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all transform hover:scale-110"><CodeIcon /></a>
              <a href={project.robloxUrl} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all transform hover:scale-110"><RobloxIcon /></a>
              <a href={project.discordUrl} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all transform hover:scale-110"><DiscordIcon /></a>
            </div>
            <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center bg-transparent text-white/60 hover:text-white transition-all cursor-pointer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-full relative">
        <motion.div className="flex h-full w-full bg-gray-900" animate={carouselControls} initial={{ x: "0%" }}>
          {imagesWithWrap.map((src, i) => (
            <div key={i} className={`w-full h-full flex-shrink-0 relative ${isPanelOpen ? 'cursor-default' : 'cursor-pointer'}`} onClick={openPanel}>
              <img src={src} alt={`${project.title} scene ${i}`} className={`w-full h-full object-cover transition-all duration-700 ${isPanelOpen ? 'blur-[2px]' : 'blur-0'}`} onLoad={() => setImagesLoaded(prev => prev + 1)} />
              <div className={`absolute inset-0 transition-colors duration-700 ${isPanelOpen ? 'bg-transparent' : 'bg-black/0'}`} />
            </div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* 修正：將毛玻璃層固定，不參與水平移動動畫，防止左側邊緣閃爍 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[70] bg-transparent backdrop-blur-md pointer-events-none"
            />
            
            {/* 文字內容層：僅在此處應用位移動畫 */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: -20, opacity: 0 }} 
              transition={{ type: "spring", damping: 30, stiffness: 200 }} 
              className="absolute top-0 left-0 w-full h-full z-[71] p-8 flex flex-col justify-center cursor-default pointer-events-none"
            >
              <div className={`max-h-full overflow-y-auto no-scrollbar drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] ${!isSmall ? 'w-1/2' : 'w-full'}`}>
                <h2 className={`${isSmall ? 'text-xl' : 'text-3xl'} font-black mb-4 leading-tight uppercase tracking-tight text-white`}>{project.title}</h2>
                <p className={`text-white leading-relaxed ${isSmall ? 'text-xs' : 'text-sm'} font-normal opacity-90 max-w-[95%]`}>{project.description}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogoVisible && !isPanelOpen && (
          <motion.img 
            initial={{ opacity: 0, scale: 0, rotate: -180, x: "-50%", y: "-50%" }} 
            animate={{ opacity: 1, scale: 1, rotate: 0, x: "-50%", y: "-50%" }} 
            exit={{ opacity: 0, scale: 0, rotate: 180, x: "-50%", y: "-50%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 150 }} 
            src={project.logoUrl} 
            alt={`${project.title} logo`} 
            onClick={handleLogoClick} 
            className={`absolute top-1/2 left-1/2 ${isSmall ? 'w-12 h-12' : 'w-20 h-20'} z-[80] rounded-full cursor-pointer drop-shadow-xl`} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 w-full h-screen overflow-y-auto bg-white flex flex-col items-center py-20 px-4"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        
        /* 強制放開捲動權限 */
        html, body {
          overflow: visible !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* 隱藏特定容器的捲動條但保留功能 */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* 針對伺服器環境的強制捲動條 */
        * {
          scrollbar-color: rgba(0,0,0,0.2) transparent;
          scrollbar-width: thin;
        }
      `}</style>
      
      {/* 內容容器：確保寬度並自然延伸高度 */}
      <div className="w-full flex flex-col items-center flex-shrink-0">
        
        {/* 主專案列表 (Hero Cards) */}
        <div className="w-full flex flex-col items-center gap-12 mb-12">
          {MAIN_PROJECTS.map(project => (
            <div key={project.id} className="w-[95%] max-w-4xl aspect-video flex-shrink-0">
              <CarouselLayer project={project} />
            </div>
          ))}
        </div>

        {/* 小型專案區塊 (Small Projects Row) */}
        <div className="w-[95%] max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[320px] mb-20 flex-shrink-0">
          <div className="md:col-span-1 h-[320px] md:h-full">
            <CarouselLayer project={SMALL_PROJECTS[0]} isSmall={true} />
          </div>
          <div className="md:col-span-1 h-[320px] md:h-full">
            <CarouselLayer project={SMALL_PROJECTS[1]} isSmall={true} />
          </div>
          <div className="md:col-span-2 h-[320px] md:h-full">
            <CarouselLayer project={SMALL_PROJECTS[2]} isSmall={false} />
          </div>
        </div>

      </div>
    </motion.div>
  );
}