export const numbers = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
];

export const cardinals = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

export const ordinals = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
  "twentieth",
];

export const numberedOrdinals = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
  "18th",
  "19th",
  "20th",
];

export function findMatchingIndex(itemName) {
  //Return the index of the itemName from the any of the number arrays that contains it
  const val = itemName.toLowerCase();
  const numberIndex = numbers.indexOf(val);
  const ordinalIndex = ordinals.indexOf(val);
  const cardinalIndex = cardinals.indexOf(val);
  const numberedOrdinalsIndex = numberedOrdinals.indexOf(val);

  if (numberIndex !== -1) {
    return numberIndex;
  } else if (ordinalIndex !== -1) {
    return ordinalIndex;
  } else if (cardinalIndex !== -1) {
    return cardinalIndex;
  } else if (numberedOrdinalsIndex !== -1) {
    return numberedOrdinalsIndex;
  } else {
    return -1;
  }
}
