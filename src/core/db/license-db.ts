import fs from "fs";
import path from "path";

export type License = {
  id: string;
  licenseKey: string;
  status: "active" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  devices: string[];
  deviceLimit: number;
  customerName?: string;
};

const DB_PATH = path.join(process.cwd(), ".data/licenses.json");

// Ensure the directory and file exist with initial data if empty
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialLicenses: License[] = [
      {
        id: "test-license-id",
        licenseKey: "ILX-TEST-1234-DEMO",
        status: "active",
        expiresAt: "2030-12-31",
        createdAt: new Date().toISOString(),
        devices: [],
        deviceLimit: 3,
        customerName: "Test Kullanıcısı",
      },
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(initialLicenses, null, 2), "utf8");
  }
}

export function readLicenses(): License[] {
  ensureDb();
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data) as License[];
  } catch (err) {
    console.error("Error reading license database:", err);
    return [];
  }
}

export function writeLicenses(licenses: License[]) {
  ensureDb();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(licenses, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing license database:", err);
  }
}

export function findLicenseByKey(key: string): License | null {
  const licenses = readLicenses();
  return licenses.find((l) => l.licenseKey === key) ?? null;
}

export function updateLicense(updated: License) {
  const licenses = readLicenses();
  const index = licenses.findIndex((l) => l.id === updated.id);
  if (index !== -1) {
    licenses[index] = updated;
    writeLicenses(licenses);
    return true;
  }
  return false;
}

export function addLicense(newLicense: License) {
  const licenses = readLicenses();
  licenses.push(newLicense);
  writeLicenses(licenses);
}
