import express, { Application } from "express";
import socketIO, { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "https";
import * as bodyParser from 'body-parser';
import router from "./src/routers/room-router";
import { readFileSync } from "fs";
import redisClient from "./src/connectors/redis-client";
var cors = require('cors')

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;

  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 5000;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();

    this.app.use(cors())

    this.app.options('*', cors())

    this.app.use(bodyParser.json());

    this.app.use('/room', router);

    this.httpServer = createServer({
      key: readFileSync('./src/security/keytmp.pem'),
      cert: readFileSync('./src/security/cert.pem'),
      passphrase: '123456'
    }, this.app);

    // this.httpServer = createServer(this.app);

    this.handleSocketConnection();
  }


  private handleSocketConnection(): void {
    this.io = socketIO(this.httpServer);


    this.io.on("connection", socket => {
      const existingSocket = this.activeSockets.find(
        existingSocket => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);
      }

      socket.on("setup-connection", async (data: any) => {

        const existedusers = await this.mapSocketUsers(this.activeSockets.filter(
          existingSocket => existingSocket !== socket.id
        ));

        const monousers = await this.mapSocketUsers([socket.id]);
        socket.emit("update-user-list", {
          users: existedusers
        });
        socket.broadcast.emit("update-user-list", {
          users: monousers
        });

      });

      socket.on("req-chat-user", async (data: any) => {
        this.activeSockets.forEach(elem => {
          socket.to(elem).broadcast.emit("resp-chat-user", {
            message: data.message,
            from: data.from
          });
        });
        socket.emit("resp-chat-user", {
          message: data.message,
          from: data.from
        });
      });


      socket.on("disconnect", async () => {

        const to = await this.getUserBySocket(socket.id);
        redisClient.del(to);
        redisClient.del(socket.id)

        this.activeSockets = this.activeSockets.filter(
          existingSocket => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: to
        });
        console.log("disconnected , ", socket.id);
      });

    });

  }

  private getUserBySocket(socket) {
    return redisClient.get(socket);
  }

  private mapSocketUsers = async arr => {
    let arrs = [];
    for (let index = 0; index < arr.length; index++) {
      const fruit = arr[index]
      const numFruit = await this.getUserBySocket(fruit);
      arrs.push(numFruit)
    }
    return arrs;

  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
