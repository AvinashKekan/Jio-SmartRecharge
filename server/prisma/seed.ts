import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const categories = [
    ["Popular Plans", "popular"], ["True 5G Plans", "5g"],
    ["Annual Plans", "annual"], ["Data Packs", "data"],
    ["Entertainment", "entertainment"], ["International Roaming", "roaming"]
  ];
  const ids: Record<string,string> = {};
  for (const [name, slug] of categories) {
    const c = await prisma.planCategory.upsert({ where: { slug }, update: { name }, create: { name, slug } });
    ids[slug] = c.id;
  }
  const rows = [
    ["Smart Start 149",149,20,1,20,"Unlimited","100 SMS/day","4G",false,"popular",["Voice benefits","Basic data"],"Affordable starter pack."],
    ["Daily Plus 349",349,28,2,56,"Unlimited","100 SMS/day","4G/5G",true,"popular",["Illustrative OTT trial"],"Daily high-speed quota; speeds may reduce after quota."],
    ["Power 399",399,28,2.5,70,"Unlimited","100 SMS/day","5G",true,"5g",["5G-style demo benefit"],"Illustrative 5G eligibility; no carrier entitlement is implied."],
    ["Max Data 499",499,28,3,84,"Unlimited","100 SMS/day","5G",true,"5g",["Extra data benefit"],"High daily data allowance."],
    ["Quarter Connect 799",799,84,1.5,126,"Unlimited","100 SMS/day","4G/5G",true,"popular",["Longer validity"],"Quarterly illustrative plan."],
    ["Annual Saver 2999",2999,365,2,730,"Unlimited","100 SMS/day","4G/5G",true,"annual",["Annual value"],"Annual illustrative plan."],
    ["Annual Max 3599",3599,365,2.5,912.5,"Unlimited","100 SMS/day","5G",true,"annual",["Annual premium demo"],"Annual illustrative plan."],
    ["Data Booster 19",19,1,null,1,"Not included","Not included","4G",false,"data",["1 GB add-on"],"Requires an active base plan."],
    ["Data Booster 49",49,7,null,6,"Not included","Not included","4G/5G",true,"data",["6 GB add-on"],"Illustrative add-on."],
    ["Stream Pack 399",399,30,1.5,45,"Unlimited","100 SMS/day","4G/5G",true,"entertainment",["Demo video subscription"],"OTT availability is illustrative and not an operator offer."],
    ["Roam Mini 599",599,7,null,2,"Limited","Not included","International",false,"roaming",["Roaming data example"],"Destination-specific roaming terms are not modelled."],
    ["Youth Play 299",299,28,2,56,"Unlimited","100 SMS/day","4G",false,"popular",["Gaming data example"],"Illustrative gaming-focused plan."],
    ["Flex 199",199,24,1,24,"Unlimited","100 SMS/day","4G",false,"popular",["Flexible validity"],"Illustrative plan."],
    ["Data Max 99",99,14,null,12,"Not included","Not included","4G/5G",true,"data",["12 GB total"],"Total data pack; requires base plan."],
    ["Entertainment Annual 1999",1999,365,1,365,"Unlimited","100 SMS/day","4G",false,"entertainment",["Demo annual content access"],"Illustrative annual entertainment pack."],
    ["5G Upgrade 51",51,30,0.5,15,"Not included","Not included","5G",true,"5g",["5G upgrade example"],"Illustrative add-on; compatible base plan required."],
    ["Global Roam 1499",1499,14,null,5,"Limited","Not included","International",false,"roaming",["Roaming example"],"Illustrative only; check destination conditions in a real service."],
    ["Long Validity 1799",1799,180,1,180,"Unlimited","100 SMS/day","4G",false,"annual",["180-day validity"],"Long-validity illustrative plan."]
  ] as const;
  for (const r of rows) {
    await prisma.rechargePlan.upsert({
      where: { id: `demo-${r[0].toLowerCase().replace(/[^a-z0-9]+/g,"-")}` },
      update: {},
      create: {
        id: `demo-${r[0].toLowerCase().replace(/[^a-z0-9]+/g,"-")}`,
        name:r[0], price:r[1], validityDays:r[2], dailyDataGB:r[3], totalDataGB:r[4],
        voiceAllowance:r[5], smsAllowance:r[6], networkType:r[7], supports5G:r[8],
        categoryId:ids[r[9]], promotionalLabel:"ILLUSTRATIVE DEMO",
        benefits:r[10] as any, notes:[{type:"paragraph",text:r[11]}],
        terms:"Sample catalogue data for portfolio demonstration only. Not a current operator offer.",
        sourceType:"SEED_DEMO", isDemoData:true
      }
    });
  }
}
main().finally(() => prisma.$disconnect());
