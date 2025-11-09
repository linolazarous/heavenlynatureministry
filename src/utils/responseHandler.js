export async function handleResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(new Error(error));
  }

  return data;
}
