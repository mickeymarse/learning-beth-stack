import figlet from 'figlet';
import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => figlet.textSync('Hello Elysia'))
  .onError(({ code }) => {
    if (code === 'NOT_FOUND') return figlet.textSync(`Route not found :'(`);
  })
  .listen(8080);

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}...`);
