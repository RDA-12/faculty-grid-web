import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import type { Route } from 'next'

export function DashboardSidebar() {
  return (
    <Card className="h-full bg-sidebar">
      <CardHeader>
        <CardTitle>FacultyGrid</CardTitle>
        <CardDescription>Sistem administrasi kampus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <NavItem href="/dashboard/faculties" label="Fakultas" />
          <NavItem href="/dashboard/programs" label="Program Studi" />
        </div>
      </CardContent>
    </Card>
  )
}

type NavItemProps = {
  label: string
  href: Route
}

function NavItem({ label, href }: NavItemProps) {
  return (
    <div className="bg-sidebar-primary py-2 px-4 rounded-md hover:bg-primary">
      <Link href={href} className="size-full block">
        {label}
      </Link>
    </div>
  )
}
