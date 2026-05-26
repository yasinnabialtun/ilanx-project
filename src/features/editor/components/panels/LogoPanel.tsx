import { ImageIcon } from "lucide-react";
import { useRef, memo } from "react";

export const LogoPanel = memo(function LogoPanel({
  handleLogoUpload,
}: {
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="size-4" /> Logo Yükle</h2>
      <div className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center">
        <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-xs text-muted-foreground mb-4">
          Kendi firmanızın logosunu ekleyin. İdeal format: Saydam PNG
        </p>
        <button
          onClick={() => logoInputRef.current?.click()}
          className="w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Bilgisayardan Seç
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>
    </section>
  );
});
