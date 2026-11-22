import{$ as Ug,$t as mH,A as Jn$1,At as dy,B as Oe,Bn as yd,Bt as ge$1,C as Hd,Cn as uS,Ct as by,D as Ja,Dn as v$1,Dt as dN,E as J$1,En as un$1,Fn as x$2,Ft as fS,G as Qd,Gn as zn$1,Gt as ie$2,H as Pa,Ht as hH,I as My,In as y$1,J as Ss,Jn as zy,K as Qs,L as N_,Ln as yE,Lt as fy,M as Kf,Mn as wE,Mt as er,N as La,Nn as wf,Nt as fC,O as Jb,On as vE,Ot as de,P as M_,Pn as wy,Q as U$2,Qt as mE,R as Ne,Rn as yG,Rt as gE,Sn as uN,St as bN,Tn as ue$2,Tt as co,U as Pv,Un as zD,Ut as he$1,V as PD,Vn as yp,W as QD,Wn as zc,Wt as hi$1,X as T$3,Xt as le$1,Y as Sy,Yt as ka,Z as Ty,Zt as lt$1,_ as Fy,_t as Zd,a as Ay,an as or,at as W8,bt as _y,cn as pH,d as Dy,dt as Xn$1,en as mN,et as Ut$1,f as Ea,fn as qd,ft as Y,g as FT,gn as rl,h as FS,hn as r_,ht as Ye$2,i as AT,in as ne$2,j as Kb,jn as vy,k as Jd,kn as vG,l as CE,ln as py,lt as X$1,m as F$2,mn as rS,mt as Yd,n as $d,nn as mp,nt as Vc,o as Ba,on as ot$2,ot as Wd,p as Eo,qn as zr,qt as jt$1,rn as nS,rt as Vd,s as Bc,sn as p$2,st as Wf,tn as mS,u as DE,un as q$1,ut as XS,v as G$2,vt as Zn$1,w as Ho,wn as ua,x as HD,xn as uI,xt as bE,y as Gn$1,yn as st$2,yt as _$1,zn as yN,zt as gS}from"./chunk-BcjubxLP.js";import{i as ne$3,r as W$1,t as N$2}from"./chunk-DDkzryvS.js";import{n as m,t as l$1}from"./chunk-Da4-SChG.js";function U$1(n){n||(n=p$2(ue$2));let e=new x$2(t=>{if(n.destroyed){t.next();return}return n.onDestroy(t.next.bind(t))});return t=>t.pipe(Eo(e))}function T$2(n,e){let d=!e?.manualCleanup?e?.injector?.get(ue$2)??p$2(ue$2):null,l=p$1(e?.equal),o;e?.requireSync?o=X$1({kind:0},{equal:l}):o=X$1({kind:1,value:e?.initialValue},{equal:l});let i,b=n.subscribe({next:r=>o.set({kind:1,value:r}),error:r=>{o.set({kind:2,error:r}),i?.()},complete:()=>{i?.()}});if(e?.requireSync&&o().kind===0)throw new y$1(601,!1);return i=d?.onDestroy(b.unsubscribe.bind(b)),Jd(()=>{let r=o();switch(r.kind){case 1:return r.value;case 2:throw r.error;case 0:throw new y$1(601,!1)}},{equal:e?.equal})}function p$1(n=Object.is){return(e,t)=>e.kind===1&&t.kind===1&&n(e.value,t.value)}function D$2(i){return i.buttons===0||i.detail===0}function O$3(i){let t=i.touches&&i.touches[0]||i.changedTouches&&i.changedTouches[0];return!!t&&t.identifier===-1&&(t.radiusX==null||t.radiusX===1)&&(t.radiusY==null||t.radiusY===1)}var ie$1;function Fe(){if(ie$1==null){let i=typeof document<`u`?document.head:null;ie$1=!!(i&&(i.createShadowRoot||i.attachShadow))}return ie$1}function se(i){if(Fe()){let t=i.getRootNode?i.getRootNode():null;if(typeof ShadowRoot<`u`&&ShadowRoot&&t instanceof ShadowRoot)return t}return null}function g$1(i){if(i.composedPath)try{return i.composedPath()[0]}catch{}return i.target}var N$1;function we(){if(N$1==null&&typeof window<`u`)try{window.addEventListener(`test`,null,Object.defineProperty({},"passive",{get:()=>N$1=!0}))}finally{N$1=N$1||!1}return N$1}function I(i){return we()?i:!!i.capture}function ne$1(i,t=0){return Se(i)?Number(i):arguments.length===2?t:0}function Se(i){return!isNaN(parseFloat(i))&&!isNaN(Number(i))}function p(i){return i instanceof ot$2?i.nativeElement:i}var Re=new v$1(`cdk-input-modality-detector-options`);var Le={ignoreKeys:[18,17,224,91,16]};var ke=650;var re$1={passive:!0,capture:!0};var xe$1=(()=>{class i{_platform=p$2(N$2);_listenerCleanups;modalityDetected;modalityChanged;get mostRecentModality(){return this._modality.value}_mostRecentTarget=null;_modality=new de(null);_options;_lastTouchMs=0;_onKeydown=e=>{this._options?.ignoreKeys?.some(s=>s===e.keyCode)||(this._modality.next(`keyboard`),this._mostRecentTarget=g$1(e))};_onMousedown=e=>{Date.now()-this._lastTouchMs<ke||(this._modality.next(D$2(e)?`keyboard`:`mouse`),this._mostRecentTarget=g$1(e))};_onTouchstart=e=>{if(O$3(e)){this._modality.next(`keyboard`);return}this._lastTouchMs=Date.now(),this._modality.next(`touch`),this._mostRecentTarget=g$1(e)};constructor(){let e=p$2(le$1),s=p$2(U$2),n=p$2(Re,{optional:!0});if(this._options=l$1(l$1({},Le),n),this.modalityDetected=this._modality.pipe(bE(1)),this.modalityChanged=this.modalityDetected.pipe(DE()),this._platform.isBrowser){let r=p$2(zn$1).createRenderer(null,null);this._listenerCleanups=e.runOutsideAngular(()=>[r.listen(s,`keydown`,this._onKeydown,re$1),r.listen(s,`mousedown`,this._onMousedown,re$1),r.listen(s,`touchstart`,this._onTouchstart,re$1)])}}ngOnDestroy(){this._modality.complete(),this._listenerCleanups?.forEach(e=>e())}static ɵfac=function(s){return new(s||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();var F$1=(function(i){return i[i.IMMEDIATE=0]=`IMMEDIATE`,i[i.EVENTUAL=1]=`EVENTUAL`,i})(F$1||{});var Pe=new v$1(`cdk-focus-monitor-default-options`);var j$2=I({passive:!0,capture:!0});var Ue$1=(()=>{class i{_ngZone=p$2(le$1);_platform=p$2(N$2);_inputModalityDetector=p$2(xe$1);_origin=null;_lastFocusOrigin=null;_windowFocused=!1;_windowFocusTimeoutId;_originTimeoutId;_originFromTouchInteraction=!1;_elementInfo=/* @__PURE__ */ new Map;_monitoredElementCount=0;_rootNodeFocusListenerCount=/* @__PURE__ */ new Map;_detectionMode;_windowFocusListener=()=>{this._windowFocused=!0,this._windowFocusTimeoutId=setTimeout(()=>this._windowFocused=!1)};_document=p$2(U$2);_stopInputModalityDetector=new Y;constructor(){let e=p$2(Pe,{optional:!0});this._detectionMode=e?.detectionMode||F$1.IMMEDIATE}_rootNodeFocusAndBlurListener=e=>{let s=g$1(e);for(let n=s;n;n=n.parentElement)e.type===`focus`?this._onFocus(e,n):this._onBlur(e,n)};monitor(e,s=!1){let n=p(e);if(!this._platform.isBrowser||n.nodeType!==1)return T$3();let r=se(n)||this._document,a=this._elementInfo.get(n);if(a)return s&&(a.checkChildren=!0),a.subject;let l={checkChildren:s,subject:new Y,rootNode:r};return this._elementInfo.set(n,l),this._registerGlobalListeners(l),l.subject}stopMonitoring(e){let s=p(e),n=this._elementInfo.get(s);n&&(n.subject.complete(),this._setClasses(s),this._elementInfo.delete(s),this._removeGlobalListeners(n))}focusVia(e,s,n){let r=p(e);r===this._document.activeElement?this._getClosestElementsInfo(r).forEach(([l,M])=>this._originChanged(l,s,M)):(this._setOrigin(s),typeof r.focus==`function`&&r.focus(n))}ngOnDestroy(){this._elementInfo.forEach((e,s)=>this.stopMonitoring(s))}_getWindow(){return this._document.defaultView||window}_getFocusOrigin(e){return this._origin?this._originFromTouchInteraction?this._shouldBeAttributedToTouch(e)?`touch`:`program`:this._origin:this._windowFocused&&this._lastFocusOrigin?this._lastFocusOrigin:e&&this._isLastInteractionFromInputLabel(e)?`mouse`:`program`}_shouldBeAttributedToTouch(e){return this._detectionMode===F$1.EVENTUAL||!!e?.contains(this._inputModalityDetector._mostRecentTarget)}_setClasses(e,s){e.classList.toggle(`cdk-focused`,!!s),e.classList.toggle(`cdk-touch-focused`,s===`touch`),e.classList.toggle(`cdk-keyboard-focused`,s===`keyboard`),e.classList.toggle(`cdk-mouse-focused`,s===`mouse`),e.classList.toggle(`cdk-program-focused`,s===`program`)}_setOrigin(e,s=!1){this._ngZone.runOutsideAngular(()=>{if(this._origin=e,this._originFromTouchInteraction=e===`touch`&&s,this._detectionMode===F$1.IMMEDIATE){clearTimeout(this._originTimeoutId);let n=this._originFromTouchInteraction?ke:1;this._originTimeoutId=setTimeout(()=>this._origin=null,n)}})}_onFocus(e,s){let n=this._elementInfo.get(s),r=g$1(e);!n||!n.checkChildren&&s!==r||this._originChanged(s,this._getFocusOrigin(r),n)}_onBlur(e,s){let n=this._elementInfo.get(s);!n||n.checkChildren&&e.relatedTarget instanceof Node&&s.contains(e.relatedTarget)||(this._setClasses(s),this._emitOrigin(n,null))}_emitOrigin(e,s){e.subject.observers.length&&this._ngZone.run(()=>e.subject.next(s))}_registerGlobalListeners(e){if(!this._platform.isBrowser)return;let s=e.rootNode,n=this._rootNodeFocusListenerCount.get(s)||0;n||this._ngZone.runOutsideAngular(()=>{s.addEventListener(`focus`,this._rootNodeFocusAndBlurListener,j$2),s.addEventListener(`blur`,this._rootNodeFocusAndBlurListener,j$2)}),this._rootNodeFocusListenerCount.set(s,n+1),++this._monitoredElementCount===1&&(this._ngZone.runOutsideAngular(()=>{this._getWindow().addEventListener(`focus`,this._windowFocusListener)}),this._inputModalityDetector.modalityDetected.pipe(Eo(this._stopInputModalityDetector)).subscribe(r=>{this._setOrigin(r,!0)}))}_removeGlobalListeners(e){let s=e.rootNode;if(this._rootNodeFocusListenerCount.has(s)){let n=this._rootNodeFocusListenerCount.get(s);n>1?this._rootNodeFocusListenerCount.set(s,n-1):(s.removeEventListener(`focus`,this._rootNodeFocusAndBlurListener,j$2),s.removeEventListener(`blur`,this._rootNodeFocusAndBlurListener,j$2),this._rootNodeFocusListenerCount.delete(s))}--this._monitoredElementCount||(this._getWindow().removeEventListener(`focus`,this._windowFocusListener),this._stopInputModalityDetector.next(),clearTimeout(this._windowFocusTimeoutId),clearTimeout(this._originTimeoutId))}_originChanged(e,s,n){this._setClasses(e,s),this._emitOrigin(n,s),this._lastFocusOrigin=s}_getClosestElementsInfo(e){let s=[];return this._elementInfo.forEach((n,r)=>{(r===e||n.checkChildren&&r.contains(e))&&s.push([r,n])}),s}_isLastInteractionFromInputLabel(e){let{_mostRecentTarget:s,mostRecentModality:n}=this._inputModalityDetector;if(n!==`mouse`||!s||s===e||e.nodeName!==`INPUT`&&e.nodeName!==`TEXTAREA`||e.disabled)return!1;let r=e.labels;if(r){for(let a=0;a<r.length;a++)if(r[a].contains(s))return!0}return!1}static ɵfac=function(s){return new(s||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();var qe$1=(()=>{class i{_elementRef=p$2(ot$2);_focusMonitor=p$2(Ue$1);_monitorSubscription;_focusOrigin=null;cdkFocusChange=new ge$1;get focusOrigin(){return this._focusOrigin}ngAfterViewInit(){let e=this._elementRef.nativeElement;this._monitorSubscription=this._focusMonitor.monitor(e,e.nodeType===1&&e.hasAttribute(`cdkMonitorSubtreeFocus`)).subscribe(s=>{this._focusOrigin=s,this.cdkFocusChange.emit(s)})}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef),this._monitorSubscription?.unsubscribe()}static ɵfac=function(s){return new(s||i)};static ɵdir=un$1({type:i,selectors:[[``,`cdkMonitorElementFocus`,``],[``,`cdkMonitorSubtreeFocus`,``]],outputs:{cdkFocusChange:`cdkFocusChange`},exportAs:[`cdkMonitorFocus`]})}return i})();function Je(i){if(i.type===`characterData`&&i.target instanceof Comment)return!0;if(i.type===`childList`){for(let t=0;t<i.addedNodes.length;t++)if(!(i.addedNodes[t]instanceof Comment))return!1;for(let t=0;t<i.removedNodes.length;t++)if(!(i.removedNodes[t]instanceof Comment))return!1;return!0}return!1}var Be$1=(()=>{class i{create(e){return typeof MutationObserver>`u`?null:new MutationObserver(e)}static ɵfac=function(s){return new(s||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();var et$1=(()=>{class i{_mutationObserverFactory=p$2(Be$1);_observedElements=/* @__PURE__ */ new Map;_ngZone=p$2(le$1);ngOnDestroy(){this._observedElements.forEach((e,s)=>this._cleanupObserver(s))}observe(e){let s=p(e);return new x$2(n=>{let a=this._observeElement(s).pipe(F$2(l=>l.filter(M=>!Je(M))),Ne(l=>!!l.length)).subscribe(l=>{this._ngZone.run(()=>{n.next(l)})});return()=>{a.unsubscribe(),this._unobserveElement(s)}})}_observeElement(e){return this._ngZone.runOutsideAngular(()=>{if(this._observedElements.has(e))this._observedElements.get(e).count++;else{let s=new Y,n=this._mutationObserverFactory.create(r=>s.next(r));n&&n.observe(e,{characterData:!0,childList:!0,subtree:!0}),this._observedElements.set(e,{observer:n,stream:s,count:1})}return this._observedElements.get(e).stream})}_unobserveElement(e){this._observedElements.has(e)&&(this._observedElements.get(e).count--,this._observedElements.get(e).count||this._cleanupObserver(e))}_cleanupObserver(e){if(this._observedElements.has(e)){let{observer:s,stream:n}=this._observedElements.get(e);s&&s.disconnect(),n.complete(),this._observedElements.delete(e)}}static ɵfac=function(s){return new(s||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();var Yt$1=(()=>{class i{_contentObserver=p$2(et$1);_elementRef=p$2(ot$2);event=new ge$1;get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._disabled?this._unsubscribe():this._subscribe()}_disabled=!1;get debounce(){return this._debounce}set debounce(e){this._debounce=ne$1(e),this._subscribe()}_debounce;_currentSubscription=null;ngAfterContentInit(){!this._currentSubscription&&!this.disabled&&this._subscribe()}ngOnDestroy(){this._unsubscribe()}_subscribe(){this._unsubscribe();let e=this._contentObserver.observe(this._elementRef);this._currentSubscription=(this.debounce?e.pipe(yE(this.debounce)):e).subscribe(this.event)}_unsubscribe(){this._currentSubscription?.unsubscribe()}static ɵfac=function(s){return new(s||i)};static ɵdir=un$1({type:i,selectors:[[``,`cdkObserveContent`,``]],inputs:{disabled:[2,`cdkObserveContentDisabled`,`disabled`,er],debounce:`debounce`},outputs:{event:`cdkObserveContent`},exportAs:[`cdkObserveContent`]})}return i})();var Xt$1=(()=>{class i{static ɵfac=function(s){return new(s||i)};static ɵmod=jt$1({type:i});static ɵinj=lt$1({providers:[Be$1]})}return i})();function Ke$1(i,...t){return t.length?t.some(e=>i[e]):i.altKey||i.shiftKey||i.ctrlKey||i.metaKey}var tt$1=200;var W=class{_letterKeyStream=new Y;_items=[];_selectedItemIndex=-1;_pressedLetters=[];_skipPredicateFn;_selectedItem=new Y;selectedItem=this._selectedItem;constructor(t,e){let s=typeof e?.debounceInterval==`number`?e.debounceInterval:tt$1;e?.skipPredicate&&(this._skipPredicateFn=e.skipPredicate),this.setItems(t),this._setupKeyHandler(s)}destroy(){this._pressedLetters=[],this._letterKeyStream.complete(),this._selectedItem.complete()}setCurrentSelectedItemIndex(t){this._selectedItemIndex=t}setItems(t){this._items=t}handleKey(t){let e=t.keyCode;t.key&&t.key.length===1?this._letterKeyStream.next(t.key.toLocaleUpperCase()):(e>=65&&e<=90||e>=48&&e<=57)&&this._letterKeyStream.next(String.fromCharCode(e))}isTyping(){return this._pressedLetters.length>0}reset(){this._pressedLetters=[]}_setupKeyHandler(t){this._letterKeyStream.pipe(he$1(e=>this._pressedLetters.push(e)),yE(t),Ne(()=>this._pressedLetters.length>0),F$2(()=>this._pressedLetters.join(``).toLocaleUpperCase())).subscribe(e=>{for(let s=1;s<this._items.length+1;s++){let n=(this._selectedItemIndex+s)%this._items.length,r=this._items[n];if(!this._skipPredicateFn?.(r)&&r.getLabel?.().toLocaleUpperCase().trim().indexOf(e)===0){this._selectedItem.next(r);break}}this._pressedLetters=[]})}};var G$1=class{_items;_activeItemIndex=X$1(-1);_activeItem=X$1(null);_wrap=!1;_typeaheadSubscription=ne$2.EMPTY;_itemChangesSubscription;_vertical=!0;_horizontal=null;_allowedModifierKeys=[];_homeAndEnd=!1;_pageUpAndDown={enabled:!1,delta:10};_effectRef;_typeahead;_skipPredicateFn=t=>t.disabled;constructor(t,e){this._items=t,t instanceof ua?this._itemChangesSubscription=t.changes.subscribe(s=>this._itemsChanged(s.toArray())):Qs(t)&&(this._effectRef=rl(()=>this._itemsChanged(t()),{injector:e}))}tabOut=new Y;change=new Y;skipPredicate(t){return this._skipPredicateFn=t,this}withWrap(t=!0){return this._wrap=t,this}withVerticalOrientation(t=!0){return this._vertical=t,this}withHorizontalOrientation(t){return this._horizontal=t,this}withAllowedModifierKeys(t){return this._allowedModifierKeys=t,this}withTypeAhead(t=200){this._typeaheadSubscription.unsubscribe();let e=this._getItemsArray();return this._typeahead=new W(e,{debounceInterval:typeof t==`number`?t:void 0,skipPredicate:s=>this._skipPredicateFn(s)}),this._typeaheadSubscription=this._typeahead.selectedItem.subscribe(s=>{this.setActiveItem(s)}),this}cancelTypeahead(){return this._typeahead?.reset(),this}withHomeAndEnd(t=!0){return this._homeAndEnd=t,this}withPageUpDown(t=!0,e=10){return this._pageUpAndDown={enabled:t,delta:e},this}setActiveItem(t){let e=this._activeItem();this.updateActiveItem(t),this._activeItem()!==e&&this.change.next(this._activeItemIndex())}onKeydown(t){let e=t.keyCode,n=[`altKey`,`ctrlKey`,`metaKey`,`shiftKey`].every(r=>!t[r]||this._allowedModifierKeys.indexOf(r)>-1);switch(e){case 9:this.tabOut.next();return;case 40:if(this._vertical&&n){this.setNextItemActive();break}else return;case 38:if(this._vertical&&n){this.setPreviousItemActive();break}else return;case 39:if(this._horizontal&&n){this._horizontal===`rtl`?this.setPreviousItemActive():this.setNextItemActive();break}else return;case 37:if(this._horizontal&&n){this._horizontal===`rtl`?this.setNextItemActive():this.setPreviousItemActive();break}else return;case 36:if(this._homeAndEnd&&n){this.setFirstItemActive();break}else return;case 35:if(this._homeAndEnd&&n){this.setLastItemActive();break}else return;case 33:if(this._pageUpAndDown.enabled&&n){let r=this._activeItemIndex()-this._pageUpAndDown.delta;this._setActiveItemByIndex(r>0?r:0,1);break}else return;case 34:if(this._pageUpAndDown.enabled&&n){let r=this._activeItemIndex()+this._pageUpAndDown.delta,a=this._getItemsArray().length;this._setActiveItemByIndex(r<a?r:a-1,-1);break}else return;default:(n||Ke$1(t,`shiftKey`))&&this._typeahead?.handleKey(t);return}this._typeahead?.reset(),t.preventDefault()}get activeItemIndex(){return this._activeItemIndex()}get activeItem(){return this._activeItem()}isTyping(){return!!this._typeahead&&this._typeahead.isTyping()}setFirstItemActive(){this._setActiveItemByIndex(0,1)}setLastItemActive(){this._setActiveItemByIndex(this._getItemsArray().length-1,-1)}setNextItemActive(){this._activeItemIndex()<0?this.setFirstItemActive():this._setActiveItemByDelta(1)}setPreviousItemActive(){this._activeItemIndex()<0&&this._wrap?this.setLastItemActive():this._setActiveItemByDelta(-1)}updateActiveItem(t){let e=this._getItemsArray(),s=typeof t==`number`?t:e.indexOf(t),n=e[s];this._activeItem.set(n??null),this._activeItemIndex.set(s),this._typeahead?.setCurrentSelectedItemIndex(s)}destroy(){this._typeaheadSubscription.unsubscribe(),this._itemChangesSubscription?.unsubscribe(),this._effectRef?.destroy(),this._typeahead?.destroy(),this.tabOut.complete(),this.change.complete()}_setActiveItemByDelta(t){this._wrap?this._setActiveInWrapMode(t):this._setActiveInDefaultMode(t)}_setActiveInWrapMode(t){let e=this._getItemsArray();for(let s=1;s<=e.length;s++){let n=(this._activeItemIndex()+t*s+e.length)%e.length,r=e[n];if(!this._skipPredicateFn(r)){this.setActiveItem(n);return}}}_setActiveInDefaultMode(t){this._setActiveItemByIndex(this._activeItemIndex()+t,t)}_setActiveItemByIndex(t,e){let s=this._getItemsArray();if(s[t]){for(;this._skipPredicateFn(s[t]);)if(t+=e,!s[t])return;this.setActiveItem(t)}}_getItemsArray(){return Qs(this._items)?this._items():this._items instanceof ua?this._items.toArray():this._items}_itemsChanged(t){this._typeahead?.setItems(t);let e=this._activeItem();if(e){let s=t.indexOf(e);s>-1&&s!==this._activeItemIndex()&&(this._activeItemIndex.set(s),this._typeahead?.setCurrentSelectedItemIndex(s))}}};var oe=class extends G$1{_origin=`program`;setFocusOrigin(t){return this._origin=t,this}setActiveItem(t){super.setActiveItem(t),this.activeItem&&this.activeItem.focus(this._origin)}};var He$1=/* @__PURE__ */ new Map;var ae=class i{_appId=p$2(Ho);static _infix=`a${Math.floor(Math.random()*1e5).toString()}`;getId(t,e=!1){this._appId!==`ng`&&(t+=this._appId);let s=He$1.get(t);return s===void 0?s=0:s++,He$1.set(t,s),`${t}${e?i._infix+`-`:``}${s}`}static ɵfac=function(e){return new(e||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})};var je=(()=>{class i{_platform=p$2(N$2);isDisabled(e){return e.hasAttribute(`disabled`)}isVisible(e){return st$1(e)&&getComputedStyle(e).visibility===`visible`}isTabbable(e){if(!this._platform.isBrowser)return!1;let s=it$1(dt$1(e));if(s&&(Ve(s)===-1||!this.isVisible(s)))return!1;let n=e.nodeName.toLowerCase(),r=Ve(e);return e.hasAttribute(`contenteditable`)?r!==-1:n===`iframe`||n===`object`||this._platform.WEBKIT&&this._platform.IOS&&!lt(e)?!1:n===`audio`?e.hasAttribute(`controls`)?r!==-1:!1:n===`video`?r===-1?!1:r!==null?!0:this._platform.FIREFOX||e.hasAttribute(`controls`):e.tabIndex>=0}isFocusable(e,s){return ut(e)&&!this.isDisabled(e)&&(s?.ignoreInert||!e.closest?.(`[inert]`))&&(s?.ignoreVisibility||this.isVisible(e))}static ɵfac=function(s){return new(s||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();function it$1(i){try{return i.frameElement}catch{return null}}function st$1(i){return!!(i.offsetWidth||i.offsetHeight||typeof i.getClientRects==`function`&&i.getClientRects().length)}function nt$1(i){let t=i.nodeName.toLowerCase();return t===`input`||t===`select`||t===`button`||t===`textarea`}function rt$2(i){return at$1(i)&&i.type==`hidden`}function ot$1(i){return ct(i)&&i.hasAttribute(`href`)}function at$1(i){return i.nodeName.toLowerCase()==`input`}function ct(i){return i.nodeName.toLowerCase()==`a`}function We$1(i){if(!i.hasAttribute(`tabindex`)||i.tabIndex===void 0)return!1;let t=i.getAttribute(`tabindex`);return!!(t&&!isNaN(parseInt(t,10)))}function Ve(i){if(!We$1(i))return null;let t=parseInt(i.getAttribute(`tabindex`)||``,10);return isNaN(t)?-1:t}function lt(i){let t=i.nodeName.toLowerCase(),e=t===`input`&&i.type;return e===`text`||e===`password`||t===`select`||t===`textarea`}function ut(i){return rt$2(i)?!1:nt$1(i)||ot$1(i)||i.hasAttribute(`contenteditable`)||We$1(i)}function dt$1(i){return i.ownerDocument&&i.ownerDocument.defaultView||window}var Z$1=class{_element;_checker;_ngZone;_document;_injector;_startAnchor=null;_endAnchor=null;_hasAttached=!1;startAnchorListener=()=>{!this.focusLastTabbableElement()&&this._checker.isFocusable(this._element)&&this._element.focus()};endAnchorListener=()=>{!this.focusFirstTabbableElement()&&this._checker.isFocusable(this._element)&&this._element.focus()};get enabled(){return this._enabled}set enabled(t){this._enabled=t,this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(t,this._startAnchor),this._toggleAnchorTabIndex(t,this._endAnchor))}_enabled=!0;constructor(t,e,s,n,r=!1,a){this._element=t,this._checker=e,this._ngZone=s,this._document=n,this._injector=a,r||this.attachAnchors()}destroy(){let t=this._startAnchor,e=this._endAnchor;t&&(t.removeEventListener(`focus`,this.startAnchorListener),t.remove()),e&&(e.removeEventListener(`focus`,this.endAnchorListener),e.remove()),this._startAnchor=this._endAnchor=null,this._hasAttached=!1}attachAnchors(){return this._hasAttached?!0:(this._ngZone.runOutsideAngular(()=>{this._startAnchor||(this._startAnchor=this._createAnchor(),this._startAnchor.addEventListener(`focus`,this.startAnchorListener)),this._endAnchor||(this._endAnchor=this._createAnchor(),this._endAnchor.addEventListener(`focus`,this.endAnchorListener))}),this._element.parentNode&&(this._element.parentNode.insertBefore(this._startAnchor,this._element),this._element.parentNode.insertBefore(this._endAnchor,this._element.nextSibling),this._hasAttached=!0),this._hasAttached)}focusInitialElementWhenReady(t){return new Promise(e=>{this._executeOnStable(()=>e(this.focusInitialElement(t)))})}focusFirstTabbableElementWhenReady(t){return new Promise(e=>{this._executeOnStable(()=>e(this.focusFirstTabbableElement(t)))})}focusLastTabbableElementWhenReady(t){return new Promise(e=>{this._executeOnStable(()=>e(this.focusLastTabbableElement(t)))})}_getRegionBoundary(t){let e=this._element.querySelectorAll(`[cdk-focus-region-${t}], [cdkFocusRegion${t}], [cdk-focus-${t}]`);return t==`start`?e.length?e[0]:this._getFirstTabbableElement(this._element):e.length?e[e.length-1]:this._getLastTabbableElement(this._element)}focusInitialElement(t){let e=this._element.querySelector(`[cdk-focus-initial], [cdkFocusInitial]`);if(e){if(!this._checker.isFocusable(e)){let s=this._getFirstTabbableElement(e);return s?.focus(t),!!s}return e.focus(t),!0}return this.focusFirstTabbableElement(t)}focusFirstTabbableElement(t){let e=this._getRegionBoundary(`start`);return e&&e.focus(t),!!e}focusLastTabbableElement(t){let e=this._getRegionBoundary(`end`);return e&&e.focus(t),!!e}hasAttached(){return this._hasAttached}_getFirstTabbableElement(t){if(this._checker.isFocusable(t)&&this._checker.isTabbable(t))return t;let e=t.children;for(let s=0;s<e.length;s++){let n=e[s].nodeType===this._document.ELEMENT_NODE?this._getFirstTabbableElement(e[s]):null;if(n)return n}return null}_getLastTabbableElement(t){if(this._checker.isFocusable(t)&&this._checker.isTabbable(t))return t;let e=t.children;for(let s=e.length-1;s>=0;s--){let n=e[s].nodeType===this._document.ELEMENT_NODE?this._getLastTabbableElement(e[s]):null;if(n)return n}return null}_createAnchor(){let t=this._document.createElement(`div`);return this._toggleAnchorTabIndex(this._enabled,t),t.classList.add(`cdk-visually-hidden`),t.classList.add(`cdk-focus-trap-anchor`),t.setAttribute(`aria-hidden`,`true`),t}_toggleAnchorTabIndex(t,e){t?e.setAttribute(`tabindex`,`0`):e.removeAttribute(`tabindex`)}toggleAnchors(t){this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(t,this._startAnchor),this._toggleAnchorTabIndex(t,this._endAnchor))}_executeOnStable(t){yd(t,{injector:this._injector})}};var ht$1=(()=>{class i{_checker=p$2(je);_ngZone=p$2(le$1);_document=p$2(U$2);_injector=p$2(ie$2);constructor(){p$2(yN).load(W8)}create(e,s=!1){return new Z$1(e,this._checker,this._ngZone,this._document,s,this._injector)}static ɵfac=function(s){return new(s||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();function qi$1(i){return i!=null&&`${i}`!=`false`}var R$1=(function(i){return i[i.NORMAL=0]=`NORMAL`,i[i.NEGATED=1]=`NEGATED`,i[i.INVERTED=2]=`INVERTED`,i})(R$1||{});var $;var E$1;function ts(){if(E$1==null){if(typeof document!=`object`||!document||typeof Element!=`function`||!Element)return E$1=!1,E$1;if(document.documentElement?.style&&`scrollBehavior`in document.documentElement.style)E$1=!0;else{let i=Element.prototype.scrollTo;i?E$1=!/\{\s*\[native code\]\s*\}/.test(i.toString()):E$1=!1}}return E$1}function is(){if(typeof document!=`object`||!document)return R$1.NORMAL;if($==null){let i=document.createElement(`div`),t=i.style;i.dir=`rtl`,t.width=`1px`,t.overflow=`auto`,t.visibility=`hidden`,t.pointerEvents=`none`,t.position=`absolute`;let e=document.createElement(`div`),s=e.style;s.width=`2px`,s.height=`1px`,i.appendChild(e),document.body.appendChild(i),$=R$1.NORMAL,i.scrollLeft===0&&(i.scrollLeft=1,$=i.scrollLeft===0?R$1.NEGATED:R$1.INVERTED),i.remove()}return $}var T$1;var Ge$1=[`color`,`button`,`checkbox`,`date`,`datetime-local`,`email`,`file`,`hidden`,`image`,`month`,`number`,`password`,`radio`,`range`,`reset`,`search`,`submit`,`tel`,`text`,`time`,`url`,`week`];function rs(){if(T$1)return T$1;if(typeof document!=`object`||!document)return T$1=new Set(Ge$1),T$1;let i=document.createElement(`input`);return T$1=new Set(Ge$1.filter(t=>(i.setAttribute(`type`,t),i.type===t))),T$1}var d=(function(i){return i[i.FADING_IN=0]=`FADING_IN`,i[i.VISIBLE=1]=`VISIBLE`,i[i.FADING_OUT=2]=`FADING_OUT`,i[i.HIDDEN=3]=`HIDDEN`,i})(d||{});var ce$1=class{_renderer;element;config;_animationForciblyDisabledThroughCss;state=d.HIDDEN;constructor(t,e,s,n=!1){this._renderer=t,this.element=e,this.config=s,this._animationForciblyDisabledThroughCss=n}fadeOut(){this._renderer.fadeOutRipple(this)}};var Ze$1=I({passive:!0,capture:!0});var le=class{_events=/* @__PURE__ */ new Map;addHandler(t,e,s,n){let r=this._events.get(e);if(r){let a=r.get(s);a?a.add(n):r.set(s,/* @__PURE__ */ new Set([n]))}else this._events.set(e,/* @__PURE__ */ new Map([[s,/* @__PURE__ */ new Set([n])]])),t.runOutsideAngular(()=>{document.addEventListener(e,this._delegateEventHandler,Ze$1)})}removeHandler(t,e,s){let n=this._events.get(t);if(!n)return;let r=n.get(e);r&&(r.delete(s),r.size===0&&n.delete(e),n.size===0&&(this._events.delete(t),document.removeEventListener(t,this._delegateEventHandler,Ze$1)))}_delegateEventHandler=t=>{let e=g$1(t);e&&this._events.get(t.type)?.forEach((s,n)=>{(n===e||n.contains(e))&&s.forEach(r=>r.handleEvent(t))})}};var $e$1={enterDuration:225,exitDuration:150};var mt$1=800;var ze=I({passive:!0,capture:!0});var Ye$1=[`mousedown`,`touchstart`];var Xe$1=[`mouseup`,`mouseleave`,`touchend`,`touchcancel`];var pt=(()=>{class i{static ɵfac=function(s){return new(s||i)};static ɵcmp=Xn$1({type:i,selectors:[[`ng-component`]],hostAttrs:[`mat-ripple-style-loader`,``],decls:0,vars:0,template:function(s,n){},styles:[`.mat-ripple {
  overflow: hidden;
  position: relative;
}
.mat-ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-ripple.mat-ripple-unbounded {
  overflow: visible;
}

.mat-ripple-element {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity, transform 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: scale3d(0, 0, 0);
  background-color: var(--%NS%mat-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 10%, transparent));
}
@media (forced-colors: active) {
  .mat-ripple-element {
    display: none;
  }
}
.cdk-drag-preview .mat-ripple-element, .cdk-drag-placeholder .mat-ripple-element {
  display: none;
}
`],encapsulation:2})}return i})();var ue$1=class i{_target;_ngZone;_platform;_containerElement;_triggerElement=null;_isPointerDown=!1;_activeRipples=/* @__PURE__ */ new Map;_mostRecentTransientRipple=null;_lastTouchStartEvent;_pointerUpEventsRegistered=!1;_containerRect=null;static _eventManager=new le;constructor(t,e,s,n,r){this._target=t,this._ngZone=e,this._platform=n,n.isBrowser&&(this._containerElement=p(s)),r&&r.get(yN).load(pt)}fadeInRipple(t,e,s={}){let n=this._containerRect=this._containerRect||this._containerElement.getBoundingClientRect(),r=l$1(l$1({},$e$1),s.animation);s.centered&&(t=n.left+n.width/2,e=n.top+n.height/2);let a=s.radius||_t(t,e,n),l=t-n.left,M=e-n.top,L=r.enterDuration,u=document.createElement(`div`);u.classList.add(`mat-ripple-element`),u.style.left=`${l-a}px`,u.style.top=`${M-a}px`,u.style.height=`${a*2}px`,u.style.width=`${a*2}px`,s.color!=null&&(u.style.backgroundColor=s.color),u.style.transitionDuration=`${L}ms`,this._containerElement.appendChild(u);let de=window.getComputedStyle(u),Qe=de.transitionProperty,he=de.transitionDuration,z=Qe===`none`||he===`0s`||he===`0s, 0s`||n.width===0&&n.height===0,v=new ce$1(this,u,s,z);u.style.transform=`scale3d(1, 1, 1)`,v.state=d.FADING_IN,s.persistent||(this._mostRecentTransientRipple=v);let k=null;return!z&&(L||r.exitDuration)&&this._ngZone.runOutsideAngular(()=>{let me=()=>{k&&(k.fallbackTimer=null),clearTimeout(pe),this._finishRippleTransition(v)},Y=()=>this._destroyRipple(v),pe=setTimeout(Y,L+100);u.addEventListener(`transitionend`,me),u.addEventListener(`transitioncancel`,Y),k={onTransitionEnd:me,onTransitionCancel:Y,fallbackTimer:pe}}),this._activeRipples.set(v,k),(z||!L)&&this._finishRippleTransition(v),v}fadeOutRipple(t){if(t.state===d.FADING_OUT||t.state===d.HIDDEN)return;let e=t.element,s=l$1(l$1({},$e$1),t.config.animation);e.style.transitionDuration=`${s.exitDuration}ms`,e.style.opacity=`0`,t.state=d.FADING_OUT,(t._animationForciblyDisabledThroughCss||!s.exitDuration)&&this._finishRippleTransition(t)}fadeOutAll(){this._getActiveRipples().forEach(t=>t.fadeOut())}fadeOutAllNonPersistent(){this._getActiveRipples().forEach(t=>{t.config.persistent||t.fadeOut()})}setupTriggerEvents(t){let e=p(t);!this._platform.isBrowser||!e||e===this._triggerElement||(this._removeTriggerEvents(),this._triggerElement=e,Ye$1.forEach(s=>{i._eventManager.addHandler(this._ngZone,s,e,this)}))}handleEvent(t){t.type===`mousedown`?this._onMousedown(t):t.type===`touchstart`?this._onTouchStart(t):this._onPointerUp(),this._pointerUpEventsRegistered||(this._ngZone.runOutsideAngular(()=>{Xe$1.forEach(e=>{this._triggerElement.addEventListener(e,this,ze)})}),this._pointerUpEventsRegistered=!0)}_finishRippleTransition(t){t.state===d.FADING_IN?this._startFadeOutTransition(t):t.state===d.FADING_OUT&&this._destroyRipple(t)}_startFadeOutTransition(t){let e=t===this._mostRecentTransientRipple,{persistent:s}=t.config;t.state=d.VISIBLE,!s&&(!e||!this._isPointerDown)&&t.fadeOut()}_destroyRipple(t){let e=this._activeRipples.get(t)??null;this._activeRipples.delete(t),this._activeRipples.size||(this._containerRect=null),t===this._mostRecentTransientRipple&&(this._mostRecentTransientRipple=null),t.state=d.HIDDEN,e!==null&&(t.element.removeEventListener(`transitionend`,e.onTransitionEnd),t.element.removeEventListener(`transitioncancel`,e.onTransitionCancel),e.fallbackTimer!==null&&clearTimeout(e.fallbackTimer)),t.element.remove()}_onMousedown(t){let e=D$2(t),s=this._lastTouchStartEvent&&Date.now()<this._lastTouchStartEvent+mt$1;!this._target.rippleDisabled&&!e&&!s&&(this._isPointerDown=!0,this.fadeInRipple(t.clientX,t.clientY,this._target.rippleConfig))}_onTouchStart(t){if(!this._target.rippleDisabled&&!O$3(t)){this._lastTouchStartEvent=Date.now(),this._isPointerDown=!0;let e=t.changedTouches;if(e)for(let s=0;s<e.length;s++)this.fadeInRipple(e[s].clientX,e[s].clientY,this._target.rippleConfig)}}_onPointerUp(){this._isPointerDown&&(this._isPointerDown=!1,this._getActiveRipples().forEach(t=>{let e=t.state===d.VISIBLE||t.config.terminateOnPointerUp&&t.state===d.FADING_IN;!t.config.persistent&&e&&t.fadeOut()}))}_getActiveRipples(){return Array.from(this._activeRipples.keys())}_removeTriggerEvents(){let t=this._triggerElement;t&&(Ye$1.forEach(e=>i._eventManager.removeHandler(e,t,this)),this._pointerUpEventsRegistered&&(Xe$1.forEach(e=>t.removeEventListener(e,this,ze)),this._pointerUpEventsRegistered=!1))}};function _t(i,t,e){let s=Math.max(Math.abs(i-e.left),Math.abs(i-e.right)),n=Math.max(Math.abs(t-e.top),Math.abs(t-e.bottom));return Math.sqrt(s*s+n*n)}var ft=new v$1(`mat-ripple-global-options`);var ys=(()=>{class i{_elementRef=p$2(ot$2);_animationsDisabled=ne$3();color;unbounded=!1;centered=!1;radius=0;animation;get disabled(){return this._disabled}set disabled(e){e&&this.fadeOutAllNonPersistent(),this._disabled=e,this._setupTriggerEventsIfEnabled()}_disabled=!1;get trigger(){return this._trigger||this._elementRef.nativeElement}set trigger(e){this._trigger=e,this._setupTriggerEventsIfEnabled()}_trigger;_rippleRenderer;_globalOptions;_isInitialized=!1;constructor(){let e=p$2(le$1),s=p$2(N$2),n=p$2(ft,{optional:!0}),r=p$2(ie$2);this._globalOptions=n||{},this._rippleRenderer=new ue$1(this,e,this._elementRef,s,r)}ngOnInit(){this._isInitialized=!0,this._setupTriggerEventsIfEnabled()}ngOnDestroy(){this._rippleRenderer._removeTriggerEvents()}fadeOutAll(){this._rippleRenderer.fadeOutAll()}fadeOutAllNonPersistent(){this._rippleRenderer.fadeOutAllNonPersistent()}get rippleConfig(){return{centered:this.centered,radius:this.radius,color:this.color,animation:l$1(l$1(l$1({},this._globalOptions.animation),this._animationsDisabled?{enterDuration:0,exitDuration:0}:{}),this.animation),terminateOnPointerUp:this._globalOptions.terminateOnPointerUp}}get rippleDisabled(){return this.disabled||!!this._globalOptions.disabled}_setupTriggerEventsIfEnabled(){!this.disabled&&this._isInitialized&&this._rippleRenderer.setupTriggerEvents(this.trigger)}launch(e,s=0,n){return typeof e==`number`?this._rippleRenderer.fadeInRipple(e,s,l$1(l$1({},this.rippleConfig),n)):this._rippleRenderer.fadeInRipple(0,0,l$1(l$1({},this.rippleConfig),e))}static ɵfac=function(s){return new(s||i)};static ɵdir=un$1({type:i,selectors:[[``,`mat-ripple`,``],[``,`matRipple`,``]],hostAttrs:[1,`mat-ripple`],hostVars:2,hostBindings:function(s,n){s&2&&La(`mat-ripple-unbounded`,n.unbounded)},inputs:{color:[0,`matRippleColor`,`color`],unbounded:[0,`matRippleUnbounded`,`unbounded`],centered:[0,`matRippleCentered`,`centered`],radius:[0,`matRippleRadius`,`radius`],animation:[0,`matRippleAnimation`,`animation`],disabled:[0,`matRippleDisabled`,`disabled`],trigger:[0,`matRippleTrigger`,`trigger`]},exportAs:[`matRipple`]})}return i})();var Is=(()=>{class i{static ɵfac=function(s){return new(s||i)};static ɵcmp=Xn$1({type:i,selectors:[[`structural-styles`]],decls:0,vars:0,template:function(s,n){},styles:[`.mat-focus-indicator {
  position: relative;
}
.mat-focus-indicator::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  box-sizing: border-box;
  pointer-events: none;
  display: var(--%NS%mat-focus-indicator-display, none);
  border-width: var(--%NS%mat-focus-indicator-border-width, 3px);
  border-style: var(--%NS%mat-focus-indicator-border-style, solid);
  border-color: var(--%NS%mat-focus-indicator-border-color, transparent);
  border-radius: var(--%NS%mat-focus-indicator-border-radius, 4px);
}
.mat-focus-indicator:focus-visible::before {
  content: "";
}

@media (forced-colors: active) {
  html {
    --%NS%mat-focus-indicator-display: block;
    --%NS%mat-focus-indicator-fallback-border-style: none;
  }
}
`],encapsulation:2})}return i})();var D$1=20;var z$2=(()=>{class i{_ngZone=p$2(le$1);_platform=p$2(N$2);_renderer=p$2(zn$1).createRenderer(null,null);_cleanupGlobalListener;_scrolled=new Y;_scrolledCount=0;scrollContainers=/* @__PURE__ */ new Map;register(e){this.scrollContainers.has(e)||this.scrollContainers.set(e,e.elementScrolled().subscribe(()=>this._scrolled.next(e)))}deregister(e){let t=this.scrollContainers.get(e);t&&(t.unsubscribe(),this.scrollContainers.delete(e))}scrolled(e=D$1){return this._platform.isBrowser?new x$2(t=>{this._cleanupGlobalListener||(this._cleanupGlobalListener=this._ngZone.runOutsideAngular(()=>this._renderer.listen(`document`,`scroll`,()=>this._scrolled.next())));let n=e>0?this._scrolled.pipe(mE(e)).subscribe(t):this._scrolled.subscribe(t);return this._scrolledCount++,()=>{n.unsubscribe(),this._scrolledCount--,this._scrolledCount||(this._cleanupGlobalListener?.(),this._cleanupGlobalListener=void 0)}}):T$3()}ngOnDestroy(){this._cleanupGlobalListener?.(),this._cleanupGlobalListener=void 0,this.scrollContainers.forEach((e,t)=>this.deregister(t)),this._scrolled.complete()}ancestorScrolled(e,t){let n=this.getAncestorScrollContainers(e);return this.scrolled(t).pipe(Ne(r=>!r||n.indexOf(r)>-1))}getAncestorScrollContainers(e){let t=[];return this.scrollContainers.forEach((n,r)=>{this._targetContainsElement(r,e)&&t.push(r)}),t}_targetContainsElement(e,t){let n=p(t),r=e.getElementRef().nativeElement;do if(n==r)return!0;while(n=n.parentElement);return!1}static ɵfac=function(t){return new(t||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();var Me=(()=>{class i{elementRef=p$2(ot$2);scrollDispatcher=p$2(z$2);ngZone=p$2(le$1);dir=p$2(bN,{optional:!0});_scrollElement=this.elementRef.nativeElement;_destroyed=new Y;_renderer=p$2(Gn$1);_cleanupScroll;_elementScrolled=new Y;ngOnInit(){this._cleanupScroll=this.ngZone.runOutsideAngular(()=>this._renderer.listen(this._scrollElement,`scroll`,e=>this._elementScrolled.next(e))),this.scrollDispatcher.register(this)}ngOnDestroy(){this._cleanupScroll?.(),this._elementScrolled.complete(),this.scrollDispatcher.deregister(this),this._destroyed.next(),this._destroyed.complete()}elementScrolled(){return this._elementScrolled}getElementRef(){return this.elementRef}scrollTo(e){let t=this.elementRef.nativeElement,n=this.dir&&this.dir.value==`rtl`;e.left??=n?e.end:e.start,e.right??=n?e.start:e.end,e.bottom!=null&&(e.top=t.scrollHeight-t.clientHeight-e.bottom),n&&is()!=R$1.NORMAL?(e.left!=null&&(e.right=t.scrollWidth-t.clientWidth-e.left),is()==R$1.INVERTED?e.left=e.right:is()==R$1.NEGATED&&(e.left=e.right?-e.right:e.right)):e.right!=null&&(e.left=t.scrollWidth-t.clientWidth-e.right),this._applyScrollToOptions(e)}_applyScrollToOptions(e){let t=this.elementRef.nativeElement;ts()?t.scrollTo(e):(e.top!=null&&(t.scrollTop=e.top),e.left!=null&&(t.scrollLeft=e.left))}measureScrollOffset(e){let t=`left`,n=`right`,r=this.elementRef.nativeElement;if(e==`top`)return r.scrollTop;if(e==`bottom`)return r.scrollHeight-r.clientHeight-r.scrollTop;let l=this.dir&&this.dir.value==`rtl`;return e==`start`?e=l?n:t:e==`end`&&(e=l?t:n),l&&is()==R$1.INVERTED?e==t?r.scrollWidth-r.clientWidth-r.scrollLeft:r.scrollLeft:l&&is()==R$1.NEGATED?e==t?r.scrollLeft+r.scrollWidth-r.clientWidth:-r.scrollLeft:e==t?r.scrollLeft:r.scrollWidth-r.clientWidth-r.scrollLeft}static ɵfac=function(t){return new(t||i)};static ɵdir=un$1({type:i,selectors:[[``,`cdk-scrollable`,``],[``,`cdkScrollable`,``]]})}return i})();var O$2=20;var Be=(()=>{class i{_platform=p$2(N$2);_listeners;_viewportSize=null;_change=new Y;_document=p$2(U$2);constructor(){let e=p$2(le$1),t=p$2(zn$1).createRenderer(null,null);e.runOutsideAngular(()=>{if(this._platform.isBrowser){let n=r=>this._change.next(r);this._listeners=[t.listen(`window`,`resize`,n),t.listen(`window`,`orientationchange`,n)]}this.change().subscribe(()=>this._viewportSize=null)})}ngOnDestroy(){this._listeners?.forEach(e=>e()),this._change.complete()}getViewportSize(){this._viewportSize||this._updateViewportSize();let e={width:this._viewportSize.width,height:this._viewportSize.height};return this._platform.isBrowser||(this._viewportSize=null),e}getViewportRect(){let e=this.getViewportScrollPosition(),{width:t,height:n}=this.getViewportSize();return{top:e.top,left:e.left,bottom:e.top+n,right:e.left+t,height:n,width:t}}getViewportScrollPosition(){if(!this._platform.isBrowser)return{top:0,left:0};let e=this._document,t=this._getWindow(),n=e.documentElement,r=n.getBoundingClientRect();return{top:-r.top||e.body?.scrollTop||t.scrollY||n.scrollTop||0,left:-r.left||e.body?.scrollLeft||t.scrollX||n.scrollLeft||0}}change(e=O$2){return e>0?this._change.pipe(mE(e)):this._change}_getWindow(){return this._document.defaultView||window}_updateViewportSize(){let e=this._getWindow();this._viewportSize=this._platform.isBrowser?{width:e.innerWidth,height:e.innerHeight}:{width:0,height:0}}static ɵfac=function(t){return new(t||i)};static ɵprov=G$2({token:i,factory:i.ɵfac})}return i})();var Ie=(()=>{class i{static ɵfac=function(t){return new(t||i)};static ɵmod=jt$1({type:i});static ɵinj=lt$1({})}return i})();var n=class{_box;_destroyed=new Y;_resizeSubject=new Y;_resizeObserver;_elementObservables=/* @__PURE__ */ new Map;constructor(r){this._box=r,typeof ResizeObserver<`u`&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)))}observe(r){return this._elementObservables.has(r)||this._elementObservables.set(r,new x$2(e=>{let s=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(r,{box:this._box}),()=>{this._resizeObserver?.unobserve(r),s.unsubscribe(),this._elementObservables.delete(r)}}).pipe(F$2(e=>e.filter(s=>s.target===r)),Ne(e=>e.length>0),CE({bufferSize:1,refCount:!0}),Eo(this._destroyed))),this._elementObservables.get(r)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear()}};var x$1=(()=>{class t{_cleanupErrorListener;_observers=/* @__PURE__ */ new Map;_ngZone=p$2(le$1);constructor(){}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.()}observe(e,s){let o=s?.box||`content-box`;return this._observers.has(o)||this._observers.set(o,new n(o)),this._observers.get(o).observe(e)}static ɵfac=function(s){return new(s||t)};static ɵprov=G$2({token:t,factory:t.ɵfac})}return t})();var Pt=(()=>{class i{_renderer;_elementRef;onChange=e=>{};onTouched=()=>{};constructor(e,n){this._renderer=e,this._elementRef=n}setProperty(e,n){this._renderer.setProperty(this._elementRef.nativeElement,e,n)}registerOnTouched(e){this.onTouched=e}registerOnChange(e){this.onChange=e}setDisabledState(e){this.setProperty(`disabled`,e)}static ɵfac=function(n){return new(n||i)(Ye$2(Gn$1),Ye$2(ot$2))};static ɵdir=un$1({type:i})}return i})();var In=(()=>{class i extends Pt{static ɵfac=(()=>{let e;return function(r){return(e||(e=Ug(i)))(r||i)}})();static ɵdir=un$1({type:i,features:[fy]})}return i})();var Rn=new v$1(``);var On={provide:Rn,useExisting:Ss(()=>kt),multi:!0};function Tn(){let i=Ut$1()?Ut$1().getUserAgent():``;return/android (\d+)/.test(i.toLowerCase())}var Pn=new v$1(``);var kt=(()=>{class i extends Pt{_compositionMode;_composing=!1;constructor(e,n,r){super(e,n),this._compositionMode=r,this._compositionMode??=!Tn()}writeValue(e){let n=e??``;this.setProperty(`value`,n)}_handleInput(e){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(e)}_compositionStart(){this._composing=!0}_compositionEnd(e){this._composing=!1,this._compositionMode&&this.onChange(e)}static ɵfac=function(n){return new(n||i)(Ye$2(Gn$1),Ye$2(ot$2),Ye$2(Pn,8))};static ɵdir=un$1({type:i,selectors:[[`input`,`formControlName`,``,3,`type`,`checkbox`,3,`ngNoCva`,``],[`textarea`,`formControlName`,``,3,`ngNoCva`,``],[`input`,`formControl`,``,3,`type`,`checkbox`,3,`ngNoCva`,``],[`textarea`,`formControl`,``,3,`ngNoCva`,``],[`input`,`ngModel`,``,3,`type`,`checkbox`,3,`ngNoCva`,``],[`textarea`,`ngModel`,``,3,`ngNoCva`,``],[``,`ngDefaultControl`,``]],hostBindings:function(n,r){n&1&&Pa(`input`,function(s){return r._handleInput(s.target.value)})(`blur`,function(){return r.onTouched()})(`compositionstart`,function(){return r._compositionStart()})(`compositionend`,function(s){return r._compositionEnd(s.target.value)})},standalone:!1,features:[zy([On]),fy]})}return i})();function qe(i){return i==null||$e(i)===0}function $e(i){return i==null?null:Array.isArray(i)||typeof i==`string`?i.length:i instanceof Set?i.size:null}var We=new v$1(``);var Lt$1=new v$1(``);var kn=/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;var Ge=class{static min(t){return Ln(t)}static max(t){return jn(t)}static required(t){return jt(t)}static requiredTrue(t){return zn(t)}static email(t){return Bn(t)}static minLength(t){return Gn(t)}static maxLength(t){return Hn(t)}static pattern(t){return Un(t)}static nullValidator(t){return ue()}static compose(t){return qt(t)}static composeAsync(t){return $t(t)}};function Ln(i){return t=>{if(t.value==null||i==null)return null;let e=parseFloat(t.value);return!isNaN(e)&&e<i?{min:{min:i,actual:t.value}}:null}}function jn(i){return t=>{if(t.value==null||i==null)return null;let e=parseFloat(t.value);return!isNaN(e)&&e>i?{max:{max:i,actual:t.value}}:null}}function jt(i){return qe(i.value)?{required:!0}:null}function zn(i){return i.value===!0?null:{required:!0}}function Bn(i){return qe(i.value)||kn.test(i.value)?null:{email:!0}}function Gn(i){return t=>{let e=t.value?.length??$e(t.value);return e===null||e===0?null:e<i?{minlength:{requiredLength:i,actualLength:e}}:null}}function Hn(i){return t=>{let e=t.value?.length??$e(t.value);return e!==null&&e>i?{maxlength:{requiredLength:i,actualLength:e}}:null}}function Un(i){if(!i)return ue;let t,e;return typeof i==`string`?(e=``,i.charAt(0)!==`^`&&(e+=`^`),e+=i,i.charAt(i.length-1)!==`$`&&(e+=`$`),t=new RegExp(e)):(e=i.toString(),t=i),n=>{if(qe(n.value))return null;let r=n.value;return t.test(r)?null:{pattern:{requiredPattern:e,actualValue:r}}}}function ue(i){return null}function zt$1(i){return i!=null}function Bt(i){return zr(i)?J$1(i):i}function Gt(i){let t={};return i.forEach(e=>{t=e!=null?l$1(l$1({},t),e):t}),Object.keys(t).length===0?null:t}function Ht(i,t){return t.map(e=>e(i))}function qn(i){return!i.validate}function Ut(i){return i.map(t=>qn(t)?t:e=>t.validate(e))}function qt(i){if(!i)return null;let t=i.filter(zt$1);return t.length==0?null:function(e){return Gt(Ht(e,t))}}function Ke(i){return i!=null?qt(Ut(i)):null}function $t(i){if(!i)return null;let t=i.filter(zt$1);return t.length==0?null:function(e){let n=Ht(e,t).map(Bt);return Bc(n).pipe(F$2(Gt))}}function Ye(i){return i!=null?$t(Ut(i)):null}function Dt$2(i,t){return i===null?[t]:Array.isArray(i)?[...i,t]:[i,t]}function Wt(i){return i._rawValidators}function Kt(i){return i._rawAsyncValidators}function He(i){return i?Array.isArray(i)?i:[i]:[]}function fe(i,t){return Array.isArray(i)?i.includes(t):i===t}function Et(i,t){let e=He(t);return He(i).forEach(r=>{fe(e,r)||e.push(r)}),e}function Ft(i,t){return He(t).filter(e=>!fe(i,e))}var me=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(t){this._rawValidators=t||[],this._composedValidatorFn=Ke(this._rawValidators)}_setAsyncValidators(t){this._rawAsyncValidators=t||[],this._composedAsyncValidatorFn=Ye(this._rawAsyncValidators)}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(t){this._onDestroyCallbacks.push(t)}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(t=>t()),this._onDestroyCallbacks=[]}reset(t=void 0){this.control?.reset(t)}hasError(t,e){return this.control?this.control.hasError(t,e):!1}getError(t,e){return this.control?this.control.getError(t,e):null}};var U=class extends me{name;get formDirective(){return null}get path(){return null}};var J=`VALID`;var ce=`INVALID`;var G=`PENDING`;var ee=`DISABLED`;var O$1=class{};var he=class extends O$1{value;source;constructor(t,e){super(),this.value=t,this.source=e}};var ne=class extends O$1{pristine;source;constructor(t,e){super(),this.pristine=t,this.source=e}};var ie=class extends O$1{touched;source;constructor(t,e){super(),this.touched=t,this.source=e}};var H=class extends O$1{status;source;constructor(t,e){super(),this.status=t,this.source=e}};var pe=class extends O$1{source;constructor(t){super(),this.source=t}};var q=class extends O$1{source;constructor(t){super(),this.source=t}};function Yt(i){return(_e(i)?i.validators:i)||null}function $n(i){return Array.isArray(i)?Ke(i):i||null}function Xt(i,t){return(_e(t)?t.asyncValidators:i)||null}function Wn(i){return Array.isArray(i)?Ye(i):i||null}function _e(i){return i!=null&&!Array.isArray(i)&&typeof i==`object`}function Kn(i,t,e){let n=i.controls;if(!(t?Object.keys(n):n).length)throw new y$1(1e3,``);if(!Qt(n,e))throw new y$1(1001,``)}function Yn(i,t,e){i._forEachChild((n,r)=>{if(e[r]===void 0)throw new y$1(-1002,``)})}var Xn=Symbol();var ge=class{_pendingDirty=!1;_hasOwnPendingAsyncValidator=null;_pendingTouched=!1;_onCollectionChange=()=>{};_updateOn;_hasRequired=X$1(!1);_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(t,e){this[Xn]=!0,this._assignValidators(t),this._assignAsyncValidators(e)}get validator(){return this._composedValidatorFn}set validator(t){this._rawValidators=this._composedValidatorFn=t,this._updateHasRequiredValidator()}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(t){this._rawAsyncValidators=this._composedAsyncValidatorFn=t}get parent(){return this._parent}get status(){return q$1(this.statusReactive)}set status(t){q$1(()=>this.statusReactive.set(t))}_status=Jd(()=>this.statusReactive());statusReactive=X$1(void 0);get valid(){return this.status===J}get invalid(){return this.status===ce}get pending(){return this.status===G}get disabled(){return this.status===ee}get enabled(){return this.status!==ee}errors;get pristine(){return q$1(this.pristineReactive)}set pristine(t){q$1(()=>this.pristineReactive.set(t))}_pristine=Jd(()=>this.pristineReactive());pristineReactive=X$1(!0);get dirty(){return!this.pristine}get touched(){return q$1(this.touchedReactive)}set touched(t){q$1(()=>this.touchedReactive.set(t))}_touched=Jd(()=>this.touchedReactive());touchedReactive=X$1(!1);get untouched(){return!this.touched}_events=new Y;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:`change`}setValidators(t){this._assignValidators(t)}setAsyncValidators(t){this._assignAsyncValidators(t)}addValidators(t){this.setValidators(Et(t,this._rawValidators))}addAsyncValidators(t){this.setAsyncValidators(Et(t,this._rawAsyncValidators))}removeValidators(t){this.setValidators(Ft(t,this._rawValidators))}removeAsyncValidators(t){this.setAsyncValidators(Ft(t,this._rawAsyncValidators))}hasValidator(t){return fe(this._rawValidators,t)}hasAsyncValidator(t){return fe(this._rawAsyncValidators,t)}clearValidators(){this.validator=null}clearAsyncValidators(){this.asyncValidator=null}markAsTouched(t={}){let e=this.touched===!1;this.touched=!0;let n=t.sourceControl??this;t.onlySelf||this._parent?.markAsTouched(m(l$1({},t),{sourceControl:n})),e&&t.emitEvent!==!1&&this._events.next(new ie(!0,n))}markAllAsDirty(t={}){this.markAsDirty({onlySelf:!0,emitEvent:t.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsDirty(t))}markAllAsTouched(t={}){this.markAsTouched({onlySelf:!0,emitEvent:t.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsTouched(t))}markAsUntouched(t={}){let e=this.touched===!0;this.touched=!1,this._pendingTouched=!1;let n=t.sourceControl??this;this._forEachChild(r=>{r.markAsUntouched({onlySelf:!0,emitEvent:t.emitEvent,sourceControl:n})}),t.onlySelf||this._parent?._updateTouched(t,n),e&&t.emitEvent!==!1&&this._events.next(new ie(!1,n))}markAsDirty(t={}){let e=this.pristine===!0;this.pristine=!1;let n=t.sourceControl??this;t.onlySelf||this._parent?.markAsDirty(m(l$1({},t),{sourceControl:n})),e&&t.emitEvent!==!1&&this._events.next(new ne(!1,n))}markAsPristine(t={}){let e=this.pristine===!1;this.pristine=!0,this._pendingDirty=!1;let n=t.sourceControl??this;this._forEachChild(r=>{r.markAsPristine({onlySelf:!0,emitEvent:t.emitEvent})}),t.onlySelf||this._parent?._updatePristine(t,n),e&&t.emitEvent!==!1&&this._events.next(new ne(!0,n))}markAsPending(t={}){this.status=G;let e=t.sourceControl??this;t.emitEvent!==!1&&(this._events.next(new H(this.status,e)),this.statusChanges.emit(this.status)),t.onlySelf||this._parent?.markAsPending(m(l$1({},t),{sourceControl:e}))}disable(t={}){let e=this._parentMarkedDirty(t.onlySelf);this.status=ee,this.errors=null,this._forEachChild(r=>{r.disable(m(l$1({},t),{onlySelf:!0}))}),this._updateValue();let n=t.sourceControl??this;t.emitEvent!==!1&&(this._events.next(new he(this.value,n)),this._events.next(new H(this.status,n)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(m(l$1({},t),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(r=>r(!0))}enable(t={}){let e=this._parentMarkedDirty(t.onlySelf);this.status=J,this._forEachChild(n=>{n.enable(m(l$1({},t),{onlySelf:!0}))}),this.updateValueAndValidity({onlySelf:!0,emitEvent:t.emitEvent}),this._updateAncestors(m(l$1({},t),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(n=>n(!1))}_updateAncestors(t,e){t.onlySelf||(this._parent?.updateValueAndValidity(t),t.skipPristineCheck||this._parent?._updatePristine({},e),this._parent?._updateTouched({},e))}setParent(t){this._parent=t}getRawValue(){return this.value}updateValueAndValidity(t={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let n=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===J||this.status===G)&&this._runAsyncValidator(n,t.emitEvent)}let e=t.sourceControl??this;t.emitEvent!==!1&&(this._events.next(new he(this.value,e)),this._events.next(new H(this.status,e)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),t.onlySelf||this._parent?.updateValueAndValidity(m(l$1({},t),{sourceControl:e}))}_updateTreeValidity(t={emitEvent:!0}){this._forEachChild(e=>e._updateTreeValidity(t)),this.updateValueAndValidity({onlySelf:!0,emitEvent:t.emitEvent})}_setInitialStatus(){this.status=this._allControlsDisabled()?ee:J}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(t,e){if(this.asyncValidator){this.status=G,this._hasOwnPendingAsyncValidator={emitEvent:e!==!1,shouldHaveEmitted:t!==!1};let n=Bt(this.asyncValidator(this));this._asyncValidationSubscription=n.subscribe(r=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(r,{emitEvent:e,shouldHaveEmitted:t})})}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let t=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??!1;return this._hasOwnPendingAsyncValidator=null,t}return!1}setErrors(t,e={}){this.errors=t,this._updateControlsErrors(e.emitEvent!==!1,this,e.shouldHaveEmitted)}get(t){let e=t;return e==null||(Array.isArray(e)||(e=e.split(`.`)),e.length===0)?null:e.reduce((n,r)=>n&&n._find(r),this)}getError(t,e){let n=e?this.get(e):this;return n?.errors?n.errors[t]:null}hasError(t,e){return!!this.getError(t,e)}get root(){let t=this;for(;t._parent;)t=t._parent;return t}_updateControlsErrors(t,e,n){this.status=this._calculateStatus(),t&&this.statusChanges.emit(this.status),(t||n)&&this._events.next(new H(this.status,e)),this._parent&&this._parent._updateControlsErrors(t,e,n)}_initObservables(){this.valueChanges=new ge$1,this.statusChanges=new ge$1}_calculateStatus(){return this._allControlsDisabled()?ee:this.errors?ce:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(G)?G:this._anyControlsHaveStatus(ce)?ce:J}_anyControlsHaveStatus(t){return this._anyControls(e=>e.status===t)}_anyControlsDirty(){return this._anyControls(t=>t.dirty)}_anyControlsTouched(){return this._anyControls(t=>t.touched)}_updatePristine(t,e){let n=!this._anyControlsDirty(),r=this.pristine!==n;this.pristine=n,t.onlySelf||this._parent?._updatePristine(t,e),r&&this._events.next(new ne(this.pristine,e))}_updateTouched(t={},e){this.touched=this._anyControlsTouched(),this._events.next(new ie(this.touched,e)),t.onlySelf||this._parent?._updateTouched(t,e)}_onDisabledChange=[];_registerOnCollectionChange(t){this._onCollectionChange=t}_setUpdateStrategy(t){_e(t)&&t.updateOn!=null&&(this._updateOn=t.updateOn)}_parentMarkedDirty(t){return!t&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(t){return null}_assignValidators(t){this._rawValidators=Array.isArray(t)?t.slice():t,this._composedValidatorFn=$n(this._rawValidators),this._updateHasRequiredValidator()}_assignAsyncValidators(t){this._rawAsyncValidators=Array.isArray(t)?t.slice():t,this._composedAsyncValidatorFn=Wn(this._rawAsyncValidators)}_updateHasRequiredValidator(){q$1(()=>this._hasRequired.set(this.hasValidator(Ge.required)))}};function Qt(i,t){return Object.hasOwn(i,t)}function Qn(i){return i.tagName===`INPUT`||i.tagName===`SELECT`||i.tagName===`TEXTAREA`}function Zn(i,t,e,n){switch(e){case`name`:i.setAttribute(t,e,n);break;case`disabled`:case`readonly`:case`required`:n?i.setAttribute(t,e,``):i.removeAttribute(t,e);break;case`max`:case`min`:case`minLength`:case`maxLength`:n!==void 0?i.setAttribute(t,e,n.toString()):i.removeAttribute(t,e)}}var Ue=class{kind;context;control;message;constructor({kind:t,context:e,control:n}){this.kind=t,this.context=e,this.control=n}};var Zt=new v$1(``,{factory:()=>Jn});var Jn=`always`;function At$1(i,t,e=!0){let n=()=>{};t?.valueAccessor?.registerOnChange(n),t?.valueAccessor?.registerOnTouched(n),ye(i,t),i&&(t._invokeOnDestroyCallbacks(),i._registerOnCollectionChange(()=>{}))}function ve(i,t){i.forEach(e=>{e.registerOnValidatorChange&&e.registerOnValidatorChange(t)})}function Jt(i,t){let e=Wt(i);t.validator!==null?i.setValidators(Dt$2(e,t.validator)):typeof e==`function`&&i.setValidators([e]);let n=Kt(i);t.asyncValidator!==null?i.setAsyncValidators(Dt$2(n,t.asyncValidator)):typeof n==`function`&&i.setAsyncValidators([n]);let r=()=>i.updateValueAndValidity();ve(t._rawValidators,r),ve(t._rawAsyncValidators,r)}function ye(i,t){let e=!1;if(i!==null){if(t.validator!==null){let r=Wt(i);if(Array.isArray(r)&&r.length>0){let a=r.filter(s=>s!==t.validator);a.length!==r.length&&(e=!0,i.setValidators(a))}}if(t.asyncValidator!==null){let r=Kt(i);if(Array.isArray(r)&&r.length>0){let a=r.filter(s=>s!==t.asyncValidator);a.length!==r.length&&(e=!0,i.setAsyncValidators(a))}}}let n=()=>{};return ve(t._rawValidators,n),ve(t._rawAsyncValidators,n),e}function en(i,t){Jt(i,t)}function ei(i,t){return ye(i,t)}function ti(i){return Object.getPrototypeOf(i.constructor)===In}function tn(i,t){i._syncPendingControls(),t.forEach(e=>{let n=e.control;n.updateOn===`submit`&&n._pendingChange&&(e.viewToModelUpdate(n._pendingValue),n._pendingChange=!1)})}function ni(i,t){if(!t)return null;let e,n,r;return t.forEach(a=>{a.constructor===kt?e=a:ti(a)?n=a:r=a}),r||n||e||null}function ii(i,t){let e=i.indexOf(t);e>-1&&i.splice(e,1)}var ri=(()=>{class i{_validator=ue;_onChange;_enabled;ngOnChanges(e){if(this.inputName in e){let n=this.normalizeInput(e[this.inputName].currentValue);this._enabled=this.enabled(n),this._validator=this._enabled?this.createValidator(n):ue,this._onChange?.()}}validate(e){return this._validator(e)}registerOnValidatorChange(e){this._onChange=e}enabled(e){return e!=null}static ɵfac=function(n){return new(n||i)};static ɵdir=un$1({type:i,features:[Zn$1]})}return i})();var oi={provide:We,useExisting:Ss(()=>nn),multi:!0};var nn=(()=>{class i extends ri{required;inputName=`required`;normalizeInput=er;createValidator=e=>jt;enabled(e){return e}static ɵfac=(()=>{let e;return function(r){return(e||(e=Ug(i)))(r||i)}})();static ɵdir=un$1({type:i,selectors:[[``,`required`,``,`formControlName`,``,3,`type`,`checkbox`],[``,`required`,``,`formControl`,``,3,`type`,`checkbox`],[``,`required`,``,`ngModel`,``,3,`type`,`checkbox`]],hostVars:1,hostBindings:function(n,r){n&2&&Jn$1(`required`,r._enabled?``:null)},inputs:{required:`required`},standalone:!1,features:[zy([oi]),fy]})}return i})();var Vt=class extends me{_parent=null;name=null;valueAccessor=null;isCustomControlBased=!1;userOnReset;resetSubscription;set onReset(t){this.userOnReset=t,this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.control&&(this.resetSubscription=this.control.events.subscribe(e=>{e instanceof q&&this.control&&this.userOnReset?.(this.control.value)}),this.subscription?.add(this.resetSubscription))}isNativeFormElement=!1;rawValueAccessors;_selectedValueAccessor=null;get selectedValueAccessor(){return this._selectedValueAccessor??=ni(this,this.rawValueAccessors)}parseErrorsValidator=null;renderer;injector;requiredValidatorViaDi;subscription;customControlBindings=null;pendingCustomValue=void 0;hasPendingCustomValue=!1;constructor(t,e,n){super(),this.injector=t,this.renderer=e,this.rawValueAccessors=n,this.injector?.get(ue$2)?.onDestroy(()=>{this.removeParseErrorsValidator(this.control),this.subscription?.unsubscribe()})}setupCustomControl(){this.subscription?.unsubscribe();let t=this.control,e=this.injector?.get(hi$1);if(!t||!e)return;let n=e.markForCheck.bind(e);if(this.subscription=new ne$2,this.subscription.add(()=>this.discardPendingCustomValue(t)),typeof t.registerOnChange==`function`){let r=(a,s)=>{this.discardPendingCustomValue(t),s&&this.viewToModelUpdate(a),n()};t.registerOnChange(r),this.subscription.add(()=>t._unregisterOnChange(r))}this.subscription.add(t.valueChanges.subscribe(n)),this.subscription.add(t.statusChanges.subscribe(n)),this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.userOnReset&&(this.resetSubscription=t.events.subscribe(r=>{r instanceof q&&this.control&&this.userOnReset?.(this.control.value)}),this.subscription.add(this.resetSubscription)),this.parseErrorsValidator&&t.addValidators(this.parseErrorsValidator)}ngControlCreate(t){!t.nativeElement.hasAttribute?.(`ngNoCva`)&&(this.rawValueAccessors&&this.rawValueAccessors.length>0||this.valueAccessor!==null)||!t.customControl||(this.isCustomControlBased=!0,t.listenToCustomControlModel(r=>{let a=this.control;a&&(a._pendingValue=r,a._pendingChange=!0,a._pendingDirty=!0,this.pendingCustomValue=r,this.hasPendingCustomValue=!0,a.updateOn===`change`&&this.updateControlFromCustom(a))}),t.listenToCustomControlOutput(`touch`,()=>{let r=this.control;r&&(r._pendingTouched=!0,r.updateOn===`blur`&&r._pendingChange&&this.updateControlFromCustom(r),r.updateOn!==`submit`&&r.markAsTouched())}),this.customControlBindings={},this.isNativeFormElement=Qn(t.nativeElement),this.requiredValidatorViaDi=this._rawValidators.find(r=>r instanceof nn))}updateControlFromCustom(t){let e=t._pendingValue;t._pendingChange=!1,this.clearPendingCustomValue(),this.customControlBindings&&(this.customControlBindings.value=e),t._pendingDirty&&t.markAsDirty(),t.setValue(e,{emitModelToViewChange:!1}),this.viewToModelUpdate(t.value)}discardPendingCustomValue(t){this.hasPendingCustomValue&&(this.customControlBindings&&(this.customControlBindings.value=this.pendingCustomValue),this.clearPendingCustomValue(),t._pendingValue=t.value,t._pendingChange=!1,t._pendingDirty=!1)}clearPendingCustomValue(){this.pendingCustomValue=void 0,this.hasPendingCustomValue=!1}ngControlUpdate(t,e){if(!this.isCustomControlBased)return;let n=this.control,r=this.customControlBindings;if(!n||!r)return;this.hasPendingCustomValue&&!n._pendingChange&&(r.value=this.pendingCustomValue,this.clearPendingCustomValue()),Object.is(r.value,n.value)||(this.discardPendingCustomValue(n),r.value=n.value,t.setCustomControlModelInput(n.value)),this.bindControlProperty(t,r,`touched`,n.touched),this.bindControlProperty(t,r,`dirty`,n.dirty),this.bindControlProperty(t,r,`valid`,n.valid),this.bindControlProperty(t,r,`invalid`,n.invalid),this.bindControlProperty(t,r,`pending`,n.pending),this.bindControlProperty(t,r,`disabled`,n.disabled),this.shouldBindRequired&&this.bindControlProperty(t,r,`required`,this.isRequired);let a=n.errors;if(r.errors!==a){r.errors=a;let s=this._convertErrors(a);t.setInputOnDirectives(`errors`,s)}}get isRequired(){return(this.requiredValidatorViaDi?._enabled||this.control?._hasRequired())??!1}get shouldBindRequired(){return!0}bindControlProperty(t,e,n,r){if(e[n]===r)return;e[n]=r;let a=t.setInputOnDirectives(n,r);this.isNativeFormElement&&!a&&(n===`disabled`||n===`required`)&&this.renderer&&Zn(this.renderer,t.nativeElement,n,r)}_convertErrors(t){if(t===null)return[];let e=this.control;return Object.entries(t).map(([n,r])=>new Ue({context:r,kind:n,control:e}))}setParseErrorSource(t){if(t===void 0)return;let e=null,n=Jd(()=>{let r=t();return r.length===0?null:r.reduce((a,s)=>(a[s.kind]=s,a),{})});this.parseErrorsValidator=()=>(e=q$1(n),e),rl(()=>{let r=n();r!==e&&(e=r,this.control?.updateValueAndValidity({emitEvent:!1}),this.injector?.get(hi$1)?.markForCheck())},{injector:this.injector})}removeParseErrorsValidator(t){this.parseErrorsValidator&&(t?.removeValidators(this.parseErrorsValidator),t?.updateValueAndValidity({emitEvent:!1}))}};var be=class extends ge{constructor(t,e,n){super(Yt(e),Xt(n,e)),this.controls=t,this._initObservables(),this._setUpdateStrategy(e),this._setUpControls(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator})}controls;registerControl(t,e){return this._find(t)||(this.controls[t]=e,e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange),e)}addControl(t,e,n={}){this.registerControl(t,e),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange()}removeControl(t,e={}){let n=this._find(t);n&&n._registerOnCollectionChange(()=>{}),delete this.controls[t],this.updateValueAndValidity({emitEvent:e.emitEvent}),this._onCollectionChange()}setControl(t,e,n={}){let r=this._find(t);r&&r._registerOnCollectionChange(()=>{}),delete this.controls[t],e&&this.registerControl(t,e),this.updateValueAndValidity({emitEvent:n.emitEvent}),this._onCollectionChange()}contains(t){return this._find(t)?.enabled===!0}setValue(t,e={}){q$1(()=>{Yn(this,!0,t),Object.keys(t).forEach(n=>{Kn(this,!0,n),this.controls[n].setValue(t[n],{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e)})}patchValue(t,e={}){t!=null&&(Object.keys(t).forEach(n=>{let r=this._find(n);r&&r.patchValue(t[n],{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e))}reset(t={},e={}){this._forEachChild((n,r)=>{n.reset(t?t[r]:null,m(l$1({},e),{onlySelf:!0}))}),this._updatePristine(e,this),this._updateTouched(e,this),this.updateValueAndValidity(e),e?.emitEvent!==!1&&this._events.next(new q(this))}getRawValue(){return this._reduceChildren({},(t,e,n)=>(t[n]=e.getRawValue(),t))}_syncPendingControls(){let t=this._reduceChildren(!1,(e,n)=>n._syncPendingControls()?!0:e);return t&&this.updateValueAndValidity({onlySelf:!0}),t}_forEachChild(t){Object.keys(this.controls).forEach(e=>{let n=this.controls[e];n&&t(n,e)})}_setUpControls(){this._forEachChild(t=>{t.setParent(this),t._registerOnCollectionChange(this._onCollectionChange)})}_updateValue(){this.value=this._reduceValue()}_anyControls(t){for(let[e,n]of Object.entries(this.controls))if(this.contains(e)&&t(n))return!0;return!1}_reduceValue(){return this._reduceChildren({},(e,n,r)=>((n.enabled||this.disabled)&&(e[r]=n.value),e))}_reduceChildren(t,e){let n=t;return this._forEachChild((r,a)=>{n=e(n,r,a)}),n}_allControlsDisabled(){for(let t of Object.keys(this.controls))if(this.controls[t].enabled)return!1;return Object.keys(this.controls).length>0||this.disabled}_find(t){return Qt(this.controls,t)?this.controls[t]:null}};var ai={provide:U,useExisting:Ss(()=>li)};var te=Promise.resolve();var li=(()=>{class i extends U{callSetDisabledState;get submitted(){return q$1(this.submittedReactive)}_submitted=Jd(()=>this.submittedReactive());submittedReactive=X$1(!1);_directives=/* @__PURE__ */ new Set;form;ngSubmit=new ge$1;options;constructor(e,n,r){super(),this.callSetDisabledState=r,this.form=new be({},Ke(e),Ye(n))}ngAfterViewInit(){this._setUpdateStrategy()}get formDirective(){return this}get control(){return this.form}get path(){return[]}get controls(){return this.form.controls}addControl(e){te.then(()=>{e.control=this._findContainer(e.path).registerControl(e.name,e.control),e._setupWithForm(this.callSetDisabledState),e.control.updateValueAndValidity({emitEvent:!1}),this._directives.add(e)})}getControl(e){return this.form.get(e.path)}removeControl(e){te.then(()=>{this._findContainer(e.path)?.removeControl(e.name),this._directives.delete(e)})}addFormGroup(e){te.then(()=>{let n=this._findContainer(e.path),r=new be({});en(r,e),n.registerControl(e.name,r),r.updateValueAndValidity({emitEvent:!1})})}removeFormGroup(e){te.then(()=>{this._findContainer(e.path)?.removeControl?.(e.name)})}getFormGroup(e){return this.form.get(e.path)}updateModel(e,n){te.then(()=>{this.form.get(e.path).setValue(n)})}setValue(e){this.control.setValue(e)}onSubmit(e){return this.submittedReactive.set(!0),tn(this.form,this._directives),this.ngSubmit.emit(e),this.form._events.next(new pe(this.control)),e?.target?.method===`dialog`}onReset(){this.resetForm()}resetForm(e=void 0){this.form.reset(e),this.submittedReactive.set(!1)}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.form._updateOn=this.options.updateOn)}_findContainer(e){return e.pop(),e.length?this.form.get(e):this.form}static ɵfac=function(n){return new(n||i)(Ye$2(We,10),Ye$2(Lt$1,10),Ye$2(Zt,8))};static ɵdir=un$1({type:i,selectors:[[`form`,3,`ngNoForm`,``,3,`formGroup`,``,3,`formArray`,``],[`ng-form`],[``,`ngForm`,``]],hostBindings:function(n,r){n&1&&Pa(`submit`,function(s){return r.onSubmit(s)})(`reset`,function(){return r.onReset()})},inputs:{options:[0,`ngFormOptions`,`options`]},outputs:{ngSubmit:`ngSubmit`},exportAs:[`ngForm`],standalone:!1,features:[zy([ai]),fy]})}return i})();function It$1(i,t){let e=i.indexOf(t);e>-1&&i.splice(e,1)}function Rt(i){return typeof i==`object`&&i!==null&&Object.keys(i).length===2&&`value`in i&&`disabled`in i}var si=class extends ge{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=!1;constructor(t=null,e,n){super(Yt(e),Xt(n,e)),this._applyFormState(t),this._setUpdateStrategy(e),this._initObservables(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator}),_e(e)&&(e.nonNullable||e.initialValueIsDefault)&&(Rt(t)?this.defaultValue=t.value:this.defaultValue=t)}setValue(t,e={}){q$1(()=>{this.value=this._pendingValue=t,this._onChange.length&&e.emitModelToViewChange!==!1&&this._onChange.forEach(n=>n(this.value,e.emitViewToModelChange!==!1)),this.updateValueAndValidity(e)})}patchValue(t,e={}){this.setValue(t,e)}reset(t=this.defaultValue,e={}){this._applyFormState(t),this.markAsPristine(e),this.markAsUntouched(e),this.setValue(this.value,e),e.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=!1,e?.emitEvent!==!1&&this._events.next(new q(this))}_updateValue(){}_anyControls(t){return!1}_allControlsDisabled(){return this.disabled}registerOnChange(t){this._onChange.push(t)}_unregisterOnChange(t){It$1(this._onChange,t)}registerOnDisabledChange(t){this._onDisabledChange.push(t)}_unregisterOnDisabledChange(t){It$1(this._onDisabledChange,t)}_forEachChild(t){}_syncPendingControls(){return this.updateOn===`submit`&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:!0,emitModelToViewChange:!1}),!0):!1}_applyFormState(t){Rt(t)?(this.value=this._pendingValue=t.value,t.disabled?this.disable({onlySelf:!0,emitEvent:!1}):this.enable({onlySelf:!0,emitEvent:!1})):this.value=this._pendingValue=t}};var di=i=>i instanceof si;var ci=(()=>{class i extends U{callSetDisabledState;get submitted(){return q$1(this._submittedReactive)}set submitted(e){this._submittedReactive.set(e)}_submitted=Jd(()=>this._submittedReactive());_submittedReactive=X$1(!1);_oldForm;_onCollectionChange=()=>this._updateDomValue();directives=[];constructor(e,n,r){super(),this.callSetDisabledState=r,this._setValidators(e),this._setAsyncValidators(n)}ngOnChanges(e){this.onChanges(e)}ngOnDestroy(){this.onDestroy()}onChanges(e){if(!this.form)throw new y$1(1052,!1);Object.hasOwn(e,`form`)&&(this._updateValidators(),this._updateDomValue(),this._updateRegistrations(),this._oldForm=this.form)}onDestroy(){this.form&&(ye(this.form,this),this.form._onCollectionChange===this._onCollectionChange&&this.form._registerOnCollectionChange(()=>{}))}get formDirective(){return this}get path(){return[]}addControl(e){let n=this.form.get(e.path);if(!n)throw new y$1(-1055,!1);return e._setupWithForm(n,this.callSetDisabledState),n.updateValueAndValidity({emitEvent:!1}),this.directives.push(e),n}getControl(e){return this.form.get(e.path)}removeControl(e){At$1(e.control||null,e,!1),ii(this.directives,e)}addFormGroup(e){this._setUpFormContainer(e)}removeFormGroup(e){this._cleanUpFormContainer(e)}getFormGroup(e){return this.form.get(e.path)}getFormArray(e){return this.form.get(e.path)}addFormArray(e){this._setUpFormContainer(e)}removeFormArray(e){this._cleanUpFormContainer(e)}updateModel(e,n){this.form.get(e.path).setValue(n)}onReset(){this.resetForm()}resetForm(e=void 0,n={}){this.form.reset(e,n),this._submittedReactive.set(!1)}onSubmit(e){return this.submitted=!0,tn(this.form,this.directives),this.ngSubmit.emit(e),this.form._events.next(new pe(this.control)),e?.target?.method===`dialog`}_updateDomValue(){this.directives.forEach(e=>{let n=e.control,r=this.form.get(e.path);n!==r&&(At$1(n||null,e),di(r)&&e._setupWithForm(r,this.callSetDisabledState))}),this.form._updateTreeValidity({emitEvent:!1})}_setUpFormContainer(e){let n=this.form.get(e.path);en(n,e),n.updateValueAndValidity({emitEvent:!1})}_cleanUpFormContainer(e){let n=this.form?.get(e.path);n&&ei(n,e)&&n.updateValueAndValidity({emitEvent:!1})}_updateRegistrations(){this.form._registerOnCollectionChange(this._onCollectionChange),this._oldForm?._registerOnCollectionChange(()=>{})}_updateValidators(){Jt(this.form,this),this._oldForm&&ye(this._oldForm,this)}static ɵfac=function(n){return new(n||i)(Ye$2(We,10),Ye$2(Lt$1,10),Ye$2(Zt,8))};static ɵdir=un$1({type:i,features:[fy,Zn$1]})}return i})();var ui={provide:U,useExisting:Ss(()=>fi)};var fi=(()=>{class i extends ci{form=null;ngSubmit=new ge$1;get control(){return this.form}static ɵfac=(()=>{let e;return function(r){return(e||(e=Ug(i)))(r||i)}})();static ɵdir=un$1({type:i,selectors:[[``,`formGroup`,``]],hostBindings:function(n,r){n&1&&Pa(`submit`,function(s){return r.onSubmit(s)})(`reset`,function(){return r.onReset()})},inputs:{form:[0,`formGroup`,`form`]},outputs:{ngSubmit:`ngSubmit`},exportAs:[`ngForm`],standalone:!1,features:[zy([ui]),fy]})}return i})();var on=Symbol(`FIELD_TREE`);function re(i){return typeof i==`function`&&i[on]===!0}var Mr=new v$1(``);var Xe=(()=>{class i{static ɵfac=function(n){return new(n||i)};static ɵdir=un$1({type:i,selectors:[[`mat-label`]]})}return i})();var mn=new v$1(`MatError`);var Qe=(()=>{class i{align=`start`;id=p$2(ae).getId(`mat-mdc-hint-`);static ɵfac=function(n){return new(n||i)};static ɵdir=un$1({type:i,selectors:[[`mat-hint`]],hostAttrs:[1,`mat-mdc-form-field-hint`,`mat-mdc-form-field-bottom-align`],hostVars:4,hostBindings:function(n,r){n&2&&(wy(`id`,r.id),Jn$1(`align`,null),La(`mat-mdc-form-field-hint-end`,r.align===`end`))},inputs:{align:`align`,id:`id`}})}return i})();var Ze=new v$1(`MatPrefix`);var mi=(()=>{class i{set _isTextSelector(e){this._isText=!0}_isText=!1;static ɵfac=function(n){return new(n||i)};static ɵdir=un$1({type:i,selectors:[[``,`matPrefix`,``],[``,`matIconPrefix`,``],[``,`matTextPrefix`,``]],inputs:{_isTextSelector:[0,`matTextPrefix`,`_isTextSelector`]},features:[zy([{provide:Ze,useExisting:i}])]})}return i})();var hn=new v$1(`MatSuffix`);var pn=new v$1(`FloatingLabelParent`);var ln=(()=>{class i{_elementRef=p$2(ot$2);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize()}_floating=!1;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe()}_monitorResize=!1;_resizeObserver=p$2(x$1);_ngZone=p$2(le$1);_parent=p$2(pn);_resizeSubscription=new ne$2;ngOnDestroy(){this._resizeSubscription.unsubscribe()}getWidth(){return hi(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized())}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:`border-box`}).subscribe(()=>this._handleResize())})}static ɵfac=function(n){return new(n||i)};static ɵdir=un$1({type:i,selectors:[[`label`,`matFormFieldFloatingLabel`,``]],hostAttrs:[1,`mdc-floating-label`,`mat-mdc-floating-label`],hostVars:2,hostBindings:function(n,r){n&2&&La(`mdc-floating-label--float-above`,r.floating)},inputs:{floating:`floating`,monitorResize:`monitorResize`}})}return i})();function hi(i){let t=i;if(t.offsetParent!==null)return t.scrollWidth;let e=t.cloneNode(!0);e.style.setProperty(`position`,`absolute`),e.style.setProperty(`transform`,`translate(-9999px, -9999px)`),document.documentElement.appendChild(e);let n=e.scrollWidth;return e.remove(),n}var sn=`mdc-line-ripple--active`;var xe=`mdc-line-ripple--deactivating`;var dn=(()=>{class i{_elementRef=p$2(ot$2);_cleanupTransitionEnd;constructor(){let e=p$2(le$1),n=p$2(Gn$1);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=n.listen(this._elementRef.nativeElement,`transitionend`,this._handleTransitionEnd)})}activate(){let e=this._elementRef.nativeElement.classList;e.remove(xe),e.add(sn)}deactivate(){this._elementRef.nativeElement.classList.add(xe)}_handleTransitionEnd=e=>{let n=this._elementRef.nativeElement.classList,r=n.contains(xe);e.propertyName===`opacity`&&r&&n.remove(sn,xe)};ngOnDestroy(){this._cleanupTransitionEnd()}static ɵfac=function(n){return new(n||i)};static ɵdir=un$1({type:i,selectors:[[`div`,`matFormFieldLineRipple`,``]],hostAttrs:[1,`mdc-line-ripple`]})}return i})();var cn=(()=>{class i{_elementRef=p$2(ot$2);_ngZone=p$2(le$1);open=!1;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,n=e.querySelector(`.mdc-floating-label`);n?(e.classList.add(`mdc-notched-outline--upgraded`),typeof requestAnimationFrame==`function`&&(n.style.transitionDuration=`0s`,this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>n.style.transitionDuration=``)}))):e.classList.add(`mdc-notched-outline--no-label`)}_setNotchWidth(e){let n=this._notch.nativeElement;!this.open||!e?n.style.width=``:n.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`}_setMaxWidth(e){this._notch.nativeElement.style.setProperty(`--mat-form-field-notch-max-width`,`calc(100% - ${e}px)`)}static ɵfac=function(n){return new(n||i)};static ɵcmp=(function(){let e=[`notch`];return Xn$1({type:i,selectors:[[`div`,`matFormFieldNotchedOutline`,``]],viewQuery:function(a,s){if(a&1&&by(e,5),a&2){let N;Sy(N=Ty())&&(s._notch=N.first)}},hostAttrs:[1,`mdc-notched-outline`],hostVars:2,hostBindings:function(a,s){a&2&&La(`mdc-notched-outline--notched`,s.open)},inputs:{open:[0,`matFormFieldNotchedOutlineOpen`,`open`]},ngContentSelectors:[`*`],decls:5,vars:0,consts:[[`notch`,``],[1,`mat-mdc-notch-piece`,`mdc-notched-outline__leading`],[1,`mat-mdc-notch-piece`,`mdc-notched-outline__notch`],[1,`mat-mdc-notch-piece`,`mdc-notched-outline__trailing`]],template:function(a,s){a&1&&(Wd(),Dy(0,`div`,1),Hd(1,`div`,2,0),qd(3),$d(),Dy(4,`div`,3))},encapsulation:2})})()}return i})();var gn=(()=>{class i{id;ngField=null;ngControl=null;focused=!1;empty=!1;shouldLabelFloat=!1;required=!1;disabled=!1;errorState=!1;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;stateChanges=null;value;static ɵfac=function(n){return new(n||i)};static ɵdir=un$1({type:i})}return i})();var vn=new v$1(`MatFormField`);var yn=new v$1(`MAT_FORM_FIELD_DEFAULT_OPTIONS`);var un=`fill`;var pi=`auto`;var fn=`fixed`;var gi=`translateY(-50%)`;var bn=(()=>{class i{_elementRef=p$2(ot$2);_changeDetectorRef=p$2(hi$1);_platform=p$2(N$2);_idGenerator=p$2(ae);_ngZone=p$2(le$1);_defaults=p$2(yn,{optional:!0});_currentDirection;_unwrapMaybeSignal(e){return Qs(e)?e():e}_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=hH(`iconPrefixContainer`);_textPrefixContainerSignal=hH(`textPrefixContainer`);_iconSuffixContainerSignal=hH(`iconSuffixContainer`);_textSuffixContainerSignal=hH(`textSuffixContainer`);_prefixSuffixContainers=Jd(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=pH(Xe);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=qi$1(e)}_hideRequiredMarker=!1;color=`primary`;get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||pi}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck())}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let n=e||this._defaults?.appearance||un;this._appearanceSignal.set(n)}_appearanceSignal=X$1(un);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||fn}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||fn}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints()}_hintLabel=``;_hasIconPrefix=!1;_hasTextPrefix=!1;_hasIconSuffix=!1;_hasTextSuffix=!1;_labelId=this._idGenerator.getId(`mat-mdc-form-field-label-`);_hintLabelId=this._idGenerator.getId(`mat-mdc-hint-`);_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e}_destroyed=new Y;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=ne$3();constructor(){let e=this._defaults,n=p$2(bN);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),rl(()=>this._currentDirection=n.valueSignal()),this._syncOutlineLabelOffset()}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add(`mat-form-field-animations-enabled`)},300)}),this._changeDetectorRef.detectChanges()}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix()}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=re(this._control.ngField)?null:this._control.ngControl.control.validator),this._previousControl=this._control,this._changeDetectorRef.markForCheck()),this._control.ngControl&&this._control.ngControl.control&&!re(this._control.ngField)&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck()}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete()}getLabelId=Jd(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel=`always`)}_initializeControl(e){let n=this._control,r=`mat-mdc-form-field-type-`;e&&this._elementRef.nativeElement.classList.remove(r+e.controlType),n.controlType&&this._elementRef.nativeElement.classList.add(r+n.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=n.stateChanges?.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck()}),this._describedByChanges?.unsubscribe(),this._describedByChanges=n.stateChanges?.pipe(zc([void 0,void 0]),F$2(()=>[this._unwrapMaybeSignal(n.errorState),n.userAriaDescribedBy]),wE(),Ne(([[a,s],[N,$]])=>a!==N||s!==$)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),n.ngControl&&n.ngControl.valueChanges&&!re(n.ngField)&&(this._valueChanges=n.ngControl.valueChanges.pipe(Eo(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()))}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText)}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),gE(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck()})}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck()}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck()}),this._validateHints(),this._syncDescribedByIds()}_assertFormFieldControl(){this._control}_updateFocusState(){let e=this._unwrapMaybeSignal(this._control.focused);e&&!this._isFocused?(this._isFocused=!0,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=!1,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle(`mat-focused`,e),this._textField?.nativeElement.classList.toggle(`mdc-text-field--focused`,e)}_syncOutlineLabelOffset(){mH({earlyRead:()=>{if(this._appearanceSignal()!==`outline`)return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset())});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:`border-box`})}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())})}_shouldAlwaysFloat(){return this.floatLabel===`always`}_hasOutline(){return this.appearance===`outline`}_forceDisplayInfixLabel(){return!this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=Jd(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._shouldAlwaysFloat()||this._unwrapMaybeSignal(this._control.shouldLabelFloat):!1}_shouldForward(e){let n=this._control?.ngField||this._control?.ngControl;if(!n)return!1;if(re(n)){let r=n();return e===`valid`?r.valid():e===`dirty`?r.dirty():e===`touched`?r.touched():e===`pending`?r.pending():e===`untouched`?!r.touched():e===`pristine`?!r.dirty():e===`invalid`?!r.valid():!1}else{let r=n;return e===`valid`?r.valid:e===`dirty`?r.dirty:e===`touched`?r.touched:e===`pending`?r.pending:e===`untouched`?r.untouched:e===`pristine`?r.pristine:e===`invalid`?r.invalid:!1}}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._unwrapMaybeSignal(this._control.errorState)?`error`:`hint`}_handleLabelResized(){this._refreshOutlineNotchWidth()}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth())}_processHints(){this._validateHints(),this._syncDescribedByIds()}_validateHints(){this._hintChildren}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy==`string`&&e.push(...this._control.userAriaDescribedBy.split(` `)),this._getSubscriptMessageType()===`hint`){let a=this._hintChildren?this._hintChildren.find(N=>N.align===`start`):null,s=this._hintChildren?this._hintChildren.find(N=>N.align===`end`):null;a?e.push(a.id):this._hintLabel&&e.push(this._hintLabelId),s&&e.push(s.id)}else this._errorChildren&&e.push(...this._errorChildren.map(a=>a.id));let n=this._control.describedByIds,r;if(n){let a=this._describedByIds||e;r=e.concat(n.filter(s=>s&&!a.includes(s)))}else r=e;this._control.setDescribedByIds(r),this._describedByIds=e}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return[``,null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,n=this._textPrefixContainer?.nativeElement,r=this._iconSuffixContainer?.nativeElement,a=this._textSuffixContainer?.nativeElement,s=e?.getBoundingClientRect().width??0,N=n?.getBoundingClientRect().width??0,$=r?.getBoundingClientRect().width??0,Ce=a?.getBoundingClientRect().width??0;return[`var(--mat-mdc-form-field-label-transform, ${gi} translateX(${`calc(${this._currentDirection===`rtl`?`-1`:`1`} * (${`${s+N}px`} + var(--mat-mdc-form-field-label-offset-x, 0px)))`}))`,s+N+$+Ce]}_writeOutlinedLabelStyles(e){if(e!==null){let[n,r]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=n),r!==null&&this._notchedOutline?._setMaxWidth(r)}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let n=e.getRootNode();return n&&n!==e}return document.documentElement.contains(e)}static ɵfac=function(n){return new(n||i)};static ɵcmp=(function(){let e=[`iconPrefixContainer`],n=[`textPrefixContainer`],r=[`iconSuffixContainer`],a=[`textSuffixContainer`],s=[`textField`],N=[`*`,[[`mat-label`]],[[``,`matPrefix`,``],[``,`matIconPrefix`,``]],[[``,`matTextPrefix`,``]],[[``,`matTextSuffix`,``]],[[``,`matSuffix`,``],[``,`matIconSuffix`,``]],[[`mat-error`],[``,`matError`,``]],[[`mat-hint`,3,`align`,`end`]],[[`mat-hint`,`align`,`end`]]],$=[`*`,`mat-label`,`[matPrefix], [matIconPrefix]`,`[matTextPrefix]`,`[matTextSuffix]`,`[matSuffix], [matIconSuffix]`,`mat-error, [matError]`,`mat-hint:not([align='end'])`,`mat-hint[align='end']`];function Ce(l,d){l&1&&ka(0,`span`,21)}function Se(l,d){if(l&1&&(Ea(0,`label`,20),qd(1,1),Kb(2,Ce,1,0,`span`,21),Vd()),l&2){let o=fS(2);vy(`floating`,o._shouldLabelFloat())(`monitorResize`,o._hasOutline())(`id`,o._labelId),Jn$1(`for`,o._control.disableAutomaticLabeling?null:o._control.id),fC(2),Jb(!o.hideRequiredMarker&&o._unwrapMaybeSignal(o._control.required)?2:-1)}}function Ne(l,d){if(l&1&&Kb(0,Se,3,5,`label`,20),l&2){let o=fS();Jb(o._hasFloatingLabel()?0:-1)}}function Je(l,d){l&1&&ka(0,`div`,7)}function Me(l,d){}function we(l,d){if(l&1&&py(0,Me,0,0,`ng-template`,13),l&2){fS(2);let o=mS(1);vy(`ngTemplateOutlet`,o)}}function De(l,d){if(l&1&&(Ea(0,`div`,9),Kb(1,we,1,1,null,13),Vd()),l&2){let o=fS();vy(`matFormFieldNotchedOutlineOpen`,o._shouldLabelFloat()),fC(),Jb(o._forceDisplayInfixLabel()?-1:1)}}function _n(l,d){l&1&&(Ea(0,`div`,10,2),qd(2,2),Vd())}function xn(l,d){l&1&&(Ea(0,`div`,11,3),qd(2,3),Vd())}function Cn(l,d){}function Sn(l,d){if(l&1&&py(0,Cn,0,0,`ng-template`,13),l&2){fS();let o=mS(1);vy(`ngTemplateOutlet`,o)}}function Nn(l,d){l&1&&(Ea(0,`div`,14,4),qd(2,4),Vd())}function Mn(l,d){l&1&&(Ea(0,`div`,15,5),qd(2,5),Vd())}function wn(l,d){l&1&&ka(0,`div`,16)}function Dn(l,d){l&1&&(Ea(0,`div`,18),qd(1,6),Vd())}function En(l,d){if(l&1&&(Ea(0,`mat-hint`,22),FS(1),Vd()),l&2){let o=fS(2);vy(`id`,o._hintLabelId),fC(),Fy(o.hintLabel)}}function Fn(l,d){if(l&1&&(Ea(0,`div`,19),Kb(1,En,2,2,`mat-hint`,22),qd(2,7),ka(3,`div`,23),qd(4,8),Vd()),l&2){let o=fS();fC(),Jb(o.hintLabel?1:-1)}}return Xn$1({type:i,selectors:[[`mat-form-field`]],contentQueries:function(d,o,c){if(d&1&&(_y(c,o._labelChild,Xe,5),Yd(c,gn,5)(c,Ze,5)(c,hn,5)(c,mn,5)(c,Qe,5)),d&2){gS();let h;Sy(h=Ty())&&(o._formFieldControl=h.first),Sy(h=Ty())&&(o._prefixChildren=h),Sy(h=Ty())&&(o._suffixChildren=h),Sy(h=Ty())&&(o._errorChildren=h),Sy(h=Ty())&&(o._hintChildren=h)}},viewQuery:function(d,o){if(d&1&&(My(o._iconPrefixContainerSignal,e,5)(o._textPrefixContainerSignal,n,5)(o._iconSuffixContainerSignal,r,5)(o._textSuffixContainerSignal,a,5),by(s,5)(e,5)(n,5)(r,5)(a,5)(ln,5)(cn,5)(dn,5)),d&2){gS(4);let c;Sy(c=Ty())&&(o._textField=c.first),Sy(c=Ty())&&(o._iconPrefixContainer=c.first),Sy(c=Ty())&&(o._textPrefixContainer=c.first),Sy(c=Ty())&&(o._iconSuffixContainer=c.first),Sy(c=Ty())&&(o._textSuffixContainer=c.first),Sy(c=Ty())&&(o._floatingLabel=c.first),Sy(c=Ty())&&(o._notchedOutline=c.first),Sy(c=Ty())&&(o._lineRipple=c.first)}},hostAttrs:[1,`mat-mdc-form-field`],hostVars:38,hostBindings:function(d,o){d&2&&La(`mat-mdc-form-field-label-always-float`,o._shouldAlwaysFloat())(`mat-mdc-form-field-has-icon-prefix`,o._hasIconPrefix)(`mat-mdc-form-field-has-icon-suffix`,o._hasIconSuffix)(`mat-form-field-invalid`,o._unwrapMaybeSignal(o._control.errorState))(`mat-form-field-disabled`,o._unwrapMaybeSignal(o._control.disabled))(`mat-form-field-autofilled`,o._unwrapMaybeSignal(o._control.autofilled))(`mat-form-field-appearance-fill`,o.appearance==`fill`)(`mat-form-field-appearance-outline`,o.appearance==`outline`)(`mat-form-field-hide-placeholder`,o._hasFloatingLabel()&&!o._shouldLabelFloat())(`mat-primary`,o.color!==`accent`&&o.color!==`warn`)(`mat-accent`,o.color===`accent`)(`mat-warn`,o.color===`warn`)(`ng-untouched`,o._shouldForward(`untouched`))(`ng-touched`,o._shouldForward(`touched`))(`ng-pristine`,o._shouldForward(`pristine`))(`ng-dirty`,o._shouldForward(`dirty`))(`ng-valid`,o._shouldForward(`valid`))(`ng-invalid`,o._shouldForward(`invalid`))(`ng-pending`,o._shouldForward(`pending`))},inputs:{hideRequiredMarker:`hideRequiredMarker`,color:`color`,floatLabel:`floatLabel`,appearance:`appearance`,subscriptSizing:`subscriptSizing`,hintLabel:`hintLabel`},exportAs:[`matFormField`],features:[zy([{provide:vn,useExisting:i},{provide:pn,useExisting:i}])],ngContentSelectors:$,decls:18,vars:21,consts:[[`labelTemplate`,``],[`textField`,``],[`iconPrefixContainer`,``],[`textPrefixContainer`,``],[`textSuffixContainer`,``],[`iconSuffixContainer`,``],[1,`mat-mdc-text-field-wrapper`,`mdc-text-field`,3,`click`],[1,`mat-mdc-form-field-focus-overlay`],[1,`mat-mdc-form-field-flex`],[`matFormFieldNotchedOutline`,``,3,`matFormFieldNotchedOutlineOpen`],[1,`mat-mdc-form-field-icon-prefix`],[1,`mat-mdc-form-field-text-prefix`],[1,`mat-mdc-form-field-infix`],[3,`ngTemplateOutlet`],[1,`mat-mdc-form-field-text-suffix`],[1,`mat-mdc-form-field-icon-suffix`],[`matFormFieldLineRipple`,``],[`aria-atomic`,`true`,`aria-live`,`polite`,1,`mat-mdc-form-field-subscript-wrapper`,`mat-mdc-form-field-bottom-align`],[1,`mat-mdc-form-field-error-wrapper`],[1,`mat-mdc-form-field-hint-wrapper`],[`matFormFieldFloatingLabel`,``,3,`floating`,`monitorResize`,`id`],[`aria-hidden`,`true`,1,`mat-mdc-form-field-required-marker`,`mdc-floating-label--required`],[3,`id`],[1,`mat-mdc-form-field-hint-spacer`]],template:function(d,o){if(d&1&&(Wd(N),py(0,Ne,1,1,`ng-template`,null,0,XS),Ea(2,`div`,6,1),Pa(`click`,function(h){return o._control.onContainerClick(h)}),Kb(4,Je,1,0,`div`,7),Ea(5,`div`,8),Kb(6,De,2,2,`div`,9),Kb(7,_n,3,0,`div`,10),Kb(8,xn,3,0,`div`,11),Ea(9,`div`,12),Kb(10,Sn,1,1,null,13),qd(11),Vd(),Kb(12,Nn,3,0,`div`,14),Kb(13,Mn,3,0,`div`,15),Vd(),Kb(14,wn,1,0,`div`,16),Vd(),Ea(15,`div`,17),Kb(16,Dn,2,0,`div`,18)(17,Fn,5,1,`div`,19),Vd()),d&2){let c,h=o._unwrapMaybeSignal(o._control.disabled);fC(2),La(`mdc-text-field--filled`,!o._hasOutline())(`mdc-text-field--outlined`,o._hasOutline())(`mdc-text-field--no-label`,!o._hasFloatingLabel())(`mdc-text-field--disabled`,h)(`mdc-text-field--invalid`,o._unwrapMaybeSignal(o._control.errorState)),fC(2),Jb(!o._hasOutline()&&!h?4:-1),fC(2),Jb(o._hasOutline()?6:-1),fC(),Jb(o._hasIconPrefix?7:-1),fC(),Jb(o._hasTextPrefix?8:-1),fC(2),Jb(!o._hasOutline()||o._forceDisplayInfixLabel()?10:-1),fC(2),Jb(o._hasTextSuffix?12:-1),fC(),Jb(o._hasIconSuffix?13:-1),fC(),Jb(o._hasOutline()?-1:14),fC(),La(`mat-mdc-form-field-subscript-dynamic-size`,o.subscriptSizing===`dynamic`);let An=o._getSubscriptMessageType();fC(),Jb((c=An)===`error`?16:c===`hint`?17:-1)}},dependencies:[ln,cn,FT,dn,Qe],styles:[`.mdc-text-field {
  display: inline-flex;
  align-items: baseline;
  padding: 0 16px;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  will-change: opacity, transform, color;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.mdc-text-field__input {
  width: 100%;
  min-width: 0;
  border: none;
  border-radius: 0;
  background: none;
  padding: 0;
  -moz-appearance: none;
  -webkit-appearance: none;
  height: 28px;
}
.mdc-text-field__input::-webkit-calendar-picker-indicator, .mdc-text-field__input::-webkit-search-cancel-button {
  display: none;
}
.mdc-text-field__input::-ms-clear {
  display: none;
}
.mdc-text-field__input:focus {
  outline: none;
}
.mdc-text-field__input:invalid {
  box-shadow: none;
}
.mdc-text-field__input::placeholder {
  opacity: 0;
}
.mdc-text-field__input::-moz-placeholder {
  opacity: 0;
}
.mdc-text-field__input::-webkit-input-placeholder {
  opacity: 0;
}
.mdc-text-field__input:-ms-input-placeholder {
  opacity: 0;
}
.mdc-text-field--no-label .mdc-text-field__input::placeholder, .mdc-text-field--focused .mdc-text-field__input::placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder, .mdc-text-field--focused .mdc-text-field__input::-moz-placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder, .mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder, .mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder {
  opacity: 1;
}
.mdc-text-field--%NS%disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::placeholder {
  opacity: 0;
}
.mdc-text-field--%NS%disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::-moz-placeholder {
  opacity: 0;
}
.mdc-text-field--%NS%disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::-webkit-input-placeholder {
  opacity: 0;
}
.mdc-text-field--%NS%disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive:-ms-input-placeholder {
  opacity: 0;
}
.mdc-text-field--outlined .mdc-text-field__input, .mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__input {
  height: 100%;
}
.mdc-text-field--outlined .mdc-text-field__input {
  display: flex;
  border: none !important;
  background-color: transparent;
}
.mdc-text-field--disabled .mdc-text-field__input {
  pointer-events: auto;
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: var(--%NS%mat-form-field-filled-input-text-color, var(--%NS%mat-sys-on-surface));
  caret-color: var(--%NS%mat-form-field-filled-caret-color, var(--%NS%mat-sys-primary));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder {
  color: var(--%NS%mat-form-field-filled-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder {
  color: var(--%NS%mat-form-field-filled-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--%NS%mat-form-field-filled-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder {
  color: var(--%NS%mat-form-field-filled-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: var(--%NS%mat-form-field-outlined-input-text-color, var(--%NS%mat-sys-on-surface));
  caret-color: var(--%NS%mat-form-field-outlined-caret-color, var(--%NS%mat-sys-primary));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder {
  color: var(--%NS%mat-form-field-outlined-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder {
  color: var(--%NS%mat-form-field-outlined-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--%NS%mat-form-field-outlined-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder {
  color: var(--%NS%mat-form-field-outlined-input-text-placeholder-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--%NS%invalid:not(.mdc-text-field--disabled) .mdc-text-field__input {
  caret-color: var(--%NS%mat-form-field-filled-error-caret-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--outlined.mdc-text-field--%NS%invalid:not(.mdc-text-field--disabled) .mdc-text-field__input {
  caret-color: var(--%NS%mat-form-field-outlined-error-caret-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-text-field__input {
  color: var(--%NS%mat-form-field-filled-disabled-input-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mdc-text-field__input {
  color: var(--%NS%mat-form-field-outlined-disabled-input-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-text-field--disabled .mdc-text-field__input {
    background-color: Window;
  }
}

.mdc-text-field--filled {
  height: 56px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: var(--%NS%mat-form-field-filled-container-shape, var(--%NS%mat-sys-corner-extra-small));
  border-top-right-radius: var(--%NS%mat-form-field-filled-container-shape, var(--%NS%mat-sys-corner-extra-small));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) {
  background-color: var(--%NS%mat-form-field-filled-container-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--disabled {
  background-color: var(--%NS%mat-form-field-filled-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 4%, transparent));
}

.mdc-text-field--outlined {
  height: 56px;
  overflow: visible;
  padding-right: max(16px, var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small)));
  padding-left: max(16px, var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small)) + 4px);
}
[dir=rtl] .mdc-text-field--outlined {
  padding-right: max(16px, var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small)) + 4px);
  padding-left: max(16px, var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small)));
}

.mdc-floating-label {
  position: absolute;
  left: 0;
  transform-origin: left top;
  line-height: 1.15rem;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
  overflow: hidden;
  will-change: transform;
}
[dir=rtl] .mdc-floating-label {
  right: 0;
  left: auto;
  transform-origin: right top;
  text-align: right;
}
.mdc-text-field .mdc-floating-label {
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.mdc-notched-outline .mdc-floating-label {
  display: inline-block;
  position: relative;
  max-width: 100%;
}
.mdc-text-field--outlined .mdc-floating-label {
  left: 4px;
  right: auto;
}
[dir=rtl] .mdc-text-field--outlined .mdc-floating-label {
  left: auto;
  right: 4px;
}
.mdc-text-field--filled .mdc-floating-label {
  left: 16px;
  right: auto;
}
[dir=rtl] .mdc-text-field--filled .mdc-floating-label {
  left: auto;
  right: 16px;
}
.mdc-text-field--disabled .mdc-floating-label {
  cursor: default;
}
@media (forced-colors: active) {
  .mdc-text-field--disabled .mdc-floating-label {
    z-index: 1;
  }
}
.mdc-text-field--filled.mdc-text-field--no-label .mdc-floating-label {
  display: none;
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-floating-label {
  color: var(--%NS%mat-form-field-filled-label-text-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label {
  color: var(--%NS%mat-form-field-filled-focus-label-text-color, var(--%NS%mat-sys-primary));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label {
  color: var(--%NS%mat-form-field-filled-hover-label-text-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-floating-label {
  color: var(--%NS%mat-form-field-filled-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label {
  color: var(--%NS%mat-form-field-filled-error-label-text-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label {
  color: var(--%NS%mat-form-field-filled-error-focus-label-text-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled).mdc-text-field--%NS%invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label {
  color: var(--%NS%mat-form-field-filled-error-hover-label-text-color, var(--%NS%mat-sys-on-error-container));
}
.mdc-text-field--filled .mdc-floating-label {
  font-family: var(--%NS%mat-form-field-filled-label-text-font, var(--%NS%mat-sys-body-large-font));
  font-size: var(--%NS%mat-form-field-filled-label-text-size, var(--%NS%mat-sys-body-large-size));
  font-weight: var(--%NS%mat-form-field-filled-label-text-weight, var(--%NS%mat-sys-body-large-weight));
  letter-spacing: var(--%NS%mat-form-field-filled-label-text-tracking, var(--%NS%mat-sys-body-large-tracking));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled) .mdc-floating-label {
  color: var(--%NS%mat-form-field-outlined-label-text-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label {
  color: var(--%NS%mat-form-field-outlined-focus-label-text-color, var(--%NS%mat-sys-primary));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label {
  color: var(--%NS%mat-form-field-outlined-hover-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mdc-floating-label {
  color: var(--%NS%mat-form-field-outlined-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label {
  color: var(--%NS%mat-form-field-outlined-error-label-text-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label {
  color: var(--%NS%mat-form-field-outlined-error-focus-label-text-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--%NS%invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label {
  color: var(--%NS%mat-form-field-outlined-error-hover-label-text-color, var(--%NS%mat-sys-on-error-container));
}
.mdc-text-field--outlined .mdc-floating-label {
  font-family: var(--%NS%mat-form-field-outlined-label-text-font, var(--%NS%mat-sys-body-large-font));
  font-size: var(--%NS%mat-form-field-outlined-label-text-size, var(--%NS%mat-sys-body-large-size));
  font-weight: var(--%NS%mat-form-field-outlined-label-text-weight, var(--%NS%mat-sys-body-large-weight));
  letter-spacing: var(--%NS%mat-form-field-outlined-label-text-tracking, var(--%NS%mat-sys-body-large-tracking));
}

.mdc-floating-label--float-above {
  cursor: auto;
  transform: translateY(-106%) scale(0.75);
}
.mdc-text-field--filled .mdc-floating-label--float-above {
  transform: translateY(-106%) scale(0.75);
}
.mdc-text-field--outlined .mdc-floating-label--float-above {
  transform: translateY(-37.25px) scale(1);
  font-size: 0.75rem;
}
.mdc-notched-outline .mdc-floating-label--float-above {
  text-overflow: clip;
}
.mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  max-width: 133.3333333333%;
}
.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above, .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  transform: translateY(-34.75px) scale(0.75);
}
.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above, .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  font-size: 1rem;
}

.mdc-floating-label--%NS%required:not(.mdc-floating-label--hide-required-marker)::after {
  margin-left: 1px;
  margin-right: 0;
  content: "*";
}
[dir=rtl] .mdc-floating-label--%NS%required:not(.mdc-floating-label--hide-required-marker)::after {
  margin-left: 0;
  margin-right: 1px;
}

.mdc-notched-outline {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: 100%;
  text-align: left;
  pointer-events: none;
}
[dir=rtl] .mdc-notched-outline {
  text-align: right;
}
.mdc-text-field--outlined .mdc-notched-outline {
  z-index: 1;
}

.mat-mdc-notch-piece {
  box-sizing: border-box;
  height: 100%;
  pointer-events: none;
  border: none;
  border-top: 1px solid;
  border-bottom: 1px solid;
}
.mdc-text-field--focused .mat-mdc-notch-piece {
  border-width: 2px;
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled) .mat-mdc-notch-piece {
  border-color: var(--%NS%mat-form-field-outlined-outline-color, var(--%NS%mat-sys-outline));
  border-width: var(--%NS%mat-form-field-outlined-outline-width, 1px);
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mat-mdc-notch-piece {
  border-color: var(--%NS%mat-form-field-outlined-hover-outline-color, var(--%NS%mat-sys-on-surface));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mat-mdc-notch-piece {
  border-color: var(--%NS%mat-form-field-outlined-focus-outline-color, var(--%NS%mat-sys-primary));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mat-mdc-notch-piece {
  border-color: var(--%NS%mat-form-field-outlined-disabled-outline-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mat-mdc-notch-piece {
  border-color: var(--%NS%mat-form-field-outlined-error-outline-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--%NS%invalid:not(.mdc-text-field--focused):hover .mdc-notched-outline .mat-mdc-notch-piece {
  border-color: var(--%NS%mat-form-field-outlined-error-hover-outline-color, var(--%NS%mat-sys-on-error-container));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mat-mdc-notch-piece {
  border-color: var(--%NS%mat-form-field-outlined-error-focus-outline-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--%NS%outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline .mat-mdc-notch-piece {
  border-width: var(--%NS%mat-form-field-outlined-focus-outline-width, 2px);
}

.mdc-notched-outline__leading {
  border-left: 1px solid;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
  border-bottom-left-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
}
.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading {
  width: max(12px, var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small)));
}
[dir=rtl] .mdc-notched-outline__leading {
  border-left: none;
  border-right: 1px solid;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-top-right-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
  border-bottom-right-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
}

.mdc-notched-outline__trailing {
  flex-grow: 1;
  border-left: none;
  border-right: 1px solid;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
  border-bottom-right-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
}
[dir=rtl] .mdc-notched-outline__trailing {
  border-left: 1px solid;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
  border-bottom-left-radius: var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small));
}

.mdc-notched-outline__notch {
  flex: 0 0 auto;
  width: auto;
}
.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch {
  max-width: min(var(--%NS%mat-form-field-notch-max-width, 100%), calc(100% - max(12px, var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small))) * 2));
}
.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  max-width: min(100%, calc(100% - max(12px, var(--%NS%mat-form-field-outlined-container-shape, var(--%NS%mat-sys-corner-extra-small))) * 2));
}
.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-top: 1px;
}
.mdc-text-field--focused.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-top: 2px;
}
.mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-left: 0;
  padding-right: 8px;
  border-top: none;
}
[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-left: 8px;
  padding-right: 0;
}
.mdc-notched-outline--no-label .mdc-notched-outline__notch {
  display: none;
}

.mdc-line-ripple::before, .mdc-line-ripple::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-bottom-style: solid;
  content: "";
}
.mdc-line-ripple::before {
  z-index: 1;
  border-bottom-width: var(--%NS%mat-form-field-filled-active-indicator-height, 1px);
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-line-ripple::before {
  border-bottom-color: var(--%NS%mat-form-field-filled-active-indicator-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-line-ripple::before {
  border-bottom-color: var(--%NS%mat-form-field-filled-hover-active-indicator-color, var(--%NS%mat-sys-on-surface));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-line-ripple::before {
  border-bottom-color: var(--%NS%mat-form-field-filled-disabled-active-indicator-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-line-ripple::before {
  border-bottom-color: var(--%NS%mat-form-field-filled-error-active-indicator-color, var(--%NS%mat-sys-error));
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled).mdc-text-field--%NS%invalid:not(.mdc-text-field--focused):hover .mdc-line-ripple::before {
  border-bottom-color: var(--%NS%mat-form-field-filled-error-hover-active-indicator-color, var(--%NS%mat-sys-on-error-container));
}
.mdc-line-ripple::after {
  transform: scaleX(0);
  opacity: 0;
  z-index: 2;
}
.mdc-text-field--filled .mdc-line-ripple::after {
  border-bottom-width: var(--%NS%mat-form-field-filled-focus-active-indicator-height, 2px);
}
.mdc-text-field--%NS%filled:not(.mdc-text-field--disabled) .mdc-line-ripple::after {
  border-bottom-color: var(--%NS%mat-form-field-filled-focus-active-indicator-color, var(--%NS%mat-sys-primary));
}
.mdc-text-field--filled.mdc-text-field--%NS%invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::after {
  border-bottom-color: var(--%NS%mat-form-field-filled-error-focus-active-indicator-color, var(--%NS%mat-sys-error));
}

.mdc-line-ripple--%NS%active::after {
  transform: scaleX(1);
  opacity: 1;
}

.mdc-line-ripple--%NS%deactivating::after {
  opacity: 0;
}

.mdc-text-field--disabled {
  pointer-events: none;
}

.mat-mdc-form-field-textarea-control {
  vertical-align: middle;
  resize: vertical;
  box-sizing: border-box;
  height: auto;
  margin: 0;
  padding: 0;
  border: none;
  overflow: auto;
}

.mat-mdc-form-field-input-control.mat-mdc-form-field-input-control {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font: inherit;
  letter-spacing: inherit;
  text-decoration: inherit;
  text-transform: inherit;
  border: none;
}

.mat-mdc-form-field .mat-mdc-floating-label.mdc-floating-label {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  line-height: normal;
  pointer-events: all;
  will-change: auto;
}

.mat-mdc-form-field:not(.mat-form-field-disabled) .mat-mdc-floating-label.mdc-floating-label {
  cursor: inherit;
}

.mdc-text-field--%NS%no-label:not(.mdc-text-field--textarea) .mat-mdc-form-field-input-control.mdc-text-field__input,
.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control {
  height: auto;
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control.mdc-text-field__input[type=color] {
  height: 23px;
}

.mat-mdc-text-field-wrapper {
  height: auto;
  flex: auto;
  will-change: auto;
}

.mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper {
  padding-left: 0;
  --%NS%mat-mdc-form-field-label-offset-x: -16px;
}

.mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
  padding-right: 0;
}

[dir=rtl] .mat-mdc-text-field-wrapper {
  padding-left: 16px;
  padding-right: 16px;
}
[dir=rtl] .mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
  padding-left: 0;
}
[dir=rtl] .mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper {
  padding-right: 0;
}

.mat-form-field-disabled .mdc-text-field__input::placeholder {
  color: var(--%NS%mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input::-moz-placeholder {
  color: var(--%NS%mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--%NS%mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input:-ms-input-placeholder {
  color: var(--%NS%mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-form-field-label-always-float .mdc-text-field__input::placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
  opacity: 1;
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-infix .mat-mdc-floating-label {
  left: auto;
  right: auto;
}

.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-text-field__input {
  display: inline-block;
}

.mat-mdc-form-field .mat-mdc-text-field-wrapper.mdc-text-field .mdc-notched-outline__notch {
  padding-top: 0;
}

.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch {
  border-left: 1px solid transparent;
}

[dir=rtl] .mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch {
  border-left: none;
  border-right: 1px solid transparent;
}

.mat-mdc-form-field-infix {
  min-height: var(--%NS%mat-form-field-container-height, 56px);
  padding-top: var(--%NS%mat-form-field-filled-with-label-container-padding-top, 24px);
  padding-bottom: var(--%NS%mat-form-field-filled-with-label-container-padding-bottom, 8px);
}
.mdc-text-field--outlined .mat-mdc-form-field-infix, .mdc-text-field--no-label .mat-mdc-form-field-infix {
  padding-top: var(--%NS%mat-form-field-container-vertical-padding, 16px);
  padding-bottom: var(--%NS%mat-form-field-container-vertical-padding, 16px);
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-flex .mat-mdc-floating-label {
  top: calc(var(--%NS%mat-form-field-container-height, 56px) / 2);
}

.mdc-text-field--filled .mat-mdc-floating-label {
  display: var(--%NS%mat-form-field-filled-label-display, block);
}

.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  --%NS%mat-mdc-form-field-label-transform: translateY(calc(calc(6.75px + var(--%NS%mat-form-field-container-height, 56px) / 2) * -1))
    scale(var(--%NS%mat-mdc-form-field-floating-label-scale, 0.75));
  transform: var(--%NS%mat-mdc-form-field-label-transform);
}

@keyframes _mat-form-field-subscript-animation {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mat-mdc-form-field-subscript-wrapper {
  box-sizing: border-box;
  width: 100%;
  position: relative;
}

.mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field-error-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 16px;
  opacity: 1;
  transform: translateY(0);
  animation: _mat-form-field-subscript-animation 0ms cubic-bezier(0.55, 0, 0.55, 0.2);
}

.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-error-wrapper {
  position: static;
}

.mat-mdc-form-field-bottom-align::before {
  content: "";
  display: inline-block;
  height: 16px;
}

.mat-mdc-form-field-bottom-align.mat-mdc-form-field-subscript-dynamic-size::before {
  content: unset;
}

.mat-mdc-form-field-hint-end {
  order: 1;
}

.mat-mdc-form-field-hint-wrapper {
  display: flex;
}

.mat-mdc-form-field-hint-spacer {
  flex: 1 0 1em;
}

.mat-mdc-form-field-error {
  display: block;
  color: var(--%NS%mat-form-field-error-text-color, var(--%NS%mat-sys-error));
}

.mat-mdc-form-field-subscript-wrapper,
.mat-mdc-form-field-bottom-align::before {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--%NS%mat-form-field-subscript-text-font, var(--%NS%mat-sys-body-small-font));
  line-height: var(--%NS%mat-form-field-subscript-text-line-height, var(--%NS%mat-sys-body-small-line-height));
  font-size: var(--%NS%mat-form-field-subscript-text-size, var(--%NS%mat-sys-body-small-size));
  letter-spacing: var(--%NS%mat-form-field-subscript-text-tracking, var(--%NS%mat-sys-body-small-tracking));
  font-weight: var(--%NS%mat-form-field-subscript-text-weight, var(--%NS%mat-sys-body-small-weight));
}

.mat-mdc-form-field-focus-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  opacity: 0;
  pointer-events: none;
  background-color: var(--%NS%mat-form-field-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-focus-overlay {
  opacity: var(--%NS%mat-form-field-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
  opacity: var(--%NS%mat-form-field-focus-state-layer-opacity, 0);
}

select.mat-mdc-form-field-input-control {
  -moz-appearance: none;
  -webkit-appearance: none;
  background-color: transparent;
  display: inline-flex;
  box-sizing: border-box;
}
select.mat-mdc-form-field-input-control:not(:disabled) {
  cursor: pointer;
}
select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option {
  color: var(--%NS%mat-form-field-select-option-text-color, var(--%NS%mat-sys-neutral10));
}
select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled {
  color: var(--%NS%mat-form-field-select-disabled-option-text-color, color-mix(in srgb, var(--%NS%mat-sys-neutral10) 38%, transparent));
}

.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after {
  content: "";
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid;
  position: absolute;
  right: 0;
  top: 50%;
  margin-top: -2.5px;
  pointer-events: none;
  color: var(--%NS%mat-form-field-enabled-select-arrow-color, var(--%NS%mat-sys-on-surface-variant));
}
[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after {
  right: auto;
  left: 0;
}
.mat-mdc-form-field-type-mat-native-select.mat-focused .mat-mdc-form-field-infix::after {
  color: var(--%NS%mat-form-field-focus-select-arrow-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-form-field-type-mat-native-select.mat-form-field-disabled .mat-mdc-form-field-infix::after {
  color: var(--%NS%mat-form-field-disabled-select-arrow-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control {
  padding-right: 15px;
}
[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control {
  padding-right: 0;
  padding-left: 15px;
}

@media (forced-colors: active) {
  .mat-form-field-appearance-fill .mat-mdc-text-field-wrapper {
    outline: solid 1px;
  }
}
@media (forced-colors: active) {
  .mat-form-field-appearance-fill.mat-form-field-disabled .mat-mdc-text-field-wrapper {
    outline-color: GrayText;
  }
}

@media (forced-colors: active) {
  .mat-form-field-appearance-fill.mat-focused .mat-mdc-text-field-wrapper {
    outline: dashed 3px;
  }
}

@media (forced-colors: active) {
  .mat-mdc-form-field.mat-focused .mdc-notched-outline {
    border: dashed 3px;
  }
}

.mat-mdc-form-field-input-control[type=date], .mat-mdc-form-field-input-control[type=datetime], .mat-mdc-form-field-input-control[type=datetime-local], .mat-mdc-form-field-input-control[type=month], .mat-mdc-form-field-input-control[type=week], .mat-mdc-form-field-input-control[type=time] {
  line-height: 1;
}
.mat-mdc-form-field-input-control::-webkit-datetime-edit {
  line-height: 1;
  padding: 0;
  margin-bottom: -2px;
}

.mat-mdc-form-field {
  --%NS%mat-mdc-form-field-floating-label-scale: 0.75;
  display: inline-flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--%NS%mat-form-field-container-text-font, var(--%NS%mat-sys-body-large-font));
  line-height: var(--%NS%mat-form-field-container-text-line-height, var(--%NS%mat-sys-body-large-line-height));
  font-size: var(--%NS%mat-form-field-container-text-size, var(--%NS%mat-sys-body-large-size));
  letter-spacing: var(--%NS%mat-form-field-container-text-tracking, var(--%NS%mat-sys-body-large-tracking));
  font-weight: var(--%NS%mat-form-field-container-text-weight, var(--%NS%mat-sys-body-large-weight));
}
.mat-mdc-form-field .mdc-text-field--outlined .mdc-floating-label--float-above {
  font-size: calc(var(--%NS%mat-form-field-outlined-label-text-populated-size) * var(--%NS%mat-mdc-form-field-floating-label-scale));
}
.mat-mdc-form-field .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  font-size: var(--%NS%mat-form-field-outlined-label-text-populated-size);
}
[dir=rtl] .mat-mdc-form-field {
  text-align: right;
}

.mat-mdc-form-field-flex {
  display: inline-flex;
  align-items: baseline;
  box-sizing: border-box;
  width: 100%;
}

.mat-mdc-text-field-wrapper {
  width: 100%;
  z-index: 0;
}

.mat-mdc-form-field-icon-prefix,
.mat-mdc-form-field-icon-suffix {
  align-self: center;
  line-height: 0;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}
.mat-mdc-form-field-icon-prefix > .mat-icon,
.mat-mdc-form-field-icon-suffix > .mat-icon {
  padding: 0 12px;
  box-sizing: content-box;
}

.mat-mdc-form-field-icon-prefix {
  color: var(--%NS%mat-form-field-leading-icon-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-form-field-disabled .mat-mdc-form-field-icon-prefix {
  color: var(--%NS%mat-form-field-disabled-leading-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-form-field-icon-suffix {
  color: var(--%NS%mat-form-field-trailing-icon-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-form-field-disabled .mat-mdc-form-field-icon-suffix {
  color: var(--%NS%mat-form-field-disabled-trailing-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-invalid .mat-mdc-form-field-icon-suffix {
  color: var(--%NS%mat-form-field-error-trailing-icon-color, var(--%NS%mat-sys-error));
}
.mat-form-field-invalid:not(.mat-focused):not(.mat-form-field-disabled) .mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-icon-suffix {
  color: var(--%NS%mat-form-field-error-hover-trailing-icon-color, var(--%NS%mat-sys-on-error-container));
}
.mat-form-field-invalid.mat-focused .mat-mdc-text-field-wrapper .mat-mdc-form-field-icon-suffix {
  color: var(--%NS%mat-form-field-error-focus-trailing-icon-color, var(--%NS%mat-sys-error));
}

.mat-mdc-form-field-icon-prefix,
[dir=rtl] .mat-mdc-form-field-icon-suffix {
  padding: 0 4px 0 0;
}

.mat-mdc-form-field-icon-suffix,
[dir=rtl] .mat-mdc-form-field-icon-prefix {
  padding: 0 0 0 4px;
}

.mat-mdc-form-field-subscript-wrapper .mat-icon,
.mat-mdc-form-field label .mat-icon {
  width: 1em;
  height: 1em;
  font-size: inherit;
}

.mat-mdc-form-field-infix {
  flex: auto;
  min-width: 0;
  width: 180px;
  position: relative;
  box-sizing: border-box;
}
.mat-mdc-form-field-infix:has(textarea[cols]) {
  width: auto;
}

.mat-mdc-form-field .mdc-notched-outline__notch {
  margin-left: -1px;
  -webkit-clip-path: inset(-9em -999em -9em 1px);
  clip-path: inset(-9em -999em -9em 1px);
}
[dir=rtl] .mat-mdc-form-field .mdc-notched-outline__notch {
  margin-left: 0;
  margin-right: -1px;
  -webkit-clip-path: inset(-9em 1px -9em -999em);
  clip-path: inset(-9em 1px -9em -999em);
}

.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-floating-label {
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::-moz-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::-webkit-input-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input:-ms-input-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::-moz-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field--%NS%filled:not(.mdc-ripple-upgraded):focus .mdc-text-field__ripple::before {
  transition-duration: 75ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-line-ripple::after {
  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field.mat-form-field-animations-enabled .mat-mdc-form-field-error-wrapper {
  animation-duration: 300ms;
}

.mdc-notched-outline .mdc-floating-label {
  max-width: calc(100% + 1px);
}

.mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  max-width: calc(133.3333333333% + 1px);
}
`],encapsulation:2})})()}return i})();var io=(()=>{class i{static ɵfac=function(n){return new(n||i)};static ɵmod=jt$1({type:i});static ɵinj=lt$1({imports:[Xt$1,bn,zD]})}return i})();function r(t,e){if(!(t instanceof or))return e;if(t.status===0||t.status===502||t.status===504)return`Brak połączenia z serwerem aplikacji. Uruchom gui.bat (Windows) albo ./gui.sh i odśwież stronę.`;let n=t.error?.detail;return typeof n==`string`?n:n&&typeof n==`object`&&`message`in n?String(n.message):`${e} (HTTP ${t.status})`}function a(t){if(!(t instanceof or))return[];let e=t.error?.detail;return Array.isArray(e?.rejected)?e.rejected.map(String):[]}var y={"OdwolanieKIO.data":`Data pisma`,"OdwolanieKIO.miejscowosc":`Miejscowość`,"OdwolanieKIO.czynnosc_dzien":`Data zaskarżonej czynności`,"OdwolanieKIO.czynnosc_powod_id":`Powód odwołania`,"OdwolanieKIO.czynnosc_opis":`Opis czynności`,"Odwolujacy[].przez-pelnomocnika":`Działa przez pełnomocnika`,"Odwolujacy[].pelnomocnik.imie_nazwisko":`Pełnomocnik: imię i nazwisko`,"Odwolujacy[].pelnomocnik.nazwa":`Pełnomocnik: kancelaria`,"Odwolujacy[].pelnomocnik.mail":`Pełnomocnik: e-mail`,"Zamawiajacy[].prowadzacy_postepowanie":`Prowadzi postępowanie`,"ZamowieniePubliczne.tytul":`Tytuł zamówienia`,"ZamowieniePubliczne.numer_postepowania":`Numer postępowania`,"ZamowieniePubliczne.numer_bzp":`Numer ogłoszenia BZP`,"ZamowieniePubliczne.numer_ted":`Numer ogłoszenia TED`,"mocodawca[].data.typ":`Typ mocodawcy`,"mocodawca[].data.imie_nazwisko":`Imię i nazwisko (osoba fizyczna)`,"mocodawca[].podpisujacy[].imie_nazwisko":`Podpisujący`,"przelew_bankowy.data_operacji":`Data operacji`,"przelew_bankowy.z_rachunku":`Z rachunku`,"przelew_bankowy.na_rachunek":`Na rachunek`,"przelew_bankowy.numer_transakcji":`Numer transakcji`,"przelew_bankowy.tytul":`Tytuł przelewu`};var M={nazwa:`Nazwa`,nip:`NIP`,krs:`KRS`,regon:`REGON`,pesel:`PESEL`,imie_nazwisko:`Imię i nazwisko`,mail:`E-mail`,email:`E-mail`,kwota:`Kwota`,data:`Data`,tytul:`Tytuł`,miejscowosc:`Miejscowość`};var O={OdwolanieKIO:`Odwołanie`,Odwolujacy:`Odwołujący`,Zamawiajacy:`Zamawiający`,ZamowieniePubliczne:`Zamówienie publiczne`,mocodawca:`Mocodawca`,podpisujacy:`Podpisujący`,pelnomocnicy:`Pełnomocnik`,przelew_bankowy:`Przelew`};var S={odwolanie:`Odwołanie`,pelnomocnictwo:`Pełnomocnictwo`,przelew:`Przelew`};var C=/* @__PURE__ */ new Set([`nip`,`krs`,`regon`,`pesel`,`bzp`,`ted`,`kio`,`swz`,`opz`,`iban`,`id`]);function l(e){let n=e.replace(/([a-ząćęłńóśźż])([A-ZĄĆĘŁŃÓŚŹŻ])/g,`$1 $2`).split(/[_\-\s]+/).filter(Boolean).map(a=>C.has(a.toLowerCase())?a.toUpperCase():a.toLowerCase());if(!n.length)return e;let[i,...o]=n;return[i.charAt(0).toUpperCase()+i.slice(1),...o].join(` `)}function g(e){if(y[e])return y[e];let n=e.split(`.`).pop()?.replace(/\[\]$/,``)??e;return M[n]??l(n)}function w(e){return O[e]??l(e)}function f(e){return S[e]??l(e)}function z$1(e){return e.length===2&&e.includes(0)&&e.includes(1)}function R(e){let n=e.derive;if(n?.kind===`present`||n?.kind===`count_at_least`)return z$1([n.if_true,n.if_false])?`flaga`:`enum`;if(n?.kind===`map_regex`)return`enum`;if(e.enum)return z$1(e.enum)?`flaga`:`enum`;if(e.dictionary&&!n)return`enum`;switch(e.type){case`date`:return`data`;case`number`:return/kwota|amount/i.test(e.path)?`kwota`:`liczba`;case`integer`:return`liczba`;default:return`tekst`}}function N(e){let n=e.derive,i=o=>typeof o==`string`||typeof o==`number`;if(e.enum)return e.enum;if(n?.kind===`present`||n?.kind===`count_at_least`)return[n.if_true,n.if_false].filter(i);if(n?.kind===`map_regex`)return[...new Set(n.cases.map(o=>o.value).filter(i))]}function T(e){let n=e.dictionary??e.derive?.dictionary??e.rules.find(i=>i.dictionary)?.dictionary??void 0;return{path:e.path,label:g(e.path),type:R(e),engineType:e.type,group:e.group,strategy:e.derive?`derived`:e.strategy,ruleCount:e.rules.length,derive:e.derive?.kind??null,normalizers:e.normalizers.map(i=>i.name),validators:e.validators.map(i=>i.severity===`error`?`${i.name} (odrzuca)`:i.name),dictionary:n??void 0,allowed:N(e),grounding:e.grounding,instruction:e.instruction}}function k$1(e,n){let i={};for(let o of e.fields)for(let a of o.path.split(`.`)){let c=a.replace(/\[\]$/,``);i[c]??=w(c)}return{code:e.code,name:e.name,description:e.classification.description,conversionProfile:e.conversion_profile,minScore:e.classification.min_score,classifier:e.classification.patterns.map(o=>({pattern:o.pattern,weight:o.weight,firstChars:o.first_chars})),sections:e.sections.map(o=>({name:o.name,start:o.start,end:o.end,within:o.within,maxChars:o.max_chars})),sectionLabels:i,groups:e.groups.map(o=>({code:o.name,label:f(o.name),instruction:o.instruction,sections:o.sections,maxChars:o.max_chars,llmProfile:o.llm_profile??n})),fields:e.fields.map(T)}}function h(e){return{code:e.code,name:e.name||e.code,entries:e.entries.map(n=>({id:n.id,label:String(n.opis??n.label??n.nazwa??n.id),keywords:n.keywords??[]}))}}function _(e,n){return{code:e.id,model:e.model,baseUrl:e.base_url,apiKeyEnv:e.api_key_env,temperature:e.temperature,maxTokens:e.max_tokens,timeoutS:e.timeout_s,structuredOutput:e.structured_output,isDefault:e.id===n}}function D(e){return{code:e.code,name:e.name,baseUrl:e.base_url,dataLocation:e.data_location,note:e.note}}function b(e){return{model:e.model,name:e.name,vendor:e.vendor,paramsBillions:e.params_billions,license:e.license,note:e.note}}var x={ocr_engine:{name:`Silnik OCR`,reason:`RapidOCR dał najwyższe F1 na skanach; Tesseract i EasyOCR wypadły gorzej (docs/raport-jakosci.md).`},ocr_lang:{name:`Język OCR`,reason:`Model rozpoznający polskie znaki.`},ocr_model_size:{name:`Rozmiar modelu PP-OCRv6`,reason:`Model „medium” był około 15 razy wolniejszy bez zysku F1.`},ocr_scale:{name:`Skala obrazu dla OCR`,reason:`3,0 = 216 dpi. Skala 4 dała tylko +0,003 F1 przy 1,2 razy dłuższym czasie.`},ocr_mode:{name:`Tryb OCR dla PDF z tekstem`,reason:`OCR tylko obszarów bez warstwy tekstowej: cyfrowe PDF-y nie tracą czasu.`},scanned_ocr_mode:{name:`Tryb OCR dla skanów`,reason:`PDF bez warstwy tekstowej idzie w całości przez OCR.`},replace_broken_text_layer:{name:`Zastępowanie zepsutej warstwy tekstu`,reason:`Nieczytelny tekst PDF trafia do OCR.`},table_structure:{name:`Rozpoznawanie tabel`,reason:`Potwierdzenia przelewów mają układ tabelaryczny.`},max_pages:{name:`Liczba czytanych stron`,reason:`Kluczowe dane są na pierwszych stronach; krótszy czas na skanach.`},num_threads:{name:`Wątki CPU`,reason:`Przewidywalne zużycie procesora na komputerze bez GPU.`},document_timeout_s:{name:`Limit czasu na dokument (s)`,reason:`Uszkodzony plik nie blokuje przetwarzania pozostałych.`},scanned_label_columns:{name:`Kolejność nagłówka w dwóch kolumnach (skany)`,reason:`Docling wypisuje najpierw etykiety „Odwołujący:”, „Zamawiający:”, potem dane; silnik układa je parami według położenia na stronie.`}};var E={unsupported_output:{name:`Wynik dla dokumentu nieobsługiwanego typu`,reason:`README organizatora: pusty plik .json.`},default_llm_profile:{name:`Domyślny profil LLM`,reason:`Profil używany przez grupy ekstrakcji bez własnego profilu.`},llm_concurrency:{name:`Równoległe wywołania LLM`,reason:`Konwersja kolejnego dokumentu nie czeka na odpowiedź modelu.`},ocr_tolerant_grounding:{name:`Tolerancyjne porównanie z tekstem skanu`,reason:`Na skanach wartość z LLM może różnić się od OCR polskimi znakami i pomyłkami 0/o, 1/l.`},ocr_restore_diacritics:{name:`Przywracanie polskich znaków na skanach`,reason:`Słownik SJP przywraca znaki zgubione przez OCR, zanim tekst trafi do reguł i LLM.`}};function F(e){return e==null?`—`:typeof e==`boolean`?e?`tak`:`nie`:Array.isArray(e)?e.join(`, `):typeof e==`object`?JSON.stringify(e):String(e)}function v(e,n,i=[]){return Object.entries(e).filter(([o])=>!i.includes(o)).map(([o,a])=>({key:o,name:n[o]?.name??o,value:F(a),reason:n[o]?.reason??``}))}function P$1(e){return{code:e.id,settings:v(e,x,[`id`])}}function j$1(e){return v(e.settings,E)}var L=class e{http=p$2(Ja);loading=X$1(!0);error=X$1(null);providers=X$1([]);models=X$1([]);system=X$1(null);active=X$1(null);snapshot=Jd(()=>this.active()?.snapshot??null);version=Jd(()=>this.snapshot()?.version??null);publishedVersion=Jd(()=>this.active()?.published_version??null);source=Jd(()=>this.active()?.source??`engine/config/release.json`);defaultLlmProfile=Jd(()=>this.snapshot()?.settings.default_llm_profile??``);documentTypes=Jd(()=>{let n=this.snapshot();return n?n.document_types.map(i=>k$1(i,n.settings.default_llm_profile)):[]});dictionaries=Jd(()=>this.snapshot()?.dictionaries.map(h)??[]);llmProfiles=Jd(()=>{let n=this.snapshot();return n?n.llm_profiles.map(i=>_(i,n.settings.default_llm_profile)):[]});conversionProfiles=Jd(()=>this.snapshot()?.conversion_profiles.map(P$1)??[]);engineSettings=Jd(()=>{let n=this.snapshot();return n?j$1(n):[]});constructor(){this.load()}documentType(n){return n?this.documentTypes().find(i=>i.code===n):void 0}dictionary(n){return n?this.dictionaries().find(i=>i.code===n):void 0}typeName(n){return n?this.documentType(n)?.name??n:`—`}async load(){this.loading.set(!0),this.error.set(null);try{let[n,i,o]=await Promise.all([QD(this.http.get(`/api/config/active`)),QD(this.http.get(`/api/llm-providers`)).catch(()=>[]),QD(this.http.get(`/api/llm-models`)).catch(()=>[])]);this.active.set(n),this.providers.set(i.map(D)),this.models.set(o.map(b)),await this.refreshSystem()}catch(n){this.error.set(r(n,`Nie udało się wczytać konfiguracji silnika.`))}finally{this.loading.set(!1)}}async refreshSystem(){try{this.system.set(await QD(this.http.get(`/api/system`)))}catch{this.system.set(null)}}static ɵfac=function(i){return new(i||e)};static ɵprov=_$1({token:e,factory:e.ɵfac,providedIn:`root`})};var ot={capture:!0};var rt$1=[`focus`,`mousedown`,`mouseenter`,`touchstart`];var z=`mat-ripple-loader-uninitialized`;var P=`mat-ripple-loader-class-name`;var X=`mat-ripple-loader-centered`;var k=`mat-ripple-loader-disabled`;var tt=(()=>{class a{_document=p$2(U$2);_animationsDisabled=ne$3();_globalRippleOptions=p$2(ft,{optional:!0});_platform=p$2(N$2);_ngZone=p$2(le$1);_injector=p$2(ie$2);_eventCleanups;_hosts=/* @__PURE__ */ new Map;constructor(){let t=p$2(zn$1).createRenderer(null,null);this._eventCleanups=this._ngZone.runOutsideAngular(()=>rt$1.map(n=>t.listen(this._document,n,this._onInteraction,ot)))}ngOnDestroy(){let t=this._hosts.keys();for(let n of t)this.destroyRipple(n);this._eventCleanups.forEach(n=>n())}configureRipple(t,n){t.setAttribute(z,this._globalRippleOptions?.namespace??``),(n.className||!t.hasAttribute(P))&&t.setAttribute(P,n.className||``),n.centered&&t.setAttribute(X,``),n.disabled&&t.setAttribute(k,``)}setDisabled(t,n){let e=this._hosts.get(t);e?(e.target.rippleDisabled=n,!n&&!e.hasSetUpEvents&&(e.hasSetUpEvents=!0,e.renderer.setupTriggerEvents(t))):n?t.setAttribute(k,``):t.removeAttribute(k)}_onInteraction=t=>{let n=g$1(t);if(n instanceof HTMLElement){let e=n.closest(`[${z}="${this._globalRippleOptions?.namespace??``}"]`);e&&this._createRipple(e)}};_createRipple(t){if(!this._document||this._hosts.has(t))return;t.querySelector(`.mat-ripple`)?.remove();let n=this._document.createElement(`span`);n.classList.add(`mat-ripple`,t.getAttribute(P)),t.append(n);let e=this._globalRippleOptions,r=this._animationsDisabled?0:e?.animation?.enterDuration??$e$1.enterDuration,i=this._animationsDisabled?0:e?.animation?.exitDuration??$e$1.exitDuration,m={rippleDisabled:this._animationsDisabled||e?.disabled||t.hasAttribute(k),rippleConfig:{centered:t.hasAttribute(X),terminateOnPointerUp:e?.terminateOnPointerUp,animation:{enterDuration:r,exitDuration:i}}},A=new ue$1(m,this._ngZone,n,this._platform,this._injector),D=!m.rippleDisabled;D&&A.setupTriggerEvents(t),this._hosts.set(t,{target:m,renderer:A,hasSetUpEvents:D}),t.removeAttribute(z)}destroyRipple(t){let n=this._hosts.get(t);n&&(n.renderer._removeTriggerEvents(),this._hosts.delete(t))}static ɵfac=function(n){return new(n||a)};static ɵprov=G$2({token:a,factory:a.ɵfac})}return a})();var it=new v$1(`MAT_BUTTON_CONFIG`);function nt(a){return a==null?void 0:AT(a)}var B=(()=>{class a{_elementRef=p$2(ot$2);_ngZone=p$2(le$1);_animationsDisabled=ne$3();_config=p$2(it,{optional:!0});_focusMonitor=p$2(Ue$1);_cleanupClick;_renderer=p$2(Gn$1);_rippleLoader=p$2(tt);_isAnchor;_isFab=!1;color;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=t,this._updateRippleDisabled()}_disableRipple=!1;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._updateRippleDisabled()}_disabled=!1;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(t){this.tabIndex=t}showProgress=Ba(!1,{transform:er});constructor(){p$2(yN).load(Is);let t=this._elementRef.nativeElement;this._isAnchor=t.tagName===`A`,this.disabledInteractive=this._config?.disabledInteractive??!1,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(t,{className:`mat-mdc-button-ripple`})}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0),this._isAnchor&&this._setupAsAnchor()}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement)}focus(t=`program`,n){t?this._focusMonitor.focusVia(this._elementRef.nativeElement,t,n):this._elementRef.nativeElement.focus(n)}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?!0:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:!0}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled)}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,`click`,t=>{this.disabled&&(t.preventDefault(),t.stopImmediatePropagation())}))}static ɵfac=function(n){return new(n||a)};static ɵdir=un$1({type:a,hostAttrs:[1,`mat-mdc-button-base`],hostVars:15,hostBindings:function(n,e){n&2&&(Jn$1(`disabled`,e._getDisabledAttribute())(`aria-disabled`,e._getAriaDisabled())(`tabindex`,e._getTabIndex()),Zd(e.color?`mat-`+e.color:``),La(`mat-mdc-button-progress-indicator-shown`,e.showProgress())(`mat-mdc-button-disabled`,e.disabled)(`mat-mdc-button-disabled-interactive`,e.disabledInteractive)(`mat-unthemed`,!e.color)(`_mat-animation-noopable`,e._animationsDisabled))},inputs:{color:`color`,disableRipple:[2,`disableRipple`,`disableRipple`,er],disabled:[2,`disabled`,`disabled`,er],ariaDisabled:[2,`aria-disabled`,`ariaDisabled`,er],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,er],tabIndex:[2,`tabIndex`,`tabIndex`,nt],_tabindex:[2,`tabindex`,`_tabindex`,nt],showProgress:[1,`showProgress`]}})}return a})();var mt=(()=>{class a extends B{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:!0})}static ɵfac=function(n){return new(n||a)};static ɵcmp=(function(){let t=[`*`,[[``,`progressIndicator`,``]]],n=[`*`,`[progressIndicator]`];function e(r,i){r&1&&(Hd(0,`div`,1),qd(1,1),$d())}return Xn$1({type:a,selectors:[[`button`,`mat-icon-button`,``],[`a`,`mat-icon-button`,``],[`button`,`matIconButton`,``],[`a`,`matIconButton`,``]],hostAttrs:[1,`mdc-icon-button`,`mat-mdc-icon-button`],exportAs:[`matButton`,`matAnchor`],features:[fy],ngContentSelectors:n,decls:5,vars:1,consts:[[1,`mat-mdc-button-persistent-ripple`,`mdc-icon-button__ripple`],[1,`mat-mdc-button-progress-indicator-container`],[1,`mat-focus-indicator`],[1,`mat-mdc-button-touch-target`]],template:function(i,m){i&1&&(Wd(t),Dy(0,`span`,0),qd(1),Kb(2,e,2,0,`div`,1),Dy(3,`span`,2)(4,`span`,3)),i&2&&(fC(2),Jb(m.showProgress()?2:-1))},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--%NS%mat-icon-button-container-shape, var(--%NS%mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--%NS%mat-icon-button-state-layer-size, 40px);
  height: var(--%NS%mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--%NS%mat-icon-button-state-layer-size, 40px) - var(--%NS%mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--%NS%mat-icon-button-icon-size, 24px);
  color: var(--%NS%mat-icon-button-icon-color, var(--%NS%mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--%NS%mat-icon-button-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface-variant) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-icon-button-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-icon-button-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-icon-button-touch-target-size, 48px);
  display: var(--%NS%mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--%NS%mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--%NS%mat-icon-button-icon-size, 24px);
  height: var(--%NS%mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__determinate-circle-graphic {
  width: inherit;
  height: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__indeterminate-circle-graphic {
  height: 100%;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--%NS%mat-icon-button-container-shape, var(--%NS%mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})})()}return a})();var at=(()=>{class a{static ɵfac=function(n){return new(n||a)};static ɵmod=jt$1({type:a});static ɵinj=lt$1({imports:[zD]})}return a})();var et=/* @__PURE__ */ new Map([[`text`,[`mat-mdc-button`]],[`filled`,[`mdc-button--unelevated`,`mat-mdc-unelevated-button`]],[`elevated`,[`mdc-button--raised`,`mat-mdc-raised-button`]],[`outlined`,[`mdc-button--outlined`,`mat-mdc-outlined-button`]],[`tonal`,[`mat-tonal-button`]]]);var At=(()=>{class a extends B{get appearance(){return this._appearance}set appearance(t){this.setAppearance(t||this._config?.defaultAppearance||`text`)}_appearance=null;constructor(){super();let t=st(this._elementRef.nativeElement);t&&this.setAppearance(t)}setAppearance(t){if(t===this._appearance)return;let n=this._elementRef.nativeElement.classList,e=this._appearance?et.get(this._appearance):null,r=et.get(t);e&&n.remove(...e),n.add(...r),this._appearance=t}static ɵfac=function(n){return new(n||a)};static ɵcmp=(function(){let t=[[[``,8,`material-icons`,3,`iconPositionEnd`,``],[`mat-icon`,3,`iconPositionEnd`,``],[``,`matButtonIcon`,``,3,`iconPositionEnd`,``],[``,8,`material-symbols-outlined`,3,`iconPositionEnd`,``],[``,8,`material-symbols-rounded`,3,`iconPositionEnd`,``],[``,8,`material-symbols-sharp`,3,`iconPositionEnd`,``]],`*`,[[``,`iconPositionEnd`,``,8,`material-icons`],[`mat-icon`,`iconPositionEnd`,``],[``,`matButtonIcon`,``,`iconPositionEnd`,``],[``,`iconPositionEnd`,``,8,`material-symbols-outlined`],[``,`iconPositionEnd`,``,8,`material-symbols-rounded`],[``,`iconPositionEnd`,``,8,`material-symbols-sharp`]],[[``,`progressIndicator`,``]]],n=[`.material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd]), .material-symbols-outlined:not([iconPositionEnd]), .material-symbols-rounded:not([iconPositionEnd]), .material-symbols-sharp:not([iconPositionEnd])`,`*`,`.material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd], .material-symbols-outlined[iconPositionEnd], .material-symbols-rounded[iconPositionEnd], .material-symbols-sharp[iconPositionEnd]`,`[progressIndicator]`];function e(r,i){r&1&&(Hd(0,`div`,2),qd(1,3),$d())}return Xn$1({type:a,selectors:[[`button`,`matButton`,``],[`a`,`matButton`,``],[`button`,`mat-button`,``],[`button`,`mat-raised-button`,``],[`button`,`mat-flat-button`,``],[`button`,`mat-stroked-button`,``],[`a`,`mat-button`,``],[`a`,`mat-raised-button`,``],[`a`,`mat-flat-button`,``],[`a`,`mat-stroked-button`,``]],hostAttrs:[1,`mdc-button`],inputs:{appearance:[0,`matButton`,`appearance`]},exportAs:[`matButton`,`matAnchor`],features:[fy],ngContentSelectors:n,decls:8,vars:5,consts:[[1,`mat-mdc-button-persistent-ripple`],[1,`mdc-button__label`],[1,`mat-mdc-button-progress-indicator-container`],[1,`mat-focus-indicator`],[1,`mat-mdc-button-touch-target`]],template:function(i,m){i&1&&(Wd(t),Dy(0,`span`,0),qd(1),Hd(2,`span`,1),qd(3,1),$d(),qd(4,2),Kb(5,e,2,0,`div`,2),Dy(6,`span`,3)(7,`span`,4)),i&2&&(La(`mdc-button__ripple`,!m._isFab)(`mdc-fab__ripple`,m._isFab),fC(5),Jb(m.showProgress()?5:-1))},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--%NS%mat-button-text-horizontal-padding, 12px);
  height: var(--%NS%mat-button-text-container-height, 40px);
  font-family: var(--%NS%mat-button-text-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-text-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-text-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-text-label-text-transform);
  font-weight: var(--%NS%mat-button-text-label-text-weight, var(--%NS%mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-text-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--%NS%mat-button-text-label-text-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, .material-symbols-outlined, .material-symbols-rounded,
.material-symbols-sharp, mat-icon, [matButtonIcon]) {
  padding: 0 var(--%NS%mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-offset, -4px);
  margin-left: var(--%NS%mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-offset, -4px);
  margin-left: var(--%NS%mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-text-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-text-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-text-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-text-touch-target-size, 48px);
  display: var(--%NS%mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-filled-container-height, 40px);
  font-family: var(--%NS%mat-button-filled-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-filled-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-filled-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-filled-label-text-transform);
  font-weight: var(--%NS%mat-button-filled-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-filled-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-filled-state-layer-color, var(--%NS%mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-filled-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-filled-touch-target-size, 48px);
  display: var(--%NS%mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--%NS%mat-button-filled-label-text-color, var(--%NS%mat-sys-on-primary));
  background-color: var(--%NS%mat-button-filled-container-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-filled-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-unelevated-button .mat-mdc-button-progress-indicator-container {
  --%NS%mat-progress-spinner-active-indicator-color: var(--%NS%mat-button-filled-progress-active-indicator-color, var(--%NS%mat-sys-on-primary));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-filled-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--%NS%mat-button-protected-container-elevation-shadow, var(--%NS%mat-sys-level1));
  height: var(--%NS%mat-button-protected-container-height, 40px);
  font-family: var(--%NS%mat-button-protected-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-protected-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-protected-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-protected-label-text-transform);
  font-weight: var(--%NS%mat-button-protected-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-protected-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-protected-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-protected-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-protected-touch-target-size, 48px);
  display: var(--%NS%mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--%NS%mat-button-protected-label-text-color, var(--%NS%mat-sys-primary));
  background-color: var(--%NS%mat-button-protected-container-color, var(--%NS%mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-protected-container-shape, var(--%NS%mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--%NS%mat-button-protected-hover-container-elevation-shadow, var(--%NS%mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--%NS%mat-button-protected-focus-container-elevation-shadow, var(--%NS%mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--%NS%mat-button-protected-pressed-container-elevation-shadow, var(--%NS%mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-protected-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--%NS%mat-button-protected-disabled-container-elevation-shadow, var(--%NS%mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-outlined-container-height, 40px);
  font-family: var(--%NS%mat-button-outlined-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-outlined-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-outlined-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-outlined-label-text-transform);
  font-weight: var(--%NS%mat-button-outlined-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  border-radius: var(--%NS%mat-button-outlined-container-shape, var(--%NS%mat-sys-corner-full));
  border-width: var(--%NS%mat-button-outlined-outline-width, 1px);
  padding: 0 var(--%NS%mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-outlined-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-outlined-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-outlined-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-outlined-touch-target-size, 48px);
  display: var(--%NS%mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--%NS%mat-button-outlined-label-text-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-button-outlined-outline-color, var(--%NS%mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  border-color: var(--%NS%mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-tonal-container-height, 40px);
  font-family: var(--%NS%mat-button-tonal-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-tonal-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-tonal-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-tonal-label-text-transform);
  font-weight: var(--%NS%mat-button-tonal-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--%NS%mat-button-tonal-label-text-color, var(--%NS%mat-sys-on-secondary-container));
  background-color: var(--%NS%mat-button-tonal-container-color, var(--%NS%mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-tonal-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-tonal-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-secondary-container) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-tonal-state-layer-color, var(--%NS%mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-tonal-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-tonal-touch-target-size, 48px);
  display: var(--%NS%mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--%NS%mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--%NS%mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon,
.mat-mdc-button-progress-indicator-shown [matButtonIcon],
.mat-mdc-button-progress-indicator-shown .mdc-button__label {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})})()}return a})();function st(a){return a.hasAttribute(`mat-raised-button`)?`elevated`:a.hasAttribute(`mat-stroked-button`)?`outlined`:a.hasAttribute(`mat-flat-button`)?`filled`:a.hasAttribute(`mat-button`)?`text`:null}var Dt$1=(()=>{class a{static ɵfac=function(n){return new(n||a)};static ɵmod=jt$1({type:a});static ɵinj=lt$1({imports:[at,zD]})}return a})();var yi=[{path:``,pathMatch:`full`,redirectTo:`pulpit`},{path:`pulpit`,title:`Pulpit`,loadComponent:()=>import(`./chunk-CBniUvCN.js`).then(i=>i.DashboardPage)},{path:`sprawy`,title:`Sprawy`,loadComponent:()=>import(`./chunk-z87jhuGv.js`).then(i=>i.CaseListPage)},{path:`sprawy/nowa`,title:`Nowa sprawa`,loadComponent:()=>import(`./chunk-C4Pn3hgV.js`).then(i=>i.CaseNewPage)},{path:`sprawy/:caseId`,title:`Sprawa`,loadComponent:()=>import(`./chunk-Co8SPfbW.js`).then(i=>i.CaseDetailPage)},{path:`sprawy/:caseId/dokumenty/:documentId`,title:`Weryfikacja dokumentu`,loadComponent:()=>import(`./chunk-B-KAWAXz.js`).then(i=>i.DocumentReviewPage)},{path:`konfiguracja/typy-dokumentow`,title:`Typy dokumentów`,loadComponent:()=>import(`./chunk-CUzPE9vd.js`).then(i=>i.DocumentTypesPage)},{path:`konfiguracja/typy-dokumentow/:code`,title:`Typ dokumentu`,loadComponent:()=>import(`./chunk-CesjbX5g.js`).then(i=>i.DocumentTypeDetailPage)},{path:`konfiguracja/slowniki`,title:`Słowniki`,loadComponent:()=>import(`./chunk-BMijdLjC.js`).then(i=>i.DictionariesPage)},{path:`konfiguracja/modele-llm`,title:`Modele LLM`,loadComponent:()=>import(`./chunk-DLPZIFLi.js`).then(i=>i.LlmPage)},{path:`konfiguracja/profile-docling`,title:`Profile Docling`,loadComponent:()=>import(`./chunk-Dwvw5qMG.js`).then(i=>i.DoclingProfilesPage)},{path:`konfiguracja/wydania`,title:`Wydania konfiguracji`,loadComponent:()=>import(`./chunk-C2dtog6x.js`).then(i=>i.ReleasesPage)},{path:`jakosc`,title:`Jakość`,loadComponent:()=>import(`./chunk-Cxv01-Tr.js`).then(i=>i.QualityPage)},{path:`audyt`,title:`Audyt`,loadComponent:()=>import(`./chunk-CWPlrIb2.js`).then(i=>i.AuditPage)},{path:`deklaracja-dostepnosci`,title:`Deklaracja dostępności`,loadComponent:()=>import(`./chunk-h6erRlfz.js`).then(i=>i.AccessibilityStatementPage)},{path:`**`,title:`Nie znaleziono strony`,loadComponent:()=>import(`./chunk-BjN7XTsO.js`).then(i=>i.NotFoundPage)}];var Ei=[`accessibility_new`,`account_circle`,`arrow_back`,`article`,`check_circle`,`chevron_right`,`close`,`dashboard`,`data_object`,`description`,`download`,`edit`,`error`,`folder_open`,`gavel`,`history`,`home`,`info`,`inventory_2`,`menu`,`menu_book`,`open_in_new`,`picture_as_pdf`,`query_stats`,`rule`,`save`,`schedule`,`search`,`smart_toy`,`task_alt`,`tune`,`undo`,`upload`,`upload_file`,`visibility`,`warning`];function ki(){let i=p$2(HD),l=p$2(wf);for(let t of Ei)i.addSvgIcon(t,l.bypassSecurityTrustResourceUrl(`icons/${t}.svg`))}var Si=`Odwołania2json`;var dt=class i extends Kf{title=p$2(Pv);updateTitle(l){let t=this.buildTitle(l);this.title.setTitle(t?`${t} \xB7 ${Si}`:Si)}static ɵfac=(()=>{let l;return function(e){return(l||(l=Ug(i)))(e||i)}})();static ɵprov=_$1({token:i,factory:i.ɵfac})};var Ni={providers:[uI(),M_(N_()),uN(yi,mN(),dN({scrollPositionRestoration:`top`,anchorScrolling:`enabled`})),{provide:Kf,useClass:dt},{provide:yn,useValue:{appearance:`outline`,subscriptSizing:`dynamic`}},dy(ki)]};var Ci=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵmod=jt$1({type:i});static ɵinj=lt$1({imports:[zD]})}return i})();var Mi=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵmod=jt$1({type:i});static ɵinj=lt$1({imports:[zD]})}return i})();var Oi=new v$1(`ListOption`);var Mt=(()=>{class i{_elementRef=p$2(ot$2);static ɵfac=function(e){return new(e||i)};static ɵdir=un$1({type:i,selectors:[[``,`matListItemTitle`,``]],hostAttrs:[1,`mat-mdc-list-item-title`,`mdc-list-item__primary-text`]})}return i})();var Fi=(()=>{class i{_elementRef=p$2(ot$2);static ɵfac=function(e){return new(e||i)};static ɵdir=un$1({type:i,selectors:[[``,`matListItemLine`,``]],hostAttrs:[1,`mat-mdc-list-item-line`,`mdc-list-item__secondary-text`]})}return i})();var Bi=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵdir=un$1({type:i,selectors:[[``,`matListItemMeta`,``]],hostAttrs:[1,`mat-mdc-list-item-meta`,`mdc-list-item__end`]})}return i})();var zi=(()=>{class i{_listOption=p$2(Oi,{optional:!0});_isAlignedAtStart(){return!this._listOption||this._listOption?._getTogglePosition()===`after`}static ɵfac=function(e){return new(e||i)};static ɵdir=un$1({type:i,hostVars:4,hostBindings:function(e,n){e&2&&La(`mdc-list-item__start`,n._isAlignedAtStart())(`mdc-list-item__end`,!n._isAlignedAtStart())}})}return i})();var Pi=(()=>{class i extends zi{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵdir=un$1({type:i,selectors:[[``,`matListItemAvatar`,``]],hostAttrs:[1,`mat-mdc-list-item-avatar`],features:[fy]})}return i})();var zt=(()=>{class i extends zi{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵdir=un$1({type:i,selectors:[[``,`matListItemIcon`,``]],hostAttrs:[1,`mat-mdc-list-item-icon`],features:[fy]})}return i})();var Ri=new v$1(`MAT_LIST_CONFIG`);var Ct=(()=>{class i{_isNonInteractive=!0;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=qi$1(t)}_disableRipple=!1;get disabled(){return this._disabled()}set disabled(t){this._disabled.set(qi$1(t))}_disabled=X$1(!1);_defaultOptions=p$2(Ri,{optional:!0});static ɵfac=function(e){return new(e||i)};static ɵdir=un$1({type:i,hostVars:1,hostBindings:function(e,n){e&2&&Jn$1(`aria-disabled`,n.disabled)},inputs:{disableRipple:`disableRipple`,disabled:`disabled`}})}return i})();var ji=(()=>{class i{_elementRef=p$2(ot$2);_ngZone=p$2(le$1);_listBase=p$2(Ct,{optional:!0});_platform=p$2(N$2);_hostElement;_isButtonElement;_noopAnimations=ne$3();_avatars;_icons;set lines(t){this._explicitLines=ne$1(t,null),this._updateItemLines(!1)}_explicitLines=null;get disableRipple(){return this.disabled||this._disableRipple||this._noopAnimations||!!this._listBase?.disableRipple}set disableRipple(t){this._disableRipple=qi$1(t)}_disableRipple=!1;get disabled(){return this._disabled()||!!this._listBase?.disabled}set disabled(t){this._disabled.set(qi$1(t))}_disabled=X$1(!1);_subscriptions=new ne$2;_rippleRenderer=null;_hasUnscopedTextContent=!1;rippleConfig;get rippleDisabled(){return this.disableRipple||!!this.rippleConfig.disabled}constructor(){p$2(yN).load(Is);let t=p$2(ft,{optional:!0});this.rippleConfig=t||{},this._hostElement=this._elementRef.nativeElement,this._isButtonElement=this._hostElement.nodeName.toLowerCase()===`button`,this._listBase&&!this._listBase._isNonInteractive&&this._initInteractiveListItem(),this._isButtonElement&&!this._hostElement.hasAttribute(`type`)&&this._hostElement.setAttribute(`type`,`button`)}ngAfterViewInit(){this._monitorProjectedLinesAndTitle(),this._updateItemLines(!0)}ngOnDestroy(){this._subscriptions.unsubscribe(),this._rippleRenderer!==null&&this._rippleRenderer._removeTriggerEvents()}_hasIconOrAvatar(){return!!(this._avatars.length||this._icons.length)}_initInteractiveListItem(){this._hostElement.classList.add(`mat-mdc-list-item-interactive`),this._rippleRenderer=new ue$1(this,this._ngZone,this._hostElement,this._platform,p$2(ie$2)),this._rippleRenderer.setupTriggerEvents(this._hostElement)}_monitorProjectedLinesAndTitle(){this._ngZone.runOutsideAngular(()=>{this._subscriptions.add(gE(this._lines.changes,this._titles.changes).subscribe(()=>this._updateItemLines(!1)))})}_updateItemLines(t){if(!this._lines||!this._titles||!this._unscopedContent)return;t&&this._checkDomForUnscopedTextContent();let e=this._explicitLines??this._inferLinesFromContent(),n=this._unscopedContent.nativeElement;if(this._hostElement.classList.toggle(`mat-mdc-list-item-single-line`,e<=1),this._hostElement.classList.toggle(`mdc-list-item--with-one-line`,e<=1),this._hostElement.classList.toggle(`mdc-list-item--with-two-lines`,e===2),this._hostElement.classList.toggle(`mdc-list-item--with-three-lines`,e===3),this._hasUnscopedTextContent){let r=this._titles.length===0&&e===1;n.classList.toggle(`mdc-list-item__primary-text`,r),n.classList.toggle(`mdc-list-item__secondary-text`,!r)}else n.classList.remove(`mdc-list-item__primary-text`),n.classList.remove(`mdc-list-item__secondary-text`)}_inferLinesFromContent(){let t=this._titles.length+this._lines.length;return this._hasUnscopedTextContent&&(t+=1),t}_checkDomForUnscopedTextContent(){this._hasUnscopedTextContent=Array.from(this._unscopedContent.nativeElement.childNodes).filter(t=>t.nodeType!==t.COMMENT_NODE).some(t=>!!(t.textContent&&t.textContent.trim()))}static ɵfac=function(e){return new(e||i)};static ɵdir=un$1({type:i,contentQueries:function(e,n,r){if(e&1&&Yd(r,Pi,4)(r,zt,4),e&2){let m;Sy(m=Ty())&&(n._avatars=m),Sy(m=Ty())&&(n._icons=m)}},hostVars:4,hostBindings:function(e,n){e&2&&(Jn$1(`aria-disabled`,n.disabled)(`disabled`,n._isButtonElement&&n.disabled||null),La(`mdc-list-item--disabled`,n.disabled))},inputs:{lines:`lines`,disableRipple:`disableRipple`,disabled:`disabled`}})}return i})();var Ii=(()=>{class i extends ji{_lines;_titles;_meta;_unscopedContent;_itemText;get activated(){return this._activated}set activated(t){this._activated=qi$1(t)}_activated=!1;_getAriaCurrent(){return this._hostElement.nodeName===`A`&&this._activated?`page`:null}_hasBothLeadingAndTrailing(){return this._meta.length!==0&&(this._avatars.length!==0||this._icons.length!==0)}static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵcmp=(function(){let t=[`unscopedContent`],e=[`text`],n=[[[``,`matListItemAvatar`,``],[``,`matListItemIcon`,``]],[[``,`matListItemTitle`,``]],[[``,`matListItemLine`,``]],`*`,[[``,`matListItemMeta`,``]],[[`mat-divider`]]];return Xn$1({type:i,selectors:[[`mat-list-item`],[`a`,`mat-list-item`,``],[`button`,`mat-list-item`,``]],contentQueries:function(o,s,h){if(o&1&&Yd(h,Fi,5)(h,Mt,5)(h,Bi,5),o&2){let p;Sy(p=Ty())&&(s._lines=p),Sy(p=Ty())&&(s._titles=p),Sy(p=Ty())&&(s._meta=p)}},viewQuery:function(o,s){if(o&1&&by(t,5)(e,5),o&2){let h;Sy(h=Ty())&&(s._unscopedContent=h.first),Sy(h=Ty())&&(s._itemText=h.first)}},hostAttrs:[1,`mat-mdc-list-item`,`mdc-list-item`],hostVars:13,hostBindings:function(o,s){o&2&&(Jn$1(`aria-current`,s._getAriaCurrent()),La(`mdc-list-item--activated`,s.activated)(`mdc-list-item--with-leading-avatar`,s._avatars.length!==0)(`mdc-list-item--with-leading-icon`,s._icons.length!==0)(`mdc-list-item--with-trailing-meta`,s._meta.length!==0)(`mat-mdc-list-item-both-leading-and-trailing`,s._hasBothLeadingAndTrailing())(`_mat-animation-noopable`,s._noopAnimations))},inputs:{activated:`activated`},exportAs:[`matListItem`],features:[fy],ngContentSelectors:[`[matListItemAvatar],[matListItemIcon]`,`[matListItemTitle]`,`[matListItemLine]`,`*`,`[matListItemMeta]`,`mat-divider`],decls:10,vars:0,consts:[[`unscopedContent`,``],[1,`mdc-list-item__content`],[1,`mat-mdc-list-item-unscoped-content`,3,`cdkObserveContent`],[1,`mat-focus-indicator`]],template:function(o,s){o&1&&(Wd(n),qd(0),Ea(1,`span`,1),qd(2,1),qd(3,2),Ea(4,`span`,2,0),Pa(`cdkObserveContent`,function(){return s._updateItemLines(!0)}),qd(6,3),Vd()(),qd(7,4),qd(8,5),ka(9,`div`,3))},dependencies:[Yt$1],encapsulation:2})})()}return i})();var Li=(()=>{class i extends Ct{_isNonInteractive=!1;static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵcmp=(function(){return Xn$1({type:i,selectors:[[`mat-nav-list`]],hostAttrs:[`role`,`navigation`,1,`mat-mdc-nav-list`,`mat-mdc-list-base`,`mdc-list`],exportAs:[`matNavList`],features:[zy([{provide:Ct,useExisting:i}]),fy],ngContentSelectors:[`*`],decls:1,vars:0,template:function(n,r){n&1&&(Wd(),qd(0))},styles:[`.mdc-list {
  margin: 0;
  padding: 8px 0;
  list-style-type: none;
}
.mdc-list:focus {
  outline: none;
}

.mdc-list-item {
  display: flex;
  position: relative;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  align-items: stretch;
  cursor: pointer;
  padding-left: 16px;
  padding-right: 16px;
  background-color: var(--%NS%mat-list-list-item-container-color, transparent);
  border-radius: var(--%NS%mat-list-list-item-container-shape, var(--%NS%mat-sys-corner-none));
}
.mdc-list-item.mdc-list-item--selected {
  background-color: var(--%NS%mat-list-list-item-selected-container-color);
}
.mdc-list-item:focus {
  outline: 0;
}
.mdc-list-item.mdc-list-item--disabled {
  cursor: auto;
}
.mdc-list-item.mdc-list-item--with-one-line {
  height: var(--%NS%mat-list-list-item-one-line-container-height, 48px);
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__start {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-two-lines {
  height: var(--%NS%mat-list-list-item-two-line-container-height, 64px);
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-three-lines {
  height: var(--%NS%mat-list-list-item-three-line-container-height, 88px);
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--%NS%selected::before, .mdc-list-item.mdc-list-item--%NS%selected:focus::before, .mdc-list-item:not(.mdc-list-item--selected):focus::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  content: "";
  pointer-events: none;
}

a.mdc-list-item {
  color: inherit;
  text-decoration: none;
}

.mdc-list-item__start {
  fill: currentColor;
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--%NS%mat-list-list-item-leading-icon-color, var(--%NS%mat-sys-on-surface-variant));
  width: var(--%NS%mat-list-list-item-leading-icon-size, 24px);
  height: var(--%NS%mat-list-list-item-leading-icon-size, 24px);
  margin-left: 16px;
  margin-right: 32px;
}
[dir=rtl] .mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-left: 32px;
  margin-right: 16px;
}
.mdc-list-item--%NS%with-leading-icon:hover .mdc-list-item__start {
  color: var(--%NS%mat-list-list-item-hover-leading-icon-color);
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start {
  width: var(--%NS%mat-list-list-item-leading-avatar-size, 40px);
  height: var(--%NS%mat-list-list-item-leading-avatar-size, 40px);
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start, [dir=rtl] .mdc-list-item--with-leading-avatar .mdc-list-item__start {
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}

.mdc-list-item__end {
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  font-family: var(--%NS%mat-list-list-item-trailing-supporting-text-font, var(--%NS%mat-sys-label-small-font));
  line-height: var(--%NS%mat-list-list-item-trailing-supporting-text-line-height, var(--%NS%mat-sys-label-small-line-height));
  font-size: var(--%NS%mat-list-list-item-trailing-supporting-text-size, var(--%NS%mat-sys-label-small-size));
  font-weight: var(--%NS%mat-list-list-item-trailing-supporting-text-weight, var(--%NS%mat-sys-label-small-weight));
  letter-spacing: var(--%NS%mat-list-list-item-trailing-supporting-text-tracking, var(--%NS%mat-sys-label-small-tracking));
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-trailing-icon-color, var(--%NS%mat-sys-on-surface-variant));
  width: var(--%NS%mat-list-list-item-trailing-icon-size, 24px);
  height: var(--%NS%mat-list-list-item-trailing-icon-size, 24px);
}
.mdc-list-item--%NS%with-trailing-icon:hover .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-hover-trailing-icon-color);
}
.mdc-list-item.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-trailing-supporting-text-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-list-item--selected.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-selected-trailing-icon-color, var(--%NS%mat-sys-primary));
}

.mdc-list-item__content {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  align-self: center;
  flex: 1;
  pointer-events: none;
}
.mdc-list-item--with-two-lines .mdc-list-item__content, .mdc-list-item--with-three-lines .mdc-list-item__content {
  align-self: stretch;
}

.mdc-list-item__primary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: var(--%NS%mat-list-list-item-label-text-color, var(--%NS%mat-sys-on-surface));
  font-family: var(--%NS%mat-list-list-item-label-text-font, var(--%NS%mat-sys-body-large-font));
  line-height: var(--%NS%mat-list-list-item-label-text-line-height, var(--%NS%mat-sys-body-large-line-height));
  font-size: var(--%NS%mat-list-list-item-label-text-size, var(--%NS%mat-sys-body-large-size));
  font-weight: var(--%NS%mat-list-list-item-label-text-weight, var(--%NS%mat-sys-body-large-weight));
  letter-spacing: var(--%NS%mat-list-list-item-label-text-tracking, var(--%NS%mat-sys-body-large-tracking));
}
.mdc-list-item:hover .mdc-list-item__primary-text {
  color: var(--%NS%mat-list-list-item-hover-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mdc-list-item:focus .mdc-list-item__primary-text {
  color: var(--%NS%mat-list-list-item-focus-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text, .mdc-list-item--with-three-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}

.mdc-list-item__secondary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  margin-top: 0;
  color: var(--%NS%mat-list-list-item-supporting-text-color, var(--%NS%mat-sys-on-surface-variant));
  font-family: var(--%NS%mat-list-list-item-supporting-text-font, var(--%NS%mat-sys-body-medium-font));
  line-height: var(--%NS%mat-list-list-item-supporting-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-list-list-item-supporting-text-size, var(--%NS%mat-sys-body-medium-size));
  font-weight: var(--%NS%mat-list-list-item-supporting-text-weight, var(--%NS%mat-sys-body-medium-weight));
  letter-spacing: var(--%NS%mat-list-list-item-supporting-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
}
.mdc-list-item__secondary-text::before {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-three-lines .mdc-list-item__secondary-text {
  white-space: normal;
  line-height: 20px;
}
.mdc-list-item--with-overline .mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: auto;
}

.mdc-list-item--with-leading-radio.mdc-list-item,
.mdc-list-item--with-leading-checkbox.mdc-list-item,
.mdc-list-item--with-leading-icon.mdc-list-item,
.mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
[dir=rtl] .mdc-list-item--with-leading-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-checkbox.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-icon.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  display: block;
  margin-top: 0;
  line-height: normal;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-trailing-icon.mdc-list-item, [dir=rtl] .mdc-list-item--with-trailing-icon.mdc-list-item {
  padding-left: 0;
  padding-right: 0;
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 16px;
}

.mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  -webkit-user-select: none;
  user-select: none;
  margin-left: 28px;
  margin-right: 16px;
}
[dir=rtl] .mdc-list-item--with-trailing-meta .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 28px;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end {
  display: block;
  line-height: normal;
  align-self: flex-start;
  margin-top: 0;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end::before, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-leading-radio .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 8px;
  margin-right: 24px;
}
[dir=rtl] .mdc-list-item--with-leading-radio .mdc-list-item__start,
[dir=rtl] .mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 24px;
  margin-right: 8px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-item--with-trailing-radio.mdc-list-item,
.mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-left: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, [dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-right: 0;
}
.mdc-list-item--with-trailing-radio .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 24px;
  margin-right: 8px;
}
[dir=rtl] .mdc-list-item--with-trailing-radio .mdc-list-item__end,
[dir=rtl] .mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 8px;
  margin-right: 24px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-three-lines .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-group__subheader {
  margin: 0.75rem 16px;
}

.mdc-list-item--disabled .mdc-list-item__start,
.mdc-list-item--disabled .mdc-list-item__content,
.mdc-list-item--disabled .mdc-list-item__end {
  opacity: 1;
}
.mdc-list-item--disabled .mdc-list-item__primary-text,
.mdc-list-item--disabled .mdc-list-item__secondary-text {
  opacity: var(--%NS%mat-list-list-item-disabled-label-text-opacity, 0.3);
}
.mdc-list-item--disabled.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--%NS%mat-list-list-item-disabled-leading-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-disabled-leading-icon-opacity, 0.38);
}
.mdc-list-item--disabled.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-disabled-trailing-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-disabled-trailing-icon-opacity, 0.38);
}

.mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing, [dir=rtl] .mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing {
  padding-left: 0;
  padding-right: 0;
}

.mdc-list-item.mdc-list-item--disabled .mdc-list-item__primary-text {
  color: var(--%NS%mat-list-list-item-disabled-label-text-color, var(--%NS%mat-sys-on-surface));
}

.mdc-list-item:hover::before {
  background-color: var(--%NS%mat-list-list-item-hover-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}

.mdc-list-item.mdc-list-item--%NS%disabled::before {
  background-color: var(--%NS%mat-list-list-item-disabled-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-disabled-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}

.mdc-list-item:focus::before {
  background-color: var(--%NS%mat-list-list-item-focus-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}

.mdc-list-item--disabled .mdc-radio,
.mdc-list-item--disabled .mdc-checkbox {
  opacity: var(--%NS%mat-list-list-item-disabled-label-text-opacity, 0.3);
}

.mdc-list-item--with-leading-avatar .mat-mdc-list-item-avatar {
  border-radius: var(--%NS%mat-list-list-item-leading-avatar-shape, var(--%NS%mat-sys-corner-full));
  background-color: var(--%NS%mat-list-list-item-leading-avatar-color, var(--%NS%mat-sys-primary-container));
}

.mat-mdc-list-item-icon {
  font-size: var(--%NS%mat-list-list-item-leading-icon-size, 24px);
}

@media (forced-colors: active) {
  a.mdc-list-item--%NS%activated::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 10px;
    height: 0;
    border-bottom: solid 10px;
    border-radius: 10px;
  }
  a.mdc-list-item--activated [dir=rtl]::after {
    right: auto;
    left: 16px;
  }
}

.mat-mdc-list-base {
  display: block;
}
.mat-mdc-list-base .mdc-list-item__start,
.mat-mdc-list-base .mdc-list-item__end,
.mat-mdc-list-base .mdc-list-item__content {
  pointer-events: auto;
}

.mat-mdc-list-item,
.mat-mdc-list-option {
  width: 100%;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-list-item:not(.mat-mdc-list-item-interactive),
.mat-mdc-list-option:not(.mat-mdc-list-item-interactive) {
  cursor: default;
}
.mat-mdc-list-item .mat-divider-inset,
.mat-mdc-list-option .mat-divider-inset {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
.mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-left: 72px;
}
[dir=rtl] .mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
[dir=rtl] .mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-right: 72px;
}

.mat-mdc-list-item-interactive::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  content: "";
  opacity: 0;
  pointer-events: none;
  border-radius: inherit;
}

.mat-mdc-list-item > .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
.mat-mdc-list-item:focus-visible > .mat-focus-indicator::before {
  content: "";
}

.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-line.mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: normal;
}
.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-unscoped-content.mdc-list-item__secondary-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

mat-action-list button {
  background: none;
  color: inherit;
  border: none;
  font: inherit;
  outline: inherit;
  -webkit-tap-highlight-color: transparent;
  text-align: start;
}
mat-action-list button::-moz-focus-inner {
  border: 0;
}

.mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-inline-start: var(--%NS%mat-list-list-item-leading-icon-start-space, 16px);
  margin-inline-end: var(--%NS%mat-list-list-item-leading-icon-end-space, 16px);
}

.mat-mdc-nav-list .mat-mdc-list-item {
  border-radius: var(--%NS%mat-list-active-indicator-shape, var(--%NS%mat-sys-corner-full));
  --%NS%mat-focus-indicator-border-radius: var(--%NS%mat-list-active-indicator-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-nav-list .mat-mdc-list-item.mdc-list-item--activated {
  background-color: var(--%NS%mat-list-active-indicator-color, var(--%NS%mat-sys-secondary-container));
}
`],encapsulation:2})})()}return i})();var Di=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵmod=jt$1({type:i});static ɵinj=lt$1({imports:[Xt$1,at,Mi,zD,Ci]})}return i})();var Gi=new v$1(`MAT_DRAWER_DEFAULT_AUTOSIZE`,{providedIn:`root`,factory:()=>!1});var Dt=new v$1(`MAT_DRAWER_CONTAINER`);var rt=(()=>{class i extends Me{_platform=p$2(N$2);_changeDetectorRef=p$2(hi$1);_element=p$2(ot$2);_ngZone=p$2(le$1);_isInert=!1;_container=p$2(Lt);ngAfterContentInit(){this._container._contentMarginChanges.subscribe(()=>this._changeDetectorRef.markForCheck())}_drawerToggled(t){t.opened?this._ngZone.runOutsideAngular(()=>{t._animationEnd.pipe(vE(50),Oe(1)).subscribe(()=>this._updateInert())}):this._updateInert()}_drawerModeChanged(){this._updateInert()}_updateInert(){let t=this._container._isShowingBackdrop();if(t!==this._isInert){let e=this._element.nativeElement;this._isInert=t,t?e.setAttribute(`inert`,`true`):e.removeAttribute(`inert`)}}_shouldBeHidden(){if(this._platform.isBrowser)return!1;let{start:t,end:e}=this._container;return t!=null&&t.mode!==`over`&&t.opened||e!=null&&e.mode!==`over`&&e.opened}static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵcmp=(function(){return Xn$1({type:i,selectors:[[`mat-drawer-content`]],hostAttrs:[1,`mat-drawer-content`],hostVars:6,hostBindings:function(n,r){n&2&&(Ay(`margin-left`,r._container._contentMargins.left,`px`)(`margin-right`,r._container._contentMargins.right,`px`),La(`mat-drawer-content-hidden`,r._shouldBeHidden()))},features:[zy([{provide:Me,useExisting:i}]),fy],ngContentSelectors:[`*`],decls:1,vars:0,template:function(n,r){n&1&&(Wd(),qd(0))},encapsulation:2})})()}return i})();var It=(()=>{class i{_elementRef=p$2(ot$2);_focusTrapFactory=p$2(ht$1);_focusMonitor=p$2(Ue$1);_platform=p$2(N$2);_ngZone=p$2(le$1);_renderer=p$2(Gn$1);_interactivityChecker=p$2(je);_doc=p$2(U$2);_isAnimating=!1;_container=p$2(Dt,{optional:!0});_focusTrap=null;_elementFocusedBeforeDrawerWasOpened=null;_eventCleanups;_isAttached=!1;_anchor=null;get position(){return this._position}set position(t){t=t===`end`?`end`:`start`,t!==this._position&&(this._isAttached&&this._updatePositionInParent(t),this._position=t,this.onPositionChanged.emit())}_position=`start`;get mode(){return this._mode}set mode(t){this._mode=t,this._updateFocusTrapState(),this._modeChanged.next(),this._getContent()?._drawerModeChanged()}_mode=`over`;get disableClose(){return this._disableClose}set disableClose(t){this._disableClose=qi$1(t)}_disableClose=!1;get autoFocus(){return this._autoFocus??(this.mode===`side`?`dialog`:`first-tabbable`)}set autoFocus(t){(t===`true`||t===`false`||t==null)&&(t=qi$1(t)),this._autoFocus=t}_autoFocus;get opened(){return this._opened()}set opened(t){this.toggle(qi$1(t))}_opened=X$1(!1);_openedVia=null;_animationStarted=new Y;_animationEnd=new Y;openedChange=new ge$1(!0);_openedStream=this.openedChange.pipe(Ne(t=>t),F$2(()=>{}));openedStart=this._animationStarted.pipe(Ne(()=>this.opened),Vc(void 0));_closedStream=this.openedChange.pipe(Ne(t=>!t),F$2(()=>{}));closedStart=this._animationStarted.pipe(Ne(()=>!this.opened),Vc(void 0));_destroyed=new Y;onPositionChanged=new ge$1;_content;_modeChanged=new Y;_injector=p$2(ie$2);_changeDetectorRef=p$2(hi$1);constructor(){this.openedChange.pipe(Eo(this._destroyed)).subscribe(t=>{t?(this._elementFocusedBeforeDrawerWasOpened=this._doc.activeElement,this._takeFocus()):this._isFocusWithinDrawer()&&this._restoreFocus(this._openedVia||`program`)}),this._eventCleanups=this._ngZone.runOutsideAngular(()=>{let t=this._renderer,e=this._elementRef.nativeElement;return[t.listen(e,`keydown`,n=>{n.keyCode===27&&!this.disableClose&&!Ke$1(n)&&this._ngZone.run(()=>{this.close(),n.stopPropagation(),n.preventDefault()})}),t.listen(e,`transitionend`,this._handleTransitionEvent),t.listen(e,`transitioncancel`,this._handleTransitionEvent)]}),this._animationEnd.subscribe(()=>{this.openedChange.emit(this.opened)})}_focusByCssSelector(t,e){let n=this._elementRef.nativeElement.querySelector(t);n&&(this._interactivityChecker.isFocusable(n)||(n.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let r=()=>{m(),o(),n.removeAttribute(`tabindex`)},m=this._renderer.listen(n,`blur`,r),o=this._renderer.listen(n,`mousedown`,r)})),n.focus(e))}_takeFocus(){if(!this._focusTrap)return;let t=this._elementRef.nativeElement;switch(this.autoFocus){case!1:case`dialog`:return;case!0:case`first-tabbable`:yd(()=>{let e=this._isAnimating?{preventScroll:!0}:void 0;!this._focusTrap.focusInitialElement(e)&&typeof t.focus==`function`&&t.focus(e)},{injector:this._injector});break;case`first-heading`:this._focusByCssSelector(`h1, h2, h3, h4, h5, h6, [role="heading"]`);break;default:this._focusByCssSelector(this.autoFocus)}}_restoreFocus(t){this.autoFocus!==`dialog`&&(this._elementFocusedBeforeDrawerWasOpened?this._focusMonitor.focusVia(this._elementFocusedBeforeDrawerWasOpened,t):this._elementRef.nativeElement.blur(),this._elementFocusedBeforeDrawerWasOpened=null)}_isFocusWithinDrawer(){let t=this._doc.activeElement;return!!t&&this._elementRef.nativeElement.contains(t)}ngAfterViewInit(){this._isAttached=!0,this._position===`end`&&this._updatePositionInParent(`end`),this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._updateFocusTrapState())}ngOnDestroy(){this._eventCleanups.forEach(t=>t()),this._focusTrap?.destroy(),this._anchor?.remove(),this._anchor=null,this._animationStarted.complete(),this._animationEnd.complete(),this._modeChanged.complete(),this._destroyed.next(),this._destroyed.complete()}open(t){return this.toggle(!0,t)}close(){return this.toggle(!1)}_closeViaBackdropClick(){return this._setOpen(!1,!0,`mouse`)}toggle(t=!this.opened,e){t&&e&&(this._openedVia=e);let n=this._setOpen(t,!t&&this._isFocusWithinDrawer(),this._openedVia||`program`);return t||(this._openedVia=null),n}_setOpen(t,e,n){return t===this.opened?Promise.resolve(t?`open`:`close`):(this._opened.set(t),this._getContent()?._drawerToggled(this),this._container?._transitionsEnabled?this._isAnimating?(this._setIsAnimating(!1),this._simulateAnimation()):(this._setIsAnimating(!0),setTimeout(()=>this._animationStarted.next())):this._simulateAnimation(),this._elementRef.nativeElement.classList.toggle(`mat-drawer-opened`,t),!t&&e&&this._restoreFocus(n),this._changeDetectorRef.markForCheck(),this._updateFocusTrapState(),new Promise(r=>{this.openedChange.pipe(Oe(1)).subscribe(m=>r(m?`open`:`close`))}))}_getContent(){return this._container?._content||this._container?._userContent}_setIsAnimating(t){t!==this._isAnimating&&(this._isAnimating=t,this._elementRef.nativeElement.classList.toggle(`mat-drawer-animating`,t))}_simulateAnimation(){setTimeout(()=>{this._animationStarted.next(),this._animationEnd.next()})}_getWidth(){return this._elementRef.nativeElement.offsetWidth||0}_updateFocusTrapState(){this._focusTrap&&(this._focusTrap.enabled=this.opened&&!!this._container?._isShowingBackdrop())}_updatePositionInParent(t){if(!this._platform.isBrowser)return;let e=this._elementRef.nativeElement,n=e.parentNode;t===`end`?(this._anchor||(this._anchor=this._doc.createComment(`mat-drawer-anchor`),n.insertBefore(this._anchor,e)),n.appendChild(e)):this._anchor&&this._anchor.parentNode.insertBefore(e,this._anchor)}_handleTransitionEvent=t=>{let e=this._elementRef.nativeElement;t.target===e&&this._ngZone.run(()=>{t.type===`transitionend`&&this._setIsAnimating(!1),this._animationEnd.next(t)})};static ɵfac=function(e){return new(e||i)};static ɵcmp=(function(){let t=[`content`];return Xn$1({type:i,selectors:[[`mat-drawer`]],viewQuery:function(r,m){if(r&1&&by(t,5),r&2){let o;Sy(o=Ty())&&(m._content=o.first)}},hostAttrs:[1,`mat-drawer`],hostVars:12,hostBindings:function(r,m){r&2&&(Jn$1(`align`,null)(`tabIndex`,m.mode!==`side`?`-1`:null),Ay(`visibility`,!m._container&&!m.opened?`hidden`:null),La(`mat-drawer-end`,m.position===`end`)(`mat-drawer-over`,m.mode===`over`)(`mat-drawer-push`,m.mode===`push`)(`mat-drawer-side`,m.mode===`side`))},inputs:{position:`position`,mode:`mode`,disableClose:`disableClose`,autoFocus:`autoFocus`,opened:`opened`},outputs:{openedChange:`openedChange`,_openedStream:`opened`,openedStart:`openedStart`,_closedStream:`closed`,closedStart:`closedStart`,onPositionChanged:`positionChanged`},exportAs:[`matDrawer`],ngContentSelectors:[`*`],decls:3,vars:0,consts:[[`content`,``],[`cdkScrollable`,``,1,`mat-drawer-inner-container`]],template:function(r,m){r&1&&(Wd(),Ea(0,`div`,1,0),qd(2),Vd())},dependencies:[Me],encapsulation:2})})()}return i})();var Lt=(()=>{class i{_dir=p$2(bN,{optional:!0});_element=p$2(ot$2);_ngZone=p$2(le$1);_changeDetectorRef=p$2(hi$1);_animationDisabled=ne$3();_transitionsEnabled=!1;_allDrawers;_drawers=new ua;_content;_userContent;get start(){return this._start}get end(){return this._end}get autosize(){return this._autosize}set autosize(t){this._autosize=qi$1(t)}_autosize=p$2(Gi);get hasBackdrop(){return this._drawerHasBackdrop(this._start)||this._drawerHasBackdrop(this._end)}set hasBackdrop(t){this._backdropOverride=t==null?null:qi$1(t)}_backdropOverride=null;backdropClick=new ge$1;_start=null;_end=null;_left=null;_right=null;_destroyed=new Y;_doCheckSubject=new Y;_contentMargins={left:null,right:null};_contentMarginChanges=new Y;get scrollable(){return this._userContent||this._content}_injector=p$2(ie$2);constructor(){let t=p$2(N$2),e=p$2(Be);this._dir?.change.pipe(Eo(this._destroyed)).subscribe(()=>{this._validateDrawers(),this.updateContentMargins()}),e.change().pipe(Eo(this._destroyed)).subscribe(()=>this.updateContentMargins()),!this._animationDisabled&&t.isBrowser&&this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._element.nativeElement.classList.add(`mat-drawer-transition`),this._transitionsEnabled=!0},200)})}ngAfterContentInit(){this._allDrawers.changes.pipe(zc(this._allDrawers),Eo(this._destroyed)).subscribe(t=>{this._drawers.reset(t.filter(e=>!e._container||e._container===this)),this._drawers.notifyOnChanges()}),this._drawers.changes.pipe(zc(null)).subscribe(()=>{this._validateDrawers(),this._drawers.forEach(t=>{this._watchDrawerToggle(t),this._watchDrawerPosition(t),this._watchDrawerMode(t)}),(!this._drawers.length||this._isDrawerOpen(this._start)||this._isDrawerOpen(this._end))&&this.updateContentMargins(),this._changeDetectorRef.markForCheck()}),this._ngZone.runOutsideAngular(()=>{this._doCheckSubject.pipe(yE(10),Eo(this._destroyed)).subscribe(()=>this.updateContentMargins())})}ngOnDestroy(){this._contentMarginChanges.complete(),this._doCheckSubject.complete(),this._drawers.destroy(),this._destroyed.next(),this._destroyed.complete()}open(){this._drawers.forEach(t=>t.open())}close(){this._drawers.forEach(t=>t.close())}updateContentMargins(){let t=0,e=0;if(this._left&&this._left.opened){if(this._left.mode==`side`)t+=this._left._getWidth();else if(this._left.mode==`push`){let n=this._left._getWidth();t+=n,e-=n}}if(this._right&&this._right.opened){if(this._right.mode==`side`)e+=this._right._getWidth();else if(this._right.mode==`push`){let n=this._right._getWidth();e+=n,t-=n}}t=t||null,e=e||null,(t!==this._contentMargins.left||e!==this._contentMargins.right)&&(this._contentMargins={left:t,right:e},this._ngZone.run(()=>this._contentMarginChanges.next(this._contentMargins)))}ngDoCheck(){this._autosize&&this._isPushed()&&this._ngZone.runOutsideAngular(()=>this._doCheckSubject.next())}_watchDrawerToggle(t){t._animationStarted.pipe(Eo(this._drawers.changes)).subscribe(()=>{this.updateContentMargins(),this._changeDetectorRef.markForCheck()}),t.mode!==`side`&&t.openedChange.pipe(Eo(this._drawers.changes)).subscribe(()=>this._setContainerClass(t.opened))}_watchDrawerPosition(t){t.onPositionChanged.pipe(Eo(this._drawers.changes)).subscribe(()=>{yd({read:()=>this._validateDrawers()},{injector:this._injector})})}_watchDrawerMode(t){t._modeChanged.pipe(Eo(gE(this._drawers.changes,this._destroyed))).subscribe(()=>{this.updateContentMargins(),this._changeDetectorRef.markForCheck()})}_setContainerClass(t){let e=this._element.nativeElement.classList,n=`mat-drawer-container-has-open`;t?e.add(n):e.remove(n)}_validateDrawers(){this._start=this._end=null,this._drawers.forEach(t=>{t.position==`end`?(this._end,this._end=t):(this._start,this._start=t)}),this._right=this._left=null,this._dir&&this._dir.value===`rtl`?(this._left=this._end,this._right=this._start):(this._left=this._start,this._right=this._end)}_isPushed(){return this._isDrawerOpen(this._start)&&this._start.mode!=`over`||this._isDrawerOpen(this._end)&&this._end.mode!=`over`}_onBackdropClicked(){this.backdropClick.emit(),this._closeModalDrawersViaBackdrop()}_closeModalDrawersViaBackdrop(){[this._start,this._end].filter(t=>t&&!t.disableClose&&this._drawerHasBackdrop(t)).forEach(t=>t._closeViaBackdropClick())}_isShowingBackdrop(){return this._isDrawerOpen(this._start)&&this._drawerHasBackdrop(this._start)||this._isDrawerOpen(this._end)&&this._drawerHasBackdrop(this._end)}_isDrawerOpen(t){return t!=null&&t.opened}_drawerHasBackdrop(t){return this._backdropOverride==null?!!t&&t.mode!==`side`:this._backdropOverride}static ɵfac=function(e){return new(e||i)};static ɵcmp=(function(){let t=[[[`mat-drawer`],[`mat-sidenav`]],[[`mat-drawer-content`],[`mat-sidenav-content`]],`*`],e=[`mat-drawer, mat-sidenav`,`mat-drawer-content, mat-sidenav-content`,`*`];function n(m,o){if(m&1){let s=uS();Ea(0,`div`,1),Pa(`click`,function(){mp(s);let p=fS();return yp(p._onBackdropClicked())}),Vd()}if(m&2){let s=fS();La(`mat-drawer-shown`,s._isShowingBackdrop())}}function r(m,o){m&1&&(Ea(0,`mat-drawer-content`),qd(1,2),Vd())}return Xn$1({type:i,selectors:[[`mat-drawer-container`]],contentQueries:function(o,s,h){if(o&1&&Yd(h,rt,5)(h,It,5),o&2){let p;Sy(p=Ty())&&(s._content=p.first),Sy(p=Ty())&&(s._allDrawers=p)}},viewQuery:function(o,s){if(o&1&&by(rt,5),o&2){let h;Sy(h=Ty())&&(s._userContent=h.first)}},hostAttrs:[1,`mat-drawer-container`],hostVars:2,hostBindings:function(o,s){o&2&&La(`mat-drawer-container-explicit-backdrop`,s._backdropOverride)},inputs:{autosize:`autosize`,hasBackdrop:`hasBackdrop`},outputs:{backdropClick:`backdropClick`},exportAs:[`matDrawerContainer`],features:[zy([{provide:Dt,useExisting:i}])],ngContentSelectors:e,decls:4,vars:2,consts:[[1,`mat-drawer-backdrop`,3,`mat-drawer-shown`],[1,`mat-drawer-backdrop`,3,`click`]],template:function(o,s){o&1&&(Wd(t),Kb(0,n,1,2,`div`,0),qd(1),qd(2,1),Kb(3,r,2,0,`mat-drawer-content`)),o&2&&(Jb(s.hasBackdrop?0:-1),fC(3),Jb(s._content?-1:3))},dependencies:[rt],styles:[`.mat-drawer-container {
  position: relative;
  z-index: 1;
  color: var(--%NS%mat-sidenav-content-text-color, var(--%NS%mat-sys-on-background));
  background-color: var(--%NS%mat-sidenav-content-background-color, var(--%NS%mat-sys-background));
  box-sizing: border-box;
  display: block;
  overflow: hidden;
}
.mat-drawer-container[fullscreen] {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
.mat-drawer-container[fullscreen].mat-drawer-container-has-open {
  overflow: hidden;
}
.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side {
  z-index: 3;
}
.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,
.mat-drawer-container.ng-animate-disabled .mat-drawer-content, .ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,
.ng-animate-disabled .mat-drawer-container .mat-drawer-content {
  transition: none;
}

.mat-drawer-backdrop {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  z-index: 3;
  visibility: hidden;
}
.mat-drawer-backdrop.mat-drawer-shown {
  visibility: visible;
  background-color: var(--%NS%mat-sidenav-scrim-color, color-mix(in srgb, var(--%NS%mat-sys-neutral-variant20) 40%, transparent));
}
.mat-drawer-transition .mat-drawer-backdrop {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: background-color, visibility;
}
@media (forced-colors: active) {
  .mat-drawer-backdrop {
    opacity: 0.5;
  }
}

.mat-drawer-content {
  position: relative;
  z-index: 1;
  display: block;
  height: 100%;
  overflow: auto;
}
.mat-drawer-content.mat-drawer-content-hidden {
  opacity: 0;
}
.mat-drawer-transition .mat-drawer-content {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: transform, margin-left, margin-right;
}

.mat-drawer {
  position: relative;
  z-index: 4;
  color: var(--%NS%mat-sidenav-container-text-color, var(--%NS%mat-sys-on-surface-variant));
  box-shadow: var(--%NS%mat-sidenav-container-elevation-shadow, none);
  background-color: var(--%NS%mat-sidenav-container-background-color, var(--%NS%mat-sys-surface));
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  width: var(--%NS%mat-sidenav-container-width, 360px);
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  outline: 0;
  box-sizing: border-box;
  overflow-y: auto;
  transform: translate3d(-100%, 0, 0);
}
@media (forced-colors: active) {
  .mat-drawer, [dir=rtl] .mat-drawer.mat-drawer-end {
    border-right: solid 1px currentColor;
  }
}
@media (forced-colors: active) {
  [dir=rtl] .mat-drawer, .mat-drawer.mat-drawer-end {
    border-left: solid 1px currentColor;
    border-right: none;
  }
}
.mat-drawer.mat-drawer-side {
  z-index: 2;
}
.mat-drawer.mat-drawer-end {
  right: 0;
  transform: translate3d(100%, 0, 0);
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[dir=rtl] .mat-drawer {
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  transform: translate3d(100%, 0, 0);
}
[dir=rtl] .mat-drawer.mat-drawer-end {
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  left: 0;
  right: auto;
  transform: translate3d(-100%, 0, 0);
}
.mat-drawer-transition .mat-drawer {
  transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) {
  visibility: hidden;
  box-shadow: none;
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) .mat-drawer-inner-container {
  display: none;
}
.mat-drawer.mat-drawer-opened.mat-drawer-opened {
  transform: none;
}

.mat-drawer-side {
  box-shadow: none;
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
}
.mat-drawer-side.mat-drawer-end {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side.mat-drawer-end {
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
  border-left: none;
}

.mat-drawer-inner-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.mat-sidenav-fixed {
  position: fixed;
}
`],encapsulation:2})})()}return i})();var j=(()=>{class i extends rt{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵcmp=(function(){return Xn$1({type:i,selectors:[[`mat-sidenav-content`]],hostAttrs:[1,`mat-drawer-content`,`mat-sidenav-content`],features:[zy([{provide:Me,useExisting:i},{provide:rt,useExisting:i}]),fy],ngContentSelectors:[`*`],decls:1,vars:0,template:function(n,r){n&1&&(Wd(),qd(0))},encapsulation:2})})()}return i})();var Z=(()=>{class i extends It{get fixedInViewport(){return this._fixedInViewport}set fixedInViewport(t){this._fixedInViewport=qi$1(t)}_fixedInViewport=!1;get fixedTopGap(){return this._fixedTopGap}set fixedTopGap(t){this._fixedTopGap=ne$1(t)}_fixedTopGap=0;get fixedBottomGap(){return this._fixedBottomGap}set fixedBottomGap(t){this._fixedBottomGap=ne$1(t)}_fixedBottomGap=0;static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵcmp=(function(){return Xn$1({type:i,selectors:[[`mat-sidenav`]],hostAttrs:[1,`mat-drawer`,`mat-sidenav`],hostVars:16,hostBindings:function(n,r){n&2&&(Jn$1(`tabIndex`,r.mode!==`side`?`-1`:null)(`align`,null),Ay(`top`,r.fixedInViewport?r.fixedTopGap:null,`px`)(`bottom`,r.fixedInViewport?r.fixedBottomGap:null,`px`),La(`mat-drawer-end`,r.position===`end`)(`mat-drawer-over`,r.mode===`over`)(`mat-drawer-push`,r.mode===`push`)(`mat-drawer-side`,r.mode===`side`)(`mat-sidenav-fixed`,r.fixedInViewport))},inputs:{fixedInViewport:`fixedInViewport`,fixedTopGap:`fixedTopGap`,fixedBottomGap:`fixedBottomGap`},exportAs:[`matSidenav`],features:[zy([{provide:It,useExisting:i}]),fy],ngContentSelectors:[`*`],decls:3,vars:0,consts:[[`content`,``],[`cdkScrollable`,``,1,`mat-drawer-inner-container`]],template:function(n,r){n&1&&(Wd(),Ea(0,`div`,1,0),qd(2),Vd())},dependencies:[Me],encapsulation:2})})()}return i})();var Ai=(()=>{class i extends Lt{_allDrawers=void 0;_content=void 0;static ɵfac=(()=>{let t;return function(n){return(t||(t=Ug(i)))(n||i)}})();static ɵcmp=(function(){let t=[[[`mat-drawer`],[`mat-sidenav`]],[[`mat-drawer-content`],[`mat-sidenav-content`]],`*`],e=[`mat-drawer, mat-sidenav`,`mat-drawer-content, mat-sidenav-content`,`*`];function n(m,o){if(m&1){let s=uS();Ea(0,`div`,1),Pa(`click`,function(){mp(s);let p=fS();return yp(p._onBackdropClicked())}),Vd()}if(m&2){let s=fS();La(`mat-drawer-shown`,s._isShowingBackdrop())}}function r(m,o){m&1&&(Ea(0,`mat-sidenav-content`),qd(1,2),Vd())}return Xn$1({type:i,selectors:[[`mat-sidenav-container`]],contentQueries:function(o,s,h){if(o&1&&Yd(h,j,5)(h,Z,5),o&2){let p;Sy(p=Ty())&&(s._content=p.first),Sy(p=Ty())&&(s._allDrawers=p)}},hostAttrs:[1,`mat-drawer-container`,`mat-sidenav-container`],hostVars:2,hostBindings:function(o,s){o&2&&La(`mat-drawer-container-explicit-backdrop`,s._backdropOverride)},exportAs:[`matSidenavContainer`],features:[zy([{provide:Dt,useExisting:i},{provide:Lt,useExisting:i}]),fy],ngContentSelectors:e,decls:4,vars:2,consts:[[1,`mat-drawer-backdrop`,3,`mat-drawer-shown`],[1,`mat-drawer-backdrop`,3,`click`]],template:function(o,s){o&1&&(Wd(t),Kb(0,n,1,2,`div`,0),qd(1),qd(2,1),Kb(3,r,2,0,`mat-sidenav-content`)),o&2&&(Jb(s.hasBackdrop?0:-1),fC(3),Jb(s._content?-1:3))},dependencies:[j],styles:[`.mat-drawer-container {
  position: relative;
  z-index: 1;
  color: var(--%NS%mat-sidenav-content-text-color, var(--%NS%mat-sys-on-background));
  background-color: var(--%NS%mat-sidenav-content-background-color, var(--%NS%mat-sys-background));
  box-sizing: border-box;
  display: block;
  overflow: hidden;
}
.mat-drawer-container[fullscreen] {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
.mat-drawer-container[fullscreen].mat-drawer-container-has-open {
  overflow: hidden;
}
.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side {
  z-index: 3;
}
.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,
.mat-drawer-container.ng-animate-disabled .mat-drawer-content, .ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,
.ng-animate-disabled .mat-drawer-container .mat-drawer-content {
  transition: none;
}

.mat-drawer-backdrop {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  z-index: 3;
  visibility: hidden;
}
.mat-drawer-backdrop.mat-drawer-shown {
  visibility: visible;
  background-color: var(--%NS%mat-sidenav-scrim-color, color-mix(in srgb, var(--%NS%mat-sys-neutral-variant20) 40%, transparent));
}
.mat-drawer-transition .mat-drawer-backdrop {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: background-color, visibility;
}
@media (forced-colors: active) {
  .mat-drawer-backdrop {
    opacity: 0.5;
  }
}

.mat-drawer-content {
  position: relative;
  z-index: 1;
  display: block;
  height: 100%;
  overflow: auto;
}
.mat-drawer-content.mat-drawer-content-hidden {
  opacity: 0;
}
.mat-drawer-transition .mat-drawer-content {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: transform, margin-left, margin-right;
}

.mat-drawer {
  position: relative;
  z-index: 4;
  color: var(--%NS%mat-sidenav-container-text-color, var(--%NS%mat-sys-on-surface-variant));
  box-shadow: var(--%NS%mat-sidenav-container-elevation-shadow, none);
  background-color: var(--%NS%mat-sidenav-container-background-color, var(--%NS%mat-sys-surface));
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  width: var(--%NS%mat-sidenav-container-width, 360px);
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  outline: 0;
  box-sizing: border-box;
  overflow-y: auto;
  transform: translate3d(-100%, 0, 0);
}
@media (forced-colors: active) {
  .mat-drawer, [dir=rtl] .mat-drawer.mat-drawer-end {
    border-right: solid 1px currentColor;
  }
}
@media (forced-colors: active) {
  [dir=rtl] .mat-drawer, .mat-drawer.mat-drawer-end {
    border-left: solid 1px currentColor;
    border-right: none;
  }
}
.mat-drawer.mat-drawer-side {
  z-index: 2;
}
.mat-drawer.mat-drawer-end {
  right: 0;
  transform: translate3d(100%, 0, 0);
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[dir=rtl] .mat-drawer {
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  transform: translate3d(100%, 0, 0);
}
[dir=rtl] .mat-drawer.mat-drawer-end {
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  left: 0;
  right: auto;
  transform: translate3d(-100%, 0, 0);
}
.mat-drawer-transition .mat-drawer {
  transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) {
  visibility: hidden;
  box-shadow: none;
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) .mat-drawer-inner-container {
  display: none;
}
.mat-drawer.mat-drawer-opened.mat-drawer-opened {
  transform: none;
}

.mat-drawer-side {
  box-shadow: none;
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
}
.mat-drawer-side.mat-drawer-end {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side.mat-drawer-end {
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
  border-left: none;
}

.mat-drawer-inner-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.mat-sidenav-fixed {
  position: fixed;
}
`],encapsulation:2})})()}return i})();var Ti=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵmod=jt$1({type:i});static ɵinj=lt$1({imports:[Ie,zD,Ie]})}return i})();var Hi=[`main`];var qi=(i,l)=>l.id;var Ui=(i,l)=>l.link;function Zi(i,l){if(i&1){let t=uS();Ea(0,`button`,23),Pa(`click`,function(){mp(t);let n=fS();return yp(n.toggleNav())}),ka(1,`mat-icon`,24),Vd()}if(i&2){fS();let t=mS(17);Jn$1(`aria-expanded`,t.opened)}}function Xi(i,l){i&1&&(Ea(0,`span`,12),FS(1,`Brak połączenia z serwerem`),Vd())}function Ki(i,l){i&1&&(Ea(0,`span`,13),FS(1),Vd()),i&2&&(fC(),Qd(`Wydanie konfiguracji `,l))}function $i(i,l){if(i&1&&(Ea(0,`a`,26),ka(1,`mat-icon`,27),Ea(2,`span`,28),FS(3),Vd()()),i&2){let t=l.$implicit,e=fS(2);vy(`routerLink`,t.link)(`activated`,e.isActive(t)),Jn$1(`aria-current`,e.isActive(t)?`page`:null),fC(),vy(`svgIcon`,t.icon),fC(2),Fy(t.label)}}function Yi(i,l){if(i&1&&(Ea(0,`p`,25),FS(1),Vd(),Ea(2,`mat-nav-list`),nS(3,$i,4,5,`a`,26,Ui),Vd()),i&2){let t=l.$implicit;vy(`id`,t.id),fC(),Fy(t.label),fC(),Jn$1(`aria-labelledby`,t.id),fC(),rS(t.items)}}var ht=class i{router=p$2(co);config=p$2(L);sidenav=hH.required(Z);content=hH.required(j);main=hH.required(`main`);isHandset=T$2(p$2(W$1).observe(`(max-width: 1023px)`).pipe(F$2(l=>l.matches)),{initialValue:!1});url=T$2(this.router.events.pipe(Ne(l=>l instanceof st$2),F$2(l=>l.urlAfterRedirects.split(/[?#]/)[0])),{initialValue:``});sections=[{id:`nav-praca`,label:`Praca`,items:[{label:`Pulpit`,icon:`dashboard`,link:`/pulpit`},{label:`Sprawy`,icon:`folder_open`,link:`/sprawy`,exclude:[`/sprawy/nowa`]},{label:`Nowa sprawa`,icon:`upload_file`,link:`/sprawy/nowa`,exact:!0}]},{id:`nav-konfiguracja`,label:`Konfiguracja`,items:[{label:`Typy dokumentów`,icon:`description`,link:`/konfiguracja/typy-dokumentow`},{label:`Słowniki`,icon:`menu_book`,link:`/konfiguracja/slowniki`},{label:`Modele LLM`,icon:`smart_toy`,link:`/konfiguracja/modele-llm`},{label:`Profile Docling`,icon:`tune`,link:`/konfiguracja/profile-docling`},{label:`Wydania`,icon:`inventory_2`,link:`/konfiguracja/wydania`}]},{id:`nav-nadzor`,label:`Nadzór`,items:[{label:`Jakość`,icon:`query_stats`,link:`/jakosc`},{label:`Audyt`,icon:`history`,link:`/audyt`}]}];constructor(){let l=!0;this.router.events.pipe(Ne(t=>t instanceof st$2),U$1()).subscribe(()=>{this.content().scrollTo({top:0}),this.isHandset()&&this.sidenav().close(),l||this.main().nativeElement.focus({preventScroll:!0}),l=!1})}isActive(l){let t=this.url();return l.exclude?.some(e=>t===e||t.startsWith(`${e}/`))?!1:l.exact?t===l.link:t===l.link||t.startsWith(`${l.link}/`)}skipToContent(l){l.preventDefault(),this.main().nativeElement.focus()}toggleNav(){this.sidenav().toggle()}static ɵfac=function(t){return new(t||i)};static ɵcmp=Xn$1({type:i,selectors:[[`app-root`]],viewQuery:function(t,e){t&1&&My(e.sidenav,Z,5)(e.content,j,5)(e.main,Hi,5),t&2&&gS(3)},decls:34,vars:4,consts:[[`nav`,``],[`main`,``],[`href`,`#main`,1,`skip-link`,3,`click`],[1,`app-header`],[`mat-icon-button`,``,`type`,`button`,`aria-label`,`Menu nawigacji`,`aria-controls`,`app-nav`,1,`nav-toggle`],[`routerLink`,`/pulpit`,1,`brand`],[`aria-hidden`,`true`,1,`brand-mark`],[`svgIcon`,`gavel`],[1,`brand-text`],[1,`brand-name`],[1,`brand-sub`],[1,`spacer`],[1,`env-badge`,`env-badge--error`],[1,`env-badge`],[1,`app-body`],[`id`,`app-nav`,1,`app-nav`,3,`mode`,`opened`],[`aria-label`,`Nawigacja główna`],[1,`app-content`],[`id`,`main`,`tabindex`,`-1`],[1,`app-footer`],[`routerLink`,`/deklaracja-dostepnosci`],[`href`,`https://github.com/Urzad-Zamowien-Publicznych/hacknation-2026`,`target`,`_blank`,`rel`,`noopener noreferrer`],[1,`visually-hidden`],[`mat-icon-button`,``,`type`,`button`,`aria-label`,`Menu nawigacji`,`aria-controls`,`app-nav`,1,`nav-toggle`,3,`click`],[`svgIcon`,`menu`,`aria-hidden`,`true`],[1,`nav-section`,3,`id`],[`mat-list-item`,``,3,`routerLink`,`activated`],[`matListItemIcon`,``,`aria-hidden`,`true`,3,`svgIcon`],[`matListItemTitle`,``]],template:function(t,e){if(t&1&&(Ea(0,`a`,2),Pa(`click`,function(r){return e.skipToContent(r)}),FS(1,`Przejdź do treści`),Vd(),Ea(2,`header`,3),Kb(3,Zi,2,1,`button`,4),Ea(4,`a`,5)(5,`span`,6),ka(6,`mat-icon`,7),Vd(),Ea(7,`span`,8)(8,`span`,9),FS(9,`Odwołania2json`),Vd(),Ea(10,`span`,10),FS(11,`Ekstrakcja danych z odwołań do KIO`),Vd()()(),ka(12,`span`,11),Kb(13,Xi,2,0,`span`,12)(14,Ki,2,1,`span`,13),Vd(),Ea(15,`mat-sidenav-container`,14)(16,`mat-sidenav`,15,0)(18,`nav`,16),nS(19,Yi,5,3,null,null,qi),Vd()(),Ea(21,`mat-sidenav-content`,17)(22,`main`,18,1),ka(24,`router-outlet`),Vd(),Ea(25,`footer`,19)(26,`span`),FS(27,`Odwołania2json · prototyp przygotowany na HackNation 2026`),Vd(),Ea(28,`a`,20),FS(29,`Deklaracja dostępności`),Vd(),Ea(30,`a`,21),FS(31,` Wyzwanie: repozytorium organizatora `),Ea(32,`span`,22),FS(33,`(otwiera się w nowej karcie)`),Vd()()()()()),t&2){let n;fC(3),Jb(e.isHandset()?3:-1),fC(10),Jb(e.config.error()?13:(n=e.config.version())?14:-1,n),fC(3),vy(`mode`,e.isHandset()?`over`:`side`)(`opened`,!e.isHandset()),fC(3),rS(e.sections)}},dependencies:[Wf,PD,Ti,Z,Ai,j,Di,Li,Ii,zt,Mt,vG,yG,Dt$1,mt],styles:[`[_nghost-%COMP%]{display:flex;flex-direction:column;height:100vh;height:100dvh}.skip-link[_ngcontent-%COMP%]{position:absolute;left:16px;top:-64px;z-index:1000;padding:12px 16px;background:var(--%NS%app-accent);color:#fff;font-weight:600;border-radius:0 0 8px 8px}.skip-link[_ngcontent-%COMP%]:focus{top:0}.app-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:12px;height:64px;padding:0 24px;flex-shrink:0;background:var(--%NS%app-accent);color:#fff;border-bottom:4px solid #3d6bb3}@media(max-width:767px){.app-header[_ngcontent-%COMP%]{padding:0 8px 0 4px}}.nav-toggle[_ngcontent-%COMP%]{color:#fff}.brand[_ngcontent-%COMP%]{display:flex;align-items:center;gap:12px;color:inherit;text-decoration:none;min-width:0}.brand-mark[_ngcontent-%COMP%]{display:grid;place-items:center;width:36px;height:36px;border-radius:8px;background:#ffffff24}.brand-text[_ngcontent-%COMP%]{display:flex;flex-direction:column;line-height:1.15;min-width:0}.brand-name[_ngcontent-%COMP%]{font-size:1.125rem;font-weight:700}.brand-sub[_ngcontent-%COMP%]{font-size:.8125rem;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.env-badge[_ngcontent-%COMP%]{padding:4px 10px;border:1px solid rgba(255,255,255,.55);border-radius:999px;font-size:.8125rem;white-space:nowrap}@media(max-width:599px){.env-badge[_ngcontent-%COMP%]{display:none}}.env-badge--error[_ngcontent-%COMP%]{border-color:#fff;background:var(--%NS%app-error)}.app-body[_ngcontent-%COMP%]{flex:1 1 auto;background:var(--%NS%app-bg)}.app-nav[_ngcontent-%COMP%]{width:264px;border-right:1px solid var(--%NS%app-border);background:var(--%NS%app-surface);padding:8px 0 16px}.app-nav[_ngcontent-%COMP%]   mat-nav-list[_ngcontent-%COMP%]{padding:0 12px}.nav-section[_ngcontent-%COMP%]{margin:16px 24px 4px;font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--%NS%app-text-muted)}.app-content[_ngcontent-%COMP%]{display:flex;flex-direction:column}main[_ngcontent-%COMP%]{flex:1 0 auto}main[_ngcontent-%COMP%]:focus{outline:none}.app-footer[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px 24px;padding:16px 32px;border-top:1px solid var(--%NS%app-border);background:var(--%NS%app-surface);color:var(--%NS%app-text-muted);font-size:.875rem}@media(max-width:767px){.app-footer[_ngcontent-%COMP%]{padding:16px}}`]})};r_(ht,Ni).catch(i=>console.error(i));export{qe$1 as A,Me as C,ae as D,Yt$1 as E,rs as M,ys as N,oe as O,T$2 as P,Be as S,Ke$1 as T,io as _,a,vn as b,Mr as c,Vt as d,We as f,gn as g,fi as h,L as i,qi$1 as j,p as k,Qe as l,bn as m,Dt$1 as n,r as o,Xe as p,mt as r,Ge as s,At as t,Rn as u,li as v,Is as w,x$1 as x,mi as y};