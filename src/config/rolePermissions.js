// Значения по умолчанию для трёх фиксированных ролей (manager/senior_manager/
// admin) — ровно то, что описано в требованиях. Используются как база,
// пока для компании нет реально сохранённых прав (метод ещё не отлажен на
// бэке, ответ может быть пустым) — и как фолбэк в usePermissions.js для
// сессий, где companyStore.roles ещё не подгружен (например, сотрудник
// открыл страницу без визита в раздел "Организация").
export const DEFAULT_PERMISSIONS = {
  manager: {
    accounts: { view_all: false, add: false, delete: false },
    chats: { view_all: false, connect_any: false },
    mailings: { view: true, create: true },
    managers: { add: false, delete: false, attach_accounts: false, detach_accounts: false },
    subscriptions: { pay: false },
    profile: { edit_own: true },
    crm: { write_from_crm: false },
  },
  senior_manager: {
    accounts: { view_all: true, add: false, delete: false },
    chats: { view_all: true, connect_any: true },
    mailings: { view: true, create: true },
    // add — по умолчанию выключено, но, в отличие от manager, для этой роли
    // видно и можно включить (коллега подтвердил именно так).
    managers: { add: false, delete: false, attach_accounts: true, detach_accounts: true },
    subscriptions: { pay: false },
    profile: { edit_own: true },
    crm: { write_from_crm: false },
  },
  admin: {
    accounts: { view_all: true, add: true, delete: true },
    chats: { view_all: true, connect_any: true },
    mailings: { view: true, create: true },
    managers: { add: true, delete: true, attach_accounts: true, detach_accounts: true },
    subscriptions: { pay: true },
    profile: { edit_own: true },
    crm: { write_from_crm: true },
  },
};
