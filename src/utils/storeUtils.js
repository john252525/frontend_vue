export function getChatStoresByNames(storeNames) {
  const allChats = [];

  // Если storeNames - реактивная ссылка, берем .value
  const namesArray = Array.isArray(storeNames)
    ? storeNames
    : storeNames?.value || [];

  if (!namesArray.length) {
    console.warn("storeNames пуст или невалиден", storeNames);
    return allChats;
  }

  const targetStores = new Set(namesArray);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (targetStores.has(key)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (!data?.chats) continue;

        // Обработка обоих форматов
        const chats = Array.isArray(data.chats)
          ? data.chats.map((c) => ({ ...c, source: key }))
          : Object.values(data.chats).map((chat) => ({
              id: chat.id,
              uniq: chat.uniq,
              data: chat.data,
              source: key,
            }));

        allChats.push(...chats);
      } catch (e) {
        console.error(`Ошибка в ${key}:`, e);
      }
    }
  }

  return allChats;
}
