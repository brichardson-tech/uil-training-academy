import type { NumberSenseQuestion } from "./number-sense-questions";

// Elementary Number Sense: positions 1–40 follow the coach's blueprint.
// Positions 41–80 are a random mixture of those skills. Every tenth
// question is a starred approximation (the website grades within 5%).

type Level = "elementary" | "junior-high";
type Q = NumberSenseQuestion;

const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]): T => items[rand(0, items.length - 1)];
const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
};
const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;
const fmt = (n: number): string => n.toLocaleString("en-US");
const make = (question: string, answer: number, topic: string): Q => ({
  question,
  answer,
  topic,
  difficulty: "easy",
});
const fraction = (n: number, d: number): string => `${n}/${d}`;
const mixed = (w: number, n: number, d: number): string => `${w} ${n}/${d}`;

// Starred questions must return the EXACT answer for the site's 5% checker.
function approximation(kind: 10 | 20 | 30 | 40 | 50): Q {
  if (kind === 10) {
    const nums = Array.from({ length: 4 }, () => rand(2000, 9999));
    return make(`★ ${nums.map(fmt).join(" + ")} ≈`, nums.reduce((a, b) => a + b, 0), "Approximation: four-number sum");
  }
  if (kind === 20) {
    const a = rand(120, 999), b = rand(120, 999);
    return make(`★ ${fmt(a)} × ${fmt(b)} ≈`, a * b, "Approximation: 3-digit × 3-digit");
  }
  if (kind === 30) {
    const a = rand(1000, 9999), b = rand(12, 99);
    return make(`★ ${fmt(a)} × ${b} ≈`, a * b, "Approximation: 4-digit × 2-digit");
  }
  if (kind === 40) {
    // (whole + numerator/denominator) × (denominator × multiplier).
    // Students can cancel the denominator before multiplying.
    const d = pick([7, 9, 11, 13]);
    const w = rand(12, 65);
    const n = rand(1, d - 1);
    const k = rand(101, 499);
    const b = d * k;
    const exact = (w * d + n) * k;
    return make(`★ ${mixed(w, n, d)} × ${fmt(b)} ≈`, exact, "Approximation: cancellation shortcut");
  }
  return approximation(pick([10, 20, 30, 40] as const));
}

