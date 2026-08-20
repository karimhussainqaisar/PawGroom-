import React from 'react';
import { ClientNotificationPopup } from './ClientNotificationPopup';
import { ClientNotificationBanner } from './ClientNotificationBanner';
import { ClientNotificationSheet } from './ClientNotificationSheet';
import { ClientNotificationFloatingWidget } from './ClientNotificationFloatingWidget';
import { ClientNotificationToastStack } from './ClientNotificationToastStack';
import { ClientNotificationTicker } from './ClientNotificationTicker';
import { ClientNotificationTakeover } from './ClientNotificationTakeover';

export const ClientNotificationRenderer: React.FC = () => {
  return (
    <>
      {/* 1. Live Breaking News Ticker / Marquee */}
      <ClientNotificationTicker />

      {/* 2. Top Announcement Banners */}
      <ClientNotificationBanner />

      {/* 3. Center Pop-up Modal */}
      <ClientNotificationPopup />

      {/* 4. Slide-Up Bottom Action Sheet / Drawer */}
      <ClientNotificationSheet />

      {/* 5. Floating Bottom-Right Action Widget */}
      <ClientNotificationFloatingWidget />

      {/* 6. Corner Interactive Toast Stack */}
      <ClientNotificationToastStack />

      {/* 7. Fullscreen Immersive Announcement Takeover */}
      <ClientNotificationTakeover />
    </>
  );
};
