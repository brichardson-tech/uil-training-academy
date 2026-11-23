
import type { NumberSenseQuestion } from "./number-sense-questions";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAddition(): NumberSenseQuestion {
  const a = randomInt(20, 99);
  const b = randomInt(20, 99);

  return {
    question: `${a} + ${b}`,
    answer: a + b,
    topic: "Addition",
    difficulty: "easy",
  };
}

function generateSubtraction(): NumberSenseQuestion {
  const a = randomInt(60, 150);
  const b = randomInt(10, a - 1);

  return {
    question: `${a} - ${b}`,
    answer: a - b,
    topic: "Subtraction",
    difficulty: "easy",
  };
}

function generateMultiplication(): NumberSenseQuestion {
  const a = randomInt(12, 35);
  const b = randomInt(3, 12);

  return {
    question: `${a} × ${b}`,
    answer: a * b,
    topic: "Multiplication",
    difficulty: "easy",
  };
}

function generateDivision(): NumberSenseQuestion {
  const divisor = randomInt(3, 15);
  const quotient = randomInt(4, 25);

  return {
    question: `${divisor * quotient} ÷ ${divisor}`,
    answer: quotient,
    topic: "Division",
    difficulty: "easy",
  };
}

function generateApproximation(): NumberSenseQuestion {
  const type = randomInt(1, 3);

  if (type === 1) {
    const a = randomInt(125, 975);
    const b = randomInt(24, 98);

    return {
      question: `★ ${a} × ${b} ≈`,
      answer: a * b,
      topic: "Approximation",
      difficulty: "medium",
    };
  }

  if (type === 2) {
    const a = randomInt(1250, 9750);
    const b = randomInt(12, 89);

    return {
      question: `★ ${a} ÷ ${b} ≈`,
      answer: a / b,
      topic: "Approximation",
      difficulty: "medium",
    };
  }

  const a = randomInt(120, 980);
  const b = randomInt(110, 890);

  return {
    question: `★ ${a} + ${b} ≈`,
    answer: a + b,
    topic: "Approximation",
    difficulty: "medium",
  };
}

