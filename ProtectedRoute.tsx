import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../contexts/LanguageContext';
import logoImage from '../assets/sofalimpo-fotor-2025120517450.png';

export default function Navbar() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 250, 250, 0)', 'rgba(255, 250, 250, 1)']
  );
  
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
          <motion.img
            src={logoImage}
            alt="SofáLimpo"
            className="h-20 w-auto max-w-[400px] object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          />
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
            {t('nav.home')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#deb052] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            to="/sobre"
            className={`text-[#deb052] hover:text-[#deb052] relative group ${
              location.pathname === '/sobre' ? 'font-semibold' : ''
            }`}
          >
            {t('nav.about')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#deb052] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            to="/contacto"
            className={`text-[#deb052] hover:text-[#deb052] relative group ${
              location.pathname === '/contacto' ? 'font-semibold' : ''
            }`}
          >
            {t('nav.contact')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#deb052] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            to="/empresas"
            className={`text-[#deb052] hover:text-[#deb052] relative group ${
              location.pathname === '/empresas' ? 'font-semibold' : ''
            }`}
          >
            Empresas
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#deb052] group-hover:w-full transition-all duration-300" />
          </Link>
        </motion.div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <motion.a
            href="tel:+351935798081"
            className="bg-white border-2 border-[#deb052] text-black px-6 py-2 text-sm font-semibold hover:bg-[#deb052] hover:text-white transition-all duration-300 ease-in-out flex items-center gap-2 rounded-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PhoneCall size={20} />
            <span className="hidden sm:inline">
              {t('nav.callNow')}
            </span>
          </motion.a>
        </div>
      </nav>
    </motion.header>
  );
}