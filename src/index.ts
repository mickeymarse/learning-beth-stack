import figlet from 'figlet';
import { Elysia } from 'elysia';

const app = new Elysia().get('/', () => figlet.textSync('Hello Elysia')).listen(8080);

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}...`);
