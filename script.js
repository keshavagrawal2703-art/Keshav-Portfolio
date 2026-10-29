/* Keshav Agrawal portfolio: scroll animations, parallax, counters, menu */
(function(){
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var clamp = function(v,a,b){return Math.max(a,Math.min(b,v))};
  var vh = innerHeight, vw = innerWidth, sy = scrollY, ticking = false, lastY = 0;

  /* ---- Marquee: clone each set so the loop is seamless ---- */
  var rows = [].map.call(document.querySelectorAll('.mq-row'), function(row){
    var track=row.querySelector('.mq-track'), set=track.firstElementChild;
    for(var i=0;i<3;i++){var c=set.cloneNode(true);c.setAttribute('aria-hidden','true');track.appendChild(c)}
    return {row:row, track:track, dir:+row.dataset.dir, w:0};
  });

  /* ---- Manifesto words ---- */
  var scrub = document.getElementById('scrub');
  scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');
  var words = [].slice.call(scrub.querySelectorAll('.w')), wordsOn = 0;

  /* ---- Element refs ---- */
  var nav=document.getElementById('nav'), bar=document.querySelector('.progress i');
  var hero=document.getElementById('hero'), dash=document.getElementById('dash');
  var par=[].map.call(document.querySelectorAll('[data-speed]'), function(el){
    return {el:el, speed:parseFloat(el.dataset.speed), c:0};
  });
  var cases=[].slice.call(document.querySelectorAll('.case'));
  var stepsEl=document.getElementById('steps'), fill=stepsEl.querySelector('.fill'), track=stepsEl.querySelector('.track');
  var stepItems=[].slice.call(stepsEl.querySelectorAll('.step'));
  var mqEl=document.querySelector('.mq');
  var links=[].slice.call(document.querySelectorAll('.links a'));

  /* ---- Mobile menu ---- */
  var menuBtn=document.getElementById('menuBtn');
  function setMenu(o){
    nav.classList.toggle('open',o);
    menuBtn.setAttribute('aria-expanded',o?'true':'false');
    menuBtn.setAttribute('aria-label',o?'Close menu':'Open menu');
  }
  menuBtn.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
  links.forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  addEventListener('keydown',function(e){if(e.key==='Escape') setMenu(false)});

  /* ---- Measure (positions without transforms) ---- */
  function measure(){
    vh=innerHeight; vw=innerWidth;
    if(vw>760) setMenu(false);
    par.forEach(function(o){
      o.el.style.setProperty('--py','0px');
      var r=o.el.getBoundingClientRect();
      o.c=r.top+scrollY+r.height/2;
    });
    rows.forEach(function(r){r.w=r.track.scrollWidth/4});
    cases.forEach(function(c){c._top=parseFloat(getComputedStyle(c).top)||0});
    var lastLi=stepItems[stepItems.length-1];
    track.style.height=lastLi.offsetTop+'px';
    tick();
  }

  /* ---- Per-frame work ---- */
  function tick(){
    sy=scrollY;
    var docH=document.documentElement.scrollHeight-vh;
    bar.style.transform='scaleX('+(docH>0?clamp(sy/docH,0,1):0)+')';

    nav.classList.toggle('stuck', sy>10);
    if(nav.classList.contains('open')) nav.classList.remove('hide');
    else if(sy>240 && sy>lastY+4) nav.classList.add('hide');
    else if(sy<lastY-4 || sy<=240) nav.classList.remove('hide');
    lastY=sy;

    if(reduce) return;

    /* headline gradient slides with scroll */
    if(sy<vh*1.5) hero.style.setProperty('--gp',clamp(sy/vh*70,0,100).toFixed(1)+'%');

    /* parallax layers */
    par.forEach(function(o){
      var d=sy+vh/2-o.c;
      if(Math.abs(d)>vh*1.6) return;
      o.el.style.setProperty('--py',(-d*o.speed).toFixed(1)+'px');
    });

    /* marquee bands slide with scroll */
    var mr=mqEl.getBoundingClientRect();
    if(mr.bottom>-100 && mr.top<vh+100){
      rows.forEach(function(r){
        if(!r.w) return;
        var s=(sy*0.35)%r.w;
        var x=r.dir<0 ? -s : s-r.w;
        r.track.style.transform='translate3d('+x.toFixed(1)+'px,0,0)';
      });
    }

    /* stacking case cards */
    if(vw>=800){
      cases.forEach(function(c,i){
        var n=cases[i+1]; if(!n) return;
        var d=n.getBoundingClientRect().top-c._top;
        var p=clamp(1-d/c.offsetHeight,0,1);
        c.style.transform='scale('+(1-p*.06).toFixed(4)+')';
        c.firstElementChild.style.opacity=(1-p*.55).toFixed(3);
      });
    } else {
      cases.forEach(function(c){c.style.transform='';c.firstElementChild.style.opacity=''});
    }

    /* manifesto words light up */
    var sr=scrub.getBoundingClientRect();
    var sp=clamp((vh*0.8-sr.top)/(vh*0.5),0,1);
    var on=Math.round(sp*words.length);
    if(on!==wordsOn){
      words.forEach(function(w,i){w.classList.toggle('on',i<on)});
      wordsOn=on;
    }

    /* process line fills */
    var pr=stepsEl.getBoundingClientRect();
    var pp=clamp((vh*0.6-pr.top)/pr.height,0,1);
    fill.style.transform='scaleY('+pp.toFixed(3)+')';
    stepItems.forEach(function(li){
      li.classList.toggle('on', li.getBoundingClientRect().top<vh*0.62);
    });
  }

  /* ---- Reduced-motion end states ---- */
  if(reduce){
    words.forEach(function(w){w.classList.add('on')});
    fill.style.transform='scaleY(1)';
    stepItems.forEach(function(li){li.classList.add('on')});
  }

  /* ---- Pointer effects (mouse devices only) ---- */
  if(fine && !reduce){
    hero.addEventListener('pointermove',function(e){
      var r=hero.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      dash.style.setProperty('--ry',(x*10).toFixed(2)+'deg');
      dash.style.setProperty('--rx',(-y*8).toFixed(2)+'deg');
    });
    hero.addEventListener('pointerleave',function(){
      dash.style.setProperty('--ry','0deg');
      dash.style.setProperty('--rx','0deg');
    });
    document.querySelectorAll('.mag').forEach(function(b){
      b.addEventListener('pointermove',function(e){
        var r=b.getBoundingClientRect();
        b.style.translate=((e.clientX-r.left-r.width/2)*.2).toFixed(1)+'px '+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px';
      });
      b.addEventListener('pointerleave',function(){b.style.translate=''});
    });
  }


  /* ---- Custom cursor, trail, spotlight and pointer depth (mouse devices only) ---- */
  if(fine && !reduce){
    var mk=function(cls){var d=document.createElement('i');d.className=cls;d.setAttribute('aria-hidden','true');document.body.appendChild(d);return d};
    var dotEl=mk('cur-dot'), ringEl=mk('cur-ring');
    var palette=['#19C3D6','#FF5D73','#FFB547','#19C3D6','#FF5D73'];
    var trail=palette.map(function(c,i){
      var el=mk('cur-tr'); el.style.setProperty('--c',c); el.style.setProperty('--s',(14-i*2)+'px');
      return {el:el,x:0,y:0};
    });
    var mx=0,my=0,dx=0,dy=0,rx=0,ry=0,ready=false,running=false;
    var tgt={x:0,y:0}, cur={x:0,y:0}, curSpot=null;
    var place=function(el,x,y){el.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)'};

    function loop(){
      dx+=(mx-dx)*.55; dy+=(my-dy)*.55;
      rx+=(mx-rx)*.16; ry+=(my-ry)*.16;
      place(dotEl,dx,dy); place(ringEl,rx,ry);
      var px=rx, py=ry, lag=0;
      trail.forEach(function(t,i){
        var k=.26-i*.03;
        t.x+=(px-t.x)*k; t.y+=(py-t.y)*k;
        place(t.el,t.x,t.y);
        px=t.x; py=t.y;
        lag=Math.max(lag,Math.abs(mx-t.x)+Math.abs(my-t.y));
      });
      cur.x+=(tgt.x-cur.x)*.07; cur.y+=(tgt.y-cur.y)*.07;
      hero.style.setProperty('--nx',cur.x.toFixed(4));
      hero.style.setProperty('--ny',cur.y.toFixed(4));
      var busy=lag>.3||Math.abs(tgt.x-cur.x)>.0008||Math.abs(tgt.y-cur.y)>.0008;
      if(busy) requestAnimationFrame(loop); else running=false;
    }
    function kick(){ if(!running){running=true;requestAnimationFrame(loop)} }

    document.addEventListener('pointermove',function(e){
      if(e.pointerType==='touch') return;
      mx=e.clientX; my=e.clientY;
      if(!ready){
        ready=true; dx=rx=mx; dy=ry=my;
        trail.forEach(function(t){t.x=mx;t.y=my});
        root.classList.add('has-cursor');
      }
      root.classList.remove('cur-out');
      var t=e.target;
      if(!t || !t.closest) return;

      ringEl.classList.toggle('hov',!!t.closest('a,button,.btn'));
      root.classList.toggle('trail-on',!!t.closest('[data-trail]'));

      var s=t.closest('.spot');
      if(s!==curSpot){
        if(curSpot) curSpot.classList.remove('hovering');
        if(s) s.classList.add('hovering');
        curSpot=s;
      }
      if(s){
        var r=s.getBoundingClientRect();
        s.style.setProperty('--mx',(e.clientX-r.left).toFixed(0)+'px');
        s.style.setProperty('--my',(e.clientY-r.top).toFixed(0)+'px');
      }

      if(t.closest('#hero')){
        var h=hero.getBoundingClientRect();
        tgt.x=clamp((e.clientX-h.left)/h.width-.5,-.5,.5);
        tgt.y=clamp((e.clientY-h.top)/h.height-.5,-.5,.5);
      } else { tgt.x=0; tgt.y=0; }

      var c=t.closest('.case');
      if(c){
        var cr=c.getBoundingClientRect();
        c.style.setProperty('--cx',(e.clientX-cr.left).toFixed(0)+'px');
        c.style.setProperty('--cy',(e.clientY-cr.top).toFixed(0)+'px');
      }
      kick();
    },{passive:true});

    document.addEventListener('pointerdown',function(){ringEl.classList.add('down')});
    document.addEventListener('pointerup',function(){ringEl.classList.remove('down')});
    document.documentElement.addEventListener('mouseleave',function(){root.classList.add('cur-out')});
    document.documentElement.addEventListener('mouseenter',function(){root.classList.remove('cur-out')});
  }

  /* ---- Counters ---- */
  function fmt(el,v){
    var d=+(el.dataset.dec||0);
    return (el.dataset.prefix||'')+v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})+(el.dataset.suffix||'');
  }
  function count(el){
    var to=+el.dataset.to;
    if(reduce){el.textContent=fmt(el,to);return}
    var t0=performance.now(),D=1600;
    (function f(t){
      var k=Math.min((t-t0)/D,1), e=1-Math.pow(1-k,4);
      el.textContent=fmt(el,to*e);
      if(k<1) requestAnimationFrame(f); else el.textContent=fmt(el,to);
    })(t0);
  }
  var counters=document.querySelectorAll('[data-to]');
  if(!reduce) counters.forEach(function(el){el.textContent=fmt(el,0)});
  var cio=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){cio.unobserve(e.target);count(e.target)}});
  },{threshold:.6});
  counters.forEach(function(el){cio.observe(el)});

  /* ---- Reveal on scroll (also grows bars and the budget split) ---- */
  var rio=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}});
  },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){rio.observe(el)});

  /* ---- Current section in nav ---- */
  var nio=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      links.forEach(function(a){
        if(a.getAttribute('href')==='#'+e.target.id) a.setAttribute('aria-current','true');
        else a.removeAttribute('aria-current');
      });
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('main section[id]').forEach(function(s){nio.observe(s)});

  /* ---- Events ---- */
  addEventListener('scroll',function(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){tick();ticking=false});
  },{passive:true});
  var rt;
  addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,120)});
  if('ResizeObserver' in window){
    var ro=new ResizeObserver(function(){clearTimeout(rt);rt=setTimeout(measure,120)});
    ro.observe(document.body);
  }

  measure();
  var started=false;
  var start=function(){
    if(started) return; started=true;
    requestAnimationFrame(function(){root.classList.add('loaded');measure()});
  };
  if(document.fonts && document.fonts.ready){document.fonts.ready.then(start);setTimeout(start,1500)}
  else start();
})();
