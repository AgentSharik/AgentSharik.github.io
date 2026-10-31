// Browser geometry/alpha checks; image bytes are not used for visual judgments.
import { readFile, writeFile } from 'node:fs/promises';
import { openGame } from './browser.mjs';
const {browser,page,url}=await openGame();
try {
  const assets=JSON.parse(await readFile('../../ASSET_LIBRARY/review/manifest.json','utf8'));
  await page.goto(new URL('/ASSET_LIBRARY/review.html',url).href);
  const rows=[];
  for(const a of assets) rows.push(await page.evaluate(async a=>{
    const im=new Image();im.src='review/'+a.id+'.png';await im.decode();
    const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,256,256).data;
    let clear=0,solid=0,partial=0,x0=256,y0=256,x1=-1,y1=-1,edge=[];
    for(let y=0;y<256;y++) for(let x=0;x<256;x++) {const alpha=d[(y*256+x)*4+3];if(alpha===0)clear++;else if(alpha===255)solid++;else partial++;if(alpha>8){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);if(x===0||x===255||y===0||y===255)edge.push([x,y]);}}
    return {id:a.id,size:[im.width,im.height],alpha:{clear,solid,partial},boundsAlphaOver8:[x0,y0,x1,y1],touchesCanvas:edge.length>0,edgePixels:edge.length};
  },a));
  await writeFile('../../ASSET_LIBRARY/review/metrics.json',JSON.stringify(rows,null,2));
  console.log(JSON.stringify(rows.map(r=>({id:r.id,clear:r.alpha.clear,partial:r.alpha.partial,bounds:r.boundsAlphaOver8,edge:r.edgePixels})),null,2));
}finally{await browser.close();}
