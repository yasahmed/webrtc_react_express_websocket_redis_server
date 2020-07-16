import * as express from 'express'
import { BaseController } from './base-controller'
import redisClient from '../connectors/redis-client';

export class RoomController extends BaseController {

  constructor() {
    super();
  }

  public  generateRandomString(length:Number) :String{
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
  public async create(req: express.Request, res: express.Response): Promise<void | any> {
    const username=this.generateRandomString(6);
    redisClient.hset(req.body.roomId, "users", JSON.stringify('[]')).then(result => {
      return result == 1 ? this.created(res,{user:username}) :  this.bad(res, "cannot create room");
    });
  }

  public async addUsers(req: express.Request, res: express.Response): Promise<void | any> {
    const { roomId, user } = req.body;

    return redisClient.hgetall(roomId, (err, data) => {
      if (err) {
        console.error(err);
        return this.fail(res, err.toString())
      } else {
        if (data != null) {
          const users = JSON.parse(data.users);
          if (users.indexOf(user) < 0) {
            users.push(user);
            return redisClient.hmset(roomId, "users", JSON.stringify(users)).then(result => {
              return this.ok(res)
            });
          } else {
            return this.bad(res, "user already exist in this room")
          }

        } else {
          return this.notFound(res, "room not found")
        }
      }
    });
  }

  public async removeUser(req: express.Request, res: express.Response): Promise<void | any> {
    const { roomId, user } = req.query;

    return redisClient.hgetall(roomId, (err, data) => {
      if (err) {
        console.error(err);
        return this.fail(res, err.toString())
      } else {
        if (data != null) {
          const users = JSON.parse(data.users);
          const changedUsers = users.filter(x => x != user);
          return redisClient.hmset(roomId, "users", JSON.stringify(changedUsers)).then(result => {
            return this.ok(res)
          });
        } else {
          return this.notFound(res, "room not found")
        }
      }
    });
  }

  public async remove(req: express.Request, res: express.Response): Promise<void | any> {
    redisClient.del(req.query.roomId).then(result => {
      return result == 1 ? this.ok(res) : this.bad(res, "cannot remove room");
    });
  }

  public async get(req: express.Request, res: express.Response): Promise<void | any> {
    return redisClient.hgetall(req.query.roomId, (err, result) => {
      if (err) {
        console.error(err);
        return this.fail(res, err.toString())
      } else {
        return result == null ? this.notFound(res) : this.ok(res, result);
      }
    });
  }

  public async assignUserToSocketId(req: express.Request, res: express.Response): Promise<void | any> {
    const {socketId,user}=req.body;
    redisClient.set(user,socketId);
    redisClient.set(socketId,user);
    return this.ok(res);
  }

  public async getSocketIdByUser(req: express.Request, res: express.Response): Promise<void | any> {
    const {user}=req.query;
   return redisClient.get(user).then(result=>{
     console.log("resres",result);
      return this.ok(res,{"socketId":result});
    });
  }
}