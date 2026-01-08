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
  ['#A8DADC', '#000000'], // Powder Blue
  ['#FF4757', '#FFFFFF'], // Radical Red
  ['#5F27CD', '#FFFFFF'], // Purple Heart
  ['#00D8D6', '#000000'], // Robin Egg Blue
  ['#FFA502', '#000000'], // Mango
  ['#2ECC71', '#FFFFFF'], // Emerald
  ['#E84393', '#FFFFFF'], // Pink Glamour
  ['#0984E3', '#FFFFFF'], // Azure
  ['#FDCB6E', '#000000'], // Mustard
  ['#6C5CE7', '#FFFFFF'], // Soft Purple
  ['#00B894', '#000000'], // Mint Leaf
  ['#D63031', '#FFFFFF'], // Pomegranate
  ['#FD79A8', '#000000'], // Carnation Pink
  ['#74B9FF', '#000000'], // Baby Blue
  ['#A29BFE', '#000000'], // Periwinkle
  ['#55EFC4', '#000000'], // Light Greenish Blue
  ['#FF7675', '#FFFFFF'], // Light Red
  ['#FFEAA7', '#000000'], // Light Yellow
  ['#DFE6E9', '#000000'], // Light Grey
  ['#FF6348', '#FFFFFF'], // Sunset Orange
  ['#1E3799', '#FFFFFF'], // Dark Blue
  ['#B33771', '#FFFFFF'], // Magenta Purple
  ['#3B3B98', '#FFFFFF'], // Blue Night
  ['#FD7272', '#FFFFFF'], // Watermelon
  ['#9AECDB', '#000000'], // Aqua Marine
  ['#F8EFBA', '#000000'], // Cream
  ['#58B19F', '#FFFFFF'], // Turquoise Green
  ['#EE5A6F', '#FFFFFF'], // Strawberry
  ['#F8B500', '#000000'], // Selective Yellow
  ['#1B9CFC', '#FFFFFF'], // Bright Cerulean
  ['#F97F51', '#FFFFFF'], // Mandarin
  ['#25CCF7', '#000000'], // Deep Sky Blue
  ['#EAB543', '#000000'], // Saffron
  ['#55E6C1', '#000000'], // Caribbean Green
  ['#CAD3C8', '#000000'], // Light Grayish
  ['#F8EFBA', '#000000'], // Pale Yellow
  ['#FC427B', '#FFFFFF'], // Razzmatazz
  ['#BDC581', '#000000'], // Sage
  ['#82589F', '#FFFFFF'], // Deep Lilac
  ['#F53B57', '#FFFFFF'], // Neon Red
  ['#3C40C6', '#FFFFFF'], // Blue Marguerite
  ['#05C46B', '#000000'], // Opal
  ['#FFA801', '#000000'], // Yellow Orange
  ['#0FBCF9', '#000000'], // Spiro Disco Ball
  ['#4B7BEC', '#FFFFFF'], // Cornflower Blue
  ['#A55EEA', '#FFFFFF'], // Medium Purple
  ['#26DE81', '#000000'], // UFO Green
  ['#FD7272', '#FFFFFF'], // Brink Pink
  ['#FC5C65', '#FFFFFF'], // Sunset Orange
  ['#EB3B5A', '#FFFFFF'], // Carmine Pink
  ['#FA8231', '#FFFFFF'], // Pumpkin
  ['#F7B731', '#000000'], // Bright Sun
  ['#20BF6B', '#FFFFFF'], // Shamrock
  ['#0FB9B1', '#000000'], // Light Sea Green
  ['#2D98DA', '#FFFFFF'], // Curious Blue
  ['#3867D6', '#FFFFFF'], // Royal Blue
  ['#8854D0', '#FFFFFF'], // Purple
  ['#A5B1C2', '#000000'], // Grayish
  ['#4B6584', '#FFFFFF'], // Fiord
  ['#778CA3', '#FFFFFF'], // Lynch
  ['#2C3A47', '#FFFFFF'], // Mirage
  ['#FF3838', '#FFFFFF'], // Red Orange
  ['#FF6B81', '#FFFFFF'], // Brink Pink
  ['#FD9644', '#000000'], // Yellow Sea
  ['#FEA47F', '#000000'], // Tacao
  ['#25CCF7', '#000000'], // Bright Turquoise
  ['#EAB543', '#000000'], // Casablanca
  ['#55E6C1', '#000000'], // Aquamarine
  ['#CAD3C8', '#000000'], // Pumice
  ['#F97F51', '#FFFFFF'], // Burnt Sienna
  ['#1B9CFC', '#FFFFFF'], // Dodger Blue
  ['#F8B500', '#000000'], // Amber
  ['#58B19F', '#FFFFFF'], // Puerto Rico
  ['#2C3A47', '#FFFFFF'], // Ebony Clay
  ['#B33771', '#FFFFFF'], // Plum
  ['#3B3B98', '#FFFFFF'], // Jacksons Purple
  ['#FD7272', '#FFFFFF'], // Froly
  ['#9AECDB', '#000000'], // Riptide
  ['#D6A2E8', '#000000'], // Plum Light
  ['#6A89CC', '#FFFFFF'], // Ship Cove
  ['#82CCDD', '#000000'], // Anakiwa
  ['#B8E994', '#000000'], // Reef
  ['#F3A683', '#000000'], // Tacao
  ['#F7D794', '#000000'], // Cherokee
  ['#778BEB', '#FFFFFF'], // Chetwode Blue
  ['#E77F67', '#FFFFFF'], // Apricot
  ['#CF6A87', '#FFFFFF'], // Puce
  ['#C44569', '#FFFFFF'], // Blush
  ['#786FA6', '#FFFFFF'], // Kimberly
  ['#F8A5C2', '#000000'], // Carnation Pink
  ['#63CDDA', '#000000'], // Viking
  ['#EA8685', '#FFFFFF'], // Sea Pink
  ['#596275', '#FFFFFF'], // Shuttle Gray
  ['#574B90', '#FFFFFF'], // Deluge
  ['#F19066', '#FFFFFF'], // My Sin
  ['#546DE5', '#FFFFFF'], // Chetwode Blue
  ['#E15F41', '#FFFFFF'], // Flamingo
  ['#C44569', '#FFFFFF'], // Blush
  ['#5F27CD', '#FFFFFF'], // Studio
  ['#00D2D3', '#000000'], // Bright Turquoise
  ['#01A3A4', '#FFFFFF'], // Persian Green
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
};
