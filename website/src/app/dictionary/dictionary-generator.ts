import { vocabulary, sections, facts, contexts, origins } from './dictionary-questions';
export type Question = { prompt:string; choices:string[]; answer:string; source:string };
export type Match = { word:string; answer:string };
export function shuffle<T>(items:readonly T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function choices(answer:string,pool:string[]){return shuffle([answer,...shuffle([...new Set(pool)].filter(x=>x!==answer)).slice(0,3)]);}
export function generateMatching(exclude:string[]=[]){const matches:Match[]=[];for(const [word,answer] of shuffle(vocabulary.filter(v=>!exclude.includes(v[0])))){if(matches.some(m=>m.answer===answer))continue;matches.push({word,answer});if(matches.length===8)break;}return {matches,bank:shuffle(matches.map(m=>m.answer))};}
export function generateTest(){
 const questions:Question[]=[]; const used=new Set<string>();
 function add(word:string,prompt:string,answer:string,pool:string[],source=`Main dictionary: ${word}`){used.add(word);questions.push({prompt,answer,choices:choices(answer,pool),source});}
 for(const [word,prompt,answer,pool] of shuffle(facts).slice(0,7))add(word,prompt,answer,pool);
 for(const [word,prompt,pool] of shuffle(contexts.filter(x=>!used.has(x[0]))).slice(0,5))add(word,`Which word best completes the sentence? ${prompt}`,word,pool);
 for(const [word,answer,pool] of shuffle(origins.filter(x=>!used.has(x[0]))).slice(0,2))add(word,`Which language is associated with the origin of ${word}?`,answer,pool,`Main dictionary: ${word} (word origin; verify printed entry)`);
 for(const [word,meaning,category] of shuffle(vocabulary.filter(x=>!used.has(x[0]))).slice(0,12)){
  const reverse=questions.length>=20;
  const pool=shuffle(vocabulary.filter(v=>v[0]!==word&&v[2]===category));
  const rest=shuffle(vocabulary.filter(v=>v[0]!==word&&v[2]!==category));
  add(word,reverse?`Which word best matches this description: ${meaning}?`:`Which description best fits ${word}?`,reverse?word:meaning,[...pool,...rest].map(v=>v[reverse?0:1]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12));
 }
 for(const [source,entries] of Object.entries(sections)){const [key,answer]=shuffle(entries)[0];const prompt=source==='Geographical Names'?`In which country is ${key} located?`:source==='Chemical Elements'?`Which element has the symbol ${key}?`:source==='Pronunciation Symbols'?`Which sound is represented by ${key}?`:source.startsWith('Mythological')?`Which description fits ${key}?`:`What does ${key} represent?`;add(key,prompt,answer,entries.map(e=>e[1]),source);}
 return {questions:shuffle(questions),...generateMatching([...used])};
}
