import fs from "fs";
import path from "path";
import defaultContent from "@/core/config/default-content.json";

export type ContentData = {
  hero: {
    title: string;
    description: string;
    buttonPrimary: string;
    buttonSecondary: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
  cta: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  footer: {
    copyright: string;
    email: string;
    facebook: string;
    instagram: string;
    twitter: string;
  };
};

const DB_PATH = path.join(process.cwd(), ".data/content.json");

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultContent, null, 2), "utf8");
  }
}

export const contentDb = {
  get: (): ContentData => {
    try {
      ensureDb();
      const data = fs.readFileSync(DB_PATH, "utf8");
      const parsed = JSON.parse(data);
      
      // Merge parsed data with default content to handle schema updates
      return {
        hero: { ...defaultContent.hero, ...(parsed.hero || {}) },
        features: { ...defaultContent.features, ...(parsed.features || {}) },
        howItWorks: parsed.howItWorks || defaultContent.howItWorks,
        cta: parsed.cta || defaultContent.cta,
        footer: parsed.footer || defaultContent.footer,
      } as ContentData;
    } catch (e) {
      console.error("Error reading content DB:", e);
      return defaultContent as ContentData;
    }
  },

  save: (data: ContentData) => {
    ensureDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  },
};
