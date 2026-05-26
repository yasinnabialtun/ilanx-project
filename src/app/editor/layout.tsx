export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] flex-col">
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}