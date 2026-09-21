export const employeeFullName = (employee) =>
  [employee?.last_name, employee?.first_name, employee?.middle_name].filter(Boolean).join(" ") ||
  employee?.email ||
  (employee?.id ? `Сотрудник #${employee.id}` : "—");

export const accountLabel = (account) => account?.name || account?.login || account?.uuid || "—";

export const crmUserName = (user) =>
  [user?.last_name, user?.first_name, user?.middle_name].filter(Boolean).join(" ") ||
  (user?.crm_user_id ? `Пользователь CRM #${user.crm_user_id}` : "—");
