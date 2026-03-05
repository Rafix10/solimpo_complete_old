import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PhoneCall, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.6)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor }}
    >
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between relative">
        <Link to="/">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="h-8 w-8 text-[#deb052]" />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              SofáLimpo
            </motion.h1>
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="hidden md:flex space-x-8"
        >
          <Link 
            to="/" 
            className={`text-[#deb052] hover:text-[#deb052] relative group ${
              location.pathname === '/' ? 'font-semibold' : ''
            }`}
          >
            Início
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#deb052] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            to="/sobre" 
            className={`text-[#deb052] hover:text-[#deb052] relative group ${
              location.pathname === '/sobre' ? 'font-semibold' : ''
            }`}
          >
            Sobre Nós
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#deb052] group-hover:w-full transition-all duration-300" />
          </Link>
        </motion.div>

        <motion.a 
          href="tel:+351900000000" 
          className="bg-transparent border-2 border-[#deb052] text-[#deb052] px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#deb052] hover:text-white transition-all flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PhoneCall size={20} />
          <span className="hidden sm:inline">
            Ligar Agora
          </span>
        </motion.a>
      </nav>
    </motion.header>
  );
}