function elementaryAt(position: number): Q {
  let a: number, b: number, c: number, d: number;
  switch (position) {
    case 1:
      a = rand(20, 99); b = rand(20, 99);
      return make(`${a} + ${b} =`, a + b, "Addition");
    case 2:
      a = rand(60, 160); b = rand(11, a - 1);
      return make(`${a} − ${b} =`, a - b, "Subtraction");
    case 3:
      a = rand(12, 99); b = rand(2, 9);
      return make(`${a} × ${b} =`, a * b, "Single-digit multiplication factor");
    case 4:
      // Generate divisor and quotient first: ALWAYS divides evenly.
      b = rand(2, 9); c = rand(12, 85); a = b * c;
      return make(`${a} ÷ ${b} =`, c, "Whole-number division");
    case 5:
      a = rand(30, 99); b = rand(10, 69); c = rand(10, 69);
      return make(`${a} + ${b} − ${c} =`, a + b - c, "Three-number addition/subtraction");
    case 6:
      a = rand(2, 9); b = rand(2, 9); c = rand(2, 9);
      return make(`${a} × ${b} × ${c} =`, a * b * c, "Three single-digit factors");
    case 7:
      a = rand(12, 99);
      return make(`${a} × 11 =`, a * 11, "Multiply by 11");
    case 8:
      a = rand(12, 99);
      return make(`${a} × 25 =`, a * 25, "Multiply by 25");
    case 9:
      a = rand(12, 99);
      return make(`${a} × 50 =`, a * 50, "Multiply by 50");
    case 10: return approximation(10);
    case 11: {
      a = rand(1000, 999999);
      const places = ["ones", "tens", "hundreds", "thousands"] as const;
      const index = rand(0, 3);
      return make(`What digit is in the ${places[index]} place of ${fmt(a)}?`, Math.floor(a / 10 ** index) % 10, "Place value");
    }
    case 12: {
      a = rand(1000, 99999);
      const power = pick([1, 2, 3]);
      const names: Record<number, string> = { 1: "ten", 2: "hundred", 3: "thousand" };
      b = 10 ** power;
      return make(`Round ${fmt(a)} to the nearest ${names[power]}.`, Math.round(a / b) * b, "Rounding");
    }
    case 13:
      a = 2 * rand(5, 49);
      return make(`${a} × 15 =`, a * 15, "Even two-digit × 15");
    case 14:
      a = rand(12, 99); b = rand(12, 99);
      return make(`${a} × ${b} =`, a * b, "Two-digit multiplication");
    case 15:
      b = pick([3, 4, 9, 11]); c = rand(1, b - 1); a = b * rand(100, 999) + c;
      return make(`What is the remainder when ${fmt(a)} is divided by ${b}?`, c, "Remainders");
    case 16: {
      a = rand(10, 65); b = a + rand(12, 45);
      const kind = pick(["whole", "odd", "even"] as const);
      const count = Array.from({ length: b - a - 1 }, (_, i) => a + i + 1)
        .filter(n => kind === "whole" || (kind === "odd" ? n % 2 !== 0 : n % 2 === 0)).length;
      return make(`How many ${kind} numbers are strictly between ${a} and ${b}?`, count, "Counting numbers in an interval");
    }
    case 17:
      a = rand(11, 39); b = rand(2, 8); c = rand(2, 9);
      return make(`${a} × ${b} + ${a} × ${c} =`, a * (b + c), "Distributive property");
    case 18: {
      const powers = [2, 0, -pick([1, 2, 3, 4])];
      const digits = [rand(1, 9), rand(1, 9), rand(1, 9)];
      const answer = powers.reduce((sum, power, i) => sum + digits[i] * 10 ** power, 0);
      return make(`${digits.map((n, i) => `${n} × 10^${powers[i]}`).join(" + ")} =`, Number(answer.toFixed(6)), "Powers of ten and place value");
    }
    case 19: {
      const roman: Array<[number, string]> = [[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
      a = rand(11, 99); let left = a; let text = "";
      for (const [value, symbol] of roman) while (left >= value) { text += symbol; left -= value; }
      return make(`Write ${text} as a number.`, a, "Roman numerals");
    }
    case 20: return approximation(20);
    case 21: {
      a = rand(2, 18); b = rand(2, 9); c = rand(2, 9);
      if (rand(0, 1)) return make(`${a} + ${b} × ${c} =`, a + b * c, "Order of operations");
      return make(`${a} × ${b} − ${c} =`, a * b - c, "Order of operations");
    }
    case 22:
      a = rand(5, 35); d = rand(2, 12);
      return make(`${a} + ${a+d} + ${a+2*d} + ${a+3*d} =`, 4*a + 6*d, "Arithmetic sequence sum");
    case 23: {
      const options: Array<[string, string, number]> = [
        ["feet", "inches", 12], ["yards", "feet", 3], ["hours", "minutes", 60],
        ["minutes", "seconds", 60], ["pounds", "ounces", 16], ["dozens", "items", 12],
        ["gallons", "quarts", 4], ["quarts", "pints", 2], ["feet", "yards", 1/3],
      ];
      const [from, to, multiplier] = pick(options);
      a = multiplier === 1/3 ? 3 * rand(2, 20) : rand(2, 20);
      return make(`How many ${to} are in ${a} ${from}?`, a * multiplier, "Unit conversion");
    }
    case 24: {
      d = pick([4, 6, 8, 10, 12]);
      a = rand(1, d - 2); b = rand(1, d - a);
      if (rand(0, 1)) return make(`${fraction(a,d)} + ${fraction(b,d)} =`, (a+b)/d, "Add fractions");
      const small = d / 2;
      const numerator = rand(1, small - 1);
      return make(`${fraction(a,d)} + ${fraction(numerator,small)} =`, a/d + numerator/small, "Add fractions");
    }
    case 25: {
      d = pick([4, 6, 8, 10, 12]); a = rand(2, d - 1); b = rand(1, a - 1);
      return make(`${fraction(a,d)} − ${fraction(b,d)} =`, (a-b)/d, "Subtract fractions");
    }
    case 26: {
      a = rand(1, 5); d = pick([2, 4, 8]); b = rand(1, d - 1); c = rand(1, d - 1);
      return make(`${mixed(a,b,d)} × ${mixed(a,c,d)} =`, (a+b/d)*(a+c/d), "Multiply mixed numbers");
    }
    case 27:
      a = rand(90, 99); b = rand(90, 99);
      return make(`${a} × ${b} =`, a*b, "Multiplication in the 90s");
    case 28:
      a = rand(101, 109); b = rand(101, 109);
      return make(`${a} × ${b} =`, a*b, "Multiplication just over 100");
    case 29: {
      a = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80, 90]);
      return make(`Write ${a}% as a fraction in simplest form.`, a/100, "Percent to fraction");
    }
    case 30: return approximation(30);
    case 31: {
      b = pick([3, 4, 5, 6, 8, 10]); d = pick([3, 4, 5, 6, 8, 10]);
      a = rand(1, b - 1); c = rand(1, d - 1);
      return make(`${fraction(a,b)} × ${fraction(c,d)} =`, a*c/(b*d), "Multiply fractions");
    }
    case 32: {
      b = pick([3, 4, 5, 6, 8]); d = pick([3, 4, 5, 6, 8]);
      a = rand(1, b - 1); c = rand(1, d - 1);
      return make(`${fraction(a,b)} ÷ ${fraction(c,d)} =`, a*d/(b*c), "Divide fractions");
    }
    case 33: {
      a = rand(2, 8); b = rand(2, 9); c = rand(2, 10);
      return make(`If ${a} pencils cost $${a*b}, how many dollars do ${c} pencils cost?`, b*c, "Ratios and proportions");
    }
    case 34: {
      const [coin, cents] = pick([["quarters",25],["dimes",10],["nickels",5],["pennies",1]] as const);
      a = rand(5, 65); const dollars = (a*cents/100).toFixed(2);
      return make(`How many ${coin} are in $${dollars}?`, a, "Money and coins");
    }
    case 35:
      a = rand(3, 18); b = rand(3, 18);
      return make(`Find the LCM of ${a} and ${b}.`, lcm(a,b), "Least common multiple");
    case 36:
      c = rand(2, 12); a = c*rand(2, 10); b = c*rand(2, 10);
      return make(`Find the GCD of ${a} and ${b}.`, gcd(a,b), "Greatest common divisor");
    case 37: {
      a = rand(10, 99);
      const prime = a >= 2 && Array.from({length: Math.floor(Math.sqrt(a))-1},(_,i)=>i+2).every(k=>a%k!==0);
      return make(`Is ${a} prime? Enter 1 for YES or 0 for NO.`, prime ? 1 : 0, "Prime numbers");
    }
    case 38: {
      a = pick([12, 37, 62, 87]);
      return make(`Write ${a} 1/2% as a fraction in simplest form.`, (a+0.5)/100, "Fractional percent to fraction");
    }
    case 39:
      a = rand(100, 999);
      return make(`${a} × 11 =`, a*11, "Three-digit × 11");
    case 40: return approximation(40);
    default: return elementaryAt(rand(1, 39));
  }
}

