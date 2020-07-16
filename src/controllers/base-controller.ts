import * as express from 'express'

export abstract class BaseController {

    /**
     * This is the implementation that we will leave to the
     * subclasses to figure out. 
     */
  
    public static jsonResponse (
      res: express.Response, code: number, message: string
    ) {
      return res.status(code).json({ message })
    }
  
    public ok<T> (res: express.Response, dto?: T) {
        if (!!dto) {
          res.type('application/json');
          return res.status(200).json(dto);
        } else {
          return res.sendStatus(200);
        }
      }
  
    // public created (res: express.Response) {
    //   return res.sendStatus(201);
    // }
    
    public created<T> (res: express.Response, dto?: T) {
      if (!!dto) {
        res.type('application/json');
        return res.status(201).json(dto);
      } else {
        return res.sendStatus(200);
      }
    }
  
    public clientError (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 400, message ? message : 'Unauthorized');
    }
  
    public unauthorized (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 401, message ? message : 'Unauthorized');
    }
  
    public paymentRequired (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 402, message ? message : 'Payment required');
    }
  
    public forbidden (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 403, message ? message : 'Forbidden');
    }
  
    public notFound (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 404, message ? message : 'Not found');
    }
  
    public conflict (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 409, message ? message : 'Conflict');
    }
  
    public tooMany (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 429, message ? message : 'Too many requests');
    }
  
    public bad (res: express.Response, message?: string) {
      return BaseController.jsonResponse(res, 400,  message ? message : 'Bad request');
    }
  
    public fail (res: express.Response, error: Error | string) {
      console.log(error);
      return res.status(500).json({
        message: error.toString()
      })
    }
  }