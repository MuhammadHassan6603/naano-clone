import { Spinner } from './ui/Feedback'

export const DEMO_PASSWORD = 'naano-demo-2026'

const accounts = [
  { email: 'acme@demo.test', name: 'Acme CRM', role: 'Brand', note: 'A booking in every stage, including a post waiting for approval.' },
  { email: 'olivia@demo.test', name: 'Olivia Bennett', role: 'Creator', note: 'A new booking request waiting to be accepted.' },
  { email: 'emily@demo.test', name: 'Emily Carter', role: 'Creator', note: 'A post waiting for approval, and a 5 of 5 track record.' },
  { email: 'hassan@demo.test', name: 'Muhammad Hassan', role: 'Creator', note: 'AI creator with a linked LinkedIn profile.' },
  { email: 'pipewise@demo.test', name: 'Pipewise', role: 'Brand', note: 'The brand behind most of the past bookings.' },
]

type DemoAccountsProps = {
  onUse: (email: string) => void
  pendingEmail: string | null
}

export function DemoAccounts({ onUse, pendingEmail }: DemoAccountsProps) {
  return (
    <div>
      <p className="text-[#dbeafe]">
        These accounts come with real bookings and demo money. One click logs you in. The password for all of them is{' '}
        <code className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[13px] text-white">{DEMO_PASSWORD}</code>.
      </p>
      <ul className="mt-6 space-y-3">
        {accounts.map((account) => (
          <li key={account.email}>
            <button
              type="button"
              disabled={pendingEmail !== null}
              onClick={() => onUse(account.email)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">
                  Log in as {account.name} <span className="font-normal text-[#bfdbfe]">· {account.role}</span>
                </span>
                <span className="block truncate text-sm text-[#bfdbfe]">{account.email}</span>
                <span className="block text-sm text-[#dbeafe]">{account.note}</span>
              </span>
              {pendingEmail === account.email && <Spinner className="size-5 text-white" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
