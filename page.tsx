'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Wrench, Clock, RefreshCw, CheckCircle } from 'lucide-react';

interface MaintenanceInfo {
  message: string;
  eta: string;
  statusUpdates: string;
}

export default function MaintenancePage() {
  const supabase = createClient();
  const [info, setInfo] = useState<MaintenanceInfo>({
    message: 'We are performing scheduled maintenance. Please check back shortly.',
    eta: '',
    statusUpdates: '',
  });
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const checkMaintenanceStatus = useCallback(async () => {
    setChecking(true);
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['maintenance_mode', 'maintenance_message', 'maintenance_eta', 'maintenance_status_updates']);

      const map: Record<string, string> = {};
      (data || []).forEach((row: { setting_key: string; setting_value: string }) => {
        map[row.setting_key] = row.setting_value;
      });

      // If maintenance mode is off, redirect home
      if (map['maintenance_mode'] === 'false') {
        window.location.href = '/';
        return;
      }

      setInfo({
        message: map['maintenance_message'] || 'We are performing scheduled maintenance. Please check back shortly.',
        eta: map['maintenance_eta'] || '',
        statusUpdates: map['maintenance_status_updates'] || '',
      });
    } catch {
      // silently ignore
    } finally {
      setChecking(false);
    }
  }, [supabase]);

  // Auto-check every 60 seconds
  useEffect(() => {
    checkMaintenanceStatus();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkMaintenanceStatus();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [checkMaintenanceStatus]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Card */}
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <div className="px-8 py-10 space-y-8">
            {/* Icon + Title */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
                <Wrench size={36} className="text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Under Maintenance</h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {info.message}
                </p>
              </div>
            </div>

            {/* ETA */}
            {info.eta && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estimated Return</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{info.eta}</p>
                </div>
              </div>
            )}

            {/* Status Updates */}
            {info.statusUpdates && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status Updates</p>
                <div className="p-4 bg-muted/30 border border-border rounded-2xl">
                  <div className="flex gap-2.5">
                    <CheckCircle size={15} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{info.statusUpdates}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Auto-check footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Auto-checking in <span className="font-semibold text-foreground tabular-nums">{countdown}s</span></span>
              </div>
              <button
                onClick={() => { setCountdown(60); checkMaintenanceStatus(); }}
                disabled={checking}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
                Check now
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          We apologize for the inconvenience. Our team is working hard to restore service.
        </p>
      </div>
    </div>
  );
}
