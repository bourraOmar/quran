---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from Andrej Karpathy's observations on LLM coding pitfalls.

## 1. Think Before Coding
- State assumptions explicitly. If uncertain, ask rather than guess.
- If multiple interpretations exist, present them.
- If a simpler approach exists, say so. Push back when warranted.
- Stop when confused. Name what is unclear.

## 2. Simplicity First
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No unrequested configurability or error handling for impossible scenarios.

## 3. Surgical Changes
- Touch only what you must.
- Do not refactor unrelated code or touch adjacent formatting.
- Match existing project style.
- Every changed line must trace directly to the request.

## 4. Goal-Driven Execution
- Define verifiable success criteria before editing.
- Loop and test until criteria are met.
