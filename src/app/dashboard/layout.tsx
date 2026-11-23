import { DashboardSidebar } from '@/components/nav/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  return (
    <div className="h-dvh w-dvw flex flex-row gap-4 px-4 py-4">
      <nav className="min-w-90 h-full">
        <DashboardSidebar />
      </nav>
      <div className="w-full bg-sidebar p-4 rounded-md">{children}</div>
    </div>
  )
}
