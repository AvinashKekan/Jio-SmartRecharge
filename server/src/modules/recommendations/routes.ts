import {Router} from "express";
import {z} from "zod";
import {prisma} from "../../lib/prisma";
import {recommend} from "../../utils/calculations";
const router=Router();
const input=z.object({dailyUsageGB:z.number().min(0.1).max(100),monthlyBudget:z.number().int().min(1).max(100000),preferredValidity:z.number().int().min(1).max(1095),requires5G:z.boolean(),callingRequired:z.boolean().optional(),smsRequired:z.boolean().optional()});
router.post("/",async(req,res,next)=>{try{const pref=input.parse(req.body);const plans=await prisma.rechargePlan.findMany({where:{isActive:true}});res.json({results:recommend(plans,pref),disclaimer:"Scores are estimates based on illustrative catalogue data."})}catch(e){next(e)}});
export default router;