function generateElementaryFirst20(
  questionNumber: number
): NumberSenseQuestion {
  const easy = questionNumber <= 10;
  const type = randomInt(1, 10);

  // Addition
  if (type === 1) {
    const a = randomInt(easy ? 10 : 100, easy ? 99 : 499);
    const b = randomInt(easy ? 10 : 100, easy ? 99 : 499);

    return {
      question: `${a} + ${b}`,
      answer: a + b,
      topic: "Addition",
      difficulty: easy ? "easy" : "medium",
    };
  }

  // Subtraction
  if (type === 2) {
    const a = randomInt(easy ? 50 : 200, easy ? 150 : 999);
    const b = randomInt(10, a - 1);

    return {
      question: `${a} − ${b}`,
      answer: a - b,
      topic: "Subtraction",
      difficulty: easy ? "easy" : "medium",
    };
  }

  // Multiplication shortcuts
  if (type === 3) {
    const a = randomInt(easy ? 11 : 20, easy ? 49 : 99);
    const multiplier = [5, 11, 25][randomInt(0, 2)];

    return {
      question: `${a} × ${multiplier}`,
      answer: a * multiplier,
      topic: "Multiplication Shortcuts",
      difficulty: easy ? "easy" : "medium",
    };
  }

  // Division
  if (type === 4) {
    const divisor = randomInt(2, easy ? 9 : 15);
    const quotient = randomInt(3, easy ? 12 : 35);

    return {
      question: `${divisor * quotient} ÷ ${divisor}`,
      answer: quotient,
      topic: "Division",
      difficulty: easy ? "easy" : "medium",
    };
  }

  // Rounding whole numbers
  if (type === 5) {
    const number = randomInt(easy ? 100 : 1000, easy ? 999 : 9999);
    const place = easy ? 10 : [10, 100][randomInt(0, 1)];

    return {
      question: `Round ${number} to the nearest ${place}`,
      answer: Math.round(number / place) * place,
      topic: "Rounding",
      difficulty: easy ? "easy" : "medium",
    };
  }

  // Place value
  if (type === 6) {
    const number = randomInt(1000, 9999);
    const place = [10, 100, 1000][randomInt(0, 2)];
    const digit = Math.floor(number / place) % 10;

    return {
      question: `Value of the ${place === 10 ? "tens" : place === 100 ? "hundreds" : "thousands"} digit in ${number}`,
      answer: digit * place,
      topic: "Place Value",
      difficulty: "easy",
    };
  }

  // Remainders
  if (type === 7) {
    const divisor = randomInt(3, 12);
    const quotient = randomInt(4, 20);
    const remainder = randomInt(1, divisor - 1);
    const dividend = divisor * quotient + remainder;

    return {
      question: `Remainder when ${dividend} is divided by ${divisor}`,
      answer: remainder,
      topic: "Remainders",
      difficulty: easy ? "easy" : "medium",
    };
  }

  // Even and odd numbers
  if (type === 8) {
    const a = randomInt(10, 99);
    const b = randomInt(10, 99);
    const sum = a + b;

    return {
      question: `Is ${a} + ${b} even (0) or odd (1)?`,
      answer: sum % 2,
      topic: "Even and Odd Numbers",
      difficulty: "easy",
    };
  }

  // Roman numerals
  if (type === 9) {
    const romanValues = [
      ["IV", 4],
      ["VI", 6],
      ["IX", 9],
      ["XIV", 14],
      ["XIX", 19],
      ["XXIV", 24],
      ["XL", 40],
      ["XLV", 45],
      ["LIX", 59],
      ["XC", 90],
    ] as const;

    const [roman, value] =
      romanValues[randomInt(0, romanValues.length - 1)];

    return {
      question: `Write ${roman} as an Arabic numeral`,
      answer: value,
      topic: "Roman Numerals",
      difficulty: easy ? "easy" : "medium",
    };
  }

  // Regrouping and mental arithmetic
  const a = randomInt(easy ? 20 : 100, easy ? 90 : 490);
  const b = randomInt(1, 9);

  return {
    question: `${a} + ${10 - (a % 10)} + ${b}`,
    answer: a + (10 - (a % 10)) + b,
    topic: "Regrouping",
    difficulty: easy ? "easy" : "medium",
  };
}

