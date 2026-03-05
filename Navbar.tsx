import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Info, Upload, Image as ImageIcon, Crop } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onSave: (service: Service) => void;
}

interface Service {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
  saber_mais_content: any;
  pricing_rules?: {
    base_price: number;
    unit_label: string;
    calculation_type: string;
    min_quantity: number;
    max_quantity: number;
    custom_formula?: string;
    multipliers?: { [key: string]: number };
  };
  service_config?: {
    has_quantity?: boolean;
    quantity_control_type?: string;
  };
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ isOpen, onClose, service, onSave }) => {
  const [localService, setLocalService] = useState<Service>(service);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    setLocalService(service);
    setImagePreview(service.icon_image_url || '');
  }, [service]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalService(prevService => ({
      ...prevService,
      [name]: value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `service-${localService.type}-${Date.now()}.${fileExt}`;
      const filePath = `icons/${fileName}`;

      // Upload para o bucket service-icons
      const { error: uploadError } = await supabase.storage
        .from('service-icons')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('service-icons')
        .getPublicUrl(filePath);

      setLocalService(prev => ({
        ...prev,
        icon_type: 'image',
        icon_image_url: publicUrl
      }));

      setImagePreview(publicUrl);
      toast.success('Imagem carregada com sucesso!');

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (localService.icon_image_url) {
      try {
        // Extrair o caminho do arquivo da URL
        const url = new URL(localService.icon_image_url);
        const filePath = url.pathname.split('/').slice(-2).join('/'); // Pega as últimas duas partes do caminho

        // Remover do storage
        const { error } = await supabase.storage
          .from('service-icons')
          .remove([filePath]);

        if (error) {
          console.error('Error removing image:', error);
        }
      } catch (error) {
        console.error('Error parsing URL or removing image:', error);
      }
    }

    setLocalService(prev => ({
      ...prev,
      icon_type: 'emoji',
      icon_image_url: undefined
    }));
    setImagePreview('');
    toast.success('Imagem removida');
  };

  const handlePriceTypeChange = (priceType: string) => {
    const defaultRules = {
      base_price: localService.base_price || 50,
      unit_label: getUnitLabel(priceType),
      calculation_type: priceType,
      min_quantity: 1,
      max_quantity: getMaxQuantity(priceType)
    };

    setLocalService(prev => ({
      ...prev,
      price_type: priceType,
      pricing_rules: defaultRules
    }));
  };

  const getUnitLabel = (priceType: string) => {
    switch (priceType) {
      case 'per_seat': return 'lugares';
      case 'per_sqm': return 'm²';
      case 'per_item': return 'unidades';
      case 'custom': return 'personalizado';
      default: return 'unidade';
    }
  };

  const getMaxQuantity = (priceType: string) => {
    switch (priceType) {
      case 'per_seat': return 20;
      case 'per_sqm': return 100;
      case 'per_item': return 50;
      default: return 10;
    }
  };

  const updatePricingRule = (field: string, value: any) => {
    setLocalService(prev => ({
      ...prev,
      pricing_rules: {
        ...prev.pricing_rules!,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Sincronizar base_price com pricing_rules
    const updatedService = {
      ...localService,
      base_price: localService.pricing_rules?.base_price || localService.base_price
    };
    onSave(updatedService);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-[#deb052] to-[#c99a47] text-white">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <h2 className="text-lg font-semibold">Editar Serviço</h2>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Serviço
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={localService.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo (slug)
                        </label>
                        <input
                          type="text"
                          name="type"
                          value={localService.type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Usado para URLs e identificação interna (ex: limpeza-de-sofa)
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        name="description"
                        value={localService.description || ''}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                      />
                    </div>

                    {/* Configuração de Ícone */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon size={20} />
                        Configuração do Ícone
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Ícone
                          </label>
                          <select
                            value={localService.icon_type}
                            onChange={(e) => setLocalService(prev => ({ 
                              ...prev, 
                              icon_type: e.target.value as 'emoji' | 'image' | 'lucide' 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          >
                            <option value="emoji">Emoji</option>
                            <option value="image">Imagem Personalizada</option>
                            <option value="lucide">Ícone Lucide</option>
                          </select>
                        </div>

                        {/* Preview do Ícone Atual */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Preview:</div>
                          <div className="w-16 h-16 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            {localService.icon_type === 'image' && imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Preview"
                                className="w-12 h-12 object-contain"
                              />
                            ) : (
                              <div className="text-3xl">{localService.icon}</div>
                            )}
                          </div>
                        </div>

                        {/* Configuração baseada no tipo */}
                        {localService.icon_type === 'emoji' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Emoji
                            </label>
                            <input
                              type="text"
                              value={localService.icon}
                              onChange={(e) => setLocalService(prev => ({ ...prev, icon: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                              placeholder="🛋️"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Cole um emoji ou use o teclado de emojis do seu sistema
                            </p>
                          </div>
                        )}

                        {localService.icon_type === 'image' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload de Imagem
                              </label>
                              
                              {!imagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#deb052] transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleImageUpload(file);
                                      }
                                    }}
                                    className="hidden"
                                    id="icon-upload"
                                    disabled={isUploading}
                                  />
                                  <label
                                    htmlFor="icon-upload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    {isUploading ? (
                                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#deb052] border-t-transparent"></div>
                                    ) : (
                                      <Upload className="w-8 h-8 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-600">
                                      {isUploading ? 'Carregando...' : 'Clique para carregar uma imagem'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      PNG, JPG, SVG até 5MB • Recomendado: 64x64px
                                    </span>
                                  </label>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                  <img
                                    src={imagePreview}
                                    alt="Ícone carregado"
                                    className="w-16 h-16 object-contain bg-white rounded border"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Imagem carregada</p>
                                    <p className="text-xs text-gray-500">Ícone personalizado ativo</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <label
                                      htmlFor="icon-upload-replace"
                                      className="cursor-pointer px-3 py-1 text-sm bg-[#deb052] text-white rounded hover:bg-[#c99a47] transition-colors"
                                    >
                                      Substituir
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleImageUpload(file);
                                        }
                                      }}
                                      className="hidden"
                                      id="icon-upload-replace"
                                      disabled={isUploading}
                                    />
                                    <button
                                      onClick={handleRemoveImage}
                                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Dicas para o ícone:</h4>
                              <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Use imagens quadradas (1:1) para melhor resultado</li>
                                <li>• Tamanho recomendado: 64x64px ou 128x128px</li>
                                <li>• Evite detalhes muito pequenos</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {localService.icon_type === 'lucide' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome do Ícone Lucide
                            </label>
                            <input
                              type="text"
                              value={localService.icon}
                              onChange={(e) => setLocalService(prev => ({ ...prev, icon: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                              placeholder="Ex: Sofa, Home, Settings"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Nome do ícone da biblioteca Lucide React (ex: Sofa, Home, Settings)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sistema de Preços */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>Sistema de Preços</span>
                        <Info size={16} className="text-gray-400" />
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Cálculo de Preço
                          </label>
                          <select
                            value={localService.price_type}
                            onChange={(e) => handlePriceTypeChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          >
                            <option value="fixed">Preço Fixo</option>
                            <option value="per_seat">Preço por Lugar</option>
                            <option value="per_sqm">Preço por Metro Quadrado</option>
                            <option value="per_item">Preço por Item/Unidade</option>
                            <option value="custom">Personalizado</option>
                          </select>
                          <p className="mt-1 text-sm text-gray-500">
                            {localService.price_type === 'fixed' && 'Preço único independente de quantidade ou tamanho'}
                            {localService.price_type === 'per_seat' && 'Preço multiplicado pelo número de lugares (ideal para sofás)'}
                            {localService.price_type === 'per_sqm' && 'Preço multiplicado pela área em metros quadrados (ideal para tapetes)'}
                            {localService.price_type === 'per_item' && 'Preço multiplicado pela quantidade de itens'}
                            {localService.price_type === 'custom' && 'Defina regras personalizadas de cálculo'}
                          </p>
                        </div>

                        {/* Configurações de Preço */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preço Base (€)
                              </label>
                              <input
                                type="number"
                                value={localService.pricing_rules?.base_price || localService.base_price}
                                onChange={(e) => updatePricingRule('base_price', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                                step="0.01"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unidade de Medida
                              </label>
                              <input
                                type="text"
                                value={localService.pricing_rules?.unit_label || ''}
                                onChange={(e) => updatePricingRule('unit_label', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                                placeholder="Ex: lugares, m², unidades"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantidade Mínima
                              </label>
                              <input
                                type="number"
                                value={localService.pricing_rules?.min_quantity || 1}
                                onChange={(e) => updatePricingRule('min_quantity', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                                min="1"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantidade Máxima
                              </label>
                              <input
                                type="number"
                                value={localService.pricing_rules?.max_quantity || 10}
                                onChange={(e) => updatePricingRule('max_quantity', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                                min="1"
                              />
                            </div>
                          </div>

                          {/* Fórmula Personalizada para tipo custom */}
                          {localService.price_type === 'custom' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fórmula Personalizada
                              </label>
                              <textarea
                                value={localService.pricing_rules?.custom_formula || ''}
                                onChange={(e) => updatePricingRule('custom_formula', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                                rows={3}
                                placeholder="Ex: base_price * (width * height) + (seats * 10)"
                              />
                              <p className="mt-1 text-sm text-gray-500">
                                Use variáveis: base_price, width, height, seats, quantity
                              </p>
                            </div>
                          )}

                          {/* Preview do Cálculo */}
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview do Cálculo:</h4>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                              {localService.price_type === 'fixed' && (
                                <span>Preço fixo: {localService.pricing_rules?.base_price || localService.base_price}€</span>
                              )}
                              {localService.price_type === 'per_seat' && (
                                <span>Preço: {localService.pricing_rules?.base_price || localService.base_price}€ × número de lugares</span>
                              )}
                              {localService.price_type === 'per_sqm' && (
                                <span>Preço: {localService.pricing_rules?.base_price || localService.base_price}€ × (largura × altura)</span>
                              )}
                              {localService.price_type === 'per_item' && (
                                <span>Preço: {localService.pricing_rules?.base_price || localService.base_price}€ × quantidade</span>
                              )}
                              {localService.price_type === 'custom' && (
                                <span>Fórmula personalizada: {localService.pricing_rules?.custom_formula || 'Não definida'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuração de Quantidade */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span>Configuração de Quantidade</span>
                        <Info size={16} className="text-gray-400" />
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="has_quantity"
                            checked={localService.service_config?.has_quantity !== false}
                            onChange={(e) => setLocalService(prev => ({
                              ...prev,
                              service_config: {
                                ...prev.service_config,
                                has_quantity: e.target.checked
                              }
                            }))}
                            className="mr-3"
                          />
                          <label htmlFor="has_quantity" className="text-sm font-medium text-gray-700">
                            Permitir seleção de quantidade
                          </label>
                        </div>
                        
                        {/* Tipo de controle de quantidade */}
                        {localService.service_config?.has_quantity !== false && (
                          <div className="ml-6 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Controle de Quantidade
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="quantity_control_type"
                                    value="numeric"
                                    checked={localService.service_config?.quantity_control_type === 'numeric'}
                                    onChange={(e) => setLocalService(prev => ({
                                      ...prev,
                                      service_config: {
                                        ...prev.service_config,
                                        quantity_control_type: 'numeric'
                                      }
                                    }))}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Numeric Up/Down (ex: 1, 2, 3...)</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="quantity_control_type"
                                    value="button"
                                    checked={localService.service_config?.quantity_control_type === 'button'}
                                    onChange={(e) => setLocalService(prev => ({
                                      ...prev,
                                      service_config: {
                                        ...prev.service_config,
                                        quantity_control_type: 'button'
                                      }
                                    }))}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Botão "Adicionar Outro" (cada item é único)</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="quantity_control_type"
                                    value="both"
                                    checked={localService.service_config?.quantity_control_type === 'both'}
                                    onChange={(e) => setLocalService(prev => ({
                                      ...prev,
                                      service_config: {
                                        ...prev.service_config,
                                        quantity_control_type: 'both'
                                      }
                                    }))}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Ambos (Numeric + Botão "Adicionar Outro")</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Como funciona:</h4>
                          <ul className="text-xs text-blue-800 space-y-1">
                            {localService.service_config?.has_quantity === false ? (
                              <li>• Cada item será único com botão "Adicionar Outro"</li>
                            ) : localService.service_config?.quantity_control_type === 'numeric' ? (
                              <>
                                <li>• Controle numeric up/down para quantidade</li>
                                <li>• Todas as unidades têm as mesmas especificações</li>
                                <li>• Ideal para itens idênticos (ex: cadeiras iguais)</li>
                              </>
                            ) : localService.service_config?.quantity_control_type === 'button' ? (
                              <>
                                <li>• Cada item é único com suas próprias especificações</li>
                                <li>• Botão "Adicionar Outro" replica especificações para editar</li>
                                <li>• Ideal para itens com especificações diferentes</li>
                              </>
                            ) : localService.service_config?.quantity_control_type === 'both' ? (
                              <>
                                <li>• Numeric up/down para quantidade de itens idênticos</li>
                                <li>• Botão "Adicionar Outro" para itens com especificações diferentes</li>
                                <li>• Máxima flexibilidade para o cliente</li>
                              </>
                            ) : (
                              <>
                                <li>• Configuração padrão: numeric up/down</li>
                                <li>• Defina o tipo de controle acima</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Saber Mais Content Display */}
                    <div className="border-t pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conteúdo "Saber Mais" - Descrição (Apenas Visualização)
                      </label>
                      <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                        {localService.saber_mais_content?.description || 'Sem descrição "Saber Mais"'}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Para editar o conteúdo completo "Saber Mais", use o botão "Info" na lista de serviços.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isUploading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#deb052] text-white rounded-md hover:bg-[#c99a47] disabled:opacity-50"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Carregando...' : 'Salvar'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditServiceModal;