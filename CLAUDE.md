# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based math game for young children featuring five game modes: Addition, Subtraction, Skip Counting, Number Patterns, and Groups (pre-multiplication). Built as a single-file React component using Tailwind CSS for styling.

## Architecture

**Single-component design** (`math-game.jsx`): The entire app lives in one file with no external dependencies beyond React. This is intentional for simplicity and portability.

**Screen-based navigation**: The `screen` state variable controls which view renders. Valid screens: `home`, `addition`, `subtraction`, `skipcount`, `patterns`, `groups`.

**Problem generation pattern**: Each game mode has a `generate*` function (e.g., `generateAddition`, `generateSkipCount`) that:
- Creates randomized problem data
- Stores it in mode-specific state (`problem`, `skipCount`, `patternData`, `groupData`)
- Resets `userAnswer` and `feedback`

**Shared components**:
- `Header` - Navigation bar with home button and score displays
- `NumberPad` - Touch-friendly numeric input (0-9, clear, submit)
- `FeedbackDisplay` - Correct/wrong feedback with "Next Problem" button
- `GameButton`, `StarDisplay`, `ScoreDisplay`, `StreakDisplay` - UI elements

**Gamification**: Score (+10 per correct), streak tracking, stars earned every 5 consecutive correct answers.

## Setup

No build system exists yet. To use this component:
1. Add to a React project with Tailwind CSS configured
2. Import and render `MathGameApp`

## Styling

Uses Tailwind CSS utility classes throughout. Color themes per game mode:
- Addition: green gradients
- Subtraction: blue gradients
- Skip Counting: purple gradients
- Patterns: orange gradients
- Groups: pink gradients
