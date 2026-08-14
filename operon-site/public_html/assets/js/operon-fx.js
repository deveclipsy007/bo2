(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 700px)').matches;
  const mobileFrameInterval = 1000 / 30;
  const dpr = () => mobile ? 1 : Math.min(devicePixelRatio || 1, 1.5);

  class ParticleField {
    constructor(canvas, mode) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.mode = mode;
      this.points = []; this.pointer = { x: -9999, y: -9999 }; this.running = false;
      this.words = (canvas.dataset.words || '').split('|').filter(Boolean); this.wordIndex = 0;
      this.imageSrc = canvas.dataset.src; this.resize = this.resize.bind(this); this.draw = this.draw.bind(this); this.frameRequested=false;this.lastFrame=0;
      window.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;this.pointer=x>=0&&y>=0&&x<=r.width&&y<=r.height?{x,y}:{x:-9999,y:-9999}; }, {passive:true});
      new ResizeObserver(this.resize).observe(canvas);
      new IntersectionObserver(([e]) => { this.running = e.isIntersecting && !document.hidden; if(this.running)this.start(); }, {rootMargin:'100px'}).observe(canvas);
      document.addEventListener('visibilitychange', () => { this.running = !document.hidden&&canvas.getBoundingClientRect().bottom>0&&canvas.getBoundingClientRect().top<innerHeight; if(this.running)this.start(); });
      this.resize();
      if (mode === 'logo') this.loadLogo(); else this.buildWord();
      if (this.words.length > 1) setInterval(() => { if(!this.running)return;this.wordIndex=(this.wordIndex+1)%this.words.length; this.buildWord(); }, 4300);
    }
    resize(){ const r=this.canvas.getBoundingClientRect(), scale=dpr(); this.w=r.width;this.h=r.height;this.canvas.width=Math.max(1,r.width*scale);this.canvas.height=Math.max(1,r.height*scale);this.ctx.setTransform(scale,0,0,scale,0,0); if(this.mode==='word') this.buildWord(); else if(this.img) this.sampleLogo(); }
    targets(drawFn, gap){ const off=document.createElement('canvas'); off.width=Math.max(1,this.w);off.height=Math.max(1,this.h);const c=off.getContext('2d',{willReadFrequently:true});drawFn(c,off);const data=c.getImageData(0,0,off.width,off.height).data, targets=[];for(let y=0;y<off.height;y+=gap)for(let x=0;x<off.width;x+=gap)if(data[(y*off.width+x)*4+3]>90)targets.push({x,y});return targets; }
    setTargets(targets){ while(this.points.length<targets.length)this.points.push({x:Math.random()*this.w,y:Math.random()*this.h,vx:0,vy:0,a:0}); this.points.length=targets.length; targets.forEach((t,i)=>Object.assign(this.points[i],{tx:t.x,ty:t.y})); }
    buildWord(){ if(!this.w||!this.words.length)return;const word=this.words[this.wordIndex],heroWord=word==='Mais capacidade'&&mobile;if(heroWord){this.canvas.style.opacity='1';this.canvas.style.mixBlendMode='normal';}const targets=this.targets(c=>{c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';if(heroWord){const mainSize=Math.min(this.w*.2,this.h*.41),capacitySize=Math.min(this.w*.155,this.h*.34);c.font=`500 ${mainSize}px Space Grotesk, sans-serif`;c.fillText('Mais',this.w/2,this.h*.31);c.font=`500 ${capacitySize}px Space Grotesk, sans-serif`;c.fillText('capacidade',this.w/2,this.h*.72);}else{const size=Math.min(this.w/(word.length*.61),this.h*.72,170);c.font=`500 ${size}px Space Grotesk, sans-serif`;c.fillText(word,this.w/2,this.h/2);}},heroWord?3:mobile?5:4);this.heroWord=heroWord;this.setTargets(targets.sort(()=>Math.random()-.5).slice(0,heroWord?2800:mobile?1650:7000)); }
    loadLogo(){ const img=new Image();img.onload=()=>{this.img=img;this.sampleLogo()};img.src=this.imageSrc; }
    sampleLogo(){const targets=this.targets((c)=>{const size=Math.min(this.w,this.h)*.72;c.globalAlpha=.95;c.drawImage(this.img,(this.w-size)/2,(this.h-size)/2,size,size);},innerWidth<700?6:5);this.setTargets(targets);}
    start(){if(this.frameRequested||reduced)return;this.frameRequested=true;requestAnimationFrame(this.draw);}
    draw(t){this.frameRequested=false;if(!this.running||reduced)return;if(mobile&&t-this.lastFrame<mobileFrameInterval){this.start();return;}this.lastFrame=t;this.ctx.clearRect(0,0,this.w,this.h);const pulse=(Math.sin(t*.0012)+1)*.5;for(const p of this.points){let dx=p.tx-p.x,dy=p.ty-p.y;p.vx+=dx*(mobile?.032:.018);p.vy+=dy*(mobile?.032:.018);const mx=p.x-this.pointer.x,my=p.y-this.pointer.y,dist=Math.hypot(mx,my);if(dist<125&&dist>0){const force=(1-dist/125)*2.9;p.vx+=mx/dist*force;p.vy+=my/dist*force;}p.vx*=mobile?.8:.86;p.vy*=mobile?.8:.86;p.x+=p.vx;p.y+=p.vy;p.a+=(1-p.a)*.05;const size=this.mode==='logo' ? .65+pulse*.55 : this.heroWord?1.3:mobile?1.05:.7+Math.random()*.55;this.ctx.fillStyle=`rgba(244,244,239,${p.a*(this.mode==='logo'?.58:.86)})`;this.ctx.fillRect(p.x,p.y,size,size);}this.start();}
  }
  class SemanticMorph extends ParticleField {
    constructor(canvas) {
      super(canvas, 'morph');
      this.shapes=(canvas.dataset.shapes||'ruido|rede').split('|');this.shapeIndex=0;
      this.buildShape();
      setInterval(()=>{if(!this.running)return;this.shapeIndex=(this.shapeIndex+1)%this.shapes.length;this.buildShape();},+(canvas.dataset.hold||4800));
    }
    resize(){const r=this.canvas.getBoundingClientRect(),scale=dpr();this.w=r.width;this.h=r.height;this.canvas.width=Math.max(1,r.width*scale);this.canvas.height=Math.max(1,r.height*scale);this.ctx.setTransform(scale,0,0,scale,0,0);if(this.shapes)this.buildShape();}
    buildShape(){if(!this.w||!this.shapes)return;const kind=this.shapes[this.shapeIndex];const targets=this.targets((c)=>this.drawShape(c,kind),mobile?7:4);this.setTargets(targets.sort(()=>Math.random()-.5).slice(0,mobile ? 1100 : 6200));}
    drawShape(c,kind){const W=this.w,H=this.h,s=Math.min(W,H)/100,ox=(W-100*s)/2,oy=(H-100*s)/2;c.save();c.translate(ox,oy);c.scale(s,s);c.fillStyle='#fff';c.strokeStyle='#fff';c.lineWidth=3;c.lineCap='round';c.lineJoin='round';
      if(kind==='ruido'){for(let i=0;i<380;i++){c.globalAlpha=.18+Math.random()*.82;c.fillRect(Math.random()*100,Math.random()*100,Math.random()*1.4+.3,Math.random()*1.4+.3);}}
      if(kind==='seta'){c.beginPath();c.moveTo(7,43);c.lineTo(59,43);c.lineTo(59,24);c.lineTo(95,50);c.lineTo(59,76);c.lineTo(59,57);c.lineTo(7,57);c.closePath();c.fill();}
      if(kind==='rede'){const n=[[50,50],[18,22],[82,24],[15,75],[84,72],[50,10],[50,91],[27,49],[75,52]];c.beginPath();for(let i=1;i<n.length;i++){c.moveTo(50,50);c.lineTo(n[i][0],n[i][1]);}c.moveTo(18,22);c.lineTo(82,24);c.moveTo(15,75);c.lineTo(84,72);c.stroke();n.forEach((p,i)=>{c.beginPath();c.arc(p[0],p[1],i?4.5:7,0,Math.PI*2);c.fill();});}
      if(kind==='balao'){c.beginPath();c.roundRect(12,20,76,52,12);c.fill();c.beginPath();c.moveTo(31,67);c.lineTo(28,87);c.lineTo(50,70);c.fill();c.globalCompositeOperation='destination-out';c.fillRect(27,37,47,4);c.fillRect(27,51,32,4);}
      if(kind==='pasta'){c.beginPath();c.moveTo(9,27);c.lineTo(39,27);c.lineTo(47,36);c.lineTo(91,36);c.lineTo(91,80);c.quadraticCurveTo(91,87,84,87);c.lineTo(16,87);c.quadraticCurveTo(9,87,9,80);c.closePath();c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.roundRect(17,45,66,33,4);c.fill();c.globalCompositeOperation='source-over';c.fillRect(25,53,50,3);c.fillRect(25,61,39,3);c.fillRect(25,69,45,3);}
      if(kind==='exclamacao'){c.beginPath();c.arc(50,50,42,0,Math.PI*2);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(50,50,34,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';c.beginPath();c.roundRect(45,23,10,43,5);c.fill();c.beginPath();c.arc(50,77,6,0,Math.PI*2);c.fill();}
      if(kind==='cerebro'){c.globalCompositeOperation='source-over';c.beginPath();c.ellipse(50,45,32,38,0,0,Math.PI*2);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(50,8);c.lineTo(50,82);c.stroke();for(let i=0;i<5;i++){let y=20+i*13;c.beginPath();c.moveTo(46,y);c.bezierCurveTo(33,y-7,26,y+7,20,y);c.moveTo(54,y);c.bezierCurveTo(67,y-7,74,y+7,80,y);c.stroke();}}
      if(kind==='camadas'){c.globalCompositeOperation='source-over';for(let i=0;i<5;i++){c.globalAlpha=.35+i*.13;c.beginPath();c.moveTo(12,20+i*14);c.bezierCurveTo(35,10+i*15,65,30+i*11,88,18+i*15);c.lineTo(88,29+i*14);c.bezierCurveTo(62,41+i*10,34,23+i*15,12,33+i*14);c.closePath();c.fill();}}
      if(kind==='blocos'){c.globalAlpha=1;for(let y=0;y<4;y++)for(let x=0;x<4;x++)c.fillRect(13+x*21,13+y*21,15,15);}
      if(kind==='engrenagem'){c.beginPath();for(let i=0;i<20;i++){let a=i/20*Math.PI*2,r=i%2?43:31;c.lineTo(50+Math.cos(a)*r,50+Math.sin(a)*r);}c.closePath();c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(50,50,14,0,Math.PI*2);c.fill();}
      if(kind==='orbita'){c.globalCompositeOperation='source-over';c.globalAlpha=1;[42,30,18].forEach((r,i)=>{c.lineWidth=5-i;c.beginPath();c.ellipse(50,50,r,r*(.35+i*.2),i*.55,0,Math.PI*2);c.stroke();});c.beginPath();c.arc(50,50,6,0,Math.PI*2);c.fill();}
      c.restore();}
  }
  if (reduced) return;
  document.querySelectorAll('[data-fx="vapor"]').forEach(c=>new ParticleField(c,'word'));
  document.querySelectorAll('[data-fx="logo-cloud"]').forEach(c=>new ParticleField(c,'logo'));
  document.querySelectorAll('[data-fx="morph"]').forEach(c=>new SemanticMorph(c));
})();
