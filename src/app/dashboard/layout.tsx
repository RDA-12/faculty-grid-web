import { DashboardSidebar } from '@/components/nav/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  return (
    <div className="h-vh w-vw flex flex-row gap-8">
      <nav className="min-w-90 h-dvh pl-4 py-4">
        <DashboardSidebar />
      </nav>
      {children}
    </div>
  )
}
