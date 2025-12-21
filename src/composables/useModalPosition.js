export function useModalPosition() {
  const getActionCount = (item) => {
    if (!item) return 1;
    if (item.enable === "0") return 1;

    let count = 0;

    if (![" amocrm", "bitrix24", "uon", "bulk"].includes(item.type)) {
      if (![" amocrm", "bitrix24", "uon"].includes(item.type)) count++;
      count += 2;
      if (item.source !== "telegram") count++;
      count += 3;
      count++;
      if (
        !(
          (item.storage === "binder" && item.type === "touchapi") ||
          (item.storage === "whatsapi" && item.type === "undefined")
        )
      ) {
        count++;
      }
    } else if (["amocrm", "bitrix24", "uon"].includes(item.type)) {
      count++;
      if (item.type === "amocrm") count++;
      if (item.source !== "telegram") count++;
    } else if (item.type === "bulk") {
      count += 2;
    }

    return Math.max(1, count);
  };

  const calculateModalPosition = (event, item) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const modalWidth = 160;
    const edgeMargin = 10;

    const actionCount = getActionCount(item);
    const itemHeight = 32;
    const padding = 16;
    const estimatedModalHeight = actionCount * itemHeight + padding;

    if (window.innerWidth <= 768) {
      return {
        top: "auto",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "400px",
      };
    }

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 5;

    if (left + modalWidth > window.innerWidth - edgeMargin) {
      left = window.innerWidth - modalWidth - edgeMargin;
    }

    if (left < edgeMargin) {
      left = edgeMargin;
    }

    const spaceBelow = window.innerHeight - rect.bottom - 15;
    const spaceAbove = rect.top - 15;

    if (actionCount <= 2) {
      if (spaceBelow < estimatedModalHeight) {
        if (spaceAbove > spaceBelow) {
          top = rect.top + window.scrollY - estimatedModalHeight - 5;
        } else {
          top = window.innerHeight - estimatedModalHeight - edgeMargin;
        }
      }
    } else {
      if (spaceBelow < estimatedModalHeight && spaceAbove > spaceBelow) {
        top = rect.top + window.scrollY - estimatedModalHeight - 5;
      }
    }

    if (top < edgeMargin) {
      top = edgeMargin;
    }

    if (top + estimatedModalHeight > window.innerHeight - edgeMargin) {
      top = window.innerHeight - estimatedModalHeight - edgeMargin;
    }

    return {
      top: Math.max(edgeMargin, Math.round(top)),
      left: Math.max(edgeMargin, Math.round(left)),
    };
  };

  return { calculateModalPosition, getActionCount };
}
