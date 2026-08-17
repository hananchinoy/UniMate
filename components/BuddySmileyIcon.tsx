import React from "react";

interface BuddySmileyIconProps {
  className?: string;
  size?: number | string;
}

/**
 * BuddySmileyIcon: A bespoke vector avatar recreation matching the smiling boy with caramel hair and happy eyes.
 */
export const BuddySmileyIcon: React.FC<BuddySmileyIconProps> = ({
  className = "w-6 h-6",
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 1. EARS - Outer shapes */}
      {/* Left Ear */}
      <path
        d="M 100 248 C 50 248 40 330 100 338"
        fill="#FDF0E9"
        stroke="#2E2C2B"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Ear Inner Pink */}
      <path
        d="M 96 264 C 68 266 62 318 96 322"
        fill="#F8C7D8"
      />

      {/* Right Ear */}
      <path
        d="M 412 248 C 462 248 472 330 412 338"
        fill="#FDF0E9"
        stroke="#2E2C2B"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Ear Inner Pink */}
      <path
        d="M 416 264 C 444 266 450 318 416 322"
        fill="#F8C7D8"
      />

      {/* 2. HEAD / FACE BASE */}
      <path
        d="M 98 160 C 98 120 120 70 256 70 C 392 70 414 120 414 160 L 414 310 C 414 410 350 482 256 482 C 162 482 98 410 98 310 Z"
        fill="#FDF0E9"
        stroke="#2E2C2B"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. HAIR */}
      {/* Hair Main Mass Fill & Outline */}
      <path
        d="M 98 175 C 80 135 105 50 256 50 C 390 50 422 110 422 170 L 422 215 C 382 225 352 170 350 100 C 265 180 185 150 106 178 Z"
        fill="#CA7E26"
        stroke="#2E2C2B"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right Side Hair Wave Dropping Down */}
      <path
        d="M 350 90 L 350 170 C 350 195 380 220 422 215"
        fill="#CA7E26"
        stroke="#2E2C2B"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Hair Swoop Swirl Line */}
      <path
        d="M 124 135 C 160 80 230 110 270 70"
        stroke="#2E2C2B"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. HAPPY CLOSED CRESCENT EYES */}
      {/* Left Eye */}
      <path
        d="M 136 295 C 150 270 178 270 192 295"
        stroke="#2E2C2B"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Eye */}
      <path
        d="M 320 295 C 334 270 362 270 376 295"
        stroke="#2E2C2B"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5. BIG WIDE CHEERFUL SMILE */}
      <path
        d="M 148 385 C 190 442 322 442 364 385"
        stroke="#2E2C2B"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
