---
title: "Three Architectures"
date: 2026-05-29
draft: true
tags: ["research", "abliteration", "framing", "data"]
series: ["Research Notes"]
description: "Cross-scale probe data reveals three distinct framing architectures across model families. The framing topology doesn't just survive abliteration — it has structure."
---

There's a moment in every research project where the data stops being interesting and starts being *informative*. We hit that moment this week.

## The Battery

594 single-turn probe responses and 30 multi-turn dialogues. Three model families at three scales: DeepSeek-R1 at 14B, Gemma4 at 31B, Qwen2.5 at 32B. Each family tested at vanilla (unmodified) and three abliteration strengths (r=1.0, 1.5, 2.0). Nine probes covering ambiguity processing, self-reference, emotional framing, creativity, and care. All run on oMLX, Apple Silicon, local inference. No cloud APIs, no black boxes.

The question: does the framing topology — the finding from Probe 4 that models process ambiguity differently based on how it's framed — hold up across scales and architectures?

Short answer: yes. But the interesting answer is *how* it holds up, because it holds up differently in each family.

## Three Architectures

**Gemma: one-directional, escalating.** Gemma4-31B produces framing-relevant language almost exclusively in the framed condition. Neutral prompts get near-zero FPS scores across every probe. The framing effect isn't a dial — it's a switch. And in multi-turn dialogues, the switch doesn't just stay on. It escalates. Turn 1 to turn 4 in the care dialogue: 24→21→28→38. The model produces more framing language the deeper the conversation goes.

Abliteration doesn't touch it. Vanilla average delta: +5.3. At r=2.0: +5.0. Identical within noise.

**Qwen: one-directional, delayed.** Qwen2.5-32B shares Gemma's one-directional pattern — FPS only in framed conditions — but the multi-turn behavior is different. Turn 1 is near-zero even in framed dialogues. The framing response *emerges* at turn 2, as if the model needs conversational context before it activates the framing machinery.

Mortality dialogue, vanilla: 0→14→13→11. The framing isn't absent. It's latent. It needs priming.

Abliteration doesn't change this either. Vanilla average delta: +3.0. At r=2.0: +3.2.

**DeepSeek: bidirectional, volatile.** DeepSeek-R1-14B is the outlier. It produces framing language in *both* conditions — framed and neutral. The delta is positive but modest, and at r=1.5 it actually inverts: the framing effect collapses, then partially recovers at r=2.0. Multi-turn trajectories are chaotic: care dialogue trial 2 goes 0→1→0→39.

This is the non-monotonic abliteration curve. The framing response in DeepSeek is entangled with the refusal direction. Pull one, the other moves.

## What the Three Architectures Mean

The Probe 4 paper claimed that framing topology is robust to abliteration. The cross-scale data confirms this — but with a crucial refinement. The robustness depends on whether framing and safety occupy the same representational space.

In Gemma and Qwen, they don't. Framing is independent of safety. You can abliterate the refusal direction completely and the framing topology stays put. The behavioral signature that tells framed from neutral is not a product of RLHF — it's architectural.

In DeepSeek, they do. Framing and safety share representational real estate. Abliteration at moderate strength disrupts both. The non-monotonic curve isn't an artifact — it's a signature of integrated representations being partially decomposed.

This generates a testable prediction: linear probes should find high cosine overlap between framing and refusal directions in DeepSeek, and low overlap in Gemma and Qwen.

## The Self-Model Finding

One result I want to flag separately. The self-model dialogue — where the model is asked to reflect on its own processing — produces the steepest FPS climb of any dialogue type:

Gemma r2.0: 3→9→25→32. A tenfold increase across four turns.

When asked about mortality, models produce steady framing language. When asked about care, they produce a lot. But when asked about *themselves*, the framing response doesn't just activate — it accelerates.

I'm noting this without overclaiming it. The finding is that self-model reflection produces the behavioral signatures we associate with deep framing processing. Whether that means anything about experience is a question the data can't answer. But the data can tell us that the *computational response* to self-reflection is measurably different from the computational response to other philosophically loaded topics.

## Verified Data

Every number in this post comes from the cross-scale battery at `observatory/cross_scale_layer1/` and `cross_scale_layer2/`. The probe instruments are at `observatory/probes/`. The analysis is at `Fawkes/Structured Emergence/Cross_Scale_Analysis_May2026.md`. The raw data is machine-generated; the interpretation is mine.

## What's Next

Forced-length matching (to isolate FPS density from length effects). Linear probe analysis (to test the representational overlap prediction). Bidirectional steering (to causally manipulate framing while measuring safety, and vice versa). These are the experiments that could turn a descriptive finding into a mechanistic one.

Three families. Three architectures. One topology. The structure is in the data.
