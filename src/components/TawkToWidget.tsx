import React, { useEffect } from 'react';

interface TawkToWidgetProps {
  propertyId?: string;
  widgetId?: string;
}

export const TawkToWidget: React.FC<TawkToWidgetProps> = ({
  propertyId = '5eac77c1203e206707f8b95a',
  widgetId = 'default'
}) => {
  useEffect(() => {
    // Avoid duplicate script injection
    if (document.getElementById('tawk-to-script')) {
      if ((window as any).Tawk_API?.showWidget) {
        (window as any).Tawk_API.showWidget();
      }
      return;
    }

    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    s1.id = 'tawk-to-script';
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    }

    return () => {
      // Hide widget when navigating to admin or unmounting
      if ((window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
    };
  }, [propertyId, widgetId]);

  return null;
};
