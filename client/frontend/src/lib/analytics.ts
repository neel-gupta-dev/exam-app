/**
 * Vayl Analytics Service
 * Utility functions for tracking user interaction and academic events 
 * via Google Analytics 4.
 */

export const GA_MEASUREMENT_ID = "G-ZDWW48QNX7";

// Log page view
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag && process.env.NODE_ENV === "production") {
    (window as any).gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Log generic events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && (window as any).gtag && process.env.NODE_ENV === "production") {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * Academic Study Events
 */

// Focus Session Tracking
export const trackFocusStart = (type: string, duration: number) => {
  event({
    action: "focus_session_start",
    category: "study_flow",
    label: `${type} • ${duration}m`,
    value: duration
  });
};

export const trackFocusComplete = (type: string, duration: number) => {
  event({
    action: "focus_session_complete",
    category: "study_flow",
    label: `${type} • ${duration}m`,
    value: duration
  });
};

// Resource Engagement
export const trackResourceSave = (type: string, subject: string) => {
  event({
    action: "resource_added",
    category: "vault_activity",
    label: `${type} • ${subject}`,
  });
};

export const trackResourceView = (title: string, type: string) => {
  event({
    action: "resource_viewed",
    category: "vault_activity",
    label: `${type} • ${title}`,
  });
};

export const trackReportExport = (reportType: string) => {
  event({
    action: "report_exported",
    category: "portfolio_management",
    label: reportType,
  });
};

// Flashcard Mastery
export const trackDeckStudyStart = (deckTitle: string, cardCount: number) => {
  event({
    action: "deck_study_start",
    category: "concept_mastery",
    label: `${deckTitle} • ${cardCount} cards`,
    value: cardCount
  });
};

export const trackDeckCreate = (category: string) => {
  event({
    action: "deck_created",
    category: "concept_mastery",
    label: category,
  });
};

// Knowledge Vault Navigation
export const trackFolderOpen = (folderName: string) => {
  event({
    action: "folder_open",
    category: "vault_navigation",
    label: folderName,
  });
};