function generateElementary21to40(
  questionNumber: number
): NumberSenseQuestion {
  const type = randomInt(1, 12);

  // 1. Add fractions with the same denominator
  if (type === 1) {
    const d = randomInt(3, 12);
    const a = randomInt(1, d - 1);
    const b = randomInt(1, d - 1);

    return {
      question: `${a}/${d} + ${b}/${d}`,
      answer: (a + b) / d,
      topic: "Adding Fractions",
      difficulty: "medium",
    };
  }

  // 2. Subtract fractions
  if (type === 2) {
    const d = randomInt(4, 12);
    const a = randomInt(2, d);
    const b = randomInt(1, a - 1);

    return {
      question: `${a}/${d} − ${b}/${d}`,
      answer: (a - b) / d,
      topic: "Subtracting Fractions",
      difficulty: "medium",
    };
  }

  // 3. Multiply fractions
  if (type === 3) {
    const a = randomInt(1, 5);
    const b = randomInt(2, 9);
    const c = randomInt(1, 5);
    const d = randomInt(2, 9);

    return {
      question: `${a}/${b} × ${c}/${d}`,
      answer: (a * c) / (b * d),
      topic: "Multiplying Fractions",
      difficulty: "medium",
    };
  }

  // 4. Divide fractions
  if (type === 4) {
    const a = randomInt(1, 5);
    const b = randomInt(2, 9);
    const c = randomInt(1, 5);
    const d = randomInt(2, 9);

    return {
      question: `${a}/${b} ÷ ${c}/${d}`,
      answer: (a * d) / (b * c),
      topic: "Dividing Fractions",
      difficulty: "medium",
    };
  }

  // 5. Fraction to percentage
  if (type === 5) {
    const denominator = [2, 4, 5, 10, 20, 25][
      randomInt(0, 5)
    ];
    const numerator = randomInt(1, denominator - 1);

    return {
      question: `Convert ${numerator}/${denominator} to a percent`,
      answer: (numerator / denominator) * 100,
      topic: "Fractions and Percentages",
      difficulty: "medium",
    };
  }

  // 6. Decimal to fraction (answer as a decimal value)
  if (type === 6) {
    const numerator = randomInt(1, 9);

    return {
      question: `Write 0.${numerator} as a fraction`,
      answer: numerator / 10,
      topic: "Decimal to Fraction",
      difficulty: "medium",
    };
  }

  // 7. Order of operations
  if (type === 7) {
    const a = randomInt(3, 20);
    const b = randomInt(2, 9);
    const c = randomInt(2, 9);

    return {
      question: `${a} + ${b} × ${c}`,
      answer: a + b * c,
      topic: "Order of Operations",
      difficulty: "medium",
    };
  }

  // 8. Ratios and proportions
  if (type === 8) {
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    const multiplier = randomInt(2, 6);

    return {
      question: `If ${a}:${b} = ${a * multiplier}:x, find x`,
      answer: b * multiplier,
      topic: "Ratios and Proportions",
      difficulty: "medium",
    };
  }

  // 9. Consumer math - discounts
  if (type === 9) {
    const price = randomInt(2, 20) * 10;
    const discount = [10, 20, 25, 50][randomInt(0, 3)];

    return {
      question: `${discount}% off $${price}: sale price ($)`,
      answer: price * (1 - discount / 100),
      topic: "Consumer Math",
      difficulty: "medium",
    };
  }

  // 10. Prime numbers
  if (type === 10) {
    const primes = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
      31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
      73, 79, 83, 89, 97,
    ];

    const number = randomInt(10, 99);

    return {
      question: `Is ${number} prime? Yes (1), No (0)`,
      answer: primes.includes(number) ? 1 : 0,
      topic: "Prime Numbers",
      difficulty: "medium",
    };
  }

  // 11. Greatest common factor
  if (type === 11) {
    const factor = randomInt(2, 12);
    const a = factor * randomInt(2, 8);
    const b = factor * randomInt(2, 8);

    function gcd(x: number, y: number): number {
      while (y !== 0) {
        [x, y] = [y, x % y];
      }
      return x;
    }

    return {
      question: `GCF of ${a} and ${b}`,
      answer: gcd(a, b),
      topic: "Greatest Common Factor",
      difficulty: "medium",
    };
  }

  // 12. Measurement and time conversions
  const conversions = [
    { unit: "feet", amount: 12, result: 144, target: "inches" },
    { unit: "yards", amount: 5, result: 15, target: "feet" },
    { unit: "hours", amount: 3, result: 180, target: "minutes" },
    { unit: "minutes", amount: 4, result: 240, target: "seconds" },
    { unit: "dozen", amount: 3, result: 36, target: "items" },
  ];

  const conversion =
    conversions[randomInt(0, conversions.length - 1)];

  return {
    question: `Convert ${conversion.amount} ${conversion.unit} to ${conversion.target}`,
    answer: conversion.result,
    topic: "Measurement Conversions",
    difficulty: "medium",
  };
}

const basicGenerators = [
  generateAddition,
  generateSubtraction,
  generateMultiplication,
  generateDivision,
];

export function generateNumberSenseTest(
  level: "elementary" | "junior-high"
): NumberSenseQuestion[] {
  const questions: NumberSenseQuestion[] = [];
  const usedQuestions = new Set<string>();

  while (questions.length < 80) {
    
const questionNumber = questions.length + 1;



const question =
  questionNumber % 10 === 0
    ? generateApproximation()
    : level === "elementary" && questionNumber <= 20
      ? generateElementaryFirst20(questionNumber)
      : level === "elementary" && questionNumber <= 40
        ? generateElementary21to40(questionNumber)
        : basicGenerators[
            questions.length % basicGenerators.length
          ]();



    if (usedQuestions.has(question.question)) {
      continue;
    }

    usedQuestions.add(question.question);
    questions.push(question);
  }

  return questions;
}
