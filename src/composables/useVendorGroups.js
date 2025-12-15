import { ref, computed } from "vue";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_GROUP_URL;

export const useVendorGroups = (token) => {
  const groups = ref({});
  const loading = ref(false);
  const error = ref(null);

  const supportedTypes = ["whatsapp", "telegram"];

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: false,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403) {
        console.error("CORS или Авторизация ошибка");
      }
      return Promise.reject(error);
    }
  );

  const getGroups = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get();
      groups.value = response.data.data.vendor_groups;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  const addGroup = async (payload) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post("add", payload);
      await getGroups();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error adding group:", err);
    } finally {
      loading.value = false;
    }
  };

  const deleteGroup = async (uuid) => {
    loading.value = true;
    error.value = null;
    try {
      console.log("🗑️ Удаляем группу:", uuid);
      const response = await axiosInstance.post("/delete", {
        uuid,
      });
      console.log("✅ Ответ от сервера:", response.data);
      await getGroups();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error deleting group:", err);
    } finally {
      loading.value = false;
    }
  };

  const updateGroup = async (payload) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post("/update", payload);
      await getGroups();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error updating group:", err);
    } finally {
      loading.value = false;
    }
  };

  const addVendorToGroup = async (groupUuid, vendorUuid) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post("/addVendor", {
        group_uuid: groupUuid,
        vendor_uuid: vendorUuid,
      });
      await getGroups();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error adding vendor to group:", err);
    } finally {
      loading.value = false;
    }
  };

  // Добавить метод для массового добавления вендоров
  const addVendorsToGroup = async (groupUuid, vendorUuids) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post("/addVendors", {
        group_uuid: groupUuid,
        vendor_uuids: vendorUuids,
      });
      await getGroups();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error adding vendors to group:", err);
    } finally {
      loading.value = false;
    }
  };

  const deleteVendorFromGroup = async (groupUuid, vendorUuid) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post("/deleteVendor", {
        group_uuid: groupUuid,
        vendor_uuid: vendorUuid,
      });
      await getGroups();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error deleting vendor from group:", err);
    } finally {
      loading.value = false;
    }
  };

  // ✅ ГЛАВНОЕ: Все группы как список (включая пустые)
  const allGroupsList = computed(() => {
    const allGroups = Object.values(groups.value);
    console.log("📋 Все группы (список, включая пустые):", allGroups);
    console.log("📊 Всего групп:", allGroups.length);
    return allGroups;
  });

  // Группы с вендорами (хотя бы один вендор) - опционально
  const groupsWithVendors = computed(() => {
    const filtered = allGroupsList.value.filter((group) => {
      const vendors = group.vendors;
      if (Array.isArray(vendors)) {
        return vendors.length > 0;
      }
      if (vendors && typeof vendors === "object") {
        return Object.keys(vendors).length > 0;
      }
      return false;
    });
    console.log("📋 Группы с вендорами:", filtered);
    return filtered;
  });

  const getAvailableVendorsForType = (groupUuid, vendorType) => {
    const group = groups.value[groupUuid];
    if (!group) return [];

    const vendors = group.vendors || [];
    const vendorsArray = Array.isArray(vendors)
      ? vendors
      : Object.values(vendors);

    const hasVendorOfType = vendorsArray.some(
      (vendor) => vendor.source === vendorType
    );

    return !hasVendorOfType ? vendorType : null;
  };

  return {
    groups,
    allGroupsList, // ✅ Все группы (рендери это!)
    groupsWithVendors, // Только с вендорами (если нужно)
    loading,
    error,
    getGroups,
    addGroup,
    deleteGroup,
    updateGroup,
    addVendorToGroup,
    addVendorsToGroup, // ✅ Новый метод для массового добавления
    deleteVendorFromGroup,
    getAvailableVendorsForType,
    supportedTypes,
  };
};
