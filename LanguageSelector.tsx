import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
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
  { key: 'about_description', content: '', label: 'Descrição Sobre Nós' },
  { key: 'services_title', content: '', label: 'Título dos Serviços' },
  { key: 'services_subtitle', content: '', label: 'Subtítulo dos Serviços' },
];

export default function ContentEditor() {
  const [content, setContent] = useState<ContentItem[]>(contentItems);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, content');

      if (error) throw error;

      if (data) {
        setContent(contentItems.map(item => ({
          ...item,
          content: data.find(d => d.key === item.key)?.content || item.content
        })));
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Erro ao carregar conteúdo');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = content.map(({ key, content }) => ({
        key,
        content,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('site_content')
        .upsert(updates);

      if (error) throw error;

      toast.success('Conteúdo atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Gestão de Conteúdo
        </h3>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
            isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#deb052] hover:bg-[#c99a47]'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#deb052]`}
        >
          <Save size={16} className="mr-2" />
          {isSaving ? 'Salvando...' : isEditing ? 'Salvar' : 'Editar Conteúdo'}
        </button>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="space-y-6">
          {content.map((item) => (
            <div key={item.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {item.label}
              </label>
              {item.key === 'about_description' ? (
                <textarea
                  value={item.content}
                  onChange={(e) => setContent(content.map(c => 
                    c.key === item.key ? { ...c, content: e.target.value } : c
                  ))}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052] disabled:bg-gray-50"
                />
              ) : (
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => setContent(content.map(c => 
                    c.key === item.key ? { ...c, content: e.target.value } : c
                  ))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb052] disabled:bg-gray-50"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
