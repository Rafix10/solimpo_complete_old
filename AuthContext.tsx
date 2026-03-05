import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: {
    description: string;
    process: string[];
    benefits: string[];
  };
}

export default function ServiceModal({ isOpen, onClose, title, content }: ServiceModalProps) {
  if (!isOpen || !content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Limpeza de {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Description */}
              <div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {content.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Process */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Nosso Processo
                  </h3>
                  <div className="space-y-3">
                    {content.process.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-[#deb052] text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Benefícios
                  </h3>
                  <div className="space-y-3">
                    {content.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <p className="text-gray-700">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-[#deb052]/10 rounded-lg p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Pronto para transformar seus móveis?
                </h4>
                <p className="text-gray-700 mb-4">
                  Entre em contacto connosco para um orçamento personalizado e sem compromisso.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+351935798081"
                    className="bg-[#deb052] text-white px-6 py-3 rounded-full hover:bg-[#c99a47] transition-colors"
                  >
                    Ligar Agora
                  </a>
                  <a
                    href="https://wa.me/351935798081"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}