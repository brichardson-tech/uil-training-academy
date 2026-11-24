'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Chess,type Square} from 'chess.js';
import ChessBoard from '../chess-board';
import ChessExercise from '../chess-exercise';
import {lessons,type Lesson} from '../chess-lessons';
const key='uil-chess-lessons-v1';
const btn='rounded-lg bg-slate-700 px-4 py-3 hover:bg-slate-600';
export default function LearnPage(){
 const [done,setDone]=useState<string[]>([]);
 const [lesson,setLesson]=useState<Lesson|null>(null);
 const [choices,setChoices]=useState<string[]>([]);
 const [attempts,setAttempts]=useState(0);
 const [feedback,setFeedback]=useState('');
 const [finished,setFinished]=useState(false);
 const [selected,setSelected]=useState<Square|null>(null);
 const [fen,setFen]=useState(new Chess().fen());
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))setDone(saved.filter(x=>typeof x==='string'));}catch{}},[]);
 function open(l:Lesson){setLesson(l);const a=[...l.questions[0].choices];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}setChoices(a);setAttempts(0);setFeedback('');setFinished(false);setFen(new Chess().fen());setSelected(null);}
 function answer(a:string){if(!lesson||finished)return;const q=lesson.questions[0];if(a===q.answer){setFeedback('Correct! Great job! '+q.explanation);setFinished(true);const next=Array.from(new Set([...done,lesson.id]));setDone(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{}}else{const n=attempts+1;setAttempts(n);if(n>=3){setFinished(true);setFeedback('Correct answer: '+q.answer+'. '+q.explanation);}else setFeedback(`Try again! ${3-n} attempts remaining.`);}}
 const game=new Chess(fen);
 const legal=selected?game.moves({square:selected,verbose:true}).map(m=>m.to):[];
 function click(s:Square){const g=new Chess(fen);if(selected&&legal.includes(s)){g.move({from:selected,to:s,promotion:'q'});setFen(g.fen());setSelected(null);}else setSelected(g.get(s)?.color===g.turn()?s:null);}
 return <main className="min-h-screen bg-slate-950 px-5 py-8 text-white"><div className="mx-auto max-w-5xl"><Link href="/chess" className="text-cyan-400">← Back to Chess</Link><h1 className="mt-5 text-3xl font-bold">Learn & Practice</h1><p className="mt-2 text-slate-300">{done.filter(id=>lessons.some(l=>l.id===id)).length} / {lessons.length} topics completed</p>{!lesson?<div className="mt-6 space-y-6">{Array.from(new Set(lessons.map(l=>l.unit))).map(unit=><section key={unit} className="rounded-xl border border-slate-700 bg-slate-800 p-5"><h2 className="mb-4 text-xl font-bold text-cyan-400">{unit}</h2><div className="grid gap-3 sm:grid-cols-2">{lessons.filter(l=>l.unit===unit).map(l=><button key={l.id} onClick={()=>open(l)} className={btn+' text-left'}>{l.title}{done.includes(l.id)?' ✓':''}</button>)}</div></section>)}</div>:<section className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5"><button className="text-cyan-400" onClick={()=>setLesson(null)}>← All topics</button><h2 className="mt-4 text-2xl font-bold">{lesson.title}</h2><p className="my-4 text-lg text-slate-200">{lesson.explanation}</p>{lesson.questions[0].fen&&<ChessBoard fen={lesson.questions[0].fen}/>}<h3 className="my-5 text-xl font-bold">{lesson.questions[0].prompt}</h3><div className="grid gap-3 sm:grid-cols-2">{choices.map(a=><button key={a} disabled={finished} onClick={()=>answer(a)} className={btn+' text-left disabled:opacity-70'}>{a}</button>)}</div>{feedback&&<p className={'mt-4 rounded-lg p-4 '+(feedback.startsWith('Correct!')?'bg-green-900':'bg-yellow-900')}>{feedback}</p>}{finished&&<div className="mt-4 flex flex-wrap gap-3"><button className={btn} onClick={()=>open(lesson)}>Retry</button><button className="rounded-lg bg-cyan-500 px-4 py-3 font-bold text-black" onClick={()=>{const next=lessons[lessons.indexOf(lesson)+1];if(next)open(next);else setLesson(null);}}>Next topic</button></div>}<ChessExercise key={lesson.id} id={lesson.id}/><details className="mt-6"><summary className="cursor-pointer text-cyan-400">Explore moves on a practice board</summary><div className="mt-4"><ChessBoard fen={fen} selected={selected} legalMoves={legal} onSquareClick={click}/><button className={btn+' mt-3'} onClick={()=>{setFen(new Chess().fen());setSelected(null);}}>Reset board</button></div></details></section>}</div></main>;
}

