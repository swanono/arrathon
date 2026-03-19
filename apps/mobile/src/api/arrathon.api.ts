import { apiFetch } from './client'

export type ArrathonSummary = {
  id: string
  name: string
  date: string
  role: 'organisator' | 'participant'
  createdAt: string
}

export async function getMyArrathons(): Promise<ArrathonSummary[]> {
  const res = await apiFetch('/arrathons')
  if (!res.ok) throw new Error('Failed to fetch arrathons')
  const json = await res.json() as { data: ArrathonSummary[] }
  return json.data
}

export async function createArrathon(input: { name: string; date: string }): Promise<ArrathonSummary> {
  const res = await apiFetch('/arrathons', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create arrathon')
  const json = await res.json() as { data: ArrathonSummary }
  return json.data
}
