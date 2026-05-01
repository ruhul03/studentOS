export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen relative bg-background text-on-background font-body-lg">
      {children}
    </div>
  );
}
