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

export async function getArrathon(id: string): Promise<ArrathonSummary & { inviteToken: string }> {
  const res = await apiFetch(`/arrathons/${id}`)
  if (!res.ok) throw new Error('Failed to fetch arrathon')
  const json = await res.json() as { data: ArrathonSummary & { inviteToken: string } }
  return json.data
}

export async function joinArrathon(token: string): Promise<{ alreadyMember: boolean; arrathon: { name: string } }> {
  const res = await apiFetch(`/arrathons/join/${token}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to join arrathon')
  const json = await res.json() as { data: { alreadyMember: boolean; arrathon: { name: string } } }
  return json.data
}

export type Participant = {
  id: string
  name: string
  familyName: string
  avatarUrl: string | null
  role: 'organisator' | 'participant'
}

export async function getParticipants(arrathonId: string): Promise<Participant[]> {
  const res = await apiFetch(`/arrathons/${arrathonId}/participants`)
  if (!res.ok) throw new Error('Failed to fetch participants')
  const json = await res.json() as { data: Participant[] }
  return json.data
}
