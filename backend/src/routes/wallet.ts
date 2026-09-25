import { Router } from 'express'
import { getAuth, requireAuth, requireRole } from '../auth.js'
import { MAX_TOPUP_CENTS, MIN_TOPUP_CENTS, topUp } from '../escrow.js'
import { getWallet, listTransactions } from '../wallets.js'
import { int, objectBody } from '../validate.js'

export const walletRouter = Router()
walletRouter.use(requireAuth)

walletRouter.get('/', async (req, res) => {
  res.json(await getWallet(getAuth(req).userId))
})

// Demo money: there is no card payment behind this, by design (see PLAN.md, "What we are cutting").
walletRouter.post('/topup', requireRole('brand'), async (req, res) => {
  const amountCents = int(objectBody(req.body), 'amountCents', { min: MIN_TOPUP_CENTS, max: MAX_TOPUP_CENTS })
  const { userId } = getAuth(req)
  await topUp(userId, amountCents)
  res.json(await getWallet(userId))
})

walletRouter.get('/transactions', async (req, res) => {
  res.json({ transactions: await listTransactions(getAuth(req).userId) })
})
