const express=require( "express");
const router =express.Router()
const auth =require("../middleware/auth");
const  upload = require("../middleware/upload");

const messagecontroller=require("../controllers/messageController")



router.post("/send", auth.authuser, upload.array("files"), messagecontroller.sendMessage);
router.get("/conversation/:withUserId", auth.authuser, messagecontroller.getConversation);
router.get("/chats", auth.authuser, messagecontroller.getMyChats);
router.get("/task-messages", auth.authuser, messagecontroller.getTaskMessages);

module.exports=router
