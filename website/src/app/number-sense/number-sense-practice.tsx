"use client";
import { useState } from "react";

type Problem = { question: string; answer: number; explanation: string };
type Topic = { id: string; name: string; group: "Memorization" | "Mental Math Tricks"; levels: string[]; generate: () => Problem; study?: string[] };
const rand = (a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
const pick = <T,>(items:T[])=>items[rand(0,items.length-1)];
const fmt=(n:number)=>n.toLocaleString("en-US");
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
const fraction=(n:number,d:number)=>`${n}/${d}`;
const roman=(n:number)=>{let out="";for(const [v,s] of [[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]] as [number,string][])while(n>=v){out+=s;n-=v;}return out;};
const sqStudy=Array.from({length:40},(_,i)=>`${i+1}² = ${(i+1)**2}`);
const cubeStudy=Array.from({length:15},(_,i)=>`${i+1}³ = ${(i+1)**3}`);
const fractionFacts:[[number,number],...[number,number][]]=[[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,6],[5,6],[1,8],[3,8],[5,8],[7,8],[1,9],[2,9],[4,9],[5,9],[7,9],[8,9],[1,10],[1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[1,12],[5,12],[7,12],[11,12]];
const conversions:[string,string,number][]=[["feet","inches",12],["yards","feet",3],["yards","inches",36],["miles","feet",5280],["hours","minutes",60],["minutes","seconds",60],["pounds","ounces",16],["gallons","quarts",4],["quarts","pints",2],["pints","cups",2],["dozens","items",12]];
const commonLevels=["elementary","junior-high","high-school"];
const topics:Topic[]=[
 {id:"squares",name:"Squares 1–40",group:"Memorization",levels:commonLevels,study:sqStudy,generate:()=>{const n=rand(1,40);return {question:`${n}² =`,answer:n*n,explanation:`Memorize this fact: ${n}² = ${n*n}.`};}},
 {id:"cubes",name:"Cubes 1–15",group:"Memorization",levels:commonLevels,study:cubeStudy,generate:()=>{const n=rand(1,15);return {question:`${n}³ =`,answer:n**3,explanation:`Memorize this fact: ${n}³ = ${n**3}.`};}},
 {id:"fractions",name:"Common Fractions & Decimals",group:"Memorization",levels:commonLevels,study:fractionFacts.map(([n,d])=>`${n}/${d} = ${Number((n/d).toFixed(6))}… (approx.)`),generate:()=>{const [n,d]=pick(fractionFacts);return {question:`Write ${n}/${d} as a decimal (round to 3 decimal places).`,answer:Number((n/d).toFixed(3)),explanation:`${n} ÷ ${d} = ${(n/d).toFixed(6)}…; rounded to three decimal places, that is ${(n/d).toFixed(3)}.`};}},
 {id:"powers",name:"Powers of 2, 3 & 5",group:"Memorization",levels:commonLevels,study:[2,3,5].flatMap(b=>Array.from({length:5},(_,i)=>`${b}^${i+1} = ${b**(i+1)}`)),generate:()=>{const b=pick([2,3,5]),e=rand(1,5);return {question:`${b}^${e} =`,answer:b**e,explanation:`Memorize: ${b} to the power ${e} equals ${b**e}.`};}},
 {id:"roman",name:"Roman Numerals",group:"Memorization",levels:commonLevels,study:[1,4,5,9,10,40,50,90,100].map(n=>`${roman(n)} = ${n}`),generate:()=>{const n=rand(1,99);return {question:`Write ${roman(n)} as a number.`,answer:n,explanation:`${roman(n)} represents ${n}. Remember I=1, V=5, X=10, L=50, C=100; smaller symbols before larger ones are subtracted.`};}},
 {id:"conversions",name:"Measurement Conversions",group:"Memorization",levels:commonLevels,study:conversions.map(([a,b,k])=>`1 ${a.slice(0,-1)} = ${fmt(k)} ${b}`),generate:()=>{const [a,b,k]=pick(conversions),n=rand(2,30);return {question:`How many ${b} are in ${n} ${a}?`,answer:n*k,explanation:`Each ${a.slice(0,-1)} contains ${fmt(k)} ${b}. Multiply ${n} × ${fmt(k)} = ${fmt(n*k)}.`};}},
 {id:"x11",name:"Multiplying by 11",group:"Mental Math Tricks",levels:commonLevels,generate:()=>{const n=rand(12,99),t=Math.floor(n/10),o=n%10;return {question:`${n} × 11 =`,answer:n*11,explanation:`Add the digits: ${t} + ${o} = ${t+o}. Put the sum between the original digits, carrying to the hundreds place if needed. The result is ${fmt(n*11)}.`};}},
 {id:"x25",name:"Multiplying by 25",group:"Mental Math Tricks",levels:commonLevels,generate:()=>{const n=rand(3,45)*4;return {question:`${n} × 25 =`,answer:n*25,explanation:`25 is 100 ÷ 4. Divide ${n} by 4 to get ${n/4}, then multiply by 100: ${fmt(n*25)}.`};}},
 {id:"x50",name:"Multiplying by 50",group:"Mental Math Tricks",levels:commonLevels,generate:()=>{const n=rand(12,150)*2;return {question:`${n} × 50 =`,answer:n*50,explanation:`50 is half of 100. Divide ${n} by 2 to get ${n/2}, then multiply by 100: ${fmt(n*50)}.`};}},
 {id:"x101",name:"Multiplying by 101",group:"Mental Math Tricks",levels:["junior-high","high-school"],generate:()=>{const n=rand(12,999);return {question:`${n} × 101 =`,answer:n*101,explanation:`101 = 100 + 1. Calculate ${fmt(n*100)} + ${n} = ${fmt(n*101)}.`};}},
 {id:"x75",name:"Multiplying by 75",group:"Mental Math Tricks",levels:["junior-high","high-school"],generate:()=>{const n=rand(3,80)*4;return {question:`${n} × 75 =`,answer:n*75,explanation:`75 = 3/4 of 100. Divide ${n} by 4 to get ${n/4}, multiply by 3 to get ${3*n/4}, then multiply by 100: ${fmt(n*75)}.`};}},
 {id:"x111",name:"Multiplying by 111",group:"Mental Math Tricks",levels:["junior-high","high-school"],generate:()=>{const n=rand(12,999);return {question:`${n} × 111 =`,answer:n*111,explanation:`111 = 100 + 10 + 1. Add ${fmt(n*100)} + ${fmt(n*10)} + ${n} = ${fmt(n*111)}.`};}},
 {id:"near100",name:"Multiplying Numbers 90–99",group:"Mental Math Tricks",levels:commonLevels,generate:()=>{const a=rand(90,99),b=rand(90,99),da=100-a,db=100-b;return {question:`${a} × ${b} =`,answer:a*b,explanation:`Both numbers are near 100. Subtract the deficits: ${a} − ${db} = ${a-db}. Multiply deficits: ${da} × ${db} = ${da*db}. Combine ${a-db} hundreds with the two-digit ending ${String(da*db).padStart(2,"0")} to get ${fmt(a*b)}.`};}},
 {id:"over100",name:"Multiplying Numbers 101–109",group:"Mental Math Tricks",levels:commonLevels,generate:()=>{const a=rand(101,109),b=rand(101,109),da=a-100,db=b-100;return {question:`${a} × ${b} =`,answer:a*b,explanation:`Both numbers are just above 100. Add ${a} + ${db} = ${a+db}. Multiply ${da} × ${db} = ${da*db}. Combine ${a+db} hundreds and the two-digit ending ${String(da*db).padStart(2,"0")} to get ${fmt(a*b)}.`};}},
 {id:"squares5",name:"Squares Ending in 5",group:"Mental Math Tricks",levels:commonLevels,generate:()=>{const k=rand(1,9),n=k*10+5;return {question:`${n}² =`,answer:n*n,explanation:`Multiply ${k} by the next whole number ${k+1}: ${k*(k+1)}. Append 25 to get ${fmt(n*n)}.`};}},
 {id:"squares41",name:"Squares 41–59",group:"Mental Math Tricks",levels:["junior-high","high-school"],generate:()=>{const n=rand(41,59),d=n-50;return {question:`${n}² =`,answer:n*n,explanation:`Use (50 + ${d})² = 2,500 + ${100*d} + ${d*d} = ${fmt(n*n)}.`};}},
 {id:"distribute",name:"Distributive Property",group:"Mental Math Tricks",levels:commonLevels,generate:()=>{const a=rand(11,39),b=rand(2,9),c=rand(2,9);return {question:`${a} × ${b} + ${a} × ${c} =`,answer:a*(b+c),explanation:`Factor out ${a}: ${a} × (${b} + ${c}) = ${a} × ${b+c} = ${fmt(a*(b+c))}.`};}},
 {id:"gcd",name:"Greatest Common Divisor",group:"Mental Math Tricks",levels:["junior-high","high-school"],generate:()=>{const a=rand(2,15)*rand(2,8),b=rand(2,15)*rand(2,8);return {question:`Find the GCD of ${a} and ${b}.`,answer:gcd(a,b),explanation:`The greatest positive number dividing both ${a} and ${b} is ${gcd(a,b)}.`};}},
];

function parseAnswer(s:string):number|null{const v=s.trim().replace(/,/g,"");if(!v)return null;const mixed=v.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);if(mixed){const w=+mixed[1],n=+mixed[2],d=+mixed[3];return d? w+(w<0?-1:1)*n/d:null;}const f=v.match(/^(-?\d+)\/(-?\d+)$/);if(f)return +f[2]?+f[1]/+f[2]:null;return /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(v)?Number(v):null;}
export default function NumberSensePractice({level,onBack}:{level:string;onBack:()=>void}){
 const available=topics.filter(t=>t.levels.includes(level));
 const [topicId,setTopicId]=useState<string|null>(null);
 const [problem,setProblem]=useState<Problem|null>(null);
 const [input,setInput]=useState("");
 const [attempts,setAttempts]=useState(0);
 const [feedback,setFeedback]=useState("");
 const [showStudy,setShowStudy]=useState(false);
 const [correct,setCorrect]=useState(0);
 const [missed,setMissed]=useState(0);
 const topic=available.find(t=>t.id===topicId);
 const next=(t:Topic)=>{let p=t.generate();for(let i=0;i<8&&p.question===problem?.question;i++)p=t.generate();setProblem(p);setAttempts(0);setInput("");setFeedback("");};
 const select=(t:Topic)=>{setTopicId(t.id);setShowStudy(false);setCorrect(0);setMissed(0);next(t);};
 const check=()=>{if(!problem||!topic)return;const value=parseAnswer(input);if(value===null){setFeedback("Enter a valid number or fraction.");return;}if(Math.abs(value-problem.answer)<1e-9){setCorrect(c=>c+1);next(topic);return;}const n=attempts+1;setAttempts(n);setInput("");if(n===3){setMissed(m=>m+1);setFeedback("Three attempts used. Study the answer below, then try another problem.");}else setFeedback(`Not quite. You have ${3-n} ${3-n===1?"attempt":"attempts"} remaining.`);};
 return <div className="mt-8 space-y-6">
  {!topic ? <><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Choose a practice topic</h2><button onClick={onBack} className="text-cyan-400 underline">Back to menu</button></div>
   {(["Memorization","Mental Math Tricks"] as const).map(group=><section key={group} className="rounded-xl bg-slate-800 p-5"><h3 className="mb-4 text-xl font-bold">{group}</h3><div className="grid gap-3 sm:grid-cols-2">{available.filter(t=>t.group===group).map(t=><button key={t.id} onClick={()=>select(t)} className="rounded-lg border border-slate-600 bg-slate-900 p-4 text-left hover:border-cyan-400">{t.name} <span className="float-right text-cyan-400">→</span></button>)}</div></section>)}
  </> : <><div className="flex flex-wrap items-center justify-between gap-3"><button onClick={()=>{setTopicId(null);setProblem(null);}} className="text-cyan-400 underline">← All topics</button><span className="text-sm text-slate-300">Correct: {correct} · Needed explanation: {missed}</span></div>
   <div className="rounded-xl bg-slate-800 p-6"><p className="text-sm text-cyan-300">{topic.group}</p><h2 className="mt-1 text-2xl font-bold">{topic.name}</h2>{topic.study&&<button onClick={()=>setShowStudy(v=>!v)} className="mt-3 rounded-lg border border-slate-500 px-3 py-2 text-sm hover:bg-slate-700">{showStudy?"Hide Study List":"View Study List"}</button>}{showStudy&&topic.study&&<div className="mt-4 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-lg bg-slate-900 p-4 text-sm sm:grid-cols-3">{topic.study.map((fact,i)=><span key={i}>{fact}</span>)}</div>}</div>
   {problem&&<div className="rounded-xl border border-slate-700 p-6"><p className="text-sm text-slate-400">Attempt {Math.min(attempts+1,3)} of 3</p><p className="my-6 text-center text-3xl font-bold">{problem.question}</p>{attempts<3?<form onSubmit={e=>{e.preventDefault();check();}} className="space-y-3"><input autoFocus value={input} onChange={e=>setInput(e.target.value)} placeholder="Your answer" className="w-full rounded-lg bg-slate-800 p-3 text-white"/><button type="submit" className="rounded-lg bg-cyan-500 px-6 py-3 font-bold text-black hover:bg-cyan-400">Check Answer</button>{feedback&&<p className="text-amber-300">{feedback}</p>}</form>:<div className="space-y-4 rounded-lg bg-slate-800 p-5"><p className="font-semibold text-amber-300">{feedback}</p><p className="text-2xl font-bold">Answer: {fmt(problem.answer)}</p><p className="text-slate-200">{problem.explanation}</p><button onClick={()=>next(topic)} className="rounded-lg bg-cyan-500 px-6 py-3 font-bold text-black">Next Problem →</button></div>}</div>}
  </>}
 </div>;
}