import {Router} from "express";
import {z} from "zod";
import {randomUUID} from "crypto";
import {prisma} from "../../lib/prisma";
import {requireAuth} from "../../middleware/auth";
const router=Router();
router.use(requireAuth);
router.post("/simulate",async(req,res,next)=>{try{
 const body=z.object({planId:z.string(),mobileNumber:z.string().regex(/^[6-9]\d{9}$/),paymentMethod:z.enum(["UPI","CARD","NET_BANKING","WALLET"]),outcome:z.enum(["SUCCESS","FAILED","CANCELLED"]).default("SUCCESS")}).parse(req.body);
 const plan=await prisma.rechargePlan.findUnique({where:{id:body.planId}});
 if(!plan||!plan.isActive)return res.status(404).json({error:"Plan not available"});
 const reference=`DEMO-${randomUUID().slice(0,8).toUpperCase()}`;
 if(body.outcome!=="SUCCESS")return res.status(200).json({status:body.outcome,reference,disclaimer:"Demo transaction only. No payment was made."});
 const transaction=await prisma.rechargeTransaction.create({data:{reference,userId:req.userId!,planId:plan.id,mobileNumber:body.mobileNumber,amount:plan.price,paymentMethod:body.paymentMethod,expiryAt:new Date(Date.now()+plan.validityDays*86400000)}});
 res.status(201).json({status:"SUCCESS",transaction,disclaimer:"Demo transaction only. No real money was charged."});
}catch(e){next(e)}});
router.get("/history",async(req,res,next)=>{try{const rows=await prisma.rechargeTransaction.findMany({where:{userId:req.userId},include:{plan:true},orderBy:{createdAt:"desc"},take:100});res.json(rows)}catch(e){next(e)}});
export default router;
