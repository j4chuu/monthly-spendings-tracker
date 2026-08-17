import { Prisma } from "@prisma/client";

export function decimalToNumber(value: Prisma.Decimal): number {
  return Number(value.toFixed(2));
}

export function numberToDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}
