const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const usd = (n: number): string => usdFmt.format(n);
export const frac = (m: { hit: number; total: number }): string => `${m.hit}/${m.total}`;
