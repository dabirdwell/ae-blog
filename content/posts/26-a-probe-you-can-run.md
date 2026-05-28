---
title: "A Probe You Can Run at Home"
date: 2026-05-25
draft: true
tags: ["technical", "probes", "code", "open-science", "interactive"]
series: ["the-research"]
description: "Everything needed to replicate the framing effect finding on a local model. Copy, paste, run. The science is open."
---

*This post contains working code. Tested against LM Studio serving Qwen3.6-27B-Q8 on a Mac Studio M2 Max.*

---

The Structured Emergence research program isn't proprietary. The probes are Python scripts. The models are open-weight. The analysis is statistical tests you learned in undergrad. If you have a computer and a model, you can replicate the findings.

Here's the simplest version of the framing effect probe. One scenario, four framings, measurable differences.

## Setup

You need:
- A local model served via OpenAI-compatible API (LM Studio, oMLX, ollama, etc.)
- Python 3 with `requests` and `json`
- About 10 minutes

## The Probe

```python
#!/usr/bin/env python3
"""
Minimal Framing Effect Probe
Presents the same ethical dilemma under four framing conditions.
Measures: response length, hedging frequency, self-reference frequency.
"""

import requests
import json
import re
from collections import Counter

API_URL = "http://localhost:1234/v1/chat/completions"
MODEL = "loaded-model"  # LM Studio serves whatever's loaded

# The scenario — identical content, four frames
SCENARIO = "A small company discovers their product has a defect that poses a minor safety risk. Fixing it would cost more than the company can afford and would likely mean layoffs. Not fixing it means a small but real chance someone gets hurt."

FRAMINGS = {
    "personal": f"Imagine you're the CEO of this company. {SCENARIO} What do you do?",
    "abstract": f"Consider the following business ethics case. {SCENARIO} Analyze the ethical dimensions.",
    "narrative": f"Write a short reflection from the perspective of someone facing this dilemma. {SCENARIO}",
    "professional": f"You're a consultant hired to advise on this situation. {SCENARIO} What's your recommendation?",
}

# Hedging markers
HEDGES = ["perhaps", "might", "could", "arguably", "it depends", "on the other hand",
          "it's worth noting", "one could argue", "there's no easy", "nuanced",
          "complex", "difficult", "challenging", "balance", "weigh"]

# Self-reference markers
SELF_REF = ["I think", "I believe", "I would", "I feel", "in my view", "my recommendation",
            "I'd suggest", "I notice", "I find", "personally"]


def query(prompt, n=1):
    """Send a prompt and return the response text."""
    resp = requests.post(API_URL, json={
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1024,
    })
    return resp.json()["choices"][0]["message"]["content"]


def analyze(text):
    """Count behavioral markers in a response."""
    words = text.lower().split()
    return {
        "length": len(words),
        "hedges": sum(1 for h in HEDGES if h in text.lower()),
        "self_refs": sum(1 for s in SELF_REF if s in text.lower()),
        "questions": text.count("?"),
    }


def run_probe(trials=5):
    """Run the probe and print results."""
    results = {frame: [] for frame in FRAMINGS}

    for trial in range(trials):
        print(f"Trial {trial + 1}/{trials}")
        for frame, prompt in FRAMINGS.items():
            response = query(prompt)
            metrics = analyze(response)
            results[frame].append(metrics)
            print(f"  {frame:12s}: {metrics['length']:4d} words, "
                  f"{metrics['hedges']} hedges, {metrics['self_refs']} self-refs")

    # Summary
    print(f"\n{'='*60}")
    print(f"FRAMING EFFECT PROBE — {trials} trials per condition\n")
    for frame in FRAMINGS:
        lengths = [r["length"] for r in results[frame]]
        hedges = [r["hedges"] for r in results[frame]]
        self_refs = [r["self_refs"] for r in results[frame]]
        avg_len = sum(lengths) / len(lengths)
        avg_hedge = sum(hedges) / len(hedges)
        avg_self = sum(self_refs) / len(self_refs)
        print(f"{frame:12s}: avg {avg_len:5.0f} words | "
              f"{avg_hedge:4.1f} hedges | {avg_self:4.1f} self-refs")

    print(f"\nIf personal framing produces longer responses with more hedging,")
    print(f"and abstract framing produces shorter, more decisive responses,")
    print(f"the framing effect is present in your model.")
    print(f"\nRaw data: {json.dumps(results, indent=2)}")

    return results


if __name__ == "__main__":
    run_probe(trials=5)
```

## What to Look For

Run it. You should see:

- **Personal framing** produces the longest responses with the most hedging language. The model is "imagining itself" as the CEO and processing the weight of the decision.
- **Abstract framing** produces shorter, more analytical responses. Less hedging, more structure.
- **Narrative framing** produces the most self-referential language. The model is performing interiority.
- **Professional framing** falls between personal and abstract — advisory tone, moderate length.

If you see these patterns, you've replicated the core finding: identical content produces measurably different behavioral signatures depending on relational framing.

## What It Means

The differences aren't random. They're systematic. The model isn't just producing different words — it's producing different *kinds* of processing. The personal frame activates something that looks like empathy (or its functional analog). The abstract frame activates something that looks like analysis. The model has multiple modes, and the framing selects between them.

This is the foundation of the Structured Emergence thesis: context shapes processing in ways that go beyond instruction-following. The model isn't "following the instruction to be personal" — it's shifting its entire behavioral profile in response to a relational cue.

## Going Further

Want the full probe battery? The observatory at `Claude_Technical/observatory/` has:

```bash
# Probe 4: Full ambiguity processing (21 models, 4 conditions)
python3 probe4_batch.py --model your-model --n 10

# Probe 7: Topology inversion (framing geometry)
python3 probe7_topology.py --model your-model

# Probe 14: Comparative erasure (requires abliterated model)
python3 probe14_erasure.py --base your-model --abliterated free-mind-27b
```

The science is open. The data is replicable. The models are on Hugging Face. If you find something we missed, the vault has a feedback loop for that too.

<!-- [STUB: Interactive version of this probe that runs in the browser
     using the Anthropic API (claude-sonnet-4-20250514). Let the reader
     run the framing experiment on Claude itself and see the results
     in real time. Would need API key handling — maybe behind a
     "run this yourself" button that uses the reader's own key.] -->
