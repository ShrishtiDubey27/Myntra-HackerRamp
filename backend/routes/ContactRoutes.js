import { Router } from "express";
import {
  getAllContacts,
  searchContacts,
  getContactsForList,
  updateUserStatus,
  getOnlineUsers,
} from "../controllers/ContactController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.get("/get-all-contacts", verifyToken, getAllContacts);
contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForList);
contactsRoutes.post("/update-status", verifyToken, updateUserStatus);
contactsRoutes.get("/online", verifyToken, getOnlineUsers);

export default contactsRoutes;
