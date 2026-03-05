import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Prices {
  sofa_per_seat: number;
  carpet_per_sqm: number;
  chair_fixed: number;
}

const defaultPrices: Prices = {
  sofa_per_seat: 35,
  carpet_per_sqm: 15,
  chair_fixed: 25,
};

export default function PricingManager() {
  const [prices, setPrices] = useState<Prices>(defaultPrices);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setPrices({
          sofa_per_seat: data.sofa_per_seat,
          carpet_per_sqm: data.carpet_per_sqm,
          chair_fixed: data.chair_fixed,
        });
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error('Erro ao carregar preços');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prices')
        .update({
          sofa_per_seat: prices.sofa_per_seat,
          carpet_per_sqm: prices.carpet_per_sqm,
          chair_fixed: prices.chair_fixed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (await supabase.from('prices').select('id').single()).data?.id);

      if (error) throw error;

      toast.success('Preços atualizados com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error('Erro ao salvar preços');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrices(defaultPrices);
    toast.success('Preços restaurados aos valores padrão');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Gestão de Preços
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]"
          >
            <RefreshCw size={16} className="mr-2" />
            Restaurar Padrão
          </button>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
              isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#deb052] hover:bg-[#c99a47]'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]`}
          >
            <Save size={16} className="mr-2" />
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar' : 'Editar Preços'}
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="grid gap-6">
          {/* Sofa Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço por Lugar (Sofá)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={prices.sofa_per_seat}
                onChange={(e) => setPrices({ ...prices, sofa_per_seat: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className="focus:ring-[#deb052] focus:border-[#deb052] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/lugar</span>
              </div>
            </div>
          </div>

          {/* Carpet Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço por Metro Quadrado (Tapete)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={prices.carpet_per_sqm}
                onChange={(e) => setPrices({ ...prices, carpet_per_sqm: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className="focus:ring-[#deb052] focus:border-[#deb052] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/m²</span>
              </div>
            </div>
          </div>

          {/* Chair Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço Fixo (Cadeira)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={prices.chair_fixed}
                onChange={(e) => setPrices({ ...prices, chair_fixed: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className="focus:ring-[#deb052] focus:border-[#deb052] block w-full pl-7 sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}