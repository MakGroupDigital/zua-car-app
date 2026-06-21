'use client';

import { useState } from 'react';
import { ChartContainer } from '../components/stat-card';
import { Save, Lock, Bell, Mail, Globe, Shield } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'AUTONEX',
    supportEmail: 'support@autonex.com',
    maintenanceMode: false,
    enableNotifications: true,
    enableEmailAlerts: true,
    maxListingSize: 50,
    maxUploadSize: 100,
    commissionRate: 5,
    platformFee: 2,
  });

  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = () => {
    setSavedMessage('Paramètres sauvegardés avec succès!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Paramètres Admin</h1>
        <p className="text-slate-400 mt-1">Configurer l'application et les préférences système</p>
      </div>

      {/* Platform Settings */}
      <ChartContainer title="Paramètres Plateforme">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Nom de la Plateforme</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email Support</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-4">Mode Maintenance</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 accent-amber-500"
              />
              <span className="text-white">Activer le mode maintenance</span>
            </label>
            {settings.maintenanceMode && (
              <p className="text-sm text-amber-400 mt-2">⚠️ La plateforme sera indisponible pour les utilisateurs</p>
            )}
          </div>
        </div>
      </ChartContainer>

      {/* Notification Settings */}
      <ChartContainer title="Paramètres Notifications">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 transition-all">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 accent-amber-500"
            />
            <div className="flex-1">
              <p className="font-medium text-white">Notifications Push</p>
              <p className="text-sm text-slate-400">Recevoir les notifications système en temps réel</p>
            </div>
            <Bell size={20} className="text-amber-500" />
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 transition-all">
            <input
              type="checkbox"
              checked={settings.enableEmailAlerts}
              onChange={(e) => setSettings({ ...settings, enableEmailAlerts: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 accent-amber-500"
            />
            <div className="flex-1">
              <p className="font-medium text-white">Alertes Email</p>
              <p className="text-sm text-slate-400">Recevoir les alertes importantes par email</p>
            </div>
            <Mail size={20} className="text-blue-500" />
          </label>
        </div>
      </ChartContainer>

      {/* Upload Settings */}
      <ChartContainer title="Limites de Upload">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Taille Max Listing (MB)</label>
            <input
              type="number"
              value={settings.maxListingSize}
              onChange={(e) => setSettings({ ...settings, maxListingSize: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">Taille maximale pour un listing</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Taille Max Upload (MB)</label>
            <input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">Taille maximale pour un fichier unique</p>
          </div>
        </div>
      </ChartContainer>

      {/* Financial Settings */}
      <ChartContainer title="Paramètres Financiers">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Taux de Commission (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.commissionRate}
              onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">Commission collectée sur chaque transaction</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Frais Plateforme (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.platformFee}
              onChange={(e) => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">Frais de service de la plateforme</p>
          </div>
        </div>
      </ChartContainer>

      {/* Security Settings */}
      <ChartContainer title="Paramètres Sécurité">
        <div className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-amber-500" />
              <div>
                <p className="font-medium text-white">Authentification 2FA</p>
                <p className="text-sm text-slate-400">Authentification à deux facteurs obligatoire</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-blue-500" />
              <div>
                <p className="font-medium text-white">Chiffrement SSL</p>
                <p className="text-sm text-slate-400">Toutes les connexions sont sécurisées</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
        </div>
      </ChartContainer>

      {/* Save Button & Message */}
      <div className="flex items-end gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-200 font-semibold"
        >
          <Save size={20} />
          Sauvegarder les Paramètres
        </button>
        {savedMessage && (
          <p className="text-sm text-green-400 animate-pulse">{savedMessage}</p>
        )}
      </div>
    </div>
  );
}
