import figlet from 'figlet';
import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from 'typed-html';

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
  .get('/todos', () => <TodoList todos={db} />)
  .post(
    '/todos/toggle/:id',
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id);
      if (todo) {
        todo.completed = !todo.completed;
        return <TodoItem {...todo} />;
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .delete(
    '/todos/:id',
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id);
      if (todo) {
        db.splice(db.indexOf(todo), 1);
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    '/todos',
    ({ body }) => {
      if (body.content.length === 0) {
        throw new Error('Content cannot be empty');
      }
      const newTodo = {
        id: lastID++,
        content: body.content,
        completed: false,
      };
      db.push(newTodo);
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

type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

const db: Todo[] = [
  { id: 1, content: 'learn beth stack', completed: true },
  { id: 2, content: 'learn emacs', completed: false },
];

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
