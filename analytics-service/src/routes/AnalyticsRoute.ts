import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router()



router.get('/',verifyToken,async()=>{

})