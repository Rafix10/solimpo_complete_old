import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Image as ImageIcon, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Promotion {
  id?: string;
  title: string;
  description: string;
  service_type: string;
  original_price: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
  active: boolean;
  image_url?: string | null;
  display_type: 'section' | 'service';
  display_order: number;
  promotion_type: 'single' | 'bundle';
  bundle_rules?: {
    if_service: string;
    if_quantity?: number;
    then_service: string;
    then_discount: number;
  };
}

const initialSimplePromotion: Promotion = {
  title: '',
  description: '',
  service_type: 'sofa',
  original_price: 0,
  discounted_price: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  active: true,
  display_type: 'section',
  display_order: 0,
  promotion_type: 'single'
};

const initialBundlePromotion: Promotion = {
  title: '',
  description: '',
  service_type: 'sofa',
  original_price: 0,
  discounted_price: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  active: true,
  display_type: 'service',
  display_order: 0,
  promotion_type: 'bundle',
  bundle_rules: {
    if_service: '',
    then_service: '',
    then_discount: 0
  }
};

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isAddingSimple, setIsAddingSimple] = useState(false);
  const [isAddingBundle, setIsAddingBundle] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newSimplePromotion, setNewSimplePromotion] = useState<Promotion>(initialSimplePromotion);
  const [newBundlePromotion, setNewBundlePromotion] = useState<Promotion>(initialBundlePromotion);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Erro ao carregar promoções');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `promotions/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSaveSimple = async () => {
    if (!newSimplePromotion.title || !newSimplePromotion.description) {
      toast.error('O título e descrição são obrigatórios');
      return;
    }

    if (newSimplePromotion.discounted_price >= newSimplePromotion.original_price) {
      toast.error('O preço com desconto deve ser menor que o preço original');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = newSimplePromotion.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('promotions')
        .insert([{
          ...newSimplePromotion,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Promoção criada com sucesso!');
      setIsAddingSimple(false);
      setNewSimplePromotion(initialSimplePromotion);
      setImageFile(null);
      setImagePreview('');
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Erro ao salvar promoção');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBundle = async () => {
    if (!newBundlePromotion.title || !newBundlePromotion.description) {
      toast.error('O título e descrição são obrigatórios');
      return;
    }

    if (!newBundlePromotion.bundle_rules?.if_service || !newBundlePromotion.bundle_rules?.then_service) {
      toast.error('Selecione os serviços para a promoção combinada');
      return;
    }

    if (!newBundlePromotion.bundle_rules?.then_discount) {
      toast.error('Informe o desconto para a promoção combinada');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('promotions')
        .insert([{
          ...newBundlePromotion,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Promoção combinada criada com sucesso!');
      setIsAddingBundle(false);
      setNewBundlePromotion(initialBundlePromotion);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving bundle promotion:', error);
      toast.error('Erro ao salvar promoção combinada');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (promotion: Promotion) => {
    setIsEditing(promotion.id || null);
    setEditingPromotion(promotion);
    if (promotion.image_url) {
      setImagePreview(promotion.image_url);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPromotion || !editingPromotion.id) return;

    setIsSaving(true);
    try {
      let imageUrl = editingPromotion.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('promotions')
        .update({
          ...editingPromotion,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPromotion.id);

      if (error) throw error;

      toast.success('Promoção atualizada com sucesso!');
      setIsEditing(null);
      setEditingPromotion(null);
      setImageFile(null);
      setImagePreview('');
      fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast.error('Erro ao atualizar promoção');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditingPromotion(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Promoção removida com sucesso!');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Erro ao remover promoção');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({
          active: !currentActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status da promoção atualizado!');
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Erro ao atualizar status da promoção');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Gestão de Promoções
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddingSimple(!isAddingSimple)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#deb052] hover:bg-[#c99a47] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]"
          >
            <Plus size={16} className="mr-2" />
            Nova Promoção Simples
          </button>
          <button
            onClick={() => setIsAddingBundle(!isAddingBundle)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#deb052] hover:bg-[#c99a47] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]"
          >
            <Plus size={16} className="mr-2" />
            Nova Promoção Combinada
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        {/* Simple Promotion Form */}
        {isAddingSimple && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-medium mb-4">Nova Promoção Simples</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={newSimplePromotion.title}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Serviço
                </label>
                <select
                  value={newSimplePromotion.service_type}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, service_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                >
                  <option value="sofa">Sofá</option>
                  <option value="carpet">Tapete</option>
                  <option value="chair">Cadeira</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Original
                </label>
                <input
                  type="number"
                  value={newSimplePromotion.original_price}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, original_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço com Desconto
                </label>
                <input
                  type="number"
                  value={newSimplePromotion.discounted_price}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, discounted_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={newSimplePromotion.start_date}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={newSimplePromotion.end_date}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Exibição
                </label>
                <select
                  value={newSimplePromotion.display_type}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, display_type: e.target.value as 'section' | 'service' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                >
                  <option value="section">Seção de Promoções</option>
                  <option value="service">Junto ao Serviço</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  value={newSimplePromotion.display_order}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-auto"
                        />
                        <button
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#deb052] hover:text-[#c99a47] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#deb052]">
                            <span>Upload de imagem</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG até 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newSimplePromotion.description}
                  onChange={(e) => setNewSimplePromotion({ ...newSimplePromotion, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsAddingSimple(false);
                  setNewSimplePromotion(initialSimplePromotion);
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSimple}
                disabled={isSaving}
                className="px-4 py-2 bg-[#deb052] text-white rounded-md hover:bg-[#c99a47] disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Bundle Promotion Form */}
        {isAddingBundle && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-medium mb-4">Nova Promoção Combinada</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={newBundlePromotion.title}
                  onChange={(e) => setNewBundlePromotion({ ...newBundlePromotion, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Se Adicionar
                </label>
                <select
                  value={newBundlePromotion.bundle_rules?.if_service || ''}
                  onChange={(e) => setNewBundlePromotion({
                    ...newBundlePromotion,
                    bundle_rules: {
                      ...newBundlePromotion.bundle_rules,
                      if_service: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                >
                  <option value="">Selecione um serviço</option>
                  <option value="sofa">Sofá</option>
                  <option value="carpet">Tapete</option>
                  <option value="chair">Cadeira</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Então Desconto em
                </label>
                <select
                  value={newBundlePromotion.bundle_rules?.then_service || ''}
                  onChange={(e) => setNewBundlePromotion({
                    ...newBundlePromotion,
                    bundle_rules: {
                      ...newBundlePromotion.bundle_rules,
                      then_service: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                >
                  <option value="">Selecione um serviço</option>
                  <option value="sofa">Sofá</option>
                  <option value="carpet">Tapete</option>
                  <option value="chair">Cadeira</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Mínima (opcional)
                </label>
                <input
                  type="number"
                  value={newBundlePromotion.bundle_rules?.if_quantity || ''}
                  onChange={(e) => setNewBundlePromotion({
                    ...newBundlePromotion,
                    bundle_rules: {
                      ...newBundlePromotion.bundle_rules,
                      if_quantity: parseInt(e.target.value) || undefined
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  placeholder="Deixe em branco se não houver mínimo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desconto (%)
                </label>
                <input
                  type="number"
                  value={newBundlePromotion.bundle_rules?.then_discount || ''}
                  onChange={(e) => setNewBundlePromotion({
                    ...newBundlePromotion,
                    bundle_rules: {
                      ...newBundlePromotion.bundle_rules,
                      then_discount: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                  placeholder="Ex: 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={newBundlePromotion.start_date}
                  onChange={(e) => setNewBundlePromotion({ ...newBundlePromotion, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={newBundlePromotion.end_date}
                  onChange={(e) => setNewBundlePromotion({ ...newBundlePromotion, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newBundlePromotion.description}
                  onChange={(e) => setNewBundlePromotion({ ...newBundlePromotion, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsAddingBundle(false);
                  setNewBundlePromotion(initialBundlePromotion);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBundle}
                disabled={isSaving}
                className="px-4 py-2 bg-[#deb052] text-white rounded-md hover:bg-[#c99a47] disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Promotions List */}
        <div className="space-y-4">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {isEditing === promotion.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={editingPromotion?.title}
                        onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, title: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                      />
                    </div>

                    {promotion.promotion_type === 'single' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Serviço
                          </label>
                          <select
                            value={editingPromotion?.service_type}
                            onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, service_type: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          >
                            <option value="sofa">Sofá</option>
                            <option value="carpet">Tapete</option>
                            <option value="chair">Cadeira</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preço Original
                          </label>
                          <input
                            type="number"
                            value={editingPromotion?.original_price}
                            onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, original_price: parseFloat(e.target.value) } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preço com Desconto
                          </label>
                          
                          <input
                            type="number"
                            value={editingPromotion?.discounted_price}
                            onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, discounted_price: parseFloat(e.target.value) } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Se Adicionar
                          </label>
                          <select
                            value={editingPromotion?.bundle_rules?.if_service}
                            onChange={(e) => setEditingPromotion(prev => prev ? {
                              ...prev,
                              bundle_rules: {
                                ...prev.bundle_rules,
                                if_service: e.target.value
                              }
                            } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          >
                            <option value="sofa">Sofá</option>
                            <option value="carpet">Tapete</option>
                            <option value="chair">Cadeira</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Então Desconto em
                          </label>
                          <select
                            value={editingPromotion?.bundle_rules?.then_service}
                            onChange={(e) => setEditingPromotion(prev => prev ? {
                              ...prev,
                              bundle_rules: {
                                ...prev.bundle_rules,
                                then_service: e.target.value
                              }
                            } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          >
                            <option value="sofa">Sofá</option>
                            <option value="carpet">Tapete</option>
                            <option value="chair">Cadeira</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantidade Mínima
                          </label>
                          <input
                            type="number"
                            value={editingPromotion?.bundle_rules?.if_quantity || ''}
                            onChange={(e) => setEditingPromotion(prev => prev ? {
                              ...prev,
                              bundle_rules: {
                                ...prev.bundle_rules,
                                if_quantity: parseInt(e.target.value) || undefined
                              }
                            } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Desconto (%)
                          </label>
                          <input
                            type="number"
                            value={editingPromotion?.bundle_rules?.then_discount || ''}
                            onChange={(e) => setEditingPromotion(prev => prev ? {
                              ...prev,
                              bundle_rules: {
                                ...prev.bundle_rules,
                                then_discount: parseInt(e.target.value)
                              }
                            } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        value={editingPromotion?.start_date}
                        onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, start_date: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Término
                      </label>
                      <input
                        type="date"
                        value={editingPromotion?.end_date}
                        onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, end_date: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                      />
                    </div>

                    {promotion.promotion_type === 'single' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Exibição
                          </label>
                          <select
                            value={editingPromotion?.display_type}
                            onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, display_type: e.target.value as 'section' | 'service' } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          >
                            <option value="section">Seção de Promoções</option>
                            <option value="service">Junto ao Serviço</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ordem de Exibição
                          </label>
                          <input
                            type="number"
                            value={editingPromotion?.display_order}
                            onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, display_order: parseInt(e.target.value) } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Imagem
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              {imagePreview ? (
                                <div className="relative">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mx-auto h-32 w-auto"
                                  />
                                  <button
                                    onClick={() => {
                                      setImageFile(null);
                                      setImagePreview('');
                                      setEditingPromotion(prev => prev ? { ...prev, image_url: null } : null);
                                    }}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                  <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#deb052] hover:text-[#c99a47] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#deb052]">
                                      <span>Upload de imagem</span>
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                      />
                                    </label>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG até 5MB
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={editingPromotion?.description}
                        onChange={(e) => setEditingPromotion(prev => prev ? { ...prev, description: e.target.value } : null)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="px-4 py-2 bg-[#deb052] text-white rounded-md hover:bg-[#c99a47] disabled:opacity-50"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {promotion.image_url && promotion.promotion_type === 'single' && (
                        <img
                          src={promotion.image_url}
                          alt={promotion.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h4 className="text-lg font-medium">{promotion.title}</h4>
                        {promotion.description && (
                          <p className="text-gray-600 text-sm mt-1">{promotion.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Tipo: {promotion.promotion_type === 'single' ? 'Promoção Simples' : 'Promoção Combinada'}
                          {promotion.promotion_type === 'single' && (
                            <>
                              {' | '}
                              Exibição: {promotion.display_type === 'section' ? 'Seção de Promoções' : 'Junto ao Serviço'}
                              {' | '}
                              Ordem: {promotion.display_order}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => promotion.id && toggleActive(promotion.id, promotion.active)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          promotion.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {promotion.active ? 'Ativa' : 'Inativa'}
                      </button>
                      <button
                        onClick={() => handleStartEdit(promotion)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => promotion.id && handleDelete(promotion.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {promotion.promotion_type === 'single' ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Serviço</p>
                          <p className="font-medium">
                            {promotion.service_type === 'sofa' ? 'Sofá' :
                             promotion.service_type === 'carpet' ? 'Tapete' : 'Cadeira'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Preço Original</p>
                          <p className="font-medium">{promotion.original_price}€</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Preço com Desconto</p>
                          <p className="font-medium text-green-600">{promotion.discounted_price}€</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Se adicionar</p>
                          <p className="font-medium">
                            {promotion.bundle_rules?.if_service === 'sofa' ? 'Sofá' :
                             promotion.bundle_rules?.if_service === 'carpet' ? 'Tapete' : 'Cadeira'}
                            {promotion.bundle_rules?.if_quantity && ` (min: ${promotion.bundle_rules.if_quantity})`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Então desconto em</p>
                          <p className="font-medium">
                            {promotion.bundle_rules?.then_service === 'sofa' ? 'Sofá' :
                             promotion.bundle_rules?.then_service === 'carpet' ? 'Tapete' : 'Cadeira'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Desconto</p>
                          <p className="font-medium text-green-600">{promotion.bundle_rules?.then_discount}%</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Período</p>
                      <p className="font-medium">
                        {new Date(promotion.start_date).toLocaleDateString('pt-PT')} -  {new Date(promotion.end_date).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {promotions.length === 0 && !isAddingSimple && !isAddingBundle && (
            <p className="text-center text-gray-500 py-4">
              Nenhuma promoção cadastrada
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
