import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Eye, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  items: any[];
  additional_info: string;
  preferred_date: string;
  status: string;
  created_at: string;
  estimated_price: number | null;
}

export default function QuotesPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuoteStatus = async (id: string, status: string, estimatedPrice?: number) => {
    try {
      const updateData: any = { status };
      if (estimatedPrice !== undefined) {
        updateData.estimated_price = estimatedPrice;
      }

      const { error } = await supabase
        .from('quote_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setQuotes(prev => prev.map(quote => 
        quote.id === id 
          ? { ...quote, status, estimated_price: estimatedPrice ?? quote.estimated_price }
          : quote
      ));
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('quote_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuotes(prev => prev.filter(quote => quote.id !== id));
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Erro ao excluir pedido');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (statusFilter === 'all') return true;
    return quote.status.toLowerCase() === statusFilter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">SofáLimpo Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/quotes"
                  className="border-[#deb052] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Pedidos de Orçamento
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#deb052] hover:bg-[#c99a47]"
              >
                <LogOut size={20} className="mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Pedidos de Orçamento
            </h1>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052]"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="reviewed">Em Análise</option>
                <option value="quoted">Orçados</option>
              </select>
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Est.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quote.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quote.email}</div>
                        <div className="text-sm text-gray-500">{quote.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quote.service_type === 'residential' ? 'Residencial' : 'Empresarial'}
                        <div className="text-xs text-gray-400">
                          {quote.items?.length || 0} item(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={quote.status}
                          onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-[#deb052] ${
                            quote.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : quote.status === 'Reviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          <option value="Pending">Pendente</option>
                          <option value="Reviewed">Em Análise</option>
                          <option value="Quoted">Orçado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quote.estimated_price ? (
                          `${quote.estimated_price}€`
                        ) : (
                          <input
                            type="number"
                            placeholder="Preço"
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                            onBlur={(e) => {
                              const price = parseFloat(e.target.value);
                              if (price > 0) {
                                updateQuoteStatus(quote.id, quote.status, price);
                              }
                            }}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedQuote(quote)}
                            className="text-[#deb052] hover:text-[#c99a47]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredQuotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum pedido encontrado.</p>
            </div>
          )}
        </div>
      </main>

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalhes do Pedido
                </h2>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <p className="text-gray-900">{selectedQuote.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedQuote.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telefone
                    </label>
                    <p className="text-gray-900">{selectedQuote.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Serviço
                    </label>
                    <p className="text-gray-900">
                      {selectedQuote.service_type === 'residential' ? 'Residencial' : 'Empresarial'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Morada
                  </label>
                  <p className="text-gray-900">{selectedQuote.address}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Itens para Limpeza
                  </label>
                  <div className="space-y-2">
                    {selectedQuote.items?.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p><strong>Tipo:</strong> {item.type}</p>
                        <p><strong>Tamanho/Lugares:</strong> {item.seats}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedQuote.preferred_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data Preferida
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedQuote.preferred_date).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                )}

                {selectedQuote.additional_info && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Informações Adicionais
                    </label>
                    <p className="text-gray-900">{selectedQuote.additional_info}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="text-gray-900">{selectedQuote.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data do Pedido
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedQuote.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>

                {selectedQuote.estimated_price && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preço Estimado
                    </label>
                    <p className="text-gray-900 text-lg font-semibold">
                      {selectedQuote.estimated_price}€
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}