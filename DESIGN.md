---
name: Party Paper
description: The social paper press
colors:
  primary: "#633c76"
  ground: "#fff9ef"
  ink: "#3b2448"
  accent: "#de593a"
  muted: "#6c526d"
typography:
  display:
    fontFamily: "Party (Rubik Bold)"
    fontWeight: 700
    letterSpacing: "-0.035em"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.65
rounded:
  control: "6px"
spacing:
  compact: "12px"
  regular: "24px"
---

# Design System: Party Paper

## Overview

**Creative North Star: "The social paper press"**

Plum typography, coral accents and warm paper frame a real printable preview. Layered sample sheets introduce the product; generated output remains plain and legible for printing.

## Colors

The primary accent distinguishes actionable controls. Neutral surfaces provide hierarchy without decorative gradients.

## Typography

Self-hosted Party (Rubik Bold) carries display and brand text. System sans supports form labels and explanatory copy. Monospace is reserved for subtitle data, timestamps and puzzle grids. Fonts are subset and licensed under SIL OFL; notices are in assets/.

## Layout

A 1380px maximum container uses fluid horizontal padding. The desktop hero is asymmetric and two-column. The working area stacks on narrow screens. The main task remains accessible through a skip link and header navigation.

## Elevation & Depth

Offset soft shadows distinguish real sheet layers. Interface structure uses spacing, background and restrained borders.

## Shapes

Small-radius controls contrast with the focal paper sheets and round pager controls.

## Components

Primary actions carry the accent. Disabled controls cannot export stale results. All fields have labels, visible focus and recovery text. The preview pager browses every generated sheet, including the answer key. Printing hides the interface and exports only generated sheets.

## Do's and Don'ts

- Do preserve useful feedback under reduced motion.
- Do keep all input and processing local.
- Do keep print styles separate from screen preview styles.
- Don't introduce invented proof, fake customers or fake advertising.
- Don't make routine tasks wait for decoration.
