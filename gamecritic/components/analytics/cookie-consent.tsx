"use client";

import { useEffect, useRef } from "react";

import { acceptedCategory, run } from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function loadGoogleAnalytics(measurementId: string) {
  if (typeof window === "undefined" || window.gtag) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  script.onload = () => {
    window.gtag?.("js", new Date());
    window.gtag?.("config", measurementId, {
      anonymize_ip: true,
      send_page_view: true,
    });
  };
}

function syncAnalyticsConsent() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) {
    return;
  }

  if (acceptedCategory("analytics")) {
    loadGoogleAnalytics(id);
  }
}

export function CookieConsentBanner() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    run({
      mode: "opt-in",
      autoShow: true,
      disablePageInteraction: false,
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom right",
        },
        preferencesModal: {
          layout: "box",
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: "_gid" }],
          },
        },
      },
      language: {
        default: "cs",
        translations: {
          cs: {
            consentModal: {
              title: "Cookies a soukromí",
              description:
                "Používáme nezbytné cookies pro chod webu. Analytické cookies (např. Google Analytics) načteme jen s vaším souhlasem.",
              acceptAllBtn: "Přijmout vše",
              acceptNecessaryBtn: "Odmítnout volitelné",
              showPreferencesBtn: "Nastavení",
            },
            preferencesModal: {
              title: "Nastavení cookies",
              acceptAllBtn: "Přijmout vše",
              acceptNecessaryBtn: "Pouze nezbytné",
              savePreferencesBtn: "Uložit",
              sections: [
                {
                  title: "Nezbytné",
                  description: "Nutné pro přihlášení a základní funkce.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Analytika",
                  description: "Agregované statistiky návštěvnosti (pageview).",
                  linkedCategory: "analytics",
                },
              ],
            },
          },
        },
      },
      onConsent: () => {
        syncAnalyticsConsent();
      },
      onChange: () => {
        syncAnalyticsConsent();
      },
    });

    syncAnalyticsConsent();
  }, []);

  return null;
}
