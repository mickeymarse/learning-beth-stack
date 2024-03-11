import figlet from 'figlet';
import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from 'typed-html';
import { db } from './db';
import { Todo, todos } from './db/schema';
import { eq } from 'drizzle-orm';

const app = new Elysia()
  .use(html())
  .get('/', ({ html }) =>
    html(
      <BaseHtml>
        <body
          class='flex w-full h-screen justify-center items-center'
          hx-get='/todos'
          hx-trigger='load'
          hx-swap='innerHTML'
        />
      </BaseHtml>
    )
  )
  .get('/todos', async () => {
    const data = await db.select().from(todos).all();
    return <TodoList todos={data} />;
  })
  .post(
    '/todos/toggle/:id',
    async ({ params }) => {
      const oldTodo = await db.select().from(todos).where(eq(todos.id, params.id)).get();
      const newTodo = await db
        .update(todos)
        .set({ completed: !oldTodo.completed })
        .where(eq(todos.id, params.id))
        .returning()
        .get();
      return <TodoItem {...newTodo} />;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .delete(
    '/todos/:id',
    async ({ params }) => {
      await db.delete(todos).where(eq(todos.id, params.id)).run();
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    '/todos',
    async ({ body }) => {
      const newTodo = await db.insert(todos).values(body).returning().get();
      return <TodoItem {...newTodo} />;
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    }
  )
  .onError(({ code }) => {
    if (code === 'NOT_FOUND') return figlet.textSync(`Route not found :'(`);
  })
  .listen(8080);

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}...`);

const BaseHtml: any = ({ children }: elements.Children) => `
              <html lang='en'>
                <head>
                    <title>Hello World</title>
                    <script src="https://unpkg.com/htmx.org@1.9.10" integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC" crossorigin="anonymous"></script>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                ${children}
            </html>
            `;

function TodoItem({ content, completed, id }) {
  return (
    <section class='flex flex-row space-x-3'>
      <p>{content}</p>
      <input
        type='checkbox'
        checked={completed}
        hx-post={`/todo/toggle/${id}`}
        hx-target='closest div'
        hx-swap='outerHTML'
      />
      <button
        class='text-red-500'
        hx-post={`/todo/${id}`}
        hx-target='closest div'
        hx-swap='outerHTML'
      >
        X
      </button>
    </section>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <section>
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
      <TodoForm />
    </section>
  );
}

function TodoForm() {
  return (
    <form class='flex flex-row space-x-3' hx-post='/todos' hx-swap='beforebegin'>
      <input type='text' name='content' class='border border-black' />
      <button type='submit'>Add</button>
    </form>
  );
}
