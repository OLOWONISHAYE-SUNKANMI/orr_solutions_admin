"use client";

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, X, Activity } from 'lucide-react';
import '@fortune-sheet/react/dist/index.css';

interface SheetsEditorProps {
   content: string;
   onChange: (content: string) => void;
   title: string;
   onTitleChange: (title: string) => void;
}

// FortuneSheet uses window/document extensively, so it must be dynamically imported with SSR disabled.
const Workbook = dynamic(() => import('@fortune-sheet/react').then(mod => mod.Workbook), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-400">Loading spreadsheet engine...</div>
});

export default function SheetsEditor({ content, onChange, title, onTitleChange }: SheetsEditorProps) {
    const [showInsights, setShowInsights] = useState(false);
    
    const [data] = useState(() => {
        try {
            if (content && content.startsWith('{')) {
                const parsed = JSON.parse(content);
                // Check if it's the old flat map format (A1: value)
                if (!Array.isArray(parsed) && Object.keys(parsed).some(k => k.match(/^[A-Z]\d+$/))) {
                    const celldata: any[] = [];
                    for (const key in parsed) {
                        const match = key.match(/^([A-Z])(\d+)$/);
                        if (match) {
                            const c = match[1].charCodeAt(0) - 65;
                            const r = parseInt(match[2], 10) - 1;
                            celldata.push({
                                r, c, v: { m: parsed[key], v: parsed[key] }
                            });
                        }
                    }
                    return [{ name: "Sheet1", celldata }];
                }
            } else if (content && content.startsWith('[')) {
                // FortuneSheet native array format
                return JSON.parse(content);
            }
        } catch (e) {
            console.error("Failed to parse sheet data", e);
        }
        return [{ name: "Sheet1", celldata: [] }];
    });

    const handleChange = useCallback((d: any[]) => {
        onChange(JSON.stringify(d));
    }, [onChange]);

    return (
        <div className="flex-1 bg-white overflow-hidden flex flex-col w-full h-full relative" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="h-14 border-b border-gray-200 bg-white flex items-center px-4 shrink-0 z-30 justify-between">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="flex-1 min-w-[100px] max-w-[200px] sm:max-w-[400px] bg-transparent border-none focus:outline-none text-lg sm:text-xl text-gray-900 font-normal px-2 py-1 hover:bg-gray-50 rounded transition-colors truncate"
                    placeholder="Untitled spreadsheet"
                />
                <button
                    onClick={() => setShowInsights(!showInsights)}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${showInsights ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                >
                    <Sparkles size={16} className={showInsights ? 'text-indigo-600' : 'text-amber-500'} />
                    <span className="hidden sm:inline">AI Insights</span>
                </button>
            </div>
            
            <div className="flex-1 relative w-full overflow-hidden flex">
                <div className="flex-1 relative">
                    <Workbook 
                        data={data} 
                        onChange={handleChange} 
                        lang="en"
                    />
                </div>
                
                {/* AI Insights Sidebar */}
                {showInsights && (
                    <div className="absolute md:relative z-40 inset-y-0 right-0 w-full sm:w-80 border-l border-gray-200 bg-gray-50 flex flex-col h-full shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shrink-0">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-600" />
                                <h3 className="font-semibold text-sm text-gray-900">Sheet Insights</h3>
                            </div>
                            <button onClick={() => setShowInsights(false)} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity size={16} className="text-blue-500" />
                                    <h4 className="text-sm font-medium text-gray-900">Data Summary</h4>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    The current sheet contains {data[0]?.celldata?.length || 0} active cells. 
                                    Analyzing the latest patterns...
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100">
                                <h4 className="text-sm font-medium text-indigo-900 mb-2">Suggested Actions</h4>
                                <ul className="text-xs text-indigo-700 space-y-2 list-disc pl-4">
                                    <li>Format columns with currency</li>
                                    <li>Add a pivot table to summarize row data</li>
                                    <li>Highlight outliers using conditional formatting</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Styles overrides for FortuneSheet to match our design system */}
            <style>{`
                .fortune-sheet-container {
                    font-family: inherit !important;
                }
                .fortune-sheet-container .luckysheet-stat-area {
                    background-color: #f8f9fa;
                    border-top: 1px solid #e5e7eb;
                }
                .fortune-sheet-container .luckysheet-wa-editor {
                    font-family: monospace;
                }
            `}</style>
        </div>
    );
}
