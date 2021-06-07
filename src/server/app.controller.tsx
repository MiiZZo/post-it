import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ExpressRequest, ExpressResponse } from "../../typings";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { matchRoutes, MatchedRoute } from "react-router-config";
import { resolve } from "path";
import fs from "fs";
import { fork, serialize, allSettled } from "effector/fork";
import { root, forward, Event } from "effector-root";

import { getStart, StartParams } from "common/lib/page-routing";
import { App } from "client/app";
import { ROUTES } from "client/pages/routes";

const serverStarted =
  root.createEvent<{
    req: ExpressRequest;
    res: ExpressResponse;
  }>();

const requestHandled = serverStarted.map(({ req }) => req);
const routesMatched = requestHandled.map((req) => {
  const url = `${req.protocol}://${req.hostname}${req.originalUrl}`;
  return {
    routes: matchRoutes(ROUTES, req.path).filter(lookupStartEvent),
    query: Object.fromEntries(new URL(url).searchParams),
  };
});

for (const { component } of ROUTES) {
  const startPageEvent = getStart(component);
  if (!startPageEvent) continue;

  const matchedRoute = routesMatched.filterMap(({ routes, query }) => {
    const route = routes.find(routeWithEvent(startPageEvent));
    if (route) return { route, query };
    return undefined;
  });

  forward({
    from: matchedRoute.map(({ route, query }) => ({
      params: route.match.params,
      query,
    })),
    to: startPageEvent,
  });
}

@Controller()
export class AppController {
  @Get("/*")
  async index(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    const scope = fork(root);

    try {
      await allSettled(serverStarted, {
        scope,
        params: { req, res },
      });
    } catch (error) {
      console.error(error);
    }

    const context = {};
    const stream = ReactDOMServer.renderToNodeStream(
      <StaticRouter context={context} location={req.url}>
        <App root={scope} />
      </StaticRouter>
    );

    const storesValues = serialize(scope);

    res.write(htmlStart());
    stream.pipe(res, { end: false });
    stream.on("end", () => {
      res.end(htmlEnd(storesValues));
    });
  }
}

function htmlStart() {
  return `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>Razzle TypeScript</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <div id="root">`;
}

function htmlEnd(storesValues: Record<string, unknown>): string {
  return `</div>
        <script src="js/bundle.js" defer></script>
        <script>
          window.INITIAL_STATE = ${JSON.stringify(storesValues)}
        </script>
    </body>
</html>`;
}

function lookupStartEvent<P>(
  match: MatchedRoute<P>
): Event<StartParams> | undefined {
  if (match.route.component) {
    return getStart(match.route.component);
  }
  return undefined;
}

function routeWithEvent(event: Event<StartParams>) {
  return function <P>(route: MatchedRoute<P>) {
    return lookupStartEvent(route) === event;
  };
}
