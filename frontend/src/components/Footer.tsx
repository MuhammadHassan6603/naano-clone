export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl leading-6">
          A rebuild of naano.com made for an 8x take-home assignment. Not affiliated with naano. Accounts and bookings
          are real records in a real database, but all money is demo money: no card is charged and nothing is paid out.
        </p>
        <a
          href="https://github.com/MuhammadHassan6603/naano-clone"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-semibold text-ink underline-offset-4 hover:underline"
        >
          Source code on GitHub
        </a>
      </div>
    </footer>
  )
}
