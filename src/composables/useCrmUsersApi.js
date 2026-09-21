import { useBapi } from "@/composables/useBapi";

// Пользователи CRM (пока только Bitrix24) и связи сотрудников ЛК с ними.
// Автоматом связать нельзя — Bitrix24 не отдаёт email сотрудника, поэтому
// связывает админ вручную (crm_id — это login вендора Bitrix24, т.е. member_id).
export function useCrmUsersApi() {
  const { request } = useBapi();

  const fetchCrmUsers = async (vendorUuid) => {
    const res = await request("post", "crm-users/getUsers", { body: { uuid: vendorUuid } });
    return res.data?.users || [];
  };

  const fetchCrmLinks = async (companyId) => {
    const res = await request("post", "employee-crm-user-links/getAll", {
      body: { company_id: companyId },
    });
    return res.data?.links || [];
  };

  const linkCrmUser = ({ company_id, employee_id, user_id, crm_type, crm_id, crm_user_id }) =>
    request("post", "employee-crm-user-links/link", {
      body: { company_id, employee_id, user_id, crm_type, crm_id, crm_user_id },
    });

  const deleteCrmLink = ({ company_id, employee_id, crm_type, crm_id }) =>
    request("post", "employee-crm-user-links/delete", {
      body: { company_id, employee_id, crm_type, crm_id },
    });

  return { fetchCrmUsers, fetchCrmLinks, linkCrmUser, deleteCrmLink };
}
