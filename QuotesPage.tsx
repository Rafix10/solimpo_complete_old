import React from 'react';
import { Shield, Trophy, Users, ThumbsUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Sobre a SofáLimpo</h1>
            <p className="text-xl text-gray-600 mb-8">
              Há mais de uma década a cuidar dos seus móveis estofados com excelência e profissionalismo.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#deb052] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Experiência</h3>
              <p className="text-gray-600">
                Mais de 10 anos de experiência no mercado português.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#deb052] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualidade</h3>
              <p className="text-gray-600">
                Produtos e equipamentos de última geração.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#deb052] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Equipa</h3>
              <p className="text-gray-600">
                Profissionais altamente qualificados e dedicados.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#deb052] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Satisfação</h3>
              <p className="text-gray-600">
                Milhares de clientes satisfeitos em todo o país.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">A Nossa História</h2>
              <p className="text-gray-600 mb-4">
                A SofáLimpo nasceu da paixão por proporcionar ambientes mais limpos e saudáveis para famílias e empresas portuguesas.
              </p>
              <p className="text-gray-600 mb-4">
                Começámos como uma pequena empresa familiar em Lisboa e, graças à nossa dedicação à qualidade e ao atendimento excepcional, crescemos para nos tornar uma referência no mercado de limpeza profissional de estofados.
              </p>
              <p className="text-gray-600">
                Hoje, continuamos com o mesmo compromisso de excelência, investindo constantemente em formação e tecnologia para oferecer os melhores serviços aos nossos clientes.
              </p>
            </div>
            <div className="relative h-[400px]">
              <img
                src="/src/assets/image.png"
                alt="Nossa História"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}