// Junior High: fixed positions 1–44, then a random mix of JH skills.
// Every tenth position is starred and is checked within 5% by the website.
function juniorHighApprox(position: number): Q {
  if (position === 10) {
    const a = rand(1000, 9999), b = rand(10, 99), c = rand(1000, 9999);
    return make(`★ ${fmt(a)} × ${b} + ${fmt(c)} ≈`, a * b + c, "JH approximation: product plus sum");
  }
  if (position === 20) return approximation(20);
  if (position === 30) {
    const a = rand(100, 999), b = rand(100, 999), c = rand(100, 999);
    return make(`★ ${a} × ${b} + ${c} ≈`, a * b + c, "JH approximation: 3-digit product plus 3-digit number");
  }
  if (position === 40) {
    const [from, to, factor] = pick([
      ["miles", "feet", 5280], ["yards", "inches", 36],
      ["gallons", "fluid ounces", 128], ["tons", "pounds", 2000],
      ["days", "seconds", 86400], ["kilometers", "meters", 1000],
    ] as const);
    const n = rand(1100, 9900);
    return make(`★ Approximately how many ${to} are in ${fmt(n)} ${from}?`, n * factor, "JH approximation: large conversions");
  }
  return juniorHighApprox(pick([10, 20, 30, 40] as const));
}

