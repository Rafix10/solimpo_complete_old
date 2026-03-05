import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit, Info, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import ServiceModal from './ServiceModal'; // Import ServiceModal
import EditServiceModal from './EditServiceModal'; // Import EditServiceModal

interface Service {
  id?: string;
  type: string;
  name: string;
  description: string | null;
  icon: string;
  price_type: string;
  base_price: number;
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  saber_mais_content: any;
}

const initialService: Service = {
  type: '',
  name: '',
  description: null,
  icon: 'Sofa',
  price_type: 'fixed',
  base_price: 50,
  active: true,
  display_order: 0,
  saber_mais_content: {
    description: '',
    process: [],
    benefits: []
  }
};

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState<Service>(initialService);
  const [isSaving, setIsSaving] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isSaberMaisModalOpen, setIsSaberMaisModalOpen] = useState(false);
  const [selectedServiceForSaberMais, setSelectedServiceForSaberMais] = useState<Service | null>(null);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);


  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (editingServiceId) {
      const serviceToEdit = services.find(service => service.id === editingServiceId);
      if (serviceToEdit) {
        setNewService(serviceToEdit);
      }
    } else {
      setNewService(initialService);
    }
  }, [editingServiceId, services]);


  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erro ao carregar serviços');
    }
  };

  const handleSave = async (serviceToSave: Service) => {
    if (!serviceToSave.name || !serviceToSave.type) {
      toast.error('Nome e Tipo são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      if (editingServiceId) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceToSave)
          .eq('id', editingServiceId);
        if (error) throw error;
        toast.success('Serviço atualizado com sucesso!');
      } else {
        // Insert new service
        const { data, error } = await supabase
          .from('services')
          .insert([serviceToSave])
          .select() ; // Selecting the newly inserted record to get the id and display_order

        if (error) throw error;
        toast.success('Serviço criado com sucesso!');
      }

      setIsServiceModalOpen(false);
      setIsEditServiceModalOpen(false);
      setEditingServiceId(null);
      setNewService(initialService);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Erro ao salvar serviço');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Serviço removido com sucesso!');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Erro ao remover serviço');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Serviço ${!currentStatus ? 'ativado' : 'desativado'}!`);
      fetchServices();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Erro ao atualizar status do serviço');
    }
  };

  const handleSaveSaberMais = async (serviceId: string, saberMaisContent: any) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('services')
        .update({ saber_mais_content: saberMaisContent })
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Conteúdo "Saber Mais" atualizado com sucesso!');
      setIsSaberMaisModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving "Saber Mais" content:', error);
      toast.error('Erro ao salvar conteúdo "Saber Mais"');
    } finally {
      setIsSaving(false);
    }
  };

  const moveServiceUp = async (service: Service) => {
    const currentIndex = services.findIndex(s => s.id === service.id);
    if (currentIndex > 0) {
      const prevService = services[currentIndex - 1];
      await swapDisplayOrders(service, prevService, currentIndex, currentIndex - 1);
    }
  };


  const swapDisplayOrders = async (serviceA: Service, serviceB: Service, indexA: number, indexB: number) => {
    if (!serviceA || !serviceB) {
      console.error("Cannot swap undefined services");
      return;
    }

    const orderA = serviceA.display_order;
    const orderB = serviceB.display_order;

    console.log(`[swapDisplayOrders] Swapping ${serviceA.name} (order ${orderA}) with ${serviceB.name} (order ${orderB})`);

    // Optimistically update the local state to reflect the change immediately
    const newServices = [...services];
    newServices[indexA] = { ...serviceA, display_order: orderB };
    newServices[indexB] = { ...serviceB, display_order: orderA };
    setServices(newServices);
    console.log("[swapDisplayOrders] Optimistically updated UI, services state:", newServices.map(s => ({ id: s.id, name: s.name, order: s.display_order })));


    try {
      console.log(`[swapDisplayOrders] Updating service ${serviceA.name} id ${serviceA.id} to order ${orderB}`);
      const updateA = supabase
        .from('services')
        .update({ display_order: orderB })
        .eq('id', serviceA.id);

      console.log(`[swapDisplayOrders] Updating service ${serviceB.name} id ${serviceB.id} to order ${orderA}`);
      const updateB = supabase
        .from('services')
        .update({ display_order: orderA })
        .eq('id', serviceB.id);

      const results = await Promise.all([updateA, updateB]);
      console.log("[swapDisplayOrders] Database update results:", results);

      results.forEach((result, index) => {
        if (result.error) {
          console.error(`[swapDisplayOrders] Error updating service ${index === 0 ? serviceA.name : serviceB.name}:`, result.error);
          toast.error(`Erro ao reordenar ${index === 0 ? serviceA.name : serviceB.name} no banco de dados`);
        } else {
          console.log(`[swapDisplayOrders] Successfully updated service ${index === 0 ? serviceA.name : serviceB.name} in database`);
        }
      });
      if (results.every(result => !result.error)) {
        toast.success('Serviços reordenados com sucesso!');
        fetchServices(); // Re-fetch services to ensure data is up-to-date after successful swap
      } else {
        fetchServices(); // Re-fetch services to revert optimistic update if database update fails partially
      }

    } catch (error) {
      console.error('[swapDisplayOrders] Error swapping display orders:', error);
      toast.error('Erro ao reordenar serviços (erro geral)');
      fetchServices(); // Re-fetch services to revert optimistic update if database update fails
    }
  };


  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Gestão de Serviços
        </h3>
        <button
          onClick={() => {
            setIsServiceModalOpen(true);
            setEditingServiceId(null); // Reset editing ID for new service
            setServiceToEdit(initialService);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#deb052] hover:bg-[#c99a47] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]"
        >
          <Plus size={16} className="mr-2" />
          Novo Serviço
        </button>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">


        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium">{service.name}</h4>
                  <p className="text-gray-500 text-sm">{service.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 order-2">
                    <button
                      onClick={() => moveServiceUp(service)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      disabled={services.indexOf(service) === 0} // Disable for the first service
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setEditingServiceId(service.id);
                      setServiceToEdit(service);
                      setIsEditServiceModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 order-3"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedServiceForSaberMais(service);
                      setIsSaberMaisModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 order-4"
                  >
                    <Info size={20} />
                  </button>
                  <button
                    onClick={() => toggleActive(service.id!, service.active)}
                    className={`px-3 py-1 rounded-full text-sm font-medium order-5 ${
                      service.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => service.id && handleDelete(service.id)}
                    className="text-red-500 hover:text-red-700 order-6"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {service.description || 'Sem descrição'}
                </p>
              </div>
            </div>
          ))}

          {services.length === 0 && !isServiceModalOpen && (
            <p className="text-center text-gray-500 py-4">
              Nenhum serviço cadastrado
            </p>
          )}
        </div>
      </div>

      {/* Saber Mais Modal */}
      {isSaberMaisModalOpen && selectedServiceForSaberMais && (
        <SaberMaisModal
          isOpen={isSaberMaisModalOpen}
          onClose={() => { setIsSaberMaisModalOpen(false); setSelectedServiceForSaberMais(null); }}
          service={selectedServiceForSaberMais}
          onSave={handleSaveSaberMais}
        />
      )}

      {/* Edit Service Modal */}
      {isEditServiceModalOpen && serviceToEdit && (
        <EditServiceModal
          isOpen={isEditServiceModalOpen}
          onClose={() => { setIsEditServiceModalOpen(false); setEditingServiceId(null); setServiceToEdit(null); }}
          service={serviceToEdit}
          onSave={handleSave}
        />
      )}
    </div>
  );
}


interface SaberMaisModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onSave: (serviceId: string, saberMaisContent: any) => void;
}

const SaberMaisModal: React.FC<SaberMaisModalProps> = ({ isOpen, onClose, service, onSave }) => {
  const [localSaberMaisContent, setLocalSaberMaisContent] = useState(() => service.saber_mais_content || { description: '', process: [], benefits: [] });
  const [isSavingSaberMais, setIsSavingSaberMais] = useState(false);


  useEffect(() => {
    setLocalSaberMaisContent(service.saber_mais_content || { description: '', process: [], benefits: [] });
  }, [service]);


  if (!isOpen) return null;

  const handleProcessChange = (index: number, value: string) => {
    const updatedProcess = [...localSaberMaisContent.process];
    updatedProcess[index] = value;
    setLocalSaberMaisContent({ ...localSaberMaisContent, process: updatedProcess });
  };

  const handleAddProcessStep = () => {
    setLocalSaberMaisContent({
      ...localSaberMaisContent,
      process: [...localSaberMaisContent.process, '']
    });
  };

  const handleRemoveProcessStep = (index: number) => {
    const updatedProcess = localSaberMaisContent.process.filter((_, i) => i !== index);
    setLocalSaberMaisContent({ ...localSaberMaisContent, process: updatedProcess });
  };


  const handleBenefitsChange = (index: number, value: string) => {
    const updatedBenefits = [...localSaberMaisContent.benefits];
    updatedBenefits[index] = value;
    setLocalSaberMaisContent({ ...localSaberMaisContent, benefits: updatedBenefits });
  };

  const handleAddBenefit = () => {
    setLocalSaberMaisContent({
      ...localSaberMaisContent,
      benefits: [...localSaberMaisContent.benefits, '']
    });
  };

  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = localSaberMaisContent.benefits.filter((_, i) => i !== index);
    setLocalSaberMaisContent({ ...localSaberMaisContent, benefits: updatedBenefits });
  };


  const onSaveContent = async () => {
    setIsSavingSaberMais(true);
    await onSave(service.id!, localSaberMaisContent);
    setIsSavingSaberMais(false);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden sm:max-w-lg sm:w-full">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Editar "Saber Mais" - {service.name}
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <div className="mt-1">
                  <textarea
                    id="modal-description"
                    rows={3}
                    className="shadow-sm focus:ring-[#deb052] focus:border-[#deb052] block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Descrição detalhada do serviço"
                    value={localSaberMaisContent.description}
                    onChange={(e) => setLocalSaberMaisContent({ ...localSaberMaisContent, description: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Processo de Limpeza
                </label>
                <ul className="mt-2 space-y-2">
                  {localSaberMaisContent.process.map((step, index) => (
                    <li key={index} className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        className="flex-1 focus:ring-[#deb052] focus:border-[#deb052] block w-full min-w-0 sm:text-sm border-gray-300 rounded-none rounded-r-md"
                        placeholder={`Passo ${index + 1}`}
                        value={step}
                        onChange={(e) => handleProcessChange(index, e.target.value)}
                      />
                      <button
                        onClick={() => handleRemoveProcessStep(index)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-r-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleAddProcessStep}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]"
                >
                  Adicionar Passo
                </button>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Benefícios
                </label>
                <ul className="mt-2 space-y-2">
                  {localSaberMaisContent.benefits.map((benefit, index) => (
                    <li key={index} className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        className="flex-1 focus:ring-[#deb052] focus:border-[#deb052] block w-full min-w-0 sm:text-sm border-gray-300 rounded-none rounded-r-md"
                        placeholder={`Benefício ${index + 1}`}
                        value={benefit}
                        onChange={(e) => handleBenefitsChange(index, e.target.value)}
                      />
                      <button
                        onClick={() => handleRemoveBenefit(index)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-r-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]"
                >
                  Adicionar Benefício
                </button>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#deb052] text-base font-medium text-white hover:bg-[#c99a47] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              onClick={onSaveContent}
              disabled={isSavingSaberMais}
            >
              {isSavingSaberMais ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
