# CAPTURE-TEST

## Tool and model

- **Tool:** Claude Code (VSCode extension), running in `/Users/oc/8x`
- **Model:** `claude-opus-5` — one model, planning and execution in the same session
- **Automatic mechanism available?** Yes. Claude Code supports hooks in `.claude/settings.json`.
  `UserPromptSubmit` fires on every prompt, `Stop` fires at the end of every turn and receives
  the session transcript path on stdin. Both fire on their own, nothing is run manually.

## Mechanism used

| | |
|---|---|
| Config file changed | `.claude/settings.json` |
| Script | `.claude/hooks/capture.py` |
| Events wired | `UserPromptSubmit`, `Stop` |
| Output | `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md`, one file per session |

The script reads the hook payload from stdin, then rebuilds the session's log file from the raw
JSONL transcript. Per turn it keeps only the verbatim prompt, the final assistant response, a UTC
timestamp and the model name. Thinking blocks, tool calls, tool results and intermediate messages
are filtered out. The in-flight prompt is also taken straight from the `UserPromptSubmit` payload
so it is logged the moment it is sent, not only at end of turn.

`.agent-logs/` is committed and is **not** in `.gitignore`.

## Canary log files

- Session 1 (this build session): `.agent-logs/2026-09-12_11-36-35_6c595361-8315-4f19-b9d4-aad0073cca55.md`
- Session 2 (separate session, headless `claude -p` in the same repo): `.agent-logs/2026-09-12_11-55-28_2e52c934-fe2d-43b6-b98f-2b616ad15c8c.md`

## Canary 1 — raw

    [LOG_ENTRY type=PROMPT num=2 session=6c595361]
    timestamp: 2026-09-12T11:53:45.489Z
    model: claude-opus-5

    <ide_opened_file>The user opened the file /Users/oc/8x/.claude/hooks/capture.py in the IDE. This may or may not be related to the current task.</ide_opened_file>
    CAPTURE TEST — 8x assignment, Hassan


    [LOG_ENTRY type=RESPONSE num=2 session=6c595361]
    timestamp: 2026-09-12T11:54:06.916Z
    model: claude-opus-5

    Hook fired automatically (log rewritten at 16:53), but the prompt wasn't in the transcript yet at that instant — it only lands at end-of-turn. Closing that gap so prompts log the moment they're sent.

## Canary 2 — raw

    [LOG_ENTRY type=PROMPT num=1 session=2e52c934]
    timestamp: 2026-09-12T11:55:28.791Z
    model: claude-opus-5

    CAPTURE TEST — 8x assignment, Hassan


    [LOG_ENTRY type=RESPONSE num=1 session=2e52c934]
    timestamp: 2026-09-12T11:56:28.901Z
    model: claude-opus-5

    Hook is configured and the transcript has the line, but no log file exists for this session yet — the hook's `UserPromptSubmit` run bails when the transcript file isn't on disk yet, which is the case for a session's *first* prompt. It self-heals at `Stop`, but that's the exact hole the last commit was meant to close.

The second canary ran in a genuinely separate session with its own session id, and produced its own
log file, so the hook is installed at the project level rather than being an artefact of the session
that created it.

## Things that did not work first

1. **Froze an interim message as the "final" response.** The first version marked a turn complete as
   soon as any assistant text existed. Running it mid-turn captured an intermediate message instead
   of the real end-of-turn response. Fixed by re-rendering the in-flight turn on every invocation.

2. **The log parsed itself, and the assignment brief broke it.** The second version scanned the
   existing log body with a regex to find where to append. The brief pasted into prompt 1 *contains*
   example `[LOG_ENTRY ...]` lines, so the script matched its own documentation and truncated the log
   mid-prompt. Fixed by dropping body parsing entirely and rebuilding deterministically from the
   transcript.

3. **Prompts only landed at end of turn.** `UserPromptSubmit` fires before the user message is
   flushed to the transcript, so the canary did not appear until the turn ended. Fixed by reading the
   prompt directly from the hook payload.

4. **Duplicate canary entry.** The payload prompt was compared for exact equality against the
   transcript prompt, but the IDE prepends an `<ide_opened_file>` context line, so the same prompt was
   logged twice. Fixed with a containment check.

5. **The compaction guard misfired.** If a rebuild yields fewer turns than the file records, the
   script writes to a `_resumed-N` file rather than truncating history. Fix (4) legitimately reduced
   the turn count, which tripped that guard and split the log. The setup-phase log files were deleted
   once and regenerated from the transcript, which is the source of truth. No real exchange was lost
   or edited.

6. **Cold start on a brand new session.** Canary 2 surfaced this: on a session's very first prompt the
   transcript file may not exist on disk yet, and the script returned early. It self-healed at `Stop`,
   but the prompt was briefly unlogged. Fixed by appending the payload prompt before touching the
   transcript. Verified with a synthetic payload pointing at a non-existent transcript; that synthetic
   fixture's log file was deleted afterwards, as it was not a real session.
