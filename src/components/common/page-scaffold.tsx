import { Fragment, type ReactNode } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb'
import Link from 'next/link'
import type { Route } from 'next'

type LinkData = {
  label: string
  href: Route
}

type PageScaffoldProps = {
  children: ReactNode
  /**
   * List of links for breadcrumb
   *
   * Will assuming last link is the current active
   */
  links: LinkData[]
  title: string
  description?: string
}

/**
 * Adding breadcrumb based on links, title, and optionally description on top of
 * children
 *
 * It doesn't wrap the children with main tag, better to do it on your own
 */
export default function PageScaffold({
  children,
  links,
  title,
  description,
}: PageScaffoldProps) {
  const previousLinks = links.slice(0, links.length - 1).map((link, index) => {
    return (
      <Fragment key={index}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={link.href}>{link.label}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
      </Fragment>
    )
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            {...previousLinks}
            <BreadcrumbItem>
              <BreadcrumbPage>
                {links.at(links.length - 1)!.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  )
}
