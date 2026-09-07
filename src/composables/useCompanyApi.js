import axios from "axios";
import { computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import { useCompanyStore } from "@/stores/companyStore";

// Обёртка над методами /companies, /offices, /roles, /employees — сами методы
// прислал бэкенд (пока без гарантии, что они уже отлажены на его стороне).
// Базовый URL временно = VITE_BASE_URL (общий версионированный корень API,
// по аналогии с тем, как строятся другие VITE_FRONTEND_URL_* переменные) —
// точный путь стоит свериться с бэком отдельно, когда методы будут обкатаны.
const BASE_URL = import.meta.env.VITE_BASE_URL;

export function useCompanyApi() {
  const accountStore = useAccountStore();
  const companyStore = useCompanyStore();
  const token = computed(() => accountStore.getAccountToken);

  const authHeaders = () => ({
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token.value}`,
    },
  });

  // Бэк заворачивает полезные данные в именованный ключ внутри data, а не
  // отдаёт их напрямую — например /companies/get реально отвечает
  // {ok:true, data:{company: null}}, а не {data: null}. Если доставать
  // просто response.data.data, получаем объект {company: null}, который
  // truthy — и это ломает проверку "компания есть/нет". Пробуем ожидаемый
  // именованный ключ первым, но подстраховываемся и на случай, если для
  // какого-то метода бэк всё же отдаёт данные плоско.
  const unwrap = (response, key, fallback) => {
    const data = response.data?.data;
    if (data && typeof data === "object" && !Array.isArray(data) && key in data) {
      return data[key];
    }
    return data ?? fallback;
  };

  // ===== Компания =====

  const fetchCompany = async () => {
    try {
      const response = await axios.get(`${BASE_URL}companies/get`, authHeaders());
      const company = unwrap(response, "company", null);
      companyStore.setCompany(company);
      return company;
    } catch (error) {
      // 404/отсутствие компании — это не сбой, а нормальное "не апгрейднулся"
      companyStore.setCompany(null);
      return null;
    }
  };

  const createCompany = async ({ name, phone, data, settings }) => {
    const response = await axios.post(
      `${BASE_URL}companies/create`,
      { name, phone, data, settings },
      authHeaders(),
    );
    await fetchCompany();
    return response.data;
  };

  const updateCompany = async ({
    name,
    brand,
    inn,
    legal_form,
    locale,
    phone,
    data,
    settings,
  }) => {
    const response = await axios.post(
      `${BASE_URL}companies/update`,
      { name, brand, inn, legal_form, locale, phone, data, settings },
      authHeaders(),
    );
    await fetchCompany();
    return response.data;
  };

  const toggleCompanyEnabled = async (enabled) => {
    const response = await axios.post(
      `${BASE_URL}companies/toggleEnabled`,
      { enabled },
      authHeaders(),
    );
    await fetchCompany();
    return response.data;
  };

  // ===== Офисы =====

  const fetchOffices = async () => {
    const response = await axios.get(`${BASE_URL}offices/getAll`, authHeaders());
    const offices = unwrap(response, "offices", []) || [];
    companyStore.setOffices(offices);
    return offices;
  };

  const createOffice = async ({ name, address, data, settings }) => {
    const response = await axios.post(
      `${BASE_URL}offices/create`,
      { name, address, data, settings },
      authHeaders(),
    );
    await fetchOffices();
    return response.data;
  };

  const updateOffice = async (id, { name, address, data, settings, enabled }) => {
    const response = await axios.post(
      `${BASE_URL}offices/update/${id}`,
      { name, address, data, settings, enabled },
      authHeaders(),
    );
    await fetchOffices();
    return response.data;
  };

  const toggleOfficeEnabled = async (id, enabled) => {
    const response = await axios.post(
      `${BASE_URL}offices/toggleEnabled/${id}`,
      { enabled },
      authHeaders(),
    );
    await fetchOffices();
    return response.data;
  };

  // ===== Роли =====

  // Три фиксированные роли — см. RolesTab.vue.
  const ROLE_IDS = ["manager", "senior_manager", "admin"];

  const fetchRolePermissions = async (role) => {
    const response = await axios.get(`${BASE_URL}roles/permissions`, {
      ...authHeaders(),
      params: { role },
    });
    return unwrap(response, "permissions", null);
  };

  // /roles/permissions-all (загрузка всех ролей одним запросом) пока не
  // задеплоена на бэке ("Route not found") — вместо неё дёргаем
  // /roles/permissions по каждой роли отдельно. Как только -all появится,
  // можно будет вернуться к одному запросу.
  const fetchRolesAll = async () => {
    const roles = {};
    await Promise.all(
      ROLE_IDS.map(async (role) => {
        try {
          const permissions = await fetchRolePermissions(role);
          if (permissions) roles[role] = permissions;
        } catch (error) {
          // Роль ещё ни разу не сохранялась — RolesTab.vue сам подставит
          // дефолтные права для неё, ошибку здесь считаем нормальной.
        }
      }),
    );
    companyStore.setRoles(roles);
    return roles;
  };

  const saveRolePermissions = async (role, permissions) => {
    const response = await axios.post(
      `${BASE_URL}roles/save?role=${encodeURIComponent(role)}`,
      permissions,
      authHeaders(),
    );
    companyStore.setRolePermissions(role, permissions);
    return response.data;
  };

  // ===== Сотрудники =====

  const fetchEmployees = async () => {
    const response = await axios.get(`${BASE_URL}employees/getAll`, authHeaders());
    const employees = unwrap(response, "employees", []) || [];
    companyStore.setEmployees(employees);
    return employees;
  };

  // Создание сотрудника пока идёт не напрямую (/employees/add ещё не готов
  // на бэке), а через приглашение на почту — по той же схеме, что верификация
  // почты сейчас: сотрудник сам регистрируется и задаёт себе пароль по
  // ссылке из письма.
  const sendEmployeeInvitation = async (email) => {
    const response = await axios.post(
      `${BASE_URL}employees/send-invitation`,
      { company_id: companyStore.getCompany?.id, email },
      authHeaders(),
    );
    return response.data;
  };

  const updateEmployee = async (
    id,
    { role, first_name, last_name, middle_name, position, office_ids, data, settings, enabled },
  ) => {
    const response = await axios.post(
      `${BASE_URL}employees/update/${id}`,
      { role, first_name, last_name, middle_name, position, office_ids, data, settings, enabled },
      authHeaders(),
    );
    await fetchEmployees();
    return response.data;
  };

  const disableEmployee = async (id) => {
    const response = await axios.post(
      `${BASE_URL}employees/disable/${id}`,
      {},
      authHeaders(),
    );
    await fetchEmployees();
    return response.data;
  };

  return {
    fetchCompany,
    createCompany,
    updateCompany,
    toggleCompanyEnabled,
    fetchOffices,
    createOffice,
    updateOffice,
    toggleOfficeEnabled,
    fetchRolePermissions,
    fetchRolesAll,
    saveRolePermissions,
    fetchEmployees,
    sendEmployeeInvitation,
    updateEmployee,
    disableEmployee,
  };
}
