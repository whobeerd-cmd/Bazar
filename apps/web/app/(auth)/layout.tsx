export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-7 shadow-card">
        {children}
      </div>
    </div>
  );
}
