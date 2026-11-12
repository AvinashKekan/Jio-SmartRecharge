import {Router} from "express";
import {z} from "zod";
import {prisma} from "../../lib/prisma";
import {metrics} from "../../utils/calculations";
const router=Router();
router.post("/",async(req,res,next)=>{try{const {ids}=z.object({ids:z.array(z.string()).min(1).max(3)}).parse(req.body);const plans=await prisma.rechargePlan.findMany({where:{id:{in:ids},isActive:true}});res.json(plans.map(p=>({...p,metrics:metrics(p)})))}catch(e){next(e)}});
export default router;
