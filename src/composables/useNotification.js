import { useRouter } from "vue-router";

export const useNotification = () => {
  const router = useRouter();

  const show = async (notification) => {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const notif = new Notification(notification.title, {
      body: notification.body,
      icon: "/notification-icon.png",
      data: notification.data,
    });

    notif.onclick = () => {
      router.push(`/chat?thread=${notification.data.thread}`);
    };
  };

  return { show };
};
