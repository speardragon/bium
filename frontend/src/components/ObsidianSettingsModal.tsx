import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, FolderOpen, Check, AlertCircle, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";

interface ObsidianSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ObsidianSettingsModal({ isOpen, onClose }: ObsidianSettingsModalProps) {
  const { t } = useTranslation();
  const { settings, setObsidianVaultPath, setObsidianDefaultFolder, validateObsidianPath, fetchObsidianFolders } = useStore();
  
  const [vaultPath, setVaultPath] = useState(settings.obsidianVaultPath || "");
  const [defaultFolder, setDefaultFolder] = useState(settings.obsidianDefaultFolder || "");
  const [folders, setFolders] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; isObsidianVault?: boolean; error?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVaultPath(settings.obsidianVaultPath || "");
      setDefaultFolder(settings.obsidianDefaultFolder || "");
      setValidationResult(null);
      
      // Load folders if vault path is configured
      if (settings.obsidianVaultPath) {
        loadFolders();
      }
    }
  }, [isOpen, settings.obsidianVaultPath, settings.obsidianDefaultFolder]);

  const loadFolders = async () => {
    const folderList = await fetchObsidianFolders();
    setFolders(folderList);
  };

  const handleValidatePath = async () => {
    if (!vaultPath.trim()) {
      setValidationResult({ valid: false, error: t("obsidian.pathRequired", "Path is required") });
      return;
    }

    setIsValidating(true);
    const result = await validateObsidianPath(vaultPath.trim());
    setValidationResult(result);
    setIsValidating(false);

    if (result.valid) {
      // Save the path and load folders
      await setObsidianVaultPath(vaultPath.trim());
      const folderList = await fetchObsidianFolders();
      setFolders(folderList);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    if (vaultPath.trim() !== settings.obsidianVaultPath) {
      await setObsidianVaultPath(vaultPath.trim() || null);
    }
    
    if (defaultFolder !== settings.obsidianDefaultFolder) {
      await setObsidianDefaultFolder(defaultFolder || null);
    }
    
    setIsSaving(false);
    onClose();
  };

  const handleClearVault = async () => {
    await setObsidianVaultPath(null);
    await setObsidianDefaultFolder(null);
    setVaultPath("");
    setDefaultFolder("");
    setFolders([]);
    setValidationResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {t("obsidian.settings", "Obsidian Settings")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Vault Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("obsidian.vaultPath", "Vault Path")}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => {
                    setVaultPath(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder={t("obsidian.vaultPathPlaceholder", "~/Documents/ObsidianVault")}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleValidatePath}
                disabled={isValidating || !vaultPath.trim()}
                className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("obsidian.validate", "Validate")
                )}
              </button>
            </div>
            
            {/* Validation Result */}
            {validationResult && (
              <div className={`mt-2 flex items-center gap-2 text-sm ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult.valid ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {validationResult.isObsidianVault 
                        ? t("obsidian.validVault", "Valid Obsidian vault") 
                        : t("obsidian.validPath", "Valid path (not an Obsidian vault)")}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationResult.error}</span>
                  </>
                )}
              </div>
            )}
            
            <p className="mt-1 text-xs text-gray-500">
              {t("obsidian.vaultPathHint", "Enter the full path to your Obsidian vault. Use ~ for home directory.")}
            </p>
          </div>

          {/* Default Folder */}
          {folders.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("obsidian.defaultFolder", "Default Folder for New Notes")}
              </label>
              <select
                value={defaultFolder}
                onChange={(e) => setDefaultFolder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("obsidian.rootFolder", "/ (Root)")}</option>
                {folders.filter(f => f !== '').map((folder) => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {t("obsidian.defaultFolderHint", "New notes created from tasks will be saved in this folder.")}
              </p>
            </div>
          )}

          {/* Clear Vault Button */}
          {settings.obsidianVaultPath && (
            <button
              onClick={handleClearVault}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              {t("obsidian.clearVault", "Clear vault configuration")}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("common.save", "Save")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
