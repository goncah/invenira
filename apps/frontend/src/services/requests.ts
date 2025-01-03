export async function getRequest(
  url: string,
  token: string,
): Promise<Response> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.statusText);
  }
}

export async function postRequest(
  url: string,
  token: string,
  body: any,
): Promise<Response> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.statusText);
  }
}

export async function patchRequest(
  url: string,
  token: string,
  body: any,
): Promise<Response> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    return res;
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
