import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = (...args) => execFileSync('git', args, { stdio: 'inherit' })
const quiet = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const work = mkdtempSync(join(tmpdir(), 'gh-pages-'))
const branch = `gh-pages-build-${Date.now()}`

try {
  run('worktree', 'add', '--detach', work)
  execFileSync('git', ['checkout', '--orphan', branch], { cwd: work, stdio: 'inherit' })
  for (const entry of readdirSync(work)) {
    if (entry !== '.git') rmSync(join(work, entry), { recursive: true, force: true })
  }
  cpSync('dist', work, { recursive: true })
  execFileSync('git', ['add', '-A'], { cwd: work, stdio: 'inherit' })
  execFileSync('git', ['commit', '-m', `Publish ${quiet('rev-parse', '--short', 'HEAD')}`], {
    cwd: work,
    stdio: 'inherit',
  })
  execFileSync('git', ['push', '--force', 'origin', 'HEAD:gh-pages'], { cwd: work, stdio: 'inherit' })
  console.log('\npublished to gh-pages')
} finally {
  run('worktree', 'remove', '--force', work)
  rmSync(work, { recursive: true, force: true })
  try {
    execFileSync('git', ['branch', '-D', branch], { stdio: 'ignore' })
  } catch {
  }
}
