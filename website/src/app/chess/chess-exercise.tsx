'use client';
import {useState} from 'react';
import {Chess,type Square} from 'chess.js';
import ChessBoard from './chess-board';
import {generateExercise} from './chess-exercises';
export default function ChessExercise({id}:{id:string}){
 const [exercise,setExercise]=useState(()=>generateExercise(id));
 const [selected,setSelected]=useState<Square|null>(null);
 const [attempts,setAttempts]=useState(0);
 const [result,setResult]=useState('');
 const [fen,setFen]=useState('');
 const [pending,setPending]=useState<{from:Square;to:Square}|null>(null);
 if(!exercise)return null;
 const g=new Chess(fen||exercise.fen);
 const finished=result==='correct'||attempts>=3;
 function submit(from:Square,to:Square,promotion?:string){
  if(!exercise||finished)return;
  setPending(null);setSelected(null);
  const code=from+to+(promotion||'');
  if(exercise.answers.includes(code)){const h=new Chess(exercise.fen);h.move({from,to,promotion});setFen(h.fen());setResult('correct');}
  else{setAttempts(a=>a+1);setResult('wrong');}
 }
 function click(s:Square){if(finished||pending)return;if(selected){const moves=g.moves({square:selected,verbose:true}).filter(m=>m.to===s);if(moves.length){if(moves.some(m=>m.promotion))setPending({from:selected,to:s});else submit(selected,s);return;}}setSelected(g.get(s)?.color===g.turn()?s:null);}
 function next(){setExercise(generateExercise(id));setSelected(null);setAttempts(0);setResult('');setFen('');setPending(null);}
 return <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-4"><h3 className="text-xl font-bold text-cyan-400">Board Challenge</h3><p className="my-3">{exercise.prompt} ({new Chess(exercise.fen).turn()==='w'?'White':'Black'} to move)</p><ChessBoard fen={g.fen()} selected={selected} onSquareClick={click}/>{pending&&<div className="my-3 flex flex-wrap gap-2">{['q','r','b','n'].map(p=><button key={p} className="rounded bg-slate-700 p-3" onClick={()=>submit(pending.from,pending.to,p)}>{({q:'Queen',r:'Rook',b:'Bishop',n:'Knight'} as Record<string,string>)[p]}</button>)}</div>}{result&&<p className={'mt-3 rounded p-3 '+(result==='correct'?'bg-green-900':'bg-yellow-900')}>{result==='correct'?'Correct! Great job! '+exercise.explanation:finished?'Solution: '+exercise.answers.join(' or ')+'. '+exercise.explanation:`Try again! ${3-attempts} attempts remaining.`}</p>}<button className="mt-4 rounded bg-cyan-500 px-4 py-2 font-bold text-black" onClick={next}>New challenge</button></section>;
}
