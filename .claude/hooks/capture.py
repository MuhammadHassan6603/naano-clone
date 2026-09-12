#!/usr/bin/env python3
"""8x assignment capture hook: rebuilds .agent-logs/<session>.md from the session transcript.

Fires automatically on UserPromptSubmit and Stop (see .claude/settings.json).
Captures only the verbatim prompt and the final assistant response of each turn.
"""
import datetime
import glob
import json
import os
import re
import sys

AUTHOR = "MuhammadHassan6603"
PROJECT = "naano-rebuild"
TOOL = "claude-code"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOGDIR = os.path.join(ROOT, ".agent-logs")


def text_of(content):
    if isinstance(content, str):
        return content.strip()
    if not isinstance(content, list):
        return ""
    parts = [b.get("text", "") for b in content
             if isinstance(b, dict) and b.get("type") == "text"]
    return "\n".join(p for p in parts if p).strip()


def is_prompt(entry):
    if entry.get("type") != "user" or entry.get("isMeta"):
        return False
    content = entry.get("message", {}).get("content")
    if isinstance(content, list) and any(
            isinstance(b, dict) and b.get("type") == "tool_result" for b in content):
        return False
    body = text_of(content)
    return bool(body) and not body.startswith("<local-command")


def read_turns(transcript):
    turns, current = [], None
    with open(transcript, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if is_prompt(entry):
                if current:
                    turns.append(current)
                current = {"prompt": text_of(entry["message"]["content"]),
                           "prompt_time": entry.get("timestamp", ""),
                           "model": "", "response": "", "response_time": ""}
            elif current and entry.get("type") == "assistant":
                message = entry.get("message", {})
                current["model"] = message.get("model") or current["model"]
                body = text_of(message.get("content"))
                if body:
                    current["response"] = body
                    current["response_time"] = entry.get("timestamp", "")
    if current:
        turns.append(current)
    return turns


def render(turn, num, short):
    model = turn["model"] or "unknown"
    block = [f"[LOG_ENTRY type=PROMPT num={num} session={short}]",
             f"timestamp: {turn['prompt_time']}", f"model: {model}", "", turn["prompt"], ""]
    if turn["response"]:
        block += ["", f"[LOG_ENTRY type=RESPONSE num={num} session={short}]",
                  f"timestamp: {turn['response_time']}", f"model: {model}", "",
                  turn["response"], ""]
    return "\n".join(block)


def main():
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return
    session = payload.get("session_id") or "unknown"
    transcript = payload.get("transcript_path") or ""

    turns = read_turns(transcript) if os.path.exists(transcript) else []
    pending = (payload.get("prompt") or "").strip()
    if pending and (not turns or pending not in turns[-1]["prompt"]):
        turns.append({"prompt": pending,
                      "prompt_time": datetime.datetime.now(datetime.timezone.utc)
                      .strftime("%Y-%m-%dT%H:%M:%S.") + f"{datetime.datetime.now().microsecond // 1000:03d}Z",
                      "model": turns[-1]["model"] if turns else "",
                      "response": "", "response_time": ""})
    if not turns:
        return

    os.makedirs(LOGDIR, exist_ok=True)
    short = session[:8]
    existing = sorted(glob.glob(os.path.join(LOGDIR, f"*_{session}*.md")))
    started = turns[0]["prompt_time"]
    path = existing[0] if existing else os.path.join(
        LOGDIR, f"{started[:10]}_{started[11:19].replace(':', '-')}_{session}.md")

    if existing:
        with open(path, encoding="utf-8") as fh:
            head = fh.read(600)
        previous = re.search(r"^total_exchanges: (\d+)$", head, re.M)
        if previous and len(turns) < int(previous.group(1)):
            path = path[:-3] + f"_resumed-{len(existing)}.md"

    frontmatter = "\n".join([
        "---",
        f"session_id: {session}",
        f"date: {started[:10]}",
        f"author: {AUTHOR}",
        f"model: {turns[-1]['model'] or 'unknown'}",
        f"tool: {TOOL}",
        f"project: {PROJECT}",
        f"total_exchanges: {len(turns)}",
        f"first_prompt_time: {started}",
        f"last_prompt_time: {turns[-1]['prompt_time']}",
        "---", "",
        f"# Session Log - {started[:10]}", "",
        f"Session: `{short}` | Project: `{PROJECT}` | Author: `{AUTHOR}`", "",
        "---", "", "",
    ])
    entries = "\n\n".join(render(t, i, short) for i, t in enumerate(turns, start=1))
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(frontmatter + entries.rstrip("\n") + "\n")


if __name__ == "__main__":
    main()
