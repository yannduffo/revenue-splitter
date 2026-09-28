//GET for our own API endpoints
export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path)   //we can use the relative URL
  if (!res.ok) throw new Error(`GET ${path} failed : ${res.status}`) //we throw an Error so react query can see it
  return res.json() as Promise<T>
}
