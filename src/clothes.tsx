import type { ReactElement } from "react";

export interface ClothingItem {
  id: string;
  label: string;
  svgLayer: ReactElement;
}

export interface Preset {
  id: string;
  label: string;
  emoji: string;
  itemIds: string[];
}

export const clothingItems: ClothingItem[] = [
  {
    id: "czapka-zimowa",
    label: "Czapka zimowa",
    svgLayer: (
      <g key="czapka-zimowa">
        <rect x="178" y="8" width="64" height="32" rx="5" fill="#c0392b" />
        <rect x="168" y="33" width="84" height="12" rx="4" fill="#922b21" />
        <circle cx="210" cy="7" r="9" fill="#e74c3c" />
      </g>
    ),
  },
  {
    id: "czapka-letnia",
    label: "Czapka z daszkiem",
    svgLayer: (
      <g key="czapka-letnia">
        <path d="M 172 32 Q 172 0 210 0 Q 248 0 248 32 Z" fill="#27ae60" />
        <ellipse cx="210" cy="32" rx="38" ry="6" fill="#1e8449" />
        <path d="M 172 32 Q 150 38 152 32 Q 158 22 172 28 Z" fill="#1e8449" />
      </g>
    ),
  },
  {
    id: "szalik",
    label: "Szalik",
    svgLayer: (
      <g key="szalik">
        <rect x="186" y="90" width="48" height="20" rx="4" fill="#8e44ad" />
        <rect x="200" y="106" width="16" height="36" rx="3" fill="#8e44ad" />
      </g>
    ),
  },
  {
    id: "kurtka",
    label: "Kurtka",
    svgLayer: (
      <g key="kurtka">
        <rect x="158" y="138" width="104" height="108" fill="#2c3e50" />
        <rect x="14" y="150" width="144" height="30" fill="#2c3e50" />
        <rect x="262" y="150" width="144" height="30" fill="#2c3e50" />
        <line
          x1="210"
          y1="145"
          x2="210"
          y2="246"
          stroke="#95a5a6"
          strokeWidth="3"
        />
      </g>
    ),
  },
  {
    id: "bluza",
    label: "Bluza",
    svgLayer: (
      <g key="bluza">
        <rect x="158" y="138" width="104" height="108" fill="#7f8c8d" />
        <rect x="100" y="150" width="58" height="30" fill="#7f8c8d" />
        <rect x="262" y="150" width="58" height="30" fill="#7f8c8d" />
      </g>
    ),
  },
  {
    id: "koszulka",
    label: "Koszulka",
    svgLayer: (
      <g key="koszulka">
        <rect x="158" y="138" width="104" height="80" fill="#5dade2" />
        <rect x="110" y="150" width="48" height="28" fill="#5dade2" />
        <rect x="262" y="150" width="48" height="28" fill="#5dade2" />
      </g>
    ),
  },
  {
    id: "rekawiczki",
    label: "Rękawiczki",
    svgLayer: (
      <g key="rekawiczki">
        <rect x="14" y="150" width="28" height="30" rx="8" fill="#c0392b" />
        <rect x="378" y="150" width="28" height="30" rx="8" fill="#c0392b" />
      </g>
    ),
  },
  {
    id: "spodnie",
    label: "Spodnie",
    svgLayer: (
      <g key="spodnie">
        <rect x="158" y="220" width="104" height="26" fill="#2c3e50" />
        <rect x="166" y="246" width="42" height="118" fill="#2c3e50" />
        <rect x="212" y="246" width="42" height="118" fill="#2c3e50" />
      </g>
    ),
  },
  {
    id: "spodenki",
    label: "Spodenki",
    svgLayer: (
      <g key="spodenki">
        <rect x="158" y="220" width="104" height="26" fill="#e67e22" />
        <rect x="166" y="246" width="42" height="50" fill="#e67e22" />
        <rect x="212" y="246" width="42" height="50" fill="#e67e22" />
      </g>
    ),
  },
  {
    id: "buty",
    label: "Buty",
    svgLayer: (
      <g key="buty">
        <rect x="158" y="338" width="56" height="26" rx="4" fill="#6d4c41" />
        <rect x="208" y="338" width="56" height="26" rx="4" fill="#6d4c41" />
      </g>
    ),
  },
];

export const presets: Preset[] = [
  {
    id: "zima",
    label: "Zima",
    emoji: "❄️",
    itemIds: [
      "czapka-zimowa",
      "szalik",
      "kurtka",
      "spodnie",
      "buty",
      "rekawiczki",
    ],
  },
  {
    id: "lato",
    label: "Lato",
    emoji: "☀️",
    itemIds: ["czapka-letnia", "koszulka", "spodenki", "buty"],
  },
  {
    id: "jesien",
    label: "Jesień",
    emoji: "🍂",
    itemIds: ["bluza", "spodnie", "buty"],
  },
  {
    id: "pusto",
    label: "Pusto",
    emoji: "🫥",
    itemIds: [],
  },
];
