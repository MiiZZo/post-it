require('module-alias/register');
import { NestFactory } from "@nestjs/core";
import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import { join } from "path";
import express from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const RedisStore = connectRedis(session);
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASS,
  });

  app.use("/js", express.static(join(__dirname, "../../dist/client/js")));

  app.use(session({
    name: process.env.SESSION_NAME,
    store: new RedisStore({
      client: redis,
      disableTouch: true
    }),
    secret: "SECRET-CAT",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    },
    resave: false,
    saveUninitialized: false
  }));

  await app.listen(3000, () => {
    console.log("http://localhost:3000");
  });
}

bootstrap();
