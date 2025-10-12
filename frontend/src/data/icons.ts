import { createElement, type ComponentType, type SVGProps } from "react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const createGlyph = (glyph: string): IconComponent =>
  (({ className, ...props }) =>
    createElement(
      "svg",
      {
        className,
        viewBox: "0 0 16 16",
        ...props,
        "aria-hidden": "true",
        focusable: "false",
      },
      createElement(
        "text",
        {
          x: "50%",
          y: "50%",
          dominantBaseline: "central",
          textAnchor: "middle",
          fontSize: "10",
          fill: "currentColor",
        },
        glyph,
      ),
    )) as IconComponent;

const ICONS = {
  branch: createGlyph("⎇"),
  switch: createGlyph("⇄"),
  loop: createGlyph("⟲"),
  clock: createGlyph("⏱"),
  target: createGlyph("🎯"),
  id: createGlyph("#"),
  list: createGlyph("☰"),
  creep: createGlyph("⚙"),
  harvest: createGlyph("⛏"),
  transfer: createGlyph("⇆"),
  repair: createGlyph("🔧"),
  upgrade: createGlyph("⬆"),
  attack: createGlyph("⚔"),
  heal: createGlyph("✚"),
  structure: createGlyph("🏗"),
  tower: createGlyph("🗼"),
  link: createGlyph("🔗"),
  terminal: createGlyph("📦"),
  memory: createGlyph("💾"),
  task: createGlyph("📝"),
  flow: createGlyph("▶"),
} as const;

export type IconKey = keyof typeof ICONS;

export const getIconComponent = (key: string | undefined): IconComponent | undefined => {
  if (!key) {
    return undefined;
  }
  return ICONS[key as IconKey] ?? undefined;
};
