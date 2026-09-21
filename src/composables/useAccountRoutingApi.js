import { useBapi } from "@/composables/useBapi";

// Маршрутизация новых обращений по аккаунту (vendor): за ним закрепляется
// сотрудник и/или очередь. Чтобы закрепить сотрудника, у него должны быть
// права на этот аккаунт (см. useEmployeeAccountsApi).
export function useAccountRoutingApi() {
  const { request } = useBapi();

  // { employee_id, queue_id, enabled } — пустая маршрутизация: enabled=false
  const getRouting = async (vendorUuid) => {
    const res = await request("post", "account-routing/get", {
      body: { vendor_uuid: vendorUuid },
    });
    return res.data || { employee_id: null, queue_id: null, enabled: false };
  };

  // CRM-пользователь, назначенный аккаунтом (null, если закреплена только очередь)
  const getRoutingCrmUser = async (vendorUuid) => {
    const res = await request("post", "account-routing/getCrmUser", {
      body: { vendor_uuid: vendorUuid },
    });
    return res.data?.crm_user || null;
  };

  // Полностью перезаписывает маршрутизацию. Не переданный id снимается.
  const setRouting = (vendorUuid, { employee_id, queue_id }) => {
    const body = { vendor_uuid: vendorUuid };
    if (employee_id) body.employee_id = employee_id;
    if (queue_id) body.queue_id = queue_id;
    return request("post", "account-routing/set", { body });
  };

  const deleteRouting = (vendorUuid) =>
    request("post", "account-routing/delete", { body: { vendor_uuid: vendorUuid } });

  return { getRouting, getRoutingCrmUser, setRouting, deleteRouting };
}
