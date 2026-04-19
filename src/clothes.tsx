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
        <path
          d="M 172 26 Q 172 0 210 0 Q 248 0 248 26 L 248 30 L 172 30 Z"
          fill="#b63f34"
          stroke="#74261f"
          strokeWidth="2"
        />
        <rect
          x="166"
          y="25"
          width="88"
          height="13"
          rx="6"
          fill="#8f2e27"
          stroke="#6c211b"
          strokeWidth="1.5"
        />
        <path
          d="M 176 18 Q 210 10 244 18"
          fill="none"
          stroke="#d96f65"
          strokeWidth="2"
          opacity="0.7"
        />
        <circle cx="210" cy="4" r="8" fill="#e2776e" stroke="#8a322a" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    id: "czapka-letnia",
    label: "Czapka z daszkiem",
    svgLayer: (
      <g key="czapka-letnia">
        <path
          d="M 172 28 Q 172 0 210 0 Q 248 0 248 28 Z"
          fill="#2f9d63"
          stroke="#1f6d45"
          strokeWidth="2"
        />
        <path
          d="M 172 28 Q 154 34 154 27 Q 158 15 177 20 Z"
          fill="#1f6d45"
        />
        <ellipse cx="210" cy="28" rx="38" ry="6.5" fill="#207449" />
        <path d="M 206 2 L 214 2 L 214 22" stroke="#165235" strokeWidth="2" />
      </g>
    ),
  },
  {
    id: "szalik",
    label: "Szalik",
    svgLayer: (
      <g key="szalik">
        <path
          d="M 182 94 Q 210 82 238 94 L 236 110 Q 210 100 184 110 Z"
          fill="#7d3da0"
          stroke="#5c2d78"
          strokeWidth="2"
        />
        <path
          d="M 198 108 C 200 132 200 150 202 170 L 220 170 C 220 146 218 126 216 106"
          fill="#8c49b3"
          stroke="#5c2d78"
          strokeWidth="2"
        />
        <line x1="189" y1="101" x2="232" y2="101" stroke="#a96bc7" strokeWidth="2" opacity="0.7" />
        <line x1="205" y1="166" x2="216" y2="166" stroke="#caa1dd" strokeWidth="2" />
      </g>
    ),
  },
  {
    id: "kurtka",
    label: "Kurtka",
    svgLayer: (
      <g key="kurtka">
        <path
          d="M 158 138 Q 210 126 262 138 L 262 246 L 158 246 Z"
          fill="#2f4152"
          stroke="#1f2b35"
          strokeWidth="2"
        />
        <path d="M 14 150 Q 72 144 158 152 L 158 184 Q 70 180 14 186 Z" fill="#2f4152" stroke="#1f2b35" strokeWidth="2" />
        <path d="M 406 150 Q 348 144 262 152 L 262 184 Q 350 180 406 186 Z" fill="#2f4152" stroke="#1f2b35" strokeWidth="2" />
        <path d="M 196 138 L 210 160 L 224 138" fill="#3f5569" />
        <line x1="210" y1="142" x2="210" y2="246" stroke="#b7c4cf" strokeWidth="3" />
        <circle cx="210" cy="170" r="2" fill="#dbe4ea" />
        <circle cx="210" cy="186" r="2" fill="#dbe4ea" />
        <circle cx="210" cy="202" r="2" fill="#dbe4ea" />
      </g>
    ),
  },
  {
    id: "bluza",
    label: "Bluza",
    svgLayer: (
      <g key="bluza">
        <path
          d="M 158 138 Q 210 132 262 138 L 262 246 L 158 246 Z"
          fill="#6e7c87"
          stroke="#4d5860"
          strokeWidth="2"
        />
        <path d="M 100 150 Q 126 146 158 152 L 158 180 Q 124 178 100 182 Z" fill="#6e7c87" stroke="#4d5860" strokeWidth="2" />
        <path d="M 320 150 Q 294 146 262 152 L 262 180 Q 296 178 320 182 Z" fill="#6e7c87" stroke="#4d5860" strokeWidth="2" />
        <rect x="186" y="136" width="48" height="12" rx="4" fill="#55616b" />
        <line x1="210" y1="152" x2="210" y2="240" stroke="#83919c" strokeWidth="2" opacity="0.55" />
      </g>
    ),
  },
  {
    id: "koszulka",
    label: "Koszulka",
    svgLayer: (
      <g key="koszulka">
        <path
          d="M 158 138 L 190 138 L 198 148 L 222 148 L 230 138 L 262 138 L 262 218 L 158 218 Z"
          fill="#53a8da"
          stroke="#2f7fae"
          strokeWidth="2"
        />
        <path d="M 110 150 Q 132 148 158 156 L 158 178 Q 132 176 110 178 Z" fill="#53a8da" stroke="#2f7fae" strokeWidth="2" />
        <path d="M 310 150 Q 288 148 262 156 L 262 178 Q 288 176 310 178 Z" fill="#53a8da" stroke="#2f7fae" strokeWidth="2" />
        <path d="M 198 148 Q 210 162 222 148" fill="none" stroke="#b7e2f9" strokeWidth="2" />
      </g>
    ),
  },
  {
    id: "rekawiczki",
    label: "Rękawiczki",
    svgLayer: (
      <g key="rekawiczki">
        <path
          d="M 14 150 Q 14 138 26 138 L 36 138 Q 46 138 46 148 L 46 176 Q 46 186 36 186 L 26 186 Q 14 186 14 174 Z"
          fill="#bc4337"
          stroke="#7d2a23"
          strokeWidth="2"
        />
        <path d="M 40 150 Q 52 150 54 162 Q 52 172 42 172" fill="#bc4337" stroke="#7d2a23" strokeWidth="2" />
        <path
          d="M 406 150 Q 406 138 394 138 L 384 138 Q 374 138 374 148 L 374 176 Q 374 186 384 186 L 394 186 Q 406 186 406 174 Z"
          fill="#bc4337"
          stroke="#7d2a23"
          strokeWidth="2"
        />
        <path d="M 380 150 Q 368 150 366 162 Q 368 172 378 172" fill="#bc4337" stroke="#7d2a23" strokeWidth="2" />
      </g>
    ),
  },
  {
    id: "spodnie",
    label: "Spodnie",
    svgLayer: (
      <g key="spodnie">
        <path d="M 158 220 L 262 220 L 258 246 L 162 246 Z" fill="#33485b" stroke="#202f3b" strokeWidth="2" />
        <path d="M 166 246 L 208 246 L 205 364 L 166 364 Z" fill="#33485b" stroke="#202f3b" strokeWidth="2" />
        <path d="M 212 246 L 254 246 L 254 364 L 215 364 Z" fill="#33485b" stroke="#202f3b" strokeWidth="2" />
        <line x1="210" y1="246" x2="210" y2="362" stroke="#4b657a" strokeWidth="2" />
        <line x1="186" y1="250" x2="186" y2="360" stroke="#4b657a" strokeWidth="1.5" opacity="0.7" />
        <line x1="234" y1="250" x2="234" y2="360" stroke="#4b657a" strokeWidth="1.5" opacity="0.7" />
      </g>
    ),
  },
  {
    id: "spodenki",
    label: "Spodenki",
    svgLayer: (
      <g key="spodenki">
        <path d="M 158 220 L 262 220 L 258 246 L 162 246 Z" fill="#cf6a24" stroke="#9b4c17" strokeWidth="2" />
        <path d="M 166 246 L 208 246 L 206 298 L 166 298 Z" fill="#cf6a24" stroke="#9b4c17" strokeWidth="2" />
        <path d="M 212 246 L 254 246 L 254 298 L 214 298 Z" fill="#cf6a24" stroke="#9b4c17" strokeWidth="2" />
        <line x1="210" y1="246" x2="210" y2="296" stroke="#e08a4a" strokeWidth="2" />
      </g>
    ),
  },
  {
    id: "buty",
    label: "Buty",
    svgLayer: (
      <g key="buty">
        <path d="M 158 344 Q 160 334 170 334 L 204 334 Q 212 334 214 342 L 214 358 Q 212 364 202 364 L 164 364 Q 158 364 158 358 Z" fill="#6a4a3f" stroke="#3d2a24" strokeWidth="2" />
        <path d="M 208 344 Q 210 334 220 334 L 254 334 Q 262 334 264 342 L 264 358 Q 262 364 252 364 L 214 364 Q 208 364 208 358 Z" fill="#6a4a3f" stroke="#3d2a24" strokeWidth="2" />
        <rect x="158" y="357" width="56" height="7" rx="3" fill="#251a16" />
        <rect x="208" y="357" width="56" height="7" rx="3" fill="#251a16" />
        <line x1="172" y1="346" x2="198" y2="346" stroke="#8a6657" strokeWidth="1.5" />
        <line x1="222" y1="346" x2="248" y2="346" stroke="#8a6657" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    id: "skarpetki",
    label: "Skarpetki",
    svgLayer: (
      <g key="skarpetki">
        <path d="M 168 324 L 184 324 L 184 340 Q 184 344 180 344 L 170 344 Q 166 344 166 340 L 166 330 Q 166 324 168 324 Z" fill="#f2f2f2" stroke="#cfcfcf" strokeWidth="1.5" />
        <path d="M 192 324 L 208 324 L 208 340 Q 208 344 204 344 L 194 344 Q 190 344 190 340 L 190 330 Q 190 324 192 324 Z" fill="#f2f2f2" stroke="#cfcfcf" strokeWidth="1.5" />
        <path d="M 220 324 L 236 324 L 236 340 Q 236 344 232 344 L 222 344 Q 218 344 218 340 L 218 330 Q 218 324 220 324 Z" fill="#f2f2f2" stroke="#cfcfcf" strokeWidth="1.5" />
        <path d="M 244 324 L 260 324 L 260 340 Q 260 344 256 344 L 246 344 Q 242 344 242 340 L 242 330 Q 242 324 244 324 Z" fill="#f2f2f2" stroke="#cfcfcf" strokeWidth="1.5" />
        <line x1="168" y1="330" x2="184" y2="330" stroke="#dfdfdf" strokeWidth="1.5" />
        <line x1="192" y1="330" x2="208" y2="330" stroke="#dfdfdf" strokeWidth="1.5" />
        <line x1="220" y1="330" x2="236" y2="330" stroke="#dfdfdf" strokeWidth="1.5" />
        <line x1="244" y1="330" x2="260" y2="330" stroke="#dfdfdf" strokeWidth="1.5" />
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
      "skarpetki",
      "buty",
      "rekawiczki",
    ],
  },
  {
    id: "lato",
    label: "Lato",
    emoji: "☀️",
    itemIds: ["czapka-letnia", "koszulka", "spodenki", "skarpetki", "buty"],
  },
  {
    id: "jesien",
    label: "Jesień",
    emoji: "🍂",
    itemIds: ["bluza", "spodnie", "skarpetki", "buty"],
  },
  {
    id: "pusto",
    label: "Pusto",
    emoji: "🫥",
    itemIds: ["skarpetki"],
  },
];