const jhRoman = (n: number): string => {
  const symbols: Array<[number, string]> = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let remaining = n, result = "";
  for (const [value, symbol] of symbols) {
    while (remaining >= value) { result += symbol; remaining -= value; }
  }
  return result;
};

function juniorHighAt(position: number): Q {
  if (position % 10 === 0) return juniorHighApprox(position);
  let a: number, b: number, c: number, d: number;
  switch (position) {
    case 1:
      a = rand(100, 9999); b = rand(100, 9999);
      return make(`${fmt(a)} + ${fmt(b)} =`, a + b, "JH addition");
    case 2:
      a = rand(1000, 9999); b = rand(100, a - 1);
      return make(`${fmt(a)} − ${fmt(b)} =`, a - b, "JH subtraction");
    case 3:
      a = rand(12, 999); b = rand(2, 9);
      return make(`${a} × ${b} =`, a * b, "JH single-digit factor");
    case 4:
      b = rand(2, 9); c = rand(12, 150); a = b * c;
      return make(`${fmt(a)} ÷ ${b} =`, c, "JH exact division");
    case 5: {
      const den1 = pick([2, 3, 4, 5, 6, 8, 10, 12]);
      const den2 = pick([2, 3, 4, 5, 6, 8, 10, 12]);
      a = rand(1, den1 - 1); b = rand(1, den2 - 1);
      return make(`${fraction(a, den1)} + ${fraction(b, den2)} =`, a / den1 + b / den2, "JH add fractions");
    }
    case 6: {
      const den1 = pick([2, 3, 4, 5, 6, 8, 10, 12]);
      const den2 = pick([2, 3, 4, 5, 6, 8, 10, 12]);
      a = rand(1, den1 - 1); b = rand(1, den2 - 1);
      const first = a / den1, second = b / den2;
      return first >= second
        ? make(`${fraction(a, den1)} − ${fraction(b, den2)} =`, first - second, "JH subtract fractions")
        : make(`${fraction(b, den2)} − ${fraction(a, den1)} =`, second - first, "JH subtract fractions");
    }
    case 7: {
      const decimal = pick([0.125, 0.2, 0.25, 0.5, 0.75]);
      const denominator = Math.round(1 / decimal);
      if (rand(0, 1)) {
        a = rand(2, 50) * denominator;
        return make(`${a} × ${decimal} =`, a * decimal, "JH multiply by common-fraction decimal");
      }
      // Build a whole-number quotient first, so division never produces a messy result.
      b = rand(2, 80); a = b * decimal;
      return make(`${a} ÷ ${decimal} =`, b, "JH divide by common-fraction decimal");
    }
    case 8:
      a = rand(12, 999);
      return make(`${a} × 11 =`, a * 11, "JH multiply by 11");
    case 9:
      a = rand(13, 40);
      return make(`${a}² =`, a * a, "JH squares 13–40");
    case 11:
      a = rand(10, 60); b = rand(2, 9); c = rand(2, 9); d = rand(1, 15);
      return make(`${a} + ${b} × ${c} − ${d} =`, a + b * c - d, "JH PEMDAS");
    case 12:
      a = rand(12, 99); b = rand(12, 99);
      return make(`${a} × ${b} =`, a * b, "JH 2-digit multiplication");
    case 13: {
      if (rand(0, 1)) {
        const values = Array.from({ length: 4 }, () => rand(5, 65)).sort((x, y) => x - y);
        return make(`Find the median of ${values.join(", ")}.`, (values[1] + values[2]) / 2, "JH median");
      }
      a = rand(5, 55);
      const others = Array.from({ length: 2 }, () => rand(5, 55)).map(n => n === a ? a + 1 : n);
      if (others[0] === others[1]) others[1] += 1;
      const values = [a, a, ...others].sort(() => Math.random() - 0.5);
      return make(`Find the mode of ${values.join(", ")}.`, a, "JH mode");
    }
    case 14: {
      const den1 = pick([3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const den2 = pick([3, 4, 5, 6, 7, 8, 9, 10, 12]);
      a = rand(1, den1 - 1); b = rand(1, den2 - 1);
      if (a * den2 === b * den1) return juniorHighAt(14);
      const larger = rand(0, 1) === 1;
      const firstWins = larger ? a * den2 > b * den1 : a * den2 < b * den1;
      return make(`Which fraction is ${larger ? "larger" : "smaller"}? Enter 1 for ${fraction(a, den1)} or 2 for ${fraction(b, den2)}.`, firstWins ? 1 : 2, "JH compare fractions");
    }
    case 15:
      a = rand(300, 1500); b = rand(20, Math.floor(a / 3)); c = rand(10, a - b);
      return make(`${fmt(a)} − ${b} − ${c} =`, a - b - c, "JH three-number subtraction");
    case 16:
      a = rand(10, 90); d = rand(2, 20);
      return make(`${[0, 1, 2, 3, 4].map(i => a + i * d).join(" + ")} =`, 5 * a + 10 * d, "JH five-term arithmetic sequence");
    case 17:
      b = rand(15, 80); c = rand(15, 80); a = rand(20, 90);
      return make(`The mean of x, ${b}, and ${c} is ${a}. Find x.`, 3 * a - b - c, "JH missing number from mean");
    case 18:
      a = rand(11, 29); b = rand(2, 12); c = rand(2, 12);
      return make(`${a} × ${b} + ${c} × ${a} =`, a * (b + c), "JH distributive property");
    case 19:
      a = rand(20, 399);
      return make(`Write ${jhRoman(a)} as a number.`, a, "JH Roman numerals");
    case 21:
      a = rand(2, 10); b = rand(2, 8); c = rand(1, 12); d = rand(1, 20);
      return make(`If x = ${a}, find ${b}x² − ${c}x + ${d}.`, b * a * a - c * a + d, "JH evaluate algebraic expression");
    case 22:
      a = rand(101, 109); b = rand(101, 109);
      return make(`${a} × ${b} =`, a * b, "JH multiplication 101–109");
    case 23:
      a = rand(90, 99); b = rand(90, 99);
      return make(`${a} × ${b} =`, a * b, "JH multiplication in the 90s");
    case 24: {
      d = pick([2, 4, 5, 8, 10]); a = rand(1, 9); b = rand(1, d - 1); c = rand(1, 9);
      const e = rand(1, d - 1);
      return make(`${mixed(a, b, d)} + ${mixed(c, e, d)} =`, a + b / d + c + e / d, "JH add mixed numbers");
    }
    case 25: {
      d = pick([2, 4, 5, 8, 10]); a = rand(4, 12); b = rand(1, d - 1); c = rand(1, a - 1);
      const e = rand(1, d - 1);
      return make(`${mixed(a, b, d)} − ${mixed(c, e, d)} =`, a + b / d - c - e / d, "JH subtract mixed numbers");
    }
    case 26: {
      d = pick([2, 4, 8]); a = rand(1, 7); b = rand(1, d - 1); c = rand(1, d - 1);
      return make(`${mixed(a, b, d)} × ${mixed(a, c, d)} =`, (a + b / d) * (a + c / d), "JH multiply mixed numbers with same whole part");
    }
    case 27: {
      const [from, to, multiplier] = pick([
        ["feet", "inches", 12], ["yards", "feet", 3], ["hours", "minutes", 60],
        ["minutes", "seconds", 60], ["pounds", "ounces", 16], ["gallons", "quarts", 4],
        ["quarts", "cups", 4], ["dozens", "items", 12], ["meters", "centimeters", 100],
      ] as const);
      a = rand(2, 60);
      return make(`How many ${to} are in ${a} ${from}?`, a * multiplier, "JH conversions");
    }
    case 28:
      a = rand(2, 200) * 5; b = pick([5, 6, 8, 10]);
      return make(`Find the ${b}% sales tax on a $${a} purchase (tax only).`, a * b / 100, "JH sales tax");
    case 29:
      a = rand(100, 999);
      return make(`${a} × 111 =`, a * 111, "JH three-digit × 111");
    case 31:
      a = rand(12, 999);
      return make(`${a} × 25 =`, a * 25, "JH multiply by 25");
    case 32:
      a = rand(12, 999);
      return make(`${a} × 50 =`, a * 50, "JH multiply by 50");
    case 33:
      a = rand(12, 999);
      return make(`${a} × 111 =`, a * 111, "JH multiply by 111");
    case 34:
      c = rand(2, 15); a = c * rand(2, 12); b = c * rand(2, 12);
      return make(`Find the GCD of ${a} and ${b}.`, gcd(a, b), "JH GCD");
    case 35:
      a = rand(3, 24); b = rand(3, 24);
      return make(`Find the LCM of ${a} and ${b}.`, lcm(a, b), "JH LCM");
    case 36:
      a = rand(1, 25);
      return make(`√${a * a} =`, a, "JH square roots 1–25");
    case 37: {
      // 100 × numerator/denominator percent, displayed as a mixed percent.
      const den = pick([3, 6, 7, 9, 11, 12, 13]);
      const numerator = rand(1, den - 1);
      const common = gcd(numerator, den);
      const n = numerator / common, d2 = den / common;
      const percentNumerator = 100 * n;
      const whole = Math.floor(percentNumerator / d2);
      const remainder = percentNumerator % d2;
      if (remainder === 0) return juniorHighAt(37);
      const reduction = gcd(remainder, d2);
      return make(`Write ${whole} ${remainder / reduction}/${d2 / reduction}% as a fraction in simplest form.`, n / d2, "JH fractional percent to fraction");
    }
    case 38:
      a = rand(2, 30);
      return make(`${a}⁻¹ =`, 1 / a, "JH exponent negative one");
    case 39:
      a = rand(41, 59);
      return make(`${a}² =`, a * a, "JH squares 41–59");
    case 41:
      a = rand(12, 999);
      return make(`${a} × 101 =`, a * 101, "JH multiply by 101");
    case 42:
      a = 4 * rand(5, 200);
      return make(`${a} × 75 =`, a * 75, "JH multiply by 75 with factor divisible by 4");
    case 43: {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
      if (rand(0, 1)) {
        a = rand(4, 20);
        return make(`What is the ${a}${a % 10 === 1 && a !== 11 ? "st" : a % 10 === 2 && a !== 12 ? "nd" : a % 10 === 3 && a !== 13 ? "rd" : "th"} prime number?`, primes[a - 1], "JH prime numbers");
      }
      a = rand(15, 75); b = a + rand(10, 25);
      return make(`How many prime numbers are from ${a} through ${b}, inclusive?`, primes.filter(n => n >= a && n <= b).length, "JH prime counting");
    }
    case 44:
      a = rand(2, 9); b = rand(2, 12); c = rand(2, 15);
      return make(`If ${a} notebooks cost $${a * b}, how many dollars do ${c} notebooks cost?`, b * c, "JH ratios and proportions");
    default:
      return juniorHighAt(pick([1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,31,32,33,34,35,36,37,38,39,41,42,43,44] as const));
  }
}

export function generateNumberSenseTest(level: Level): NumberSenseQuestion[] {
  const questions: Q[] = [];
  const used = new Set<string>();
  const randomElementaryPositions = [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,31,32,33,34,35,36,37,38,39] as const;
  for (let position = 1; position <= 80; position++) {
    let question: Q;
    let attempts = 0;
    do {
      if (level === "junior-high") question = juniorHighAt(position);
      else if (position <= 40) question = elementaryAt(position);
      else if (position % 10 === 0) question = approximation(50);
      else question = elementaryAt(pick(randomElementaryPositions));
      attempts++;
    } while (used.has(question.question) && attempts < 100);
    used.add(question.question);
    questions.push(question);
  }
  return questions;
}
