import axios from "axios";
import { computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import { useCompanyStore } from "@/stores/companyStore";

// Обёртка над методами /companies, /offices, /roles, /employees. Пути в
// целом сверены с присланной бэкендом OpenAPI-спекой
// (bapi88-openapi-employees.yaml), НО спека называет компанию и роли в
// единственном числе (/company, /role/*) — на реальном бэке это отдаёт
// "Route not found", проверено на практике (создание компании). Поэтому
// company/role здесь намеренно во множественном числе, как было
// подтверждено раньше прямыми запросами к реальному бэку — спека тут либо
// устарела, либо не задеплоена. offices/employees в спеке и так во
// множественном, конфликта с ней нет.
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
  // какого-то метода бэк всё же отдаёт данные плоско (например массив
  // напрямую в data, без обёртки в объект).
  //
  // Важно: если data — объект (не массив) и нужного ключа в нём НЕТ, надо
  // вернуть fallback, а не сам data. Раньше тут стояло `data ?? fallback`,
  // из-за чего {ok:true, data:{}} (пустой, но "успешный" ответ — например
  // роль ещё ни разу не сохранялась) отдавал {} вместо null: {} truthy,
  // `??` на него не срабатывает. В usePermissions.js это {} побеждало
  // `||`-фолбэк на DEFAULT_PERMISSIONS раньше, чем до него доходило —
  // сотрудник с ещё не настроенной ролью получал ВСЕ права выключенными
  // вместо разумных дефолтов. Воспроизведено и подтверждено тестом.
  const unwrap = (response, key, fallback) => {
    const data = response.data?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return key in data ? data[key] : fallback;
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

  const createCompany = async ({ name, brand, phone, data, settings }) => {
    const response = await axios.post(
      `${BASE_URL}companies/create`,
      { name, brand, phone, data, settings },
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

  const updateOffice = async (id, { name, address, data, settings }) => {
    const response = await axios.post(
      `${BASE_URL}offices/update/${id}`,
      { name, address, data, settings },
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

  // /roles/permissions-all (загрузка всех ролей одним запросом) на момент
  // прошлой проверки не была задеплоена на бэке ("Route not found") — вместо
  // неё дёргаем /roles/permissions по каждой роли отдельно. Как только -all
  // подтвердится рабочим, можно будет вернуться к одному запросу.
  const fetchRolesAll = async () => {
    const roles = {};
    await Promise.all(
      ROLE_IDS.map(async (role) => {
        try {
          const permissions = await fetchRolePermissions(role);
          // Пустой объект — ответ бэка для роли, которую ещё не сохраняли,
          // не настоящие права; не кладём его в результат, иначе он ниже
          // (как truthy) перебьёт дефолты в RolesTab.vue/usePermissions.js.
          if (permissions && Object.keys(permissions).length > 0) roles[role] = permissions;
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
      { permissions },
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

  // Создаёт запись сотрудника в БД компании (email/роль/имя/должность/
  // офисы) — только после этого шага employees/sendInvitation ниже вообще
  // может что-то найти и отправить (иначе она отвечает 403 "Employee not
  // found or disabled", т.к. ищет уже существующую запись, а не создаёт её).
  const addEmployee = async ({
    email,
    role,
    first_name,
    last_name,
    middle_name,
    position,
    office_ids,
    data,
    settings,
  }) => {
    const response = await axios.post(
      `${BASE_URL}employees/add`,
      { email, role, first_name, last_name, middle_name, position, office_ids, data, settings },
      authHeaders(),
    );
    await fetchEmployees();
    return response.data?.data || response.data;
  };

  // Генерирует одноразовую ссылку для входа и отправляет её на почту
  // сотрудника (аналог текущей верификации почты) — сотрудник переходит по
  // ссылке (auth/login-by-link) и, если это первый вход, задаёт себе пароль
  // (auth/set-subuser-password). Требует, чтобы запись сотрудника уже была
  // создана через addEmployee — сама она никого не создаёт.
  const sendEmployeeInvitation = async (email) => {
    const response = await axios.post(
      `${BASE_URL}employees/sendInvitation`,
      { company_id: companyStore.getCompany?.id, email },
      authHeaders(),
    );
    return response.data;
  };

  // Роль сотруднику не меняется этим методом — в схеме employees/update её
  // нет вообще, поэтому не отправляем её в теле.
  const updateEmployee = async (
    id,
    { first_name, last_name, middle_name, position, office_ids, data, settings },
  ) => {
    const response = await axios.post(
      `${BASE_URL}employees/update/${id}`,
      { first_name, last_name, middle_name, position, office_ids, data, settings },
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

  const enableEmployee = async (id) => {
    const response = await axios.post(
      `${BASE_URL}employees/enable/${id}`,
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
    addEmployee,
    sendEmployeeInvitation,
    updateEmployee,
    disableEmployee,
    enableEmployee,
  };
}
