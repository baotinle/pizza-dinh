export function toParamArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

export function getSelectedEmployeeIds(
  value: string | string[] | undefined,
  employees: { id: string }[],
) {
  const requestedIds = toParamArray(value);
  if (requestedIds.length === 0 || requestedIds.includes("all")) return employees.map((e) => e.id);

  const validIds = new Set(employees.map((e) => e.id));
  return [...new Set(requestedIds)].filter((id) => validIds.has(id));
}