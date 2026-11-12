export type PlanLike = { price:number; validityDays:number; dailyDataGB:number|null; totalDataGB:number|null };
export function metrics(p: PlanLike) {
  if (!Number.isFinite(p.price) || p.price < 0) throw new Error("Invalid price");
  if (!Number.isFinite(p.validityDays) || p.validityDays <= 0) throw new Error("Invalid validity");
  const total = p.totalDataGB ?? (p.dailyDataGB == null ? null : p.dailyDataGB * p.validityDays);
  return {
    dailyCost: p.price / p.validityDays,
    totalDataGB: total,
    costPerGB: total && total > 0 ? p.price / total : null,
    monthlyEquivalent: p.price / p.validityDays * 30,
    yearlyEquivalent: p.price / p.validityDays * 365
  };
}
export type Preferences = { dailyUsageGB:number; monthlyBudget:number; preferredValidity:number; requires5G:boolean; callingRequired?:boolean; smsRequired?:boolean };
export function recommend(plans:any[], pref:Preferences) {
  const weights = { data:0.35, budget:0.25, validity:0.20, fiveG:0.10, voiceSms:0.10 };
  return plans.map(p => {
    const m = metrics(p);
    const daily = p.dailyDataGB ?? (p.totalDataGB ? p.totalDataGB / p.validityDays : 0);
    const data = pref.dailyUsageGB <= 0 ? 100 : Math.min(100, daily / pref.dailyUsageGB * 100);
    const budget = m.monthlyEquivalent <= pref.monthlyBudget ? 100 : Math.max(0, 100 - ((m.monthlyEquivalent-pref.monthlyBudget)/Math.max(pref.monthlyBudget,1))*100);
    const validity = Math.max(0,100-Math.abs(p.validityDays-pref.preferredValidity)/Math.max(pref.preferredValidity,1)*100);
    const fiveG = pref.requires5G ? (p.supports5G ? 100 : 0) : 100;
    const voiceSms = (!pref.callingRequired || p.voiceAllowance.toLowerCase().includes("unlimited") ? 50 : 0) +
      (!pref.smsRequired || !p.smsAllowance.toLowerCase().includes("not included") ? 50 : 0);
    const score = Math.round(data*weights.data+budget*weights.budget+validity*weights.validity+fiveG*weights.fiveG+voiceSms*weights.voiceSms);
    return { plan:p, score, components:{data:Math.round(data),budget:Math.round(budget),validity:Math.round(validity),fiveG,voiceSms}, reason:`${daily.toFixed(2)} GB/day equivalent; ${m.monthlyEquivalent <= pref.monthlyBudget ? "fits" : "may exceed"} your monthly budget.` };
  }).sort((a,b)=>b.score-a.score);
}
