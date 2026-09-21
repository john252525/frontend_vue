// Декодирует payload JWT без проверки подписи — только чтобы прочитать
// claim'ы (role, brand_slug и т.п.) на клиенте. Доверять этим данным для
// безопасности нельзя: реальную проверку прав делает бэк.
export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch (e) {
    return null;
  }
};
