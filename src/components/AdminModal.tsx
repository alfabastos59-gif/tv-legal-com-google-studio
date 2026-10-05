import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  Search,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  Radio,
  Tv,
  Eye,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Channel } from '../types/channel';
import { createChannel, updateChannel, deleteChannel } from '../services/supabaseClient';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  categories: string[];
  onChannelsUpdated: (updatedList: Channel[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  channels,
  categories,
  onChannelsUpdated,
}) => {
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Start accessible, with option to lock
  const [adminPin, setAdminPin] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'tools'>('manage');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('ALL');

  // New Channel Form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'VARIEDADES');
  const [customCategory, setCustomCategory] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Channel Form state
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'admin' || adminPin === 'admin123' || adminPin === 'tvlegal') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta! Use a senha padrão: admin');
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newName.trim() || !newUrl.trim()) {
      setFormError('Por favor preencha o Nome e a URL do canal.');
      return;
    }

    const finalCategory = customCategory.trim() ? customCategory.trim().toUpperCase() : newCategory;

    setIsSubmitting(true);
    try {
      const added = await createChannel({
        name: newName.trim(),
        url: newUrl.trim(),
        category: finalCategory,
        thumbnail: newThumbnail.trim() || null,
        active: newActive,
        sort_order: 0,
        source: 'admin',
      });

      const updated = [added, ...channels];
      onChannelsUpdated(updated);

      setFormSuccess(`Canal "${added.name}" adicionado com sucesso!`);
      setNewName('');
      setNewUrl('');
      setNewThumbnail('');
      setCustomCategory('');
      setTimeout(() => {
        setFormSuccess('');
        setActiveTab('manage');
      }, 1500);
    } catch (err) {
      setFormError('Erro ao salvar canal. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;

    setIsSubmitting(true);
    try {
      await updateChannel(editingChannel.id, {
        name: editingChannel.name,
        url: editingChannel.url,
        category: editingChannel.category,
        thumbnail: editingChannel.thumbnail,
        active: editingChannel.active,
      });

      const updated = channels.map(c => c.id === editingChannel.id ? editingChannel : c);
      onChannelsUpdated(updated);
      setEditingChannel(null);
    } catch (err) {
      alert('Erro ao atualizar canal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      await deleteChannel(id);
      const updated = channels.filter(c => c.id !== id);
      onChannelsUpdated(updated);
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Erro ao excluir canal.');
    }
  };

  const handleToggleActive = async (channel: Channel) => {
    const updatedStatus = !channel.active;
    await updateChannel(channel.id, { active: updatedStatus });
    const updated = channels.map(c => c.id === channel.id ? { ...c, active: updatedStatus } : c);
    onChannelsUpdated(updated);
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(channels, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `tvlegal5_canais_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onChannelsUpdated(parsed);
          alert(`${parsed.length} canais importados com sucesso!`);
        }
      } catch (err) {
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  // Filter channels in table
  const filteredChannels = channels.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = selectedCatFilter === 'ALL' || c.category === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Painel Administrativo - TV Legal 5
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ADM Ativo
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Gerencie canais, URLs de transmissão HLS, categorias e logomarcas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-800/80 bg-zinc-900/30 px-6 gap-2">
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'manage'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            Gerenciar Canais ({channels.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'add'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Canal
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'tools'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Backup & Importar
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: MANAGE CHANNELS */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Filtrar nesta lista..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="w-full bg-zinc-900 text-xs rounded-xl pl-9 pr-3 py-2 border border-zinc-800 text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedCatFilter}
                    onChange={e => setSelectedCatFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-hidden focus:border-red-500"
                  >
                    <option value="ALL">Todas Categorias ({channels.length})</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Canal
                  </button>
                </div>
              </div>

              {/* Table of channels */}
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
                <div className="max-h-[50vh] overflow-y-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider text-[10px] sticky top-0 border-b border-zinc-800 z-10">
                      <tr>
                        <th className="py-3 px-4">Canal</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">URL do Sinal</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredChannels.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-500">
                            Nenhum canal encontrado com os critérios de busca.
                          </td>
                        </tr>
                      ) : (
                        filteredChannels.map(ch => (
                          <tr key={ch.id} className="hover:bg-zinc-800/40 transition-colors">
                            {/* Logo & Name */}
                            <td className="py-3 px-4 flex items-center gap-3">
                              {ch.thumbnail ? (
                                <img
                                  src={ch.thumbnail}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-contain bg-zinc-950 p-1 border border-zinc-800 shrink-0"
                                  onError={e => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-500 font-bold text-xs shrink-0">
                                  {ch.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="font-bold text-white truncate max-w-[180px]">
                                {ch.name}
                              </span>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-semibold uppercase">
                                {ch.category}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleActive(ch)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                  ch.active
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                }`}
                              >
                                {ch.active ? 'Ativo' : 'Pausado'}
                              </button>
                            </td>

                            {/* Stream URL */}
                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 truncate max-w-[200px]">
                              {ch.url}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingChannel(ch)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                                  title="Editar Canal"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {deleteConfirmId === ch.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteChannel(ch.id)}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-md"
                                      title="Confirmar Exclusão"
                                    >
                                      Sim
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-2 py-1 bg-zinc-700 text-zinc-300 text-[10px] rounded-md"
                                    >
                                      Não
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(ch.id)}
                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 transition-colors"
                                    title="Excluir Canal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADD CHANNEL */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddChannel} className="max-w-2xl mx-auto space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-red-500" />
                  Cadastrar Novo Canal de Streaming
                </h3>

                {formSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {formSuccess}
                  </div>
                )}

                {formError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nome do Canal *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ex: HBO Max Ao Vivo, TV GLOBO SP, Discovery HD..."
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    URL do Sinal HLS (.m3u8 ou stream) *
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://servidor.com/live/canal/playlist.m3u8"
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white font-mono rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Categoria Existente
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Ou Nova Categoria Personalizada
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      placeholder="Ex: NOVELAS, DOCUMENTÁRIOS"
                      className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    URL da Imagem / Logomarca (Opcional)
                  </label>
                  <input
                    type="url"
                    value={newThumbnail}
                    onChange={e => setNewThumbnail(e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
                  />
                  {newThumbnail && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                      <img
                        src={newThumbnail}
                        alt="Preview"
                        className="w-10 h-10 object-contain rounded-lg bg-zinc-900 p-1"
                        onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <span className="text-xs text-zinc-400">Prévia da logomarca</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newActive}
                      onChange={e => setNewActive(e.target.checked)}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                    Canal Ativo Imediatamente
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('manage')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Salvar Canal na TV Legal 5
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: BACKUP & IMPORT */}
          {activeTab === 'tools' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-red-500" />
                  Backup e Exportação de Canais
                </h3>
                <p className="text-xs text-zinc-400">
                  Exporte toda a lista atual de {channels.length} canais para um arquivo JSON no seu computador.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-zinc-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Baixar Backup JSON ({channels.length} canais)
                </button>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  Importar Lista de Canais (JSON)
                </h3>
                <p className="text-xs text-zinc-400">
                  Carregue um arquivo JSON contendo canais para atualizar a lista da plataforma.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md">
                  <Upload className="w-4 h-4" />
                  Selecionar Arquivo JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Edit Channel Modal Sub-Dialog */}
        {editingChannel && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-red-500" />
                  Editar Canal: {editingChannel.name}
                </h4>
                <button
                  onClick={() => setEditingChannel(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateChannel} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome do Canal</label>
                  <input
                    type="text"
                    required
                    value={editingChannel.name}
                    onChange={e => setEditingChannel({ ...editingChannel, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">URL da Transmissão (m3u8)</label>
                  <input
                    type="url"
                    required
                    value={editingChannel.url}
                    onChange={e => setEditingChannel({ ...editingChannel, url: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs font-mono text-white rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={editingChannel.category}
                    onChange={e => setEditingChannel({ ...editingChannel, category: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2.5 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">URL da Logomarca (Thumbnail)</label>
                  <input
                    type="url"
                    value={editingChannel.thumbnail || ''}
                    onChange={e => setEditingChannel({ ...editingChannel, thumbnail: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2.5"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingChannel.active}
                      onChange={e => setEditingChannel({ ...editingChannel, active: e.target.checked })}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                    Canal Ativo
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingChannel(null)}
                    className="px-3.5 py-2 rounded-lg text-xs bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
