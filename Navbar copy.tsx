import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ContentItem {
  key: string;
  content: string;
  label: string;
}

const contentItems: ContentItem[] = [
  { key: 'hero_title', content: '', label: 'Título Principal' },
  { key: 'hero_subtitle', content: '', label: 'Subtítulo Principal' },
  { key: 'services_title', content: '', label: 'Título da Secção Serviços' },
  { key: 'services_subtitle', content: '', label: 'Subtítulo da Secção Serviços' },
  { key: 'contact_phone', content: '', label: 'Telefone de Contacto' },
  { key: 'contact_email', content: '', label: 'Email de Contacto' },
  { key: 'contact_address', content: '', label: 'Morada de Contacto' },
  { key: 'contact_hours', content: '', label: 'Horário de Funcionamento' },
];

export default function ContentEditor() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, content');

      if (error) {
        console.error('Error fetching content:', error);
        return;
      }

      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.key] = item.content;
      });
      setContent(contentMap);
      
      // Definir logo URL
      const logoUrlFromDb = contentMap['site_logo_url'] || '';
      setLogoUrl(logoUrlFromDb);
      setLogoPreview(logoUrlFromDb);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (key: string) => {
    setEditingKey(key);
    setEditValue(content[key] || '');
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const saveContent = async (key: string) => {
    if (!editValue.trim()) {
      toast.error('O conteúdo não pode estar vazio');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ 
          key, 
          content: editValue.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setContent(prev => ({ ...prev, [key]: editValue.trim() }));
      setEditingKey(null);
      setEditValue('');
      toast.success('Conteúdo atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 10MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload para o bucket site-assets
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
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
        .from('site-assets')
        .getPublicUrl(filePath);

      // Salvar URL no banco de dados
      const { error: saveError } = await supabase
        .from('site_content')
        .upsert({ 
          key: 'site_logo_url', 
          content: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (saveError) throw saveError;

      setLogoUrl(publicUrl);
      setLogoPreview(publicUrl);
      setContent(prev => ({ ...prev, site_logo_url: publicUrl }));
      toast.success('Logo atualizado com sucesso!');

    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao carregar logo: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!logoUrl) return;

    try {
      // Remover do storage se existir
      if (logoUrl.includes('site-assets')) {
        const url = new URL(logoUrl);
        const filePath = url.pathname.split('/').slice(-2).join('/');

        const { error } = await supabase.storage
          .from('site-assets')
          .remove([filePath]);

        if (error) {
          console.error('Error removing logo from storage:', error);
        }
      }

      // Remover URL do banco de dados
      const { error: saveError } = await supabase
        .from('site_content')
        .upsert({ 
          key: 'site_logo_url', 
          content: '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (saveError) throw saveError;

      setLogoUrl('');
      setLogoPreview('');
      setContent(prev => ({ ...prev, site_logo_url: '' }));
      toast.success('Logo removido com sucesso!');

    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast.error('Erro ao remover logo: ' + (error.message || 'Erro desconhecido'));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Editor de Conteúdo
        </h3>
        <p className="text-sm text-gray-500">
          Edite o conteúdo, logo e informações de contacto do site
        </p>
      </div>
      
      <div className="p-6">
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              Logo do Site
            </h4>
            
            {/* Logo Preview */}
            <div className="mb-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Preview:</div>
                <div className="w-32 h-16 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo do site"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">Sem logo</div>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            {!logoPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#deb052] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleLogoUpload(file);
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                  disabled={isUploadingLogo}
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {isUploadingLogo ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#deb052] border-t-transparent"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isUploadingLogo ? 'Carregando...' : 'Clique para carregar o logo'}
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, SVG até 10MB • Recomendado: formato horizontal
                  </span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={logoPreview}
                  alt="Logo carregado"
                  className="w-24 h-12 object-contain bg-white rounded border"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Logo ativo</p>
                  <p className="text-xs text-gray-500">Sendo usado no site</p>
                </div>
                <div className="flex gap-2">
                  <label
                    htmlFor="logo-upload-replace"
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
                        handleLogoUpload(file);
                      }
                    }}
                    className="hidden"
                    id="logo-upload-replace"
                    disabled={isUploadingLogo}
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-900 mb-1">💡 Dicas para o logo:</h5>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use formato horizontal para melhor adaptação</li>
                <li>• Prefira fundos transparentes (PNG)</li>
                <li>• Tamanho recomendado: 200x60px ou similar</li>
                <li>• Evite textos muito pequenos</li>
              </ul>
            </div>
          </div>

          {/* Content Items */}
          {contentItems.map((item) => (
            <div key={item.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {item.label}
                </label>
                {editingKey !== item.key && (
                  <button
                    onClick={() => startEditing(item.key)}
                    className="text-[#deb052] hover:text-[#c99a47] p-1"
                    title="Editar conteúdo"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
              
              {editingKey === item.key ? (
                <div className="space-y-3">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052] focus:border-transparent"
                    rows={3}
                    placeholder="Digite o conteúdo aqui..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveContent(item.key)}
                      disabled={isSaving || !editValue.trim()}
                      className="flex items-center px-3 py-1 bg-[#deb052] text-white rounded hover:bg-[#c99a47] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={14} className="mr-1" />
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={isSaving}
                      className="flex items-center px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      <X size={14} className="mr-1" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-900 bg-gray-50 p-3 rounded border min-h-[60px] flex items-center">
                  {content[item.key] || (
                    <span className="text-gray-400 italic">
                      Clique no ícone de edição para adicionar conteúdo
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}