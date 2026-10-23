import { NotificationData, PurchaseRequestData } from "@/types/dashboard.type";

function getRequestId(
  requestId: NotificationData["requestId"]
): string {
  if (!requestId) return "";
  return typeof requestId === "string" ? requestId : requestId._id;
}


function getEmployeeName(request: PurchaseRequestData): string {
  if (!request.employeeId) return "Employee";

  if (typeof request.employeeId === "string") {
    return "Employee";
  }

  return request.employeeId.name || request.employeeId.email || "Employee";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


export{
    getRequestId,
    formatDate,
    getEmployeeName,
    formatCurrency
}