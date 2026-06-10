export const ALLOWED_BRANCHES = ['SUC-CENTRAL', 'SUC-NORTE', 'SUC-SUR', 'SUC-OESTE', 'SUC-ESTE'] as const;

export type AllowedBranch = (typeof ALLOWED_BRANCHES)[number];

export const BRANCH_OPTIONS: readonly AllowedBranch[] = ALLOWED_BRANCHES;

export function isAllowedBranch(value: string | null | undefined): value is AllowedBranch {
  return !!value && ALLOWED_BRANCHES.includes(value.toUpperCase() as AllowedBranch);
}
