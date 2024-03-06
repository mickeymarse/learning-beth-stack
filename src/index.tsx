import figlet from 'figlet';
import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from 'typed-html';

const app = new Elysia()
  .use(html())
  .get('/', ({ html }) =>
    html(
      <BaseHtml>
        <body class='flex w-full h-screen justify-center items-center'>
          <button hx-post='/clicked' hx-swap='outerHTML'>
            Click Me
          </button>
        </body>
      </BaseHtml>
    )
  )
  .post('clicked', () => <section class='text-blue-600'>I'm from the server!</section>)
  .onError(({ code }) => {
    if (code === 'NOT_FOUND') return figlet.textSync(`Route not found :'(`);
  })
  .listen(8080);

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}...`);

const BaseHtml: any = ({ children }: elements.Children) => `
              <html lang='en'>
                <head>
                    <title>Hello World</title>
                </head>
                ${children}
                <script src="https://unpkg.com/htmx.org@1.9.10" integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC" crossorigin="anonymous"></script>
                <script src="https://cdn.tailwindcss.com"></script>
            </html>
            `;
