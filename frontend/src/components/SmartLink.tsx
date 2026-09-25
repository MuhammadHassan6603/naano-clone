import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'

export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href)

type SmartLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string }

export function SmartLink({ href, children, ...props }: SmartLinkProps) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  )
}
