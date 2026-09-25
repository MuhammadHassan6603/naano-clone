import { Button } from './ui/Button'

export const DEMO_PASSWORD = 'naano-demo-2026'

const accounts = [
  { email: 'acme@demo.test', name: 'Acme CRM', role: 'Brand', note: 'Has a booking in every stage, including a post waiting for approval.' },
  { email: 'maya@demo.test', name: 'Maya Okafor', role: 'Creator', note: 'Has a new booking request waiting to be accepted.' },
  { email: 'priya@demo.test', name: 'Priya Nair', role: 'Creator', note: 'Top track record: delivered 5 of 5.' },
  { email: 'pipewise@demo.test', name: 'Pipewise', role: 'Brand', note: 'The brand behind most of the past bookings.' },
]

type DemoAccountsProps = {
  onUse: (email: string) => void
  pendingEmail: string | null
}

export function DemoAccounts({ onUse, pendingEmail }: DemoAccountsProps) {
  return (
    <section aria-labelledby="demo-accounts" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 id="demo-accounts" className="text-base font-semibold">
        Try it with a demo account
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        These accounts come with real bookings and demo money. The password for all of them is{' '}
        <code className="rounded bg-page px-1.5 py-0.5 font-mono text-[13px] text-ink">{DEMO_PASSWORD}</code>.
      </p>
      <ul className="mt-4 divide-y divide-line">
        {accounts.map((account) => (
          <li key={account.email} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                {account.name} <span className="font-normal text-muted">· {account.role}</span>
              </p>
              <p className="truncate text-sm text-muted">{account.email}</p>
              <p className="text-sm text-muted">{account.note}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              loading={pendingEmail === account.email}
              disabled={pendingEmail !== null}
              onClick={() => onUse(account.email)}
            >
              Log in as {account.name.split(' ')[0]}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
