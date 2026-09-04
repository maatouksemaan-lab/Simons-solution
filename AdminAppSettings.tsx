'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings, Save, RefreshCw, AlertCircle, CheckCircle,
  DollarSign, Clock, Wrench, Zap, ChevronDown,
} from 'lucide-react';

interface Setting {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

interface SettingField {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  icon: React.ElementType;
  group: string;
}

const SETTING_FIELDS: SettingField[] = [
  // Pricing
  { key: 'premium_price_usd', label: 'Premium Price (USD)', description: 'Monthly subscription price shown to users', type: 'number', icon: DollarSign, group: 'Pricing' },
  { key: 'trial_equations_limit', label: 'Trial Equations Limit', description: 'Number of free equations for trial users', type: 'number', icon: Zap, group: 'Pricing' },
  { key: 'trial_duration_hours', label: 'Trial Duration (hours)', description: 'How long the free trial lasts', type: 'number', icon: Clock, group: 'Pricing' },
  // Maintenance
  { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Redirect all visitors to the maintenance page', type: 'boolean', icon: Wrench, group: 'Maintenance' },
  { key: 'maintenance_message', label: 'Maintenance Message', description: 'Message shown on the maintenance page', type: 'text', icon: Wrench, group: 'Maintenance' },
  { key: 'maintenance_eta', label: 'Estimated Return Time', description: 'ETA shown to visitors (e.g. "Today at 3:00 PM UTC")', type: 'text', icon: Clock, group: 'Maintenance' },
  { key: 'maintenance_status_updates', label: 'Status Updates', description: 'Latest progress notes shown on the maintenance page', type: 'text', icon: Wrench, group: 'Maintenance' },
  // App
  { key: 'app_name', label: 'App Name', description: 'Application display name', type: 'text', icon: Settings, group: 'App' },
  { key: 'support_email', label: 'Support Email', description: 'Email shown for user support', type: 'text', icon: Settings, group: 'App' },
  { key: 'bank_account_iban', label: 'Bank IBAN', description: 'IBAN for bank transfer payments', type: 'text', icon: DollarSign, group: 'Payment Info' },
  { key: 'bank_account_name', label: 'Bank Account Name', description: 'Account holder name for bank transfers', type: 'text', icon: DollarSign, group: 'Payment Info' },
  { key: 'whish_phone', label: 'Whish Phone Number', description: 'Phone number for Whish payments', type: 'text', icon: DollarSign, group: 'Payment Info' },
];

const DEFAULT_VALUES: Record<string, string> = {
  premium_price_usd: '10',
  trial_equations_limit: '5',
  trial_duration_hours: '24',
  maintenance_mode: 'false',
  maintenance_message: 'We are performing scheduled maintenance. Back soon!',
  maintenance_eta: '',
  maintenance_status_updates: '',
  app_name: "Simon's Solutions",
  support_email: 'support@simonssolutions.com',
  bank_account_iban: 'LB62 0099 9000 0001 0019 0122 9114',
  bank_account_name: 'Simon Solutions SAL',
  whish_phone: '+961 71 000 000',
};

export default function AdminAppSettings() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('system_settings').select('*');
    const map: Record<string, string> = { ...DEFAULT_VALUES };
    (data as Setting[] || []).forEach((s) => { map[s.setting_key] = s.setting_value; });
    setSettings(map);
    setOriginal(map);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (key: string) => {
    if (!profile?.id) return;
    setSaving(key);
    setError('');
    try {
      const { error: upsertError } = await supabase.from('system_settings').upsert(
        { setting_key: key, setting_value: settings[key], updated_by: profile.id },
        { onConflict: 'setting_key' }
      );
      if (upsertError) throw new Error(upsertError.message);
      setOriginal((prev) => ({ ...prev, [key]: settings[key] }));
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);

      // Log audit
      await supabase.from('audit_logs').insert({
        admin_id: profile.id,
        action: 'setting_updated',
        target_type: 'system_settings',
        metadata: { key, value: settings[key] },
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAll = async () => {
    const changed = Object.keys(settings).filter((k) => settings[k] !== original[k]);
    for (const key of changed) {
      await handleSave(key);
    }
  };

  const groups = [...new Set(SETTING_FIELDS.map((f) => f.group))];
  const hasChanges = Object.keys(settings).some((k) => settings[k] !== original[k]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">App Settings</h2>
          <p className="text-sm text-muted-foreground">Live controls — changes take effect immediately</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSettings}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          {hasChanges && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Save size={14} />
              Save All Changes
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const fields = SETTING_FIELDS.filter((f) => f.group === group);
            return (
              <div key={group} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{group}</p>
                </div>
                <div className="divide-y divide-border">
                  {fields.map((field) => {
                    const FieldIcon = field.icon;
                    const isDirty = settings[field.key] !== original[field.key];
                    const isSaving = saving === field.key;
                    const isSaved = saved === field.key;
                    return (
                      <div key={field.key} className="px-5 py-4 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FieldIcon size={15} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{field.label}</p>
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {field.type === 'boolean' ? (
                            <button
                              onClick={() => setSettings((prev) => ({ ...prev, [field.key]: prev[field.key] === 'true' ? 'false' : 'true' }))}
                              className={`relative w-11 h-6 rounded-full transition-colors ${settings[field.key] === 'true' ? 'bg-primary' : 'bg-muted'}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          ) : field.type === 'select' ? (
                            <div className="relative">
                              <select
                                value={settings[field.key] || ''}
                                onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                className="text-sm pl-3 pr-8 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                              >
                                {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                          ) : (
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={settings[field.key] || ''}
                              onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              className="text-sm px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
                            />
                          )}
                          {field.type !== 'boolean' && (
                            <button
                              onClick={() => handleSave(field.key)}
                              disabled={!isDirty || isSaving}
                              className={`p-2 rounded-lg transition-colors ${
                                isSaved
                                  ? 'text-success bg-success/10'
                                  : isDirty
                                  ? 'text-primary bg-primary/10 hover:bg-primary/20' :'text-muted-foreground opacity-40 cursor-not-allowed'
                              }`}
                              title="Save"
                            >
                              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : isSaved ? <CheckCircle size={14} /> : <Save size={14} />}
                            </button>
                          )}
                          {field.type === 'boolean' && isDirty && (
                            <button
                              onClick={() => handleSave(field.key)}
                              disabled={isSaving}
                              className="p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                            >
                              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
