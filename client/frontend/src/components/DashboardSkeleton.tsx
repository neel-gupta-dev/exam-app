"use client";

import React from "react";

/**
 * High-Fidelity Dashboard Skeleton
 * Designed to mirror the exact structure of the DashboardView:
 * 70% Main Content (Resource Cards) + 30% Sidebar Widgets.
 * This prevents layout shifting and provides a premium "instant" feel.
 */
export default function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 md:gap-8 min-h-screen p-6">
      {/* Left Column (Main Area) */}
      <div className="w-full md:w-[70%] space-y-8">
        <header className="space-y-3">
          <div className="h-8 bg-surface-container-highest rounded-lg w-1/3 animate-pulse" />
          <div className="h-4 bg-surface-container-highest rounded-lg w-1/4 animate-pulse opacity-60" />
        </header>

        {/* DashboardGrid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 h-48 rounded-2xl border border-outline-variant/5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-surface-container-highest rounded-xl animate-pulse" />
                <div className="w-6 h-6 bg-surface-container-highest rounded-full animate-pulse" />
              </div>
              <div className="h-4 bg-surface-container-highest rounded w-3/4 animate-pulse mt-4" />
              <div className="h-3 bg-surface-container-highest rounded w-1/2 animate-pulse opacity-40" />
            </div>
          ))}
        </div>

        {/* Weekly Goal Skeleton */}
        <div className="bg-surface-container-highest/30 rounded-3xl h-64 w-full animate-pulse flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 bg-surface-container-highest rounded-full" />
          <div className="h-4 bg-surface-container-highest rounded w-48" />
          <div className="h-1.5 bg-surface-container-highest rounded-full w-64" />
        </div>
      </div>

      {/* Right Column (Widgets) */}
      <div className="w-full md:w-[30%] space-y-6">
        {/* Progress Widget Skeleton */}
        <div className="bg-surface-container p-6 rounded-3xl space-y-10">
          <div className="h-4 bg-surface-container-highest rounded w-1/3 animate-pulse" />
          {/* Level Progress */}
          <div className="space-y-4">
            <div className="h-12 bg-surface-container-highest/50 rounded-xl animate-pulse" />
          </div>
          {/* Stats */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-surface-container-highest rounded-xl animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-surface-container-highest rounded w-1/4 animate-pulse" />
                <div className="h-6 bg-surface-container-highest rounded w-1/2 animate-pulse" />
              </div>
            </div>
            {/* Heatmap Area */}
            <div className="space-y-3">
              <div className="h-3 bg-surface-container-highest rounded w-1/4 animate-pulse" />
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-surface-container-highest/40 rounded-[2px] animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          {/* CTA Button Skeleton */}
          <div className="h-12 bg-primary/20 rounded-xl w-full animate-pulse" />
        </div>

        {/* Quick Tip Skeleton */}
        <div className="bg-surface-container p-6 rounded-2xl h-32 animate-pulse" />
      </div>
    </div>
  );
}
