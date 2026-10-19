import React from 'react';
import { Battery, BatteryCharging, Wifi, WifiOff, Clock, Sparkles } from 'lucide-react';
import { SystemTelemetry } from '../types/jarvis';

interface TelemetryDrawerProps {
  telemetry: SystemTelemetry;
  assistantName: string;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  telemetry,
  assistantName,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 select-none gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{assistantName} AI Engine</span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span className="text-emerald-400">Online & Ready</span>
      </div>

      <div className="flex items-center gap-4 text-[11px] font-mono">
        {telemetry.batteryLevel !== null && (
          <div className="flex items-center gap-1 text-slate-300">
            {telemetry.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{telemetry.batteryLevel}%</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{telemetry.localTime}</span>
        </div>

        <div className="flex items-center gap-1">
          {telemetry.online ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Connected</span>
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Offline</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
