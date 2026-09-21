import { useCompanyStore } from "@/stores/companyStore";
import { useBapi } from "@/composables/useBapi";

// Очереди сотрудников: employee-queues/*. Пока создавать и менять их может
// только owner (так сейчас на бэке).
export function useEmployeeQueuesApi() {
  const companyStore = useCompanyStore();
  const { request } = useBapi();

  const fetchQueues = async () => {
    const res = await request("post", "employee-queues/list", { body: {} });
    const queues = res.data?.queues || [];
    companyStore.setQueues(queues);
    return queues;
  };

  const createQueue = async ({ name, mode }) => {
    const res = await request("post", "employee-queues/create", { body: { name, mode } });
    await fetchQueues();
    return res.data?.queue_id;
  };

  const updateQueue = async (id, { name, mode }) => {
    await request("post", `employee-queues/update/${id}`, { body: { name, mode } });
    await fetchQueues();
  };

  const deleteQueue = async (id) => {
    await request("post", `employee-queues/delete/${id}`, { body: {} });
    await fetchQueues();
  };

  const fetchQueueMembers = async (id) => {
    const res = await request("post", `employee-queues/getMembers/${id}`, { body: {} });
    return res.data?.members || [];
  };

  const addQueueMember = (id, { employee_id, priority }) =>
    request("post", `employee-queues/addMember/${id}`, { body: { employee_id, priority } });

  const removeQueueMember = (id, employee_id) =>
    request("post", `employee-queues/removeMember/${id}`, { body: { employee_id } });

  const toggleQueueMember = async (id, employee_id, enabled) => {
    const res = await request("post", `employee-queues/toggleMember/${id}`, {
      body: { employee_id, enabled },
    });
    return res.data?.enabled;
  };

  return {
    fetchQueues,
    createQueue,
    updateQueue,
    deleteQueue,
    fetchQueueMembers,
    addQueueMember,
    removeQueueMember,
    toggleQueueMember,
  };
}
