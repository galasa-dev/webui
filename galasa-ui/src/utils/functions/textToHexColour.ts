/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const tagColours: [string, string][] = [
  ['#FF6B6B', '#FFFFFF'], // Bright Red
  ['#4ECDC4', '#000000'], // Turquoise
  ['#45B7D1', '#FFFFFF'], // Sky Blue
  ['#FFA07A', '#000000'], // Light Salmon
  ['#98D8C8', '#000000'], // Mint
  ['#F7DC6F', '#000000'], // Yellow
  ['#BB8FCE', '#FFFFFF'], // Lavender
  ['#85C1E2', '#000000'], // Light Blue
  ['#F8B739', '#000000'], // Orange
  ['#52B788', '#FFFFFF'], // Green
  ['#E63946', '#FFFFFF'], // Red
  ['#06FFA5', '#000000'], // Bright Mint
  ['#FF006E', '#FFFFFF'], // Hot Pink
  ['#8338EC', '#FFFFFF'], // Purple
  ['#3A86FF', '#FFFFFF'], // Blue
  ['#FB5607', '#FFFFFF'], // Orange Red
  ['#FFBE0B', '#000000'], // Amber
  ['#06D6A0', '#000000'], // Teal
  ['#118AB2', '#FFFFFF'], // Ocean Blue
  ['#EF476F', '#FFFFFF'], // Pink
  ['#FFD166', '#000000'], // Golden Yellow
  ['#26547C', '#FFFFFF'], // Navy Blue
  ['#FF9F1C', '#000000'], // Bright Orange
  ['#2EC4B6', '#000000'], // Cyan
  ['#E71D36', '#FFFFFF'], // Crimson
  ['#C9ADA7', '#000000'], // Dusty Rose
  ['#9D4EDD', '#FFFFFF'], // Violet
  ['#FF5A5F', '#FFFFFF'], // Coral
  ['#00BBF9', '#000000'], // Bright Blue
  ['#F72585', '#FFFFFF'], // Magenta
  ['#7209B7', '#FFFFFF'], // Deep Purple
  ['#4CC9F0', '#000000'], // Light Cyan
  ['#F94144', '#FFFFFF'], // Red Orange
  ['#F3722C', '#FFFFFF'], // Burnt Orange
  ['#F8961E', '#000000'], // Tangerine
  ['#90BE6D', '#000000'], // Lime Green
  ['#43AA8B', '#FFFFFF'], // Sea Green
  ['#577590', '#FFFFFF'], // Slate Blue
  ['#FF6D00', '#FFFFFF'], // Deep Orange
  ['#00C9A7', '#000000'], // Spring Green
  ['#845EC2', '#FFFFFF'], // Purple Blue
  ['#FF9671', '#000000'], // Peach
  ['#FFC75F', '#000000'], // Gold
  ['#F9F871', '#000000'], // Light Yellow
  ['#C34A36', '#FFFFFF'], // Rust
  ['#00D2FC', '#000000'], // Electric Blue
  ['#D65DB1', '#FFFFFF'], // Orchid
  ['#FF6F91', '#FFFFFF'], // Rose Pink
  ['#00F5FF', '#000000'], // Aqua
  ['#A8DADC', '#000000']  // Powder Blue
];

export const textToHexColour = (text: string): [string, string] => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    // hash << 5: Shifting bits left by 5 is the same as multiplying by 2^5 = 32).
    // Subtracting the original value results in 32x - x = 31x. 31 is a small prime number, helps distribute hash values uniformly.
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const numberBetweenZeroAndLengthOfColoursArray = Math.abs(hash % (tagColours.length - 1));
  return tagColours[numberBetweenZeroAndLengthOfColoursArray];
}