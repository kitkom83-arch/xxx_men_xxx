import { Html, Head, Main, NextScript } from 'next/document';

export const dynamic = 'force-dynamic';

export default function Document() {
  return (
    <Html lang="th">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
