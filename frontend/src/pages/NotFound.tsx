import { Page } from '../components/Layout'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Feedback'
import { usePageTitle } from '../lib/navigation'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <Page narrow>
      <EmptyState
        title="This page doesn't exist"
        message="The link may be old or mistyped. Everything in this demo starts from the creator marketplace."
        action={<ButtonLink to="/">Go to the marketplace</ButtonLink>}
      />
    </Page>
  )
}
