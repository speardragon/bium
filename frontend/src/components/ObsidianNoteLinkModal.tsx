import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { X, Search, FileText, FolderPlus, Link2, Unlink, ExternalLink, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { Task } from "../types";

interface ObsidianNoteLinkModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
}

export function ObsidianNoteLinkModal({ isOpen, task, onClose }: ObsidianNoteLinkModalProps) {
  const { t } = useTranslation();
  const { 
    settings, 
    fetchObsidianNotes, 
    fetchObsidianFolders,
    createObsidianNote, 
    updateTaskObsidianLink 
  } = useStore();
  
  const [notes, setNotes] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newNoteFolder, setNewNoteFolder] = useState("");

  useEffect(() => {
    if (isOpen && settings.obsidianVaultPath) {
      loadNotes();
      loadFolders();
      setSearchQuery("");
      setShowCreateNew(false);
      setNewNoteFolder(settings.obsidianDefaultFolder || "");
    }
  }, [isOpen, settings.obsidianVaultPath]);

  const loadNotes = async () => {
    setIsLoading(true);
    const noteList = await fetchObsidianNotes();
    setNotes(noteList);
    setIsLoading(false);
  };

  const loadFolders = async () => {
    const folderList = await fetchObsidianFolders();
    setFolders(folderList);
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note => note.toLowerCase().includes(query));
  }, [notes, searchQuery]);

  const handleSelectNote = async (notePath: string) => {
    if (!task) return;
    await updateTaskObsidianLink(task.id, notePath);
    onClose();
  };

  const handleCreateAndLink = async () => {
    if (!task) return;
    
    setIsCreating(true);
    const notePath = await createObsidianNote(task.title, newNoteFolder || undefined);
    
    if (notePath) {
      await updateTaskObsidianLink(task.id, notePath);
      // Open the note in Obsidian
      openInObsidian(notePath);
      onClose();
    }
    setIsCreating(false);
  };

  const handleUnlink = async () => {
    if (!task) return;
    await updateTaskObsidianLink(task.id, null);
    onClose();
  };

  const openInObsidian = (notePath: string) => {
    if (!settings.obsidianVaultPath) return;
    
    // Extract vault name from path (last part of the path)
    const vaultName = settings.obsidianVaultPath.split('/').pop() || 'vault';
    
    // Remove .md extension for Obsidian URI
    const fileWithoutExtension = notePath.replace(/\.md$/, '');
    
    // Create Obsidian URI
    const obsidianUri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(fileWithoutExtension)}`;
    
    window.open(obsidianUri, '_blank');
  };

  const handleOpenLinkedNote = () => {
    if (task?.obsidianLink) {
      openInObsidian(task.obsidianLink);
    }
  };

  if (!isOpen || !task) return null;

  // If vault is not configured
  if (!settings.obsidianVaultPath) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("obsidian.notConfigured", "Obsidian Not Configured")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t("obsidian.notConfiguredHint", "Please configure your Obsidian vault path in settings first.")}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t("common.close", "Close")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If task already has a linked note
  if (task.obsidianLink) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("obsidian.linkedNote", "Linked Note")}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span className="text-sm text-purple-800 truncate flex-1">
                {task.obsidianLink}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleOpenLinkedNote}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t("obsidian.openInObsidian", "Open in Obsidian")}
            </button>
            <button
              onClick={handleUnlink}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              {t("obsidian.unlinkNote", "Unlink Note")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Note selection view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {t("obsidian.linkNote", "Link to Obsidian Note")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {t("obsidian.linkingTask", "Linking task:")} <span className="font-medium text-gray-800">{task.title}</span>
          </p>
        </div>

        {/* Search / Create New Toggle */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateNew(false)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                !showCreateNew 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Link2 className="w-4 h-4 inline-block mr-1" />
              {t("obsidian.selectExisting", "Select Existing")}
            </button>
            <button
              onClick={() => setShowCreateNew(true)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showCreateNew 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FolderPlus className="w-4 h-4 inline-block mr-1" />
              {t("obsidian.createNew", "Create New")}
            </button>
          </div>
        </div>

        {showCreateNew ? (
          /* Create New Note View */
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("obsidian.noteTitle", "Note Title")}
              </label>
              <input
                type="text"
                value={task.title}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t("obsidian.noteTitleHint", "The note will be created with the task title.")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("obsidian.folder", "Folder")}
              </label>
              <select
                value={newNoteFolder}
                onChange={(e) => setNewNoteFolder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("obsidian.rootFolder", "/ (Root)")}</option>
                {folders.filter(f => f !== '').map((folder) => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateAndLink}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  {t("obsidian.createAndOpen", "Create & Open in Obsidian")}
                </>
              )}
            </button>
          </div>
        ) : (
          /* Select Existing Note View */
          <>
            {/* Search */}
            <div className="px-6 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("obsidian.searchNotes", "Search notes...")}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery 
                      ? t("obsidian.noNotesFound", "No notes found") 
                      : t("obsidian.noNotes", "No notes in vault")}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotes.map((note) => (
                    <button
                      key={note}
                      onClick={() => handleSelectNote(note)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-gray-400 group-hover:text-purple-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{note}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
