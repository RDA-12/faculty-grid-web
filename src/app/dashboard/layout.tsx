import { DashboardSidebar } from '@/components/nav/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  return (
    <div className="h-dvh w-vw flex flex-row gap-4 px-4 py-4 overflow-hidden">
      <nav className="min-w-90 h-full">
        <DashboardSidebar />
      </nav>
      <div className="flex-1 flex flex-col bg-sidebar p-4 rounded-md">
        {children}
      </div>
    </div>
  )
}
