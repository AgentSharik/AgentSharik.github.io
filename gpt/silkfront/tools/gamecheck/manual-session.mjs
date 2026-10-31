// Local-only controller for explicit agent decisions, sharing one real browser page.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { appendFile, mkdir } from 'node:fs/promises';
import http from 'node:http';
import { command } from './manual-driver.mjs';
const url=process.argv[2];
if(!/^http:\/\/127\.0\.0\.1:\d+\/GAME\/index\.html$/.test(url)) throw new Error('Use actual server URL');
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath});
const page=await browser.newPage({viewport:{width:1440,height:960}});
await mkdir('../../GAME/reports',{recursive:true});
page.on('pageerror',e=>appendFile('../../GAME/reports/manual-errors.log',String(e)+'\n'));
page.on('console',m=>{if(m.type()==='error')appendFile('../../GAME/reports/manual-errors.log',m.text()+' '+JSON.stringify(m.location())+'\n');});
page.on('requestfailed',r=>appendFile('../../GAME/reports/manual-errors.log',r.url()+' '+r.failure()?.errorText+'\n'));
await page.goto(url);await page.locator('[data-fac="HUMANS"]:enabled').waitFor();
let busy=false;
const server=http.createServer(async(req,res)=>{
  if(req.url!=='/step'||req.method!=='POST'||req.headers.origin||req.headers['content-type']!=='application/json'){res.writeHead(403);res.end();return;}
  if(busy){res.writeHead(409);res.end('Busy');return;}
  busy=true;
  try{let body='';for await(const data of req){body+=data;if(body.length>10000)throw new Error('Too much input');}
    const actions=JSON.parse(body);if(!Array.isArray(actions)||actions.length>60)throw new Error('Invalid batch');
    const state=await command(page,actions);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(state));
  }catch(e){res.writeHead(500,{'Content-Type':'text/plain'});res.end(e.stack);}finally{busy=false;}
});
server.listen(0,'127.0.0.1',()=>console.log('MANUAL_CONTROLLER=http://127.0.0.1:'+server.address().port));
