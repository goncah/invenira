export async function getRequest<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(res.statusText);
  }
}

export async function postRequest<I, O>(
  url: string,
  token: string,
  body: I,
): Promise<O> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(res.statusText);
  }
}

export async function patchRequest<I, O>(
  url: string,
  token: string,
  body: I,
): Promise<O> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(res.statusText);
  }
}

export async function deleteRequest(url: string, token: string): Promise<void> {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.ok) {
    return;
  } else {
    throw new Error(res.statusText);
  }
}
