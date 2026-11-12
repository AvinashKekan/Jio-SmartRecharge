import {describe,it,expect} from "vitest";
import {metrics,recommend} from "./calculations";
describe("plan metrics",()=>{
 it("calculates daily cost and total data",()=>{expect(metrics({price:349,validityDays:28,dailyDataGB:2,totalDataGB:null})).toMatchObject({dailyCost:12.464285714285714,totalDataGB:56,costPerGB:6.232142857142857})});
 it("uses fixed total data for add-ons",()=>{expect(metrics({price:49,validityDays:7,dailyDataGB:null,totalDataGB:6}).totalDataGB).toBe(6)});
 it("does not invent cost per GB without data",()=>{expect(metrics({price:99,validityDays:30,dailyDataGB:null,totalDataGB:null}).costPerGB).toBeNull()});
 it("rejects invalid validity",()=>{expect(()=>metrics({price:1,validityDays:0,dailyDataGB:1,totalDataGB:null})).toThrow()});
});
describe("recommendations",()=>{it("returns sorted explainable scores",()=>{const out=recommend([{id:"a",price:300,validityDays:28,dailyDataGB:2,totalDataGB:56,voiceAllowance:"Unlimited",smsAllowance:"100 SMS/day",supports5G:true}],{dailyUsageGB:2,monthlyBudget:400,preferredValidity:28,requires5G:true});expect(out[0].score).toBeGreaterThan(80);expect(out[0].reason).toContain("GB/day")})});
