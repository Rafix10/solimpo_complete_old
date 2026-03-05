import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const defaultLanguage: Language = 'pt';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  const availableLanguages = [
    { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' }
  ];

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('sofalimpo-language') as Language;
    if (savedLanguage && ['pt', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) {
        setLanguageState('en');
      } else {
        setLanguageState('pt');
      }
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('sofalimpo-language', newLanguage);
  };

  const value = {
    language,
    setLanguage,
    availableLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: string): string => {
    const keys = key.split('.');
    const translations = {
      pt: {
        nav: {
          home: 'Início',
          about: 'Sobre Nós',
          services: 'Serviços',
          contact: 'Contacto',
          callNow: 'Ligar Agora'
        },
        hero: {
          title: 'Transformamos Seus Móveis Com Excelência',
          subtitle: 'Especialistas em limpeza profissional para empresas e residências em Portugal',
          requestQuote: 'Solicitar Orçamento'
        },
        services: {
          title: 'Nossos Serviços',
          subtitle: 'Conheça nossa gama completa de serviços profissionais',
          learnMore: 'Saber Mais',
          requestQuote: 'Pedir Orçamento',
          promotion: 'PROMOÇÃO',
          offer: 'OFERTA',
          save: 'Poupe',
          discount: 'desconto',
          until: 'Até'
        },
        quote: {
          title: 'Solicitar Orçamento',
          subtitle: 'Configure o seu pedido personalizado',
          steps: {
            services: 'Serviços',
            information: 'Informações',
            finalization: 'Finalização'
          },
          selectServices: 'Selecione os serviços',
          selectServicesDesc: 'Clique nos ícones para adicionar serviços ao seu orçamento',
          contactInfo: 'Informações de Contacto',
          contactInfoDesc: 'Para podermos enviar o seu orçamento personalizado',
          finalizeOrder: 'Finalizar Pedido',
          finalizeOrderDesc: 'Últimos detalhes para o seu orçamento',
          fullName: 'Nome Completo',
          email: 'Email',
          phone: 'Telefone',
          address: 'Morada Completa',
          clientType: 'Tipo de Cliente',
          individual: 'Particular',
          company: 'Empresa',
          preferredDate: 'Data Preferida (Opcional)',
          additionalInfo: 'Informações Adicionais (Opcional)',
          cancel: 'Cancelar',
          previous: 'Anterior',
          continue: 'Continuar',
          sendRequest: 'Enviar Pedido',
          addToQuote: 'Adicionar ao Orçamento',
          summary: 'Resumo do Seu Pedido',
          estimatedTotal: 'Total Estimado',
          finalPriceNote: '* Preço final pode variar após avaliação no local',
          nameRequired: 'Nome é obrigatório',
          emailRequired: 'Email é obrigatório',
          emailInvalid: 'Por favor, insira um email válido',
          phoneRequired: 'Telefone é obrigatório',
          addressRequired: 'Morada é obrigatória',
          addAtLeastOneItem: 'Por favor, adicione pelo menos um item para limpeza',
          successMessage: 'Pedido de orçamento enviado com sucesso! Entraremos em contacto brevemente.',
          errorMessage: 'Erro ao enviar pedido. Tente novamente.'
        },
        promotions: {
          activePromotion: 'PROMOÇÃO ATIVA!',
          specialOffer: 'Oferta especial por tempo limitado',
          takeAdvantage: 'APROVEITAR OFERTA',
          maybeLater: 'Talvez mais tarde',
          specialPromotions: 'Promoções Especiais',
          congratulations: 'Parabéns! Está a poupar',
          withOurPromotions: 'com as nossas promoções!'
        },
        footer: {
          description: 'Especialistas em limpeza profissional de sofás, tapetes e móveis estofados em Portugal.',
          services: 'Serviços',
          contact: 'Contacto',
          schedule: 'Horário',
          mondayFriday: 'Segunda - Sexta',
          saturday: 'Sábado',
          allRightsReserved: 'Todos os direitos reservados.'
        },
        about: {
          title: 'Sobre a SofáLimpo',
          subtitle: 'Há mais de uma década a cuidar dos seus móveis estofados com excelência e profissionalismo.',
          experience: 'Experiência',
          experienceDesc: 'Mais de 10 anos de experiência no mercado português.',
          quality: 'Qualidade',
          qualityDesc: 'Produtos e equipamentos de última geração.',
          team: 'Equipa',
          teamDesc: 'Profissionais altamente qualificados e dedicados.',
          satisfaction: 'Satisfação',
          satisfactionDesc: 'Milhares de clientes satisfeitos em todo o país.',
          ourStory: 'A Nossa História',
          storyText1: 'A SofáLimpo nasceu da paixão por proporcionar ambientes mais limpos e saudáveis para famílias e empresas portuguesas.',
          storyText2: 'Começámos como uma pequena empresa familiar em Lisboa e, graças à nossa dedicação à qualidade e ao atendimento excepcional, crescemos para nos tornar uma referência no mercado de limpeza profissional de estofados.',
          storyText3: 'Hoje, continuamos com o mesmo compromisso de excelência, investindo constantemente em formação e tecnologia para oferecer os melhores serviços aos nossos clientes.'
        },
        admin: {
          dashboard: 'Dashboard',
          quoteRequests: 'Pedidos de Orçamento',
          contentEditor: 'Editor de Conteúdo',
          servicesManager: 'Gestão de Serviços',
          promotionsManager: 'Gestão de Promoções',
          logout: 'Sair',
          loading: 'Carregando...'
        }
      },
      en: {
        nav: {
          home: 'Home',
          about: 'About Us',
          services: 'Services',
          contact: 'Contact',
          callNow: 'Call Now'
        },
        hero: {
          title: 'We Transform Your Furniture With Excellence',
          subtitle: 'Professional cleaning specialists for businesses and residences in Portugal',
          requestQuote: 'Request Quote'
        },
        services: {
          title: 'Our Services',
          subtitle: 'Discover our complete range of professional services',
          learnMore: 'Learn More',
          requestQuote: 'Request Quote',
          promotion: 'PROMOTION',
          offer: 'OFFER',
          save: 'Save',
          discount: 'discount',
          until: 'Until'
        },
        quote: {
          title: 'Request Quote',
          subtitle: 'Configure your personalized request',
          steps: {
            services: 'Services',
            information: 'Information',
            finalization: 'Finalization'
          },
          selectServices: 'Select services',
          selectServicesDesc: 'Click on the icons to add services to your quote',
          contactInfo: 'Contact Information',
          contactInfoDesc: 'So we can send you your personalized quote',
          finalizeOrder: 'Finalize Order',
          finalizeOrderDesc: 'Final details for your quote',
          fullName: 'Full Name',
          email: 'Email',
          phone: 'Phone',
          address: 'Complete Address',
          clientType: 'Client Type',
          individual: 'Individual',
          company: 'Company',
          preferredDate: 'Preferred Date (Optional)',
          additionalInfo: 'Additional Information (Optional)',
          cancel: 'Cancel',
          previous: 'Previous',
          continue: 'Continue',
          sendRequest: 'Send Request',
          addToQuote: 'Add to Quote',
          summary: 'Your Order Summary',
          estimatedTotal: 'Estimated Total',
          finalPriceNote: '* Final price may vary after on-site evaluation',
          nameRequired: 'Name is required',
          emailRequired: 'Email is required',
          emailInvalid: 'Please enter a valid email',
          phoneRequired: 'Phone is required',
          addressRequired: 'Address is required',
          addAtLeastOneItem: 'Please add at least one item for cleaning',
          successMessage: 'Quote request sent successfully! We will contact you shortly.',
          errorMessage: 'Error sending request. Please try again.'
        },
        promotions: {
          activePromotion: 'ACTIVE PROMOTION!',
          specialOffer: 'Special offer for limited time',
          takeAdvantage: 'TAKE ADVANTAGE',
          maybeLater: 'Maybe later',
          specialPromotions: 'Special Promotions',
          congratulations: 'Congratulations! You are saving',
          withOurPromotions: 'with our promotions!'
        },
        footer: {
          description: 'Professional cleaning specialists for sofas, carpets and upholstered furniture in Portugal.',
          services: 'Services',
          contact: 'Contact',
          schedule: 'Schedule',
          mondayFriday: 'Monday - Friday',
          saturday: 'Saturday',
          allRightsReserved: 'All rights reserved.'
        },
        about: {
          title: 'About SofáLimpo',
          subtitle: 'For over a decade caring for your upholstered furniture with excellence and professionalism.',
          experience: 'Experience',
          experienceDesc: 'Over 10 years of experience in the Portuguese market.',
          quality: 'Quality',
          qualityDesc: 'State-of-the-art products and equipment.',
          team: 'Team',
          teamDesc: 'Highly qualified and dedicated professionals.',
          satisfaction: 'Satisfaction',
          satisfactionDesc: 'Thousands of satisfied customers throughout the country.',
          ourStory: 'Our Story',
          storyText1: 'SofáLimpo was born from the passion to provide cleaner and healthier environments for Portuguese families and businesses.',
          storyText2: 'We started as a small family business in Lisbon and, thanks to our dedication to quality and exceptional service, we grew to become a reference in the professional upholstery cleaning market.',
          storyText3: 'Today, we continue with the same commitment to excellence, constantly investing in training and technology to offer the best services to our customers.'
        },
        admin: {
          dashboard: 'Dashboard',
          quoteRequests: 'Quote Requests',
          contentEditor: 'Content Editor',
          servicesManager: 'Services Manager',
          promotionsManager: 'Promotions Manager',
          logout: 'Logout',
          loading: 'Loading...'
        }
      }
    };

    let current: any = translations[language];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return key;
      }
    }
    
    return typeof current === 'string' ? current : key;
  };

  return { t, language };
}