import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#deb052] border-t border-black text-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-[#deb052] mb-4">SofáLimpo</h3>
            <p className="text-gray-300 mb-4">
              Especialistas em limpeza profissional de sofás, tapetes e móveis estofados em Portugal.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/351935798081"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <FaWhatsapp size={24} />
              </a>
              <a
                href="#"
                className="text-black hover:text-gray-800 transition-colors"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="#"
                className="text-black hover:text-gray-800 transition-colors"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Serviços</h4>
            <ul className="space-y-2 text-gray-800">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Limpeza de Sofás
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Limpeza de Tapetes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Limpeza de Cadeiras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Limpeza de Colchões
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Contacto</h4>
            <div className="space-y-3 text-gray-800">
              <div className="flex items-center">
                <Phone size={16} className="mr-3 text-black" />
                <span>935 798 081</span>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="mr-3 text-black" />
                <span>info@sofalimpo.pt</span>
              </div>
              <div className="flex items-center">
                <MapPin size={16} className="mr-3 text-black" />
                <span>Portugal</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Horário</h4>
            <div className="space-y-2 text-gray-800">
              <div className="flex items-center">
                <Clock size={16} className="mr-3 text-black" />
                <div>
                  <p>Segunda - Sexta</p>
                  <p className="text-sm">08:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-3 text-black" />
                <div>
                  <p>Sábado</p>
                  <p className="text-sm">09:00 - 15:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black mt-8 pt-8 text-center text-gray-800">
          <p>&copy; 2024 SofáLimpo. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}