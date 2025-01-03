import { useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useState } from 'react';

export default function ConfigInterface() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('interfaceUrl');

  const [html, setHtml] = useState('');

  fetch(url!, { method: 'GET' })
    .then((res) => res.text())
    .then((text) => setHtml(text));

  return (
    <div
      className="content"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    ></div>
  );
}
