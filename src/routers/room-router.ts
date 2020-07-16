import express from "express";
import { RoomController } from "../controllers/room-controller";

const router = express.Router();
const roomcontroller = new RoomController()

router.get('/', (request, response) => {
  return roomcontroller.get(request, response);
});

router.post('/', (request, response) => {
  return roomcontroller.create(request, response);
});

router.put('/users', (request, response) => {
  return roomcontroller.addUsers(request, response);
});

router.delete('/users', (request, response) => {
  return roomcontroller.removeUser(request, response);
});


router.delete('/', (request, response) => {
  return roomcontroller.remove(request, response);
});

router.post('/users/socket', (request, response) => {
  return roomcontroller.assignUserToSocketId(request, response);
});

router.get('/users/socket', (request, response) => {
  return roomcontroller.getSocketIdByUser(request, response);
});




export default router;

