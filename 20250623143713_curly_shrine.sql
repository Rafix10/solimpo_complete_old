import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const CompaniesPage: React.FC = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    company_type: 'hotel',
    message: '',
    services_interested: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    { id: 'sofas', label: 'Limpeza de Sofás' },
    { id: 'tapetes', label: 'Limpeza de Tapetes' },
    { id: 'colchoes', label: 'Limpeza de Colchões' },
    { id: 'estofos', label: 'Limpeza de Estofos' },
    { id: 'outros', label: 'Outros Serviços' }
  ];

  const companyTypes = [
    { id: 'hotel', label: 'Hotel' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'airbnb', label: 'Airbnb/Alojamento' },
    { id: 'empresa', label: 'Empresa' },
    { id: 'outro', label: 'Outro' }
  ];

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services_interested: prev.services_interested.includes(serviceId)
        ? prev.services_interested.filter(id => id !== serviceId)
        : [...prev.services_interested, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name || !formData.contact_name || !formData.email || !formData.phone) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.services_interested.length === 0) {
      toast.error('Por favor, selecione pelo menos um serviço de interesse');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('company_inquiries')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('🎉 Pedido enviado com sucesso! Entraremos em contacto brevemente.', {
        duration: 5000,
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '8px'
        }
      });

      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        company_type: 'hotel',
        message: '',
        services_interested: []
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Detalhes do erro:', errorMessage);
      toast.error(`❌ Erro ao enviar pedido: ${errorMessage}`, {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '8px'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#deb052] to-[#c99a47] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Soluções para Empresas</h1>
            <p className="text-lg text-white/90">
              Serviços de limpeza profissional para hotéis, hostels, empresas e alojamentos
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Por que nos escolher?</h2>
            
            <div className="space-y-6">
              {[
                {
                  icon: '✨',
                  title: 'Qualidade Garantida',
                  description: 'Serviços de limpeza profissional com resultados impecáveis'
                },
                {
                  icon: '⏰',
                  title: 'Flexibilidade Horária',
                  description: 'Agendamentos adaptados ao seu calendário e necessidades'
                },
                {
                  icon: '🔒',
                  title: 'Confiança e Segurança',
                  description: 'Equipa verificada e seguros de responsabilidade civil'
                },
                {
                  icon: '📞',
                  title: 'Suporte Dedicado',
                  description: 'Contacto direto com gestor de conta para melhor atendimento'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  className="flex gap-4"
                >
                  <div className="text-3xl flex-shrink-0">{benefit.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Solicitar Informações</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  placeholder="Ex: Hotel Sofalimpo"
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Contacto *
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  placeholder="Seu nome"
                />
              </div>

              {/* Company Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Empresa *
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                >
                  {companyTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  placeholder="+351 9XX XXX XXX"
                />
              </div>

              {/* Locality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localidade
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  placeholder="Ex: Lisboa, Porto, Covilhã"
                />
              </div>

              {/* Services Interested */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Serviços de Interesse *
                </label>
                <div className="space-y-2">
                  {services.map(service => (
                    <label key={service.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services_interested.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#deb052] focus:ring-[#deb052]"
                      />
                      <span className="text-gray-700">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem Adicional
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  rows={4}
                  placeholder="Detalhes sobre suas necessidades..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#deb052] text-white py-3 rounded-lg font-semibold hover:bg-[#c99a47] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Contacte-nos Diretamente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-[#deb052] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telefone</h3>
              <p className="text-gray-600">+351 935 798 081</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-[#deb052] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@sofalimpo.pt</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-[#deb052] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Localização</h3>
              <p className="text-gray-600">Portugal</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
