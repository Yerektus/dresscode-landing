export const clothingSizes = [
  "xxs",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "xxxl",
  "eu40",
  "eu42",
  "eu44",
  "eu46",
  "eu48",
  "eu50",
  "eu52",
  "eu54",
  "eu56",
  "eu58"
] as const;

export type ClothingSize = (typeof clothingSizes)[number];

export const clothingSizeLabels: Record<ClothingSize, string> = {
  xxs: "XXS",
  xs: "XS",
  s: "S",
  m: "M",
  l: "L",
  xl: "XL",
  xxl: "XXL",
  xxxl: "XXXL",
  eu40: "EU 40",
  eu42: "EU 42",
  eu44: "EU 44",
  eu46: "EU 46",
  eu48: "EU 48",
  eu50: "EU 50",
  eu52: "EU 52",
  eu54: "EU 54",
  eu56: "EU 56",
  eu58: "EU 58"
};

export interface WardrobeItem {
  id: string;
  name: string;
  imageDataUri: string;
  size: ClothingSize;
  createdAt: string;
}
