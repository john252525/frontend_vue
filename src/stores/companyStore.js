import { defineStore } from "pinia";

export const useCompanyStore = defineStore("companyStore", {
  state: () => ({
    company: null, // null — компания ещё не создана (пользователь не апгрейдился)
    offices: [],
    roles: {}, // { manager: {...permissions}, senior_manager: {...}, admin: {...} }
    employees: [],
  }),

  getters: {
    hasCompany: (state) => !!state.company,
    getCompany: (state) => state.company,
    getOffices: (state) => state.offices,
    getRoles: (state) => state.roles,
    getEmployees: (state) => state.employees,
  },

  actions: {
    setCompany(data) {
      this.company = data || null;
    },

    setOffices(data) {
      this.offices = data || [];
    },

    setRoles(data) {
      this.roles = data || {};
    },

    setRolePermissions(role, permissions) {
      this.roles = { ...this.roles, [role]: permissions };
    },

    setEmployees(data) {
      this.employees = data || [];
    },

    upsertEmployee(employee) {
      const index = this.employees.findIndex((e) => e.id === employee.id);
      if (index !== -1) {
        this.employees[index] = { ...this.employees[index], ...employee };
      } else {
        this.employees.push(employee);
      }
    },

    clearCompany() {
      this.company = null;
      this.offices = [];
      this.roles = {};
      this.employees = [];
    },
  },

  // Не персистим — данные должны быть свежими при каждой сессии, как instancesStore
  persist: false,
});
