/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const WHITE = '#FFFFFF';
const BLACK = '#000000';

// Where the background colour is the first element and the text colour is the second element.
const tagColours: [string, string][] = [
  ['#FF6B6B', WHITE], // Bright Red
  ['#4ECDC4', BLACK], // Turquoise
  ['#45B7D1', WHITE], // Sky Blue
  ['#FFA07A', BLACK], // Light Salmon
  ['#98D8C8', BLACK], // Mint
  ['#F7DC6F', BLACK], // Yellow
  ['#BB8FCE', WHITE], // Lavender
  ['#85C1E2', BLACK], // Light Blue
  ['#F8B739', BLACK], // Orange
  ['#52B788', WHITE], // Green
  ['#E63946', WHITE], // Red
  ['#06FFA5', BLACK], // Bright Mint
  ['#FF006E', WHITE], // Hot Pink
  ['#8338EC', WHITE], // Purple
  ['#3A86FF', WHITE], // Blue
  ['#FB5607', WHITE], // Orange Red
  ['#FFBE0B', BLACK], // Amber
  ['#06D6A0', BLACK], // Teal
  ['#118AB2', WHITE], // Ocean Blue
  ['#EF476F', WHITE], // Pink
  ['#FFD166', BLACK], // Golden Yellow
  ['#26547C', WHITE], // Navy Blue
  ['#FF9F1C', BLACK], // Bright Orange
  ['#2EC4B6', BLACK], // Cyan
  ['#E71D36', WHITE], // Crimson
  ['#C9ADA7', BLACK], // Dusty Rose
  ['#9D4EDD', WHITE], // Violet
  ['#FF5A5F', WHITE], // Coral
  ['#00BBF9', BLACK], // Bright Blue
  ['#F72585', WHITE], // Magenta
  ['#7209B7', WHITE], // Deep Purple
  ['#4CC9F0', BLACK], // Light Cyan
  ['#F94144', WHITE], // Red Orange
  ['#F3722C', WHITE], // Burnt Orange
  ['#F8961E', BLACK], // Tangerine
  ['#90BE6D', BLACK], // Lime Green
  ['#43AA8B', WHITE], // Sea Green
  ['#577590', WHITE], // Slate Blue
  ['#FF6D00', WHITE], // Deep Orange
  ['#00C9A7', BLACK], // Spring Green
  ['#845EC2', WHITE], // Purple Blue
  ['#FF9671', BLACK], // Peach
  ['#FFC75F', BLACK], // Gold
  ['#F9F871', BLACK], // Light Yellow
  ['#C34A36', WHITE], // Rust
  ['#00D2FC', BLACK], // Electric Blue
  ['#D65DB1', WHITE], // Orchid
  ['#FF6F91', WHITE], // Rose Pink
  ['#00F5FF', BLACK], // Aqua
  ['#A8DADC', BLACK], // Powder Blue
  ['#FF4757', WHITE], // Radical Red
  ['#5F27CD', WHITE], // Purple Heart
  ['#00D8D6', BLACK], // Robin Egg Blue
  ['#FFA502', BLACK], // Mango
  ['#2ECC71', WHITE], // Emerald
  ['#E84393', WHITE], // Pink Glamour
  ['#0984E3', WHITE], // Azure
  ['#FDCB6E', BLACK], // Mustard
  ['#6C5CE7', WHITE], // Soft Purple
  ['#00B894', BLACK], // Mint Leaf
  ['#D63031', WHITE], // Pomegranate
  ['#FD79A8', BLACK], // Carnation Pink
  ['#74B9FF', BLACK], // Baby Blue
  ['#A29BFE', BLACK], // Periwinkle
  ['#55EFC4', BLACK], // Light Greenish Blue
  ['#FF7675', WHITE], // Light Red
  ['#FFEAA7', BLACK], // Light Yellow
  ['#DFE6E9', BLACK], // Light Grey
  ['#FF6348', WHITE], // Sunset Orange
  ['#1E3799', WHITE], // Dark Blue
  ['#B33771', WHITE], // Magenta Purple
  ['#3B3B98', WHITE], // Blue Night
  ['#FD7272', WHITE], // Watermelon
  ['#9AECDB', BLACK], // Aqua Marine
  ['#F8EFBA', BLACK], // Cream
  ['#58B19F', WHITE], // Turquoise Green
  ['#EE5A6F', WHITE], // Strawberry
  ['#F8B500', BLACK], // Selective Yellow
  ['#1B9CFC', WHITE], // Bright Cerulean
  ['#F97F51', WHITE], // Mandarin
  ['#25CCF7', BLACK], // Deep Sky Blue
  ['#EAB543', BLACK], // Saffron
  ['#55E6C1', BLACK], // Caribbean Green
  ['#CAD3C8', BLACK], // Light Grayish
  ['#F8EFBA', BLACK], // Pale Yellow
  ['#FC427B', WHITE], // Razzmatazz
  ['#BDC581', BLACK], // Sage
  ['#82589F', WHITE], // Deep Lilac
  ['#F53B57', WHITE], // Neon Red
  ['#3C40C6', WHITE], // Blue Marguerite
  ['#05C46B', BLACK], // Opal
  ['#FFA801', BLACK], // Yellow Orange
  ['#0FBCF9', BLACK], // Spiro Disco Ball
  ['#4B7BEC', WHITE], // Cornflower Blue
  ['#A55EEA', WHITE], // Medium Purple
  ['#26DE81', BLACK], // UFO Green
  ['#FD7272', WHITE], // Brink Pink
  ['#FC5C65', WHITE], // Sunset Orange
  ['#EB3B5A', WHITE], // Carmine Pink
  ['#FA8231', WHITE], // Pumpkin
  ['#F7B731', BLACK], // Bright Sun
  ['#20BF6B', WHITE], // Shamrock
  ['#0FB9B1', BLACK], // Light Sea Green
  ['#2D98DA', WHITE], // Curious Blue
  ['#3867D6', WHITE], // Royal Blue
  ['#8854D0', WHITE], // Purple
  ['#A5B1C2', BLACK], // Grayish
  ['#4B6584', WHITE], // Fiord
  ['#778CA3', WHITE], // Lynch
  ['#2C3A47', WHITE], // Mirage
  ['#FF3838', WHITE], // Red Orange
  ['#FF6B81', WHITE], // Brink Pink
  ['#FD9644', BLACK], // Yellow Sea
  ['#FEA47F', BLACK], // Tacao
  ['#25CCF7', BLACK], // Bright Turquoise
  ['#EAB543', BLACK], // Casablanca
  ['#55E6C1', BLACK], // Aquamarine
  ['#CAD3C8', BLACK], // Pumice
  ['#F97F51', WHITE], // Burnt Sienna
  ['#1B9CFC', WHITE], // Dodger Blue
  ['#F8B500', BLACK], // Amber
  ['#58B19F', WHITE], // Puerto Rico
  ['#2C3A47', WHITE], // Ebony Clay
  ['#B33771', WHITE], // Plum
  ['#3B3B98', WHITE], // Jacksons Purple
  ['#FD7272', WHITE], // Froly
  ['#9AECDB', BLACK], // Riptide
  ['#D6A2E8', BLACK], // Plum Light
  ['#6A89CC', WHITE], // Ship Cove
  ['#82CCDD', BLACK], // Anakiwa
  ['#B8E994', BLACK], // Reef
  ['#F3A683', BLACK], // Tacao
  ['#F7D794', BLACK], // Cherokee
  ['#778BEB', WHITE], // Chetwode Blue
  ['#E77F67', WHITE], // Apricot
  ['#CF6A87', WHITE], // Puce
  ['#C44569', WHITE], // Blush
  ['#786FA6', WHITE], // Kimberly
  ['#F8A5C2', BLACK], // Carnation Pink
  ['#63CDDA', BLACK], // Viking
  ['#EA8685', WHITE], // Sea Pink
  ['#596275', WHITE], // Shuttle Gray
  ['#574B90', WHITE], // Deluge
  ['#F19066', WHITE], // My Sin
  ['#546DE5', WHITE], // Chetwode Blue
  ['#E15F41', WHITE], // Flamingo
  ['#C44569', WHITE], // Blush
  ['#5F27CD', WHITE], // Studio
  ['#00D2D3', BLACK], // Bright Turquoise
  ['#01A3A4', WHITE], // Persian Green
];

// Cache to store computed colours for each text input.
const colourCache = new Map<string, [string, string]>();

const computeTextToHexColour = (text: string): [string, string] => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    // hash << 5: Shifting bits left by 5 is the same as multiplying by 2^5 = 32).
    // Subtracting the original value results in 32x - x = 31x. 31 is a small prime number, helps distribute hash values uniformly.
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const numberBetweenZeroAndLengthOfColoursArray = Math.abs(hash % (tagColours.length - 1));
  return tagColours[numberBetweenZeroAndLengthOfColoursArray];
};

export const textToHexColour = (text: string): [string, string] => {
  if (colourCache.has(text)) {
    return colourCache.get(text)!;
  }

  // If not cached, compute the colour.
  const colour = computeTextToHexColour(text);
  colourCache.set(text, colour);
  return colour;
};
