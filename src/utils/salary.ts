export interface SalaryInfo {
  salary_min?: number | null;
  salary_max?: number | null;
  is_negotiable?: boolean;
  salary?: string;
}

export function formatVndAmount(amount: number): string {
  if (amount >= 1000000 && amount % 1000000 === 0) {
    return `${amount / 1000000} triệu`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.0', '')} triệu`;
  }
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function formatVndAmountCompact(amount: number): string {
  if (amount >= 1000000 && amount % 1000000 === 0) {
    return `${amount / 1000000}tr`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.0', '')}tr`;
  }
  if (amount >= 1000 && amount % 1000 === 0) {
    return `${amount / 1000}k`;
  }
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function formatSalary(job: SalaryInfo): string {
  if (job.is_negotiable) {
    return 'Thỏa thuận';
  }

  const min = job.salary_min;
  const max = job.salary_max;

  if (!min && !max) {
    return job.salary || 'Thỏa thuận';
  }

  if (min && max && min === max) {
    return formatVndAmount(min);
  }

  if (min && max) {
    return `${formatVndAmountCompact(min)} - ${formatVndAmountCompact(max)}`;
  }

  if (min) return `Từ ${formatVndAmount(min)}`;
  if (max) return `Tới ${formatVndAmount(max)}`;

  return 'Thỏa thuận';
}
