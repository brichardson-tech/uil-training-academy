import { Chess } from 'chess.js';
export type Exercise = {fen:string; prompt:string; answers:string[]; explanation:string};
const pick = <T,>(a:T[]):T => a[Math.floor(Math.random()*a.length)];
export function generateExercise(id:string):Exercise|null {
 const n=Number(id.split('-').pop());
 const types:Record<number,string>={3:'p',4:'n',5:'b',6:'r',7:'q',8:'k',9:'n',10:'check',11:'check',12:'mate',14:'castle',15:'promotion',16:'ep',32:'mate'};
 const type=types[n]; if(!type)return null;
 let g=new Chess();
 if(type==='mate'){
  // White has a protected queen and a confined black king.
  g=new Chess(pick(['7k/5K2/6Q1/8/8/8/8/8 w - - 0 1','k7/2K5/1Q6/8/8/8/8/8 w - - 0 1']));
 }else if(type==='castle')g=new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
 else if(type==='promotion')g=new Chess('7k/P7/8/8/8/8/8/4K3 w - - 0 1');
 else if(type==='ep'){for(const m of ['e4','a6','e5','d5'])g.move(m);}
 else if(type==='check')g=new Chess('4r2k/8/8/8/8/8/8/4K3 w - - 0 1');
 else {
  for(let i=0;i<16;i++){const moves=g.moves();if(g.isGameOver()||!moves.length)break;g.move(pick(moves));}
  if(g.isGameOver())g=new Chess();
 }
 const moves=g.moves({verbose:true});
 const code=(m:typeof moves[number])=>m.from+m.to+(m.promotion||'');
 let good=moves.filter(m=>m.piece===type);
 let prompt='', explanation='';
 if(type==='mate'){good=moves.filter(m=>{const h=new Chess(g.fen());h.move(m.san);return h.isCheckmate();});prompt='Find a move that delivers checkmate.';explanation='Checkmate leaves the opposing king in check with no legal escape.';}
 else if(type==='castle'){good=moves.filter(m=>m.san.startsWith('O-O'));prompt='Castle on either legal side.';explanation='Move the king two squares toward its rook.';}
 else if(type==='promotion'){good=moves.filter(m=>m.promotion==='q');prompt='Promote the pawn to a queen.';explanation='A pawn reaching the last rank can promote to a queen.';}
 else if(type==='ep'){good=moves.filter(m=>m.flags.includes('e'));prompt='Capture en passant.';explanation='Capture the pawn that just advanced two squares.';}
 else if(type==='check'){good=moves;prompt='Make a legal move to escape check.';explanation='A legal move must remove the attack on your king.';}
 else {if(!good.length)return null;const target=pick(good);good=good.filter(m=>m.from===target.from&&m.to===target.to);prompt=`Move the ${({p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'} as Record<string,string>)[type]} from ${target.from} to ${target.to}.`;explanation=`${target.san} is a legal move in this position.`;}
 if(!good.length)return null;
 return {fen:g.fen(),prompt,answers:good.map(code),explanation};
}
