export function getApiBaseUrl() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  if (configuredBaseUrl && configuredBaseUrl !== "") {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  return "";
}
