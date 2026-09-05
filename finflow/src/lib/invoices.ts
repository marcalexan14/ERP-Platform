type LineLike = { quantity: number | string; unitPrice: number | string };

export function computeInvoiceTotal(lines: LineLike[]) {
  return lines.reduce((sum, l) => sum + Number(l.quantity) * Number(l.unitPrice), 0);
}
