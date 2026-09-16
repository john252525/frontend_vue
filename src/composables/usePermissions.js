import { computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import { useCompanyStore } from "@/stores/companyStore";
import { DEFAULT_PERMISSIONS } from "@/config/rolePermissions";

// Три единственные роли, которые вообще существуют в системе — см.
// RolesTab.vue. Любое другое значение в токене (в т.ч. какой-то свой,
// не связанный с этой системой role-claim из общей авторизации) намеренно
// игнорируем, а не трактуем как "это сотрудник" — система приглашений
// сотрудников на бэке ещё не готова, реальной роли оттуда взяться неоткуда,
// и ошибочно спрятать кнопки владельцу намного хуже, чем не ограничить
// сотрудника, которого физически ещё не существует.
const KNOWN_ROLES = ["manager", "senior_manager", "admin"];

const decodeJwtRole = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return KNOWN_ROLES.includes(payload.role) ? payload.role : null;
  } catch (e) {
    return null;
  }
};

export function usePermissions() {
  const accountStore = useAccountStore();
  const companyStore = useCompanyStore();

  // Роль есть только у приглашённого сотрудника — у владельца компании
  // (того, кто её создал) в токене роли нет вообще, и это единственный
  // способ отличить owner от employee, который прислал бэк.
  const currentRole = computed(() => decodeJwtRole(accountStore.getAccountToken));
  const isOwner = computed(() => !currentRole.value);

  // Пустой объект прав ({}) — truthy в JS, поэтому наивный `||`-фолбэк на
  // DEFAULT_PERMISSIONS с ним не срабатывает. А такой пустой объект — вполне
  // реальный ответ бэка для роли, которую ещё ни разу не сохраняли (баг уже
  // ловили на уровне unwrap() в useCompanyApi.js, но здесь — последний
  // рубеж: чем бы ни оказался companyStore.roles[role], пустой объект тут
  // не должен побеждать разумные дефолты.
  const hasSavedPermissions = (permissions) =>
    !!permissions && typeof permissions === "object" && Object.keys(permissions).length > 0;

  // companyStore.roles заполняется только когда кто-то открыл раздел
  // "Организация" (там вызывается fetchRolesAll). Сотрудник, который зашёл
  // сразу на другую страницу, может застать этот стор пустым — в этом
  // случае используем дефолтные права роли, а не считаем, что доступа нет
  // ни к чему. Как только реальные (возможно, изменённые владельцем) права
  // подгрузятся, они возьмут верх — DEFAULT_PERMISSIONS в приоритете ниже.
  const currentPermissions = computed(() => {
    const saved = companyStore.getRoles?.[currentRole.value];
    return hasSavedPermissions(saved) ? saved : DEFAULT_PERMISSIONS[currentRole.value] || null;
  });

  // Владелец не ограничен ролевой матрицей — у него всегда полный доступ.
  const can = (group, field) => {
    if (isOwner.value) return true;
    return currentPermissions.value?.[group]?.[field] === true;
  };

  return { currentRole, isOwner, can };
}
