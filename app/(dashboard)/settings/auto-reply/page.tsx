"use client";

import { useState, useEffect } from "react";
import { Settings, Clock, MessageSquare, Save, Loader } from "lucide-react";

interface AutoReplyTemplate {
  name: string;
  template: string;
  description: string;
  supports_timeframe?: boolean;
}

interface AutoReplySettings {
  templates: Record<string, AutoReplyTemplate>;
  default_timeframes: string[];
}

export default function AutoReplySettingsPage() {
  const [settings, setSettings] = useState<AutoReplySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24 hours");
  const [customTimeframe, setCustomTimeframe] = useState("");

  useEffect(() => {
    fetchAutoReplySettings();
  }, []);

  const fetchAutoReplySettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('https://orr-backend.orr.solutions/admin-portal/v1/tickets/auto-reply-templates/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch auto-reply settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const testAutoReply = async (replyType: string) => {
    try {
      setSaving(true);
      
      const timeframe = customTimeframe || selectedTimeframe;
      
      // This would typically send a test auto-reply
      console.log(`Testing ${replyType} with timeframe: ${timeframe}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err: any) {
      console.error("Failed to test auto-reply:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Settings size={32} />
              Auto-Reply Settings
            </h1>
            <p className="text-gray-400">Configure automatic reply templates and timeframes for client messages</p>
          </div>

          {settings && (
            <div className="space-y-8">
              {/* Timeframe Configuration */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  Response Timeframes
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {settings.default_timeframes.map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedTimeframe === timeframe
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Custom timeframe (e.g., 3 business days)"
                    value={customTimeframe}
                    onChange={(e) => setCustomTimeframe(e.target.value)}
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setCustomTimeframe("")}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Template Configuration */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MessageSquare size={20} />
                  Auto-Reply Templates
                </h2>
                
                {Object.entries(settings.templates).map(([key, template]) => (
                  <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                        <p className="text-sm text-gray-400">{template.description}</p>
                      </div>
                      <button
                        onClick={() => testAutoReply(key)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                        Test Template
                      </button>
                    </div>
                    
                    <div className="bg-black/20 border border-white/5 rounded-lg p-4 mb-4">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {template.supports_timeframe 
                          ? template.template.replace('{timeframe}', customTimeframe || selectedTimeframe)
                          : template.template
                        }
                      </pre>
                    </div>
                    
                    {template.supports_timeframe && (
                      <div className="text-xs text-gray-500">
                        * This template supports custom timeframes. Current: {customTimeframe || selectedTimeframe}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Auto-Reply Flow Information */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Auto-Reply Flow</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Client sends message → Automatic initial acknowledgment sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Admin notification created in admin portal and WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>If admin unavailable → Delay notice sent with custom timeframe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Review message sent when detailed assessment is needed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}