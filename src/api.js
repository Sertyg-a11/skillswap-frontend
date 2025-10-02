const DEV_USER = 'dev'
const DEV_PASS = 'devpass'
const basic = btoa(`${DEV_USER}:${DEV_PASS}`)

export async function listMessages(limit = 50) {
  const res = await fetch(`/api/messages?limit=${limit}`)
  if (!res.ok) throw new Error(`List failed: ${res.status}`)
  return res.json()
}

export async function createMessage(userId, content) {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basic}`,
    },
    body: JSON.stringify({ userId, content }),
  })
  if (!res.ok) throw new Error(`Create failed: ${res.status}`)
  return res.json()
}
