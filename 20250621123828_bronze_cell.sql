import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { PhoneCall, Sparkles, Sofa, Touchpad as Carpet, Armchair, Bed, Box, X, Info } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuoteRequestModal from '../components/QuoteRequestModal';
import ServiceModal from '../components/ServiceModal';

interface SiteContent {
  [key: string]: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  service_type: string;
  original_price: number;
  discounted_price: number;
  discount_percentage?: number;
  start_date: string;
  end_date: string;
  active: boolean;
  image_url: string | null;
  display_type: 'section' | 'service';
  display_order: number;
  promotion_type: 'single' | 'bundle';
  show_on_homepage?: boolean;
  bundle_rules?: {
    if_service: string;
    if_quantity?: number;
    then_service: string;
    then_discount: number;
  };
}

interface Service {
  id: string;
  type: string;
  name: string;
  description: string | null;
  icon: string;
  icon_type: 'emoji' | 'image' | 'lucide';
  icon_image_url?: string;
  price_type: string;
  base_price: number;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  saber_mais_content?: any;
}

const Icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Sofa: Sofa,
  Carpet: Carpet,
  Armchair: Armchair,
  Bed: Bed,
  PhoneCall: PhoneCall,
  Sparkles: Sparkles,
  Box: Box
};

function HomePage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showQuoteReminder, setShowQuoteReminder] = useState(false);
  const [savedFormData, setSavedFormData] = useState<any>({ items: [] });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [content, setContent] = useState<SiteContent>({});
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPromotionPopup, setShowPromotionPopup] = useState(false);
  const [showPromotionBanner, setShowPromotionBanner] = useState(false);
  const [popupPromotion, setPopupPromotion] = useState<Promotion | null>(null);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const { scrollYProgress } = useScroll();

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchContent(),
        fetchActivePromotions(),
        fetchServices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, content');

      if (error) {
        console.error('Error fetching content:', error);
        return;
      }

      const contentMap: SiteContent = {};
      data?.forEach(item => {
        contentMap[item.key] = item.content;
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchActivePromotions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('🔍 Fetching promotions for date:', today);
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching promotions:', error);
        return;
      }

      console.log('✅ Fetched all active promotions:', data);
      console.log('📊 Total active promotions found:', data?.length || 0);
      
      setPromotions(data || []);

      // Mostrar popup para a primeira promoção marcada para homepage
      const homepagePromotions = (data || []).filter(p => p.show_on_homepage === true);
      console.log('🏠 Homepage promotions:', homepagePromotions);
      
      if (homepagePromotions.length > 0 && !hasShownPopup && !showPromotionPopup && !showPromotionBanner) {
        const firstPromotion = homepagePromotions[0];
        console.log('🎉 Showing popup for promotion:', firstPromotion.title);
        setPopupPromotion(firstPromotion);
        setShowPromotionPopup(true);
        setHasShownPopup(true);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        return;
      }
      
      console.log('📋 Fetched services:', servicesData);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleCloseModal = (hasProgress: boolean, formData: any) => {
    if (hasProgress) {
      setSavedFormData(formData);
      setShowQuoteReminder(true);
    }
    setIsQuoteModalOpen(false);
  };

  const handleClosePromotionPopup = () => {
    setShowPromotionPopup(false);
    setShowPromotionBanner(true);
  };

  const serviceContent: Record<string, any> = {
    sofa: {
      description: "Nossa limpeza profissional de sofás utiliza tecnologia avançada e produtos especializados para remover manchas, ácaros e bactérias, devolvendo a beleza e higiene ao seu mobiliário.",
      process: [
        "Inspeção detalhada do material e estado do sofá",
        "Aspiração profunda para remover partículas soltas",
        "Aplicação de produto específico para o tipo de tecido",
        "Extração com equipamento profissional",
        "Higienização completa e neutralização de odores"
      ],
      benefits: [
        "Elimina ácaros e bactérias",
        "Remove manchas profundas",
        "Prolonga a vida útil do móvel",
        "Melhora a qualidade do ar",
        "Restaura a aparência original",
        "Secagem rápida"
      ]
    },
    carpet: {
      description: "Oferecemos um serviço especializado de limpeza de tapetes que preserva as fibras e cores originais, removendo sujeira profunda e restaurando a beleza do seu tapete.",
      process: [
        "Análise do material e estado do tapete",
        "Remoção do pó e sujeira solta",
        "Pré-tratamento de manchas",
        "Lavagem profunda com produtos específicos",
        "Enxágue e neutralização"
      ],
      benefits: [
        "Preservação das cores originais",
        "Remoção de ácaros e alérgenos",
        "Proteção contra manchas futuras",
        "Maior durabilidade do tapete",
        "Ambiente mais saudável",
        "Restauração da maciez"
      ]
    },
    chair: {
      description: "Nossa limpeza profissional de cadeiras combina técnicas modernas e produtos específicos para cada tipo de material, garantindo resultados excepcionais e maior durabilidade.",
      process: [
        "Análise do material e estado da cadeira",
        "Aspiração profunda",
        "Aplicação de produtos específicos",
        "Extração da sujeira",
        "Proteção do tecido"
      ],
      benefits: [
        "Higienização completa",
        "Remoção de manchas",
        "Proteção do tecido",
        "Maior vida útil",
        "Ambiente mais limpo",
        "Conforto renovado"
      ]
    }
  };

  // Separar promoções por tipo
  const sectionPromotions = promotions.filter(p => p.display_type === 'section' && p.promotion_type === 'single');
  const servicePromotions = promotions.filter(p => p.display_type === 'service' && p.promotion_type === 'single');
  const bundlePromotions = promotions.filter(p => p.promotion_type === 'bundle');

  const getServicePromotion = (serviceType: string) => {
    const promotion = servicePromotions.find(p => p.service_type === serviceType);
    console.log(`🔍 Looking for promotion for service "${serviceType}":`, promotion);
    return promotion;
  };

  const getBundlePromotionMessage = (serviceType: string) => {
    const relevantBundles = bundlePromotions.filter(p => 
      p.bundle_rules?.if_service === serviceType || p.bundle_rules?.then_service === serviceType
    );
    
    if (relevantBundles.length > 0) {
      const bundle = relevantBundles[0];
      if (bundle.bundle_rules?.if_service === serviceType) {
        return `💡 Dica: Ao pedir este serviço, ganhe ${bundle.bundle_rules.then_discount}% de desconto em ${
          bundle.bundle_rules.then_service === 'sofa' ? 'Sofás' : 
          bundle.bundle_rules.then_service === 'carpet' ? 'Tapetes' : 'Cadeiras'
        }!`;
      } else if (bundle.bundle_rules?.then_service === serviceType) {
        return `🎯 Oferta Especial: ${bundle.bundle_rules.then_discount}% de desconto neste serviço ao pedir ${
          bundle.bundle_rules.if_service === 'sofa' ? 'Sofás' : 
          bundle.bundle_rules.if_service === 'carpet' ? 'Tapetes' : 'Cadeiras'
        }!`;
      }
    }
    return null;
  };

  const renderServiceIcon = (service: Service) => {
    if (service.icon_type === 'image' && service.icon_image_url) {
      return (
        <img 
          src={service.icon_image_url} 
          alt={service.name}
          className="w-16 h-16 object-contain"
        />
      );
    } else if (service.icon_type === 'lucide' && Icons[service.icon]) {
      const IconComponent = Icons[service.icon];
      return <IconComponent className="w-16 h-16 text-[#deb052]" />;
    }
    return <div className="text-6xl">{service.icon}</div>;
  };

  const handleSaberMais = (service: Service) => {
    // Usar o conteúdo do serviço se existir, senão usar o conteúdo padrão
    const content = service.saber_mais_content || serviceContent[service.type];
    if (content) {
      setSelectedService({ ...service, saber_mais_content: content });
      setIsServiceModalOpen(true);
    }
  };

  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number) => {
    return originalPrice * (1 - discountPercentage / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>SofáLimpo - Limpeza Profissional de Sofás em Portugal</title>
        <meta name="description" content="Serviço profissional de limpeza de sofás, tapetes e cadeiras em Portugal. Atendemos empresas e particulares com qualidade garantida." />
        <link rel="canonical" href="https://sofalimpo.pt/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />

        {/* Promotion Popup */}
        <AnimatePresence>
          {showPromotionPopup && popupPromotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/20 flex items-center justify-center z-[60] p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="bg-black border border-[#deb052] max-w-md w-full shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative p-6 bg-[#deb052] text-black">
                  <button
                    onClick={handleClosePromotionPopup}
                    className="absolute right-4 top-4 text-black/80 hover:text-black transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <div className="text-center">
                    <div className="bg-black/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">🎉 PROMOÇÃO ATIVA!</h2>
                    <p className="text-black/90">Oferta especial por tempo limitado</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {popupPromotion.title}
                    </h3>
                    {popupPromotion.description && (
                      <p className="text-gray-300 text-sm mb-4">
                        {popupPromotion.description}
                      </p>
                    )}
                  </div>

                  {popupPromotion.promotion_type === 'single' ? (
                    <div className="bg-green-900/20 p-4 mb-6 border border-green-500 rounded-md">
                      <div className="text-center">
                        {popupPromotion.discount_percentage ? (
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-3xl font-bold text-green-600">
                              {popupPromotion.discount_percentage}% OFF
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-2xl text-gray-500 line-through">
                              {popupPromotion.original_price}€
                            </span>
                            <span className="text-3xl font-bold text-green-600">
                              {popupPromotion.discounted_price}€
                            </span>
                          </div>
                        )}
                        <div className="bg-black text-white px-3 py-1 text-sm font-bold inline-block rounded-md">
                          {popupPromotion.discount_percentage ? 
                            `${popupPromotion.discount_percentage}% DESCONTO` : 
                            `POUPE ${(popupPromotion.original_price - popupPromotion.discounted_price).toFixed(0)}€`
                          }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#deb052]/10 p-4 mb-6 border border-[#deb052]/50 rounded-md">
                      <div className="text-center">
                        <p className="text-[#deb052] font-medium">
                          <strong>Oferta Combinada:</strong><br/>
                          Ao pedir <strong>{popupPromotion.bundle_rules?.if_service === 'sofa' ? 'Limpeza de Sofá' : 
                            popupPromotion.bundle_rules?.if_service === 'carpet' ? 'Limpeza de Tapete' : 'Limpeza de Cadeira'}</strong>
                          {popupPromotion.bundle_rules?.if_quantity && ` (mín. ${popupPromotion.bundle_rules.if_quantity})`}, 
                          ganhe <strong className="text-green-600">{popupPromotion.bundle_rules?.then_discount}% de desconto</strong> em{' '}
                          <strong>{popupPromotion.bundle_rules?.then_service === 'sofa' ? 'Limpeza de Sofá' : 
                            popupPromotion.bundle_rules?.then_service === 'carpet' ? 'Limpeza de Tapete' : 'Limpeza de Cadeira'}</strong>!
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-400 mb-6">
                    Válido até {new Date(popupPromotion.end_date).toLocaleDateString('pt-PT')}
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      onClick={() => {
                        setShowPromotionPopup(false);
                        setIsQuoteModalOpen(true);
                        if (popupPromotion.promotion_type === 'single') {
                          setSavedFormData({
                            ...savedFormData,
                            items: [{
                              id: Date.now().toString(),
                              type: popupPromotion.service_type,
                              width: '',
                              height: '',
                              seats: '1',
                              price: 0,
                              extras: []
                            }]
                          });
                        } else if (popupPromotion.bundle_rules) {
                          setSavedFormData({
                            ...savedFormData,
                            items: [
                              {
                                id: Date.now().toString(),
                                type: popupPromotion.bundle_rules.if_service,
                                width: '',
                                height: '',
                                seats: '1',
                                price: 0,
                                extras: []
                              },
                              {
                                id: (Date.now() + 1).toString(),
                                type: popupPromotion.bundle_rules.then_service,
                                width: '',
                                height: '',
                                seats: '1',
                                price: 0,
                                extras: []
                              }
                            ]
                          });
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#deb052] border-2 border-white text-black py-3 font-bold text-lg shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 ease-in-out rounded-md"
                    >
                      🚀 APROVEITAR OFERTA
                    </motion.button>
                    
                    <button
                      onClick={handleClosePromotionPopup}
                      className="w-full text-gray-400 py-2 text-sm hover:text-gray-200 transition-colors rounded-md"
                    >
                      Talvez mais tarde
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Promotion Banner */}
        <AnimatePresence>
          {showPromotionBanner && popupPromotion && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#deb052] text-black shadow-2xl"
            >
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-black" />
                    <div>
                      <p className="font-bold text-sm">
                        🎉 {popupPromotion.title}
                      </p>
                      {popupPromotion.promotion_type === 'single' ? (
                        <p className="text-xs text-black/90">
                          {popupPromotion.discount_percentage ? 
                            `${popupPromotion.discount_percentage}% de desconto` : 
                            `Poupe ${(popupPromotion.original_price - popupPromotion.discounted_price).toFixed(0)}€ - Apenas ${popupPromotion.discounted_price}€`
                          }
                        </p>
                      ) : (
                        <p className="text-xs text-black/90">
                          {popupPromotion.bundle_rules?.then_discount}% desconto em serviços combinados
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => {
                        setShowPromotionBanner(false);
                        setIsQuoteModalOpen(true);
                        if (popupPromotion.promotion_type === 'single') {
                          setSavedFormData({
                            ...savedFormData,
                            items: [{
                              id: Date.now().toString(),
                              type: popupPromotion.service_type,
                              width: '',
                              height: '',
                              seats: '1'
                            }]
                          });
                        } else if (popupPromotion.bundle_rules) {
                          setSavedFormData({
                            ...savedFormData,
                            items: [
                              {
                                id: Date.now().toString(),
                                type: popupPromotion.bundle_rules.if_service,
                                width: '',
                                height: '',
                                seats: '1'
                              },
                              {
                                id: (Date.now() + 1).toString(),
                                type: popupPromotion.bundle_rules.then_service,
                                width: '',
                                height: '',
                                seats: '1'
                              }
                            ]
                          });
                        }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#deb052] border-2 border-white text-black px-4 py-1 text-sm font-bold hover:bg-white transition-all duration-300 ease-in-out rounded-md"
                    >
                      Aproveitar
                    </motion.button>
                    
                    <button
                      onClick={() => setShowPromotionBanner(false)}
                      className="text-black/80 hover:text-black transition-colors p-1 rounded-md"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          <section
            className="relative h-screen flex items-center justify-center overflow-hidden"
            aria-label="Banner principal"
          >
            <motion.div
              className="absolute inset-0 z-0"
              style={{ y: backgroundY }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60 z-10"
                style={{ opacity }}
              />
              <img
                src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80"
                alt="Demonstração de limpeza profissional de sofá"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>

            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mb-8"
              >
                <Sparkles className="w-16 h-16 text-[#deb052] mx-auto mb-6" />
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {content.hero_title || 'Transformamos Seus Móveis Com Excelência'}
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  {content.hero_subtitle || 'Especialistas em limpeza profissional para empresas e residências em Portugal'}
                </p>
                
                <motion.button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-[#deb052] border-2 border-white text-black px-8 py-4 text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 ease-in-out backdrop-blur-sm rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Solicitar Orçamento
                </motion.button>
              </motion.div>
            </div>

            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <motion.div
                  className="w-2 h-2 bg-white/50 rounded-full mt-2"
                  animate={{ y: [0, 16, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
            </motion.div>
          </section>

          {/* Services Section */}
          <section
            className="py-20 px-4 bg-white"
            aria-label="Nossos serviços"
          >
            <div className="container mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {content.services_title || 'Nossos Serviços'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {content.services_subtitle || 'Conheça nossa gama completa de serviços profissionais'}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {services.filter(s => s.active).map((service, index) => {
                  const servicePromo = getServicePromotion(service.type);
                  const bundleMessage = getBundlePromotionMessage(service.type);

                  console.log(`🎯 Service ${service.type} (${service.name}) has promotion:`, servicePromo);

                  return (
                    <motion.div
                      key={service.id}
                      className="relative bg-gray-800 border border-gray-700 shadow-lg overflow-hidden group rounded-lg"
                      style={{ backgroundColor: '#deb052' }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      whileHover={{ y: -5 }}
                    >
                      {/* Promotion Badge */}
                      {servicePromo && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-black text-white px-3 py-1 text-sm font-bold shadow-lg animate-pulse rounded-md">
                            PROMOÇÃO
                          </div>
                        </div>
                      )}

                      {/* Saber Mais Button */}
                      {(service.saber_mais_content || serviceContent[service.type]) && (
                        <button
                          onClick={() => handleSaberMais(service)}
                          className="absolute top-4 left-4 z-10 p-2 bg-white text-black hover:bg-gray-100 transition-colors shadow-lg rounded-md"
                          title="Saber mais sobre este serviço"
                        >
                          <Info size={16} />
                        </button>
                      )}

                      <div className="p-8">
                        <div className="w-20 h-20 bg-white flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors mx-auto rounded-lg">
                          {renderServiceIcon(service)}
                        </div>
                        <h3 className="text-xl font-semibold text-black mb-2 text-center">
                          {service.name}
                        </h3>
                        <p className="text-black mb-6 text-center">{service.description}</p>

                        {/* Bundle Promotion Message */}
                        {bundleMessage && (
                          <div className="mb-4 p-3 bg-[#deb052]/10 border-l-4 border-[#deb052] rounded-md">
                            <p className="text-[#deb052] text-sm font-medium">{bundleMessage}</p>
                          </div>
                        )}

                        {servicePromo ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-green-900/20 border border-green-500 shadow-md rounded-md">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-green-400 text-lg">{servicePromo.title}</p>
                                <div className="bg-black text-white px-2 py-1 rounded-md text-xs font-bold animate-bounce">
                                  OFERTA
                                </div>
                              </div>
                              {servicePromo.description && (
                                <p className="text-sm text-green-300 mb-3">{servicePromo.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {servicePromo.discount_percentage ? (
                                    <span className="text-2xl font-bold text-green-600">
                                      {servicePromo.discount_percentage}% OFF
                                    </span>
                                  ) : (
                                    <>
                                      <span className="text-gray-400 line-through text-lg">{servicePromo.original_price}€</span>
                                      <span className="text-2xl font-bold text-green-600">{servicePromo.discounted_price}€</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-green-600 font-medium">
                                    {servicePromo.discount_percentage ? 
                                      `${servicePromo.discount_percentage}% desconto` : 
                                      `Poupe ${(servicePromo.original_price - servicePromo.discounted_price).toFixed(0)}€`
                                    }
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Até {new Date(servicePromo.end_date).toLocaleDateString('pt-PT')}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <motion.button
                                onClick={() => {
                                  setIsQuoteModalOpen(true);
                                  setSavedFormData({
                                    ...savedFormData,
                                    items: [{
                                      id: Date.now().toString(),
                                      type: service.type,
                                      width: '',
                                      height: '',
                                      seats: '1'
                                    }]
                                  });
                                }}
                                className="flex-1 bg-white border-2 border-[#deb052] text-black px-4 py-2 text-sm font-semibold hover:bg-[#deb052] hover:text-white transition-all duration-300 ease-in-out shadow-lg rounded-md"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Pedir Orçamento
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <motion.button
                              onClick={() => {
                                setIsQuoteModalOpen(true);
                                setSavedFormData({
                                  ...savedFormData,
                                  items: [{
                                    id: Date.now().toString(),
                                    type: service.type,
                                    width: '',
                                    height: '',
                                    seats: '1'
                                  }]
                                });
                              }}
                              className="flex-1 bg-white border-2 border-[#deb052] text-black px-4 py-2 text-sm font-semibold hover:bg-[#deb052] hover:text-white transition-all duration-300 ease-in-out rounded-md"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Pedir Orçamento
                            </motion.button>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section Promotions */}
          {sectionPromotions.length > 0 && (
            <section className="py-12 bg-gray-800">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-white">🎉 Promoções Especiais</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sectionPromotions.map((promo) => (
                    <motion.div
                      key={promo.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-gray-900 shadow-lg overflow-hidden border border-green-500 rounded-lg"
                    >
                      {promo.image_url && (
                        <img
                          src={promo.image_url}
                          alt={promo.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white">{promo.title}</h3>
                          <span className="bg-black text-white text-xs px-2 py-1 rounded-md font-bold animate-pulse">
                            OFERTA
                          </span>
                        </div>
                        {promo.description && (
                          <p className="text-gray-300 mb-4">{promo.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            {promo.discount_percentage ? (
                              <span className="text-2xl font-bold text-green-600">
                                {promo.discount_percentage}% OFF
                              </span>
                            ) : (
                              <>
                                <span className="text-gray-400 line-through">{promo.original_price}€</span>
                                <span className="text-2xl font-bold text-green-600 ml-2">{promo.discounted_price}€</span>
                              </>
                            )}
                          </div>
                          <motion.button
                            onClick={() => {
                              setIsQuoteModalOpen(true);
                              setSavedFormData({
                                ...savedFormData,
                                items: [{
                                  id: Date.now().toString(),
                                  type: promo.service_type,
                                  width: '',
                                  height: '',
                                  seats: '1',
                                  price: 0,
                                  extras: []
                                }]
                              });
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#deb052] border-2 border-white text-black px-4 py-2 text-sm font-medium hover:bg-white transition-all duration-300 ease-in-out rounded-md"
                          >
                            Aproveitar
                          </motion.button>
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-green-600 font-medium text-sm">
                            {promo.discount_percentage ? 
                              `💰 ${promo.discount_percentage}% de desconto!` : 
                              `💰 Poupe ${(promo.original_price - promo.discounted_price).toFixed(0)}€!`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* WhatsApp Button */}
        <motion.a
          href="https://wa.me/351935798081"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-green-500 text-white w-14 h-14 rounded-lg flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaWhatsapp className="text-3xl" />
        </motion.a>

        {/* Service Modal */}
        {selectedService && (
          <ServiceModal
            isOpen={isServiceModalOpen}
            onClose={() => {
              setIsServiceModalOpen(false);
              setSelectedService(null);
            }}
            title={selectedService.name}
            content={selectedService.saber_mais_content}
          />
        )}

        {/* Quote Modal */}
        <QuoteRequestModal
          isOpen={isQuoteModalOpen}
          onClose={handleCloseModal}
          savedFormData={savedFormData}
          services={services}
        />

        {/* Quote Reminder Popup */}
        <AnimatePresence>
          {showQuoteReminder && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm border border-gray-700 shadow-xl p-6 max-w-md z-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-2">
                <span className="text-white">Deseja continuar o seu orçamento?</span>
              </h3>
              <p className="text-gray-300 mb-4">
                Notamos que você não completou o pedido de orçamento. Deseja continuar de onde parou?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowQuoteReminder(false);
                    setIsQuoteModalOpen(true);
                    console.log('🔄 Continuando com dados salvos:', savedFormData);
                  }}
                  className="flex-1 bg-[#deb052] border-2 border-white text-black px-4 py-2 hover:bg-white hover:text-black transition-all duration-300 ease-in-out rounded-md"
                >
                  Continuar
                </button>
                <button
                  onClick={() => {
                    setShowQuoteReminder(false);
                    setSavedFormData(null);
                    console.log('🗑️ Dados salvos removidos');
                  }}
                  className="flex-1 bg-gray-800/50 backdrop-blur-sm text-gray-300 px-4 py-2 hover:bg-gray-700/50 transition-all rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
}

export default HomePage;