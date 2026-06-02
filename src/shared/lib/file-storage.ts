import fs from "fs";
import path from "path";

export async function downloadAndSaveVideo(url: string, fileName: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch video from remote URL: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadDir = path.join(process.cwd(), "public", "videos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `${fileName}.mp4`);
    fs.writeFileSync(filePath, buffer);

    // Return the local URL path for the frontend
    return `/videos/${fileName}.mp4`;
  } catch (error) {
    console.error("Error downloading video:", error);
    // Fallback to original URL if download fails so the app doesn't break
    return url;
  }
}
