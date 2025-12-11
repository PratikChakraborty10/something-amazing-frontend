"use client";

import { useEffect, useCallback } from "react";
import { getCalApi } from "@calcom/embed-react";

interface UseCalComOptions {
  /**
   * The Cal.com booking link (e.g., "username/30min" or "username/consultation")
   * Can be passed directly or will default to NEXT_PUBLIC_CAL_LINK env variable
   */
  calLink?: string;
  /**
   * Hide the Cal.com branding in the embed
   * @default true
   */
  hideEventTypeDetails?: boolean;
  /**
   * Layout style for the calendar
   * @default "month_view"
   */
  layout?: "month_view" | "week_view" | "column_view";
}

interface CalComReturn {
  /**
   * Opens the Cal.com popup modal
   */
  openCalPopup: () => void;
}

/**
 * A reusable hook for integrating Cal.com scheduling
 *
 * @example
 * ```tsx
 * const { openCalPopup } = useCalCom({ calLink: "your-username/30min" });
 *
 * return <button onClick={openCalPopup}>Schedule a Call</button>
 * ```
 */
export function useCalCom(options: UseCalComOptions = {}): CalComReturn {
  const {
    calLink = process.env.NEXT_PUBLIC_CAL_LINK || "",
    hideEventTypeDetails = true,
    layout = "month_view",
  } = options;

  useEffect(() => {
    (async function initCal() {
      const cal = await getCalApi({ namespace: "calcom" });

      // Configure the Cal.com UI settings
      cal("ui", {
        hideEventTypeDetails,
        layout,
        cssVarsPerTheme: {
          light: { "cal-brand": "hsl(var(--primary))" },
          dark: { "cal-brand": "hsl(var(--primary))" },
        },
      });
    })();
  }, [hideEventTypeDetails, layout]);

  const openCalPopup = useCallback(() => {
    if (!calLink) {
      console.warn(
        "useCalCom: No calLink provided. Please set NEXT_PUBLIC_CAL_LINK in your environment or pass calLink option."
      );
      return;
    }

    (async function openCal() {
      const cal = await getCalApi({ namespace: "calcom" });
      cal("modal", {
        calLink,
        config: {
          layout,
        },
      });
    })();
  }, [calLink, layout]);

  return { openCalPopup };
}
