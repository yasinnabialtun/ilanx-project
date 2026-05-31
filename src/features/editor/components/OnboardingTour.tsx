"use client";

import { useEffect, useState } from "react";
import type { CallBackProps, Step } from "react-joyride";
import { STATUS } from "react-joyride";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

const Joyride = dynamic(() => import("react-joyride").then((mod) => mod.default || mod.Joyride || (mod as any)), { ssr: false });

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem("ilanx_tour_completed");
    
    // Kullanıcı ilk defa girse bile turu otomatik başlatmıyoruz (Sessiz ve pürüzsüz UX için)
    if (!hasSeenTour) {
      localStorage.setItem("ilanx_tour_completed", "true");
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    // Herhangi bir kapanma veya bitirme durumunda turu durdur.
    if (finishedStatuses.includes(status) || action === "close") {
      setRun(false);
      localStorage.setItem("ilanx_tour_completed", "true");
    }
  };

  const steps: Step[] = [
    {
      target: "body",
      content: "İlanX Tasarım Stüdyosu'na hoş geldiniz! Portföylerinizi saniyeler içinde nasıl göz alıcı hale getireceğinize hızlıca göz atalım.",
      placement: "center",
      disableBeacon: true,
      title: "🎉 Kendi Stüdyonuz!",
    },
    {
      target: "[aria-label='Görsel Yükle']",
      content: "İlk adım: Üzerinde çalışmak istediğiniz daire, arsa veya dükkan fotoğrafını buradan sisteme yükleyin.",
      placement: "bottom",
      disableBeacon: true,
      title: "1. Fotoğraf Yükle",
    },
    {
      target: "[aria-label='Araçları Göster veya Gizle']",
      content: "Fotoğraf yüklendikten sonra tasarım araçlarıyla 3D etiketler, neon çizgiler veya kendi logonuzu ekleyebilirsiniz. (Mobilde menüden açılır)",
      placement: "bottom",
      title: "2. Tasarım Araçları",
    },
    {
      target: "[aria-label='Özellikler Panelini Aç veya Kapat']",
      content: "Seçtiğiniz nesnelerin (renk, boyut, parlaklık) tüm özelliklerini bu panelden detaylıca değiştirebilirsiniz.",
      placement: "bottom",
      title: "3. Özelleştirme",
    },
    {
      target: "[aria-label='Tasarımı PNG görseli olarak indir']",
      content: "Tasarımınız bittiğinde tek tıkla sosyal medya ve ilan sitelerine hazır formatta indirebilirsiniz. Hadi başlayalım!",
      placement: "bottom",
      title: "4. Dışa Aktar",
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: theme === 'dark' ? '#fff' : '#333',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          arrowColor: theme === 'dark' ? '#1f2937' : '#fff',
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '8px',
          fontWeight: 600,
        },
        buttonBack: {
          color: theme === 'dark' ? '#aaa' : '#666',
        },
        buttonSkip: {
          color: theme === 'dark' ? '#aaa' : '#666',
        }
      }}
      locale={{
        back: 'Geri',
        close: 'Kapat',
        last: 'Bitir',
        next: 'İleri',
        skip: 'Atla'
      }}
    />
  );
}
