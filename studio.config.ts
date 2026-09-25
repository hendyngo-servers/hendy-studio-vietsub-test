// /studio.config.ts (hoặc /src/studio.config.ts)
export const STUDIO_CONFIG = {
  // 1. Kích thước bố cục (Layout Dimensions)
  layout: {
    sidebarWidth: "60px",
    sidebarWidthPx: 60,
    rightPanelWidth: "320px",
    rightPanelWidthPx: 320,
    timelineHeight: "250px",
    timelineHeightPx: 250,
  },

  // 2. Bảng màu & Hệ thống Track riêng biệt (System Tracks & Theme Colors)
  theme: {
    appBg: "#0b0f19",
    appText: "#f3f4f6",
    trackVideo: "#1e293b",     // Track Video
    trackAudio: "#131224",     // Track Audio
    trackSubtitle: "#1e1b4b",  // Track Subtitle
    brandPrimary: "#e11d48",
  },

  // 3. Định danh ứng dụng & Đa nền tảng (App Identity & Multi-platform)
  app: {
    id: "com.hendy.vietsubpro",
    name: "Hendy Vietsub Pro - AI Studio",
    splashBackgroundColor: "#0b0f19",
  },
} as const;
