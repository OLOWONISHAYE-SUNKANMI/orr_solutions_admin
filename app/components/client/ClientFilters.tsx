"use client";

import { Filter } from "lucide-react";

interface ClientFiltersProps {
  filterStage: string;
  filterPillar: string;
  filterPortalStatus: string;
  showFilters: boolean;
  onStageChange: (stage: string) => void;
  onPillarChange: (pillar: string) => void;
  onPortalStatusChange: (status: string) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export default function ClientFilters({
  filterStage,
  filterPillar,
  filterPortalStatus,
  showFilters,
  onStageChange,
  onPillarChange,
  onPortalStatusChange,
  onToggleFilters,
  onClearFilters,
}: ClientFiltersProps) {
  const hasActiveFilters = filterStage !== "all" || filterPillar !== "all" || filterPortalStatus !== "all";

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-all duration-200"
      >
        <Filter size={16} />
        Filters
        {hasActiveFilters && (
          <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">Active</span>
        )}
      </button>

      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stage</label>
            <select
              value={filterStage}
              onChange={(e) => onStageChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Stages</option>
              <option value="discover">Discover</option>
              <option value="diagnose">Diagnose</option>
              <option value="design">Design</option>
              <option value="deploy">Deploy</option>
              <option value="grow">Grow</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Primary Pillar</label>
            <select
              value={filterPillar}
              onChange={(e) => onPillarChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Pillars</option>
              <option value="strategic">Strategic Vision, Planning & Growth</option>
              <option value="operational">Operational Excellence & Processes</option>
              <option value="financial">Financial Management & Planning</option>
              <option value="cultural">Cultural Transformation & People</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Portal Status</label>
            <select
              value={filterPortalStatus}
              onChange={(e) => onPortalStatusChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-primary hover:underline self-end"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}