import { readFile } from 'node:fs/promises';
const url=process.argv[2];
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(url))throw new Error('Use actual local controller URL');
const body=await readFile('manual-actions.json','utf8');
const res=await fetch(url+'/step',{method:'POST',headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(150000)});
const text=await res.text();if(!res.ok)throw new Error(text);
console.log(JSON.stringify(JSON.parse(text),null,2));
