"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import type { ContentData } from "@/core/db/content-db";

export function ContentEditor({ adminSecret }: { adminSecret: string }) {
  const [data, setData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchContent = async () => {
    setIsLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setMsg({ text: "İçerik yüklenemedi.", type: "error" });
      }
    } catch {
      setMsg({ text: "Bağlantı hatası.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret, data }),
      });
      if (res.ok) {
        setMsg({ text: "İçerik başarıyla güncellendi. Siteye yansımış olmalı.", type: "success" });
      } else {
        setMsg({ text: "Güncelleme başarısız oldu.", type: "error" });
      }
    } catch {
      setMsg({ text: "Bağlantı hatası.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleHeroChange = (field: keyof ContentData["hero"], value: string) => {
    if (!data) return;
    setData({ ...data, hero: { ...data.hero, [field]: value } });
  };

  const handleFeatureItemChange = (index: number, field: "title" | "description", value: string) => {
    if (!data) return;
    const newItems = [...data.features.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, features: { ...data.features, items: newItems } });
  };

  if (isLoading && !data) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">İçerik yükleniyor...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Ana Sayfa (Landing Page) Metinleri</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm border ${msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* HERO SECTION */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 space-y-4">
        <h4 className="font-semibold text-cyan-400 border-b border-zinc-800 pb-2">Ana Karşılama (Hero)</h4>
        
        <label className="block space-y-1">
          <span className="text-xs text-zinc-400">Ana Başlık (Title)</span>
          <input
            type="text"
            value={data.hero.title}
            onChange={(e) => handleHeroChange("title", e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
          />
        </label>
        
        <label className="block space-y-1">
          <span className="text-xs text-zinc-400">Açıklama (Description)</span>
          <textarea
            value={data.hero.description}
            onChange={(e) => handleHeroChange("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none resize-none"
          />
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">1. Buton Yazısı</span>
            <input
              type="text"
              value={data.hero.buttonPrimary}
              onChange={(e) => handleHeroChange("buttonPrimary", e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">2. Buton Yazısı</span>
            <input
              type="text"
              value={data.hero.buttonSecondary}
              onChange={(e) => handleHeroChange("buttonSecondary", e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 space-y-4">
        <h4 className="font-semibold text-cyan-400 border-b border-zinc-800 pb-2">Özellikler (Features)</h4>
        
        <label className="block space-y-1">
          <span className="text-xs text-zinc-400">Bölüm Başlığı</span>
          <input
            type="text"
            value={data.features.title}
            onChange={(e) => setData({ ...data, features: { ...data.features, title: e.target.value } })}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
          />
        </label>
        
        <label className="block space-y-1">
          <span className="text-xs text-zinc-400">Bölüm Alt Başlığı</span>
          <input
            type="text"
            value={data.features.subtitle}
            onChange={(e) => setData({ ...data, features: { ...data.features, subtitle: e.target.value } })}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {data.features.items.map((item, index) => (
            <div key={index} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 space-y-3">
              <span className="text-xs font-bold text-zinc-500">Özellik {index + 1}</span>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleFeatureItemChange(index, "title", e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="Özellik Başlığı"
              />
              <textarea
                value={item.description}
                onChange={(e) => handleFeatureItemChange(index, "description", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none resize-none"
                placeholder="Özellik Açıklaması"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
