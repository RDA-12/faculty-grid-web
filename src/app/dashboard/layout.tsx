import { DashboardSidebar } from '@/components/nav/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  return (
    <div className="h-dvh w-dvw flex flex-row gap-8 pl-4 py-4">
      <nav className="min-w-90 h-full">
        <DashboardSidebar />
      </nav>
      {children}
    </div>
  )
}
