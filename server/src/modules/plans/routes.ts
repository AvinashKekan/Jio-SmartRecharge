import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
const router=Router();
router.get("/categories",async(_req,res,next)=>{try{res.json(await prisma.planCategory.findMany({orderBy:{name:"asc"}}))}catch(e){next(e)}});
router.get("/",async(req,res,next)=>{try{
 const q=z.object({search:z.string().max(100).optional(),category:z.string().optional(),minPrice:z.coerce.number().nonnegative().optional(),maxPrice:z.coerce.number().nonnegative().optional(),sort:z.enum(["price-asc","price-desc","validity","data"]).default("price-asc"),page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(50).default(30)}).parse(req.query);
 const where:any={isActive:true};
 if(q.search)where.OR=[{name:{contains:q.search,mode:"insensitive"}},{promotionalLabel:{contains:q.search,mode:"insensitive"}},{terms:{contains:q.search,mode:"insensitive"}}];
 if(q.category)where.category={slug:q.category};
 if(q.minPrice!==undefined||q.maxPrice!==undefined)where.price={...(q.minPrice!==undefined?{gte:q.minPrice}:{}),...(q.maxPrice!==undefined?{lte:q.maxPrice}:{})};
 const orderBy:any=q.sort==="price-desc"?{price:"desc"}:q.sort==="validity"?{validityDays:"desc"}:q.sort==="data"?{totalDataGB:"desc"}:{price:"asc"};
 const [items,total]=await Promise.all([prisma.rechargePlan.findMany({where,include:{category:true},orderBy,skip:(q.page-1)*q.limit,take:q.limit}),prisma.rechargePlan.count({where})]);
 res.json({items,total,page:q.page,limit:q.limit,pages:Math.ceil(total/q.limit)});
}catch(e){next(e)}});
router.get("/:id",async(req,res,next)=>{try{const plan=await prisma.rechargePlan.findUnique({where:{id:req.params.id},include:{category:true}});if(!plan||!plan.isActive)return res.status(404).json({error:"Plan not found"});res.json(plan)}catch(e){next(e)}});
export default router;
