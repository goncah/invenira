const parseBody = <T>(body: string): T => {
  const dateParser = (key: string, value: unknown) => {
    const iso =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    if (typeof value === 'string') {
      if (iso.exec(value)) {
        return new Date(value);
      }
      return value;
    }
    return value;
  };

  return JSON.parse(body, dateParser);
};

export async function getRequest<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.ok) {
    return parseBody<T>(await res.text());
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
    return parseBody<O>(await res.text());
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
    return parseBody<O>(await res.text());
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
