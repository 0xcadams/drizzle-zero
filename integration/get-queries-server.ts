import {serve} from '@hono/node-server';
import {mustGetQuery} from '@rocicorp/zero';
import {handleQueryRequest} from '@rocicorp/zero/server';
import {Hono} from 'hono';
import type {Server} from 'http';
import {queries} from './synced-queries';
import {schema} from './zero-schema.gen';

const app = new Hono();

app.post('/get-queries', async c => {
  try {
    const jsonBody = await c.req.json();

    const response = await handleQueryRequest(
      (name, args) => {
        const q = mustGetQuery(queries, name);
        return q.fn({args, ctx: undefined});
      },
      schema,
      jsonBody,
    );

    return c.json(response);
  } catch (error) {
    console.error('Error in get-queries-server:', error);
    return c.json({error: String(error)}, 500);
  }
});

export function startGetQueriesServer(): Promise<{
  server: Server;
  port: number;
  url: string;
}> {
  return new Promise(resolve => {
    const server = serve(
      {
        fetch: app.fetch,
        port: 0,
      },
      info => {
        const port = info.port;
        const url = `http://host.docker.internal:${port}/get-queries`;

        console.log(`Get-queries server listening on port ${port}`);
        resolve({server: server as unknown as Server, port, url});
      },
    );
  });
}

export function stopGetQueriesServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
