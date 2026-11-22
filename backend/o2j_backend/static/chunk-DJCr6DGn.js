import{n as qe$1,t as je$1}from"./chunk-CMtxIiSy.js";import{D as ae,N as ys,_ as io,a as Dt,c as Mr,f as We$1,i as At,l as Qe$1,m as bn,p as Xe$1,r,t as L,u as Rn,w as Is}from"./main-V2ELVWED.js";import{t as u}from"./chunk-E03KeNg2.js";import{i as g}from"./chunk-g-ToLrD_.js";import{n as j,t as L$1}from"./chunk-qez8LVIm.js";import{t as O}from"./chunk-DT0ETsno.js";import{i as ne}from"./chunk-DDkzryvS.js";import{A as Jn,Bt as ge,Cn as uS,Ct as by,D as Ja,Dn as v,F as Mp,Ft as fS,G as Qd,Gt as ie,H as Pa,J as Ss,Jn as zy,Mt as er,N as La,Nt as fC,O as Jb,Pn as wy,Rn as yG,Un as zD,Vn as yp,W as QD,Wt as hi,Xt as le,Y as Sy,Yt as ka,Z as Ty,Zt as lt,_ as Fy,_t as Zd,b as Gr,dt as Xn,f as Ea,fn as qd,h as FS,i as AT,j as Kb,jn as vy,k as Jd,kn as vG,lt as X,mn as rS,nn as mp,on as ot,ot as Wd,qt as jt,rn as nS,rt as Vd,sn as p,tn as mS,vt as Zn,z as Np,zn as yN}from"./chunk-BcjubxLP.js";var Ae=(()=>{class n{labelPosition=`after`;static ɵfac=function(c){return new(c||n)};static ɵcmp=(function(){return Xn({type:n,selectors:[[``,`mat-internal-form-field`,``]],hostAttrs:[1,`mdc-form-field`,`mat-internal-form-field`],hostVars:2,hostBindings:function(l,d){l&2&&La(`mdc-form-field--align-end`,d.labelPosition===`before`)},inputs:{labelPosition:`labelPosition`},ngContentSelectors:[`*`],decls:1,vars:0,template:function(l,d){l&1&&(Wd(),qd(0))},styles:[`.mat-internal-form-field {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.mat-internal-form-field > label, .mat-internal-form-field > .mat-internal-form-field-label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
  order: 0;
}
[dir=rtl] .mat-internal-form-field > label, [dir=rtl] .mat-internal-form-field > .mat-internal-form-field-label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
}

.mdc-form-field--align-end > label, .mdc-form-field--align-end > .mat-internal-form-field-label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
  order: -1;
}
[dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end label, [dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end .mat-internal-form-field-label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
}
`],encapsulation:2})})()}return n})();var T={color:`accent`,clickAction:`check-indeterminate`,disabledInteractive:!1};var Ve=new v(`mat-checkbox-default-options`,{providedIn:`root`,factory:()=>T});var s=(function(n){return n[n.Init=0]=`Init`,n[n.Checked=1]=`Checked`,n[n.Unchecked=2]=`Unchecked`,n[n.Indeterminate=3]=`Indeterminate`,n})(s||{});var R=class{source;checked};var D=(()=>{class n{_elementRef=p(ot);_changeDetectorRef=p(hi);_ngZone=p(le);_animationsDisabled=ne();_options=p(Ve,{optional:!0});_injector=p(ie);_signalFormField=null;focus(){this._inputElement.nativeElement.focus()}_createChangeEvent(e){let c=new R;return c.source=this,c.checked=e,c}_getAnimationTargetElement(){return this._inputElement?.nativeElement}_animationClasses={uncheckedToChecked:`mdc-checkbox--anim-unchecked-checked`,uncheckedToIndeterminate:`mdc-checkbox--anim-unchecked-indeterminate`,checkedToUnchecked:`mdc-checkbox--anim-checked-unchecked`,checkedToIndeterminate:`mdc-checkbox--anim-checked-indeterminate`,indeterminateToChecked:`mdc-checkbox--anim-indeterminate-checked`,indeterminateToUnchecked:`mdc-checkbox--anim-indeterminate-unchecked`};ariaLabel=``;ariaLabelledby=null;ariaDescribedby;ariaExpanded;ariaControls;ariaOwns;_uniqueId;id;get inputId(){return`${this.id||this._uniqueId}-input`}required=!1;labelPosition=`after`;name=null;change=new ge;indeterminateChange=new ge;value;disableRipple=!1;_inputElement;tabIndex;color;disabledInteractive;_onTouched=()=>{};_currentAnimationClass=``;_currentCheckState=s.Init;_controlValueAccessorChangeFn=()=>{};_validatorChangeFn=()=>{};constructor(){p(yN).load(Is);let e=p(new Gr(`tabindex`),{optional:!0});this._options=this._options||T,this.color=this._options.color||T.color,this.tabIndex=e==null?0:parseInt(e)||0,this.id=this._uniqueId=p(ae).getId(`mat-mdc-checkbox-`),this.disabledInteractive=this._options?.disabledInteractive??!1}ngOnChanges(e){e.required&&this._validatorChangeFn()}ngOnInit(){this._signalFormField=this._injector.get(Mr,void 0,{optional:!0,self:!0})}ngAfterViewInit(){this._syncIndeterminate(this.indeterminate)}get checked(){return this._checked}set checked(e){e!=this.checked&&(this._checked=e,this._changeDetectorRef.markForCheck())}_checked=!1;get disabled(){return this._disabled}set disabled(e){e!==this.disabled&&(this._disabled=e,this._changeDetectorRef.markForCheck())}_disabled=!1;get indeterminate(){return this._indeterminate()}set indeterminate(e){let c=e!=this._indeterminate();this._indeterminate.set(e),c&&(e?this._transitionCheckState(s.Indeterminate):this._transitionCheckState(this.checked?s.Checked:s.Unchecked),this.indeterminateChange.emit(e)),this._syncIndeterminate(e)}_indeterminate=X(!1);_isRippleDisabled(){return this.disableRipple||this.disabled}_onLabelTextChange(){this._changeDetectorRef.detectChanges()}writeValue(e){this.checked=!!e}registerOnChange(e){this._controlValueAccessorChangeFn=e}registerOnTouched(e){this._onTouched=e}setDisabledState(e){this.disabled=e}validate(e){return this.required&&e.value!==!0&&!this._signalFormField?{required:!0}:null}registerOnValidatorChange(e){this._validatorChangeFn=e}_transitionCheckState(e){let c=this._currentCheckState,l=this._getAnimationTargetElement();if(!(c===e||!l)&&(this._currentAnimationClass&&l.classList.remove(this._currentAnimationClass),this._currentAnimationClass=this._getAnimationClassForCheckStateTransition(c,e),this._currentCheckState=e,this._currentAnimationClass.length>0)){l.classList.add(this._currentAnimationClass);let d=this._currentAnimationClass;this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{l.classList.remove(d)},1e3)})}}_emitChangeEvent(){this._controlValueAccessorChangeFn(this.checked),this.change.emit(this._createChangeEvent(this.checked)),this._inputElement&&(this._inputElement.nativeElement.checked=this.checked)}toggle(){this.checked=!this.checked,this._controlValueAccessorChangeFn(this.checked)}_handleInputClick(){let e=this._options?.clickAction;!this.disabled&&e!==`noop`?(this.indeterminate&&e!==`check`&&Promise.resolve().then(()=>{this._indeterminate.set(!1),this.indeterminateChange.emit(!1)}),this._checked=!this._checked,this._transitionCheckState(this._checked?s.Checked:s.Unchecked),this._emitChangeEvent()):(this.disabled&&this.disabledInteractive||!this.disabled&&e===`noop`)&&(this._inputElement.nativeElement.checked=this.checked,this._inputElement.nativeElement.indeterminate=this.indeterminate)}_onInteractionEvent(e){e.stopPropagation()}_onBlur(){Promise.resolve().then(()=>{this._onTouched(),this._changeDetectorRef.markForCheck()})}_getAnimationClassForCheckStateTransition(e,c){if(this._animationsDisabled)return``;switch(e){case s.Init:if(c===s.Checked)return this._animationClasses.uncheckedToChecked;if(c==s.Indeterminate)return this._checked?this._animationClasses.checkedToIndeterminate:this._animationClasses.uncheckedToIndeterminate;break;case s.Unchecked:return c===s.Checked?this._animationClasses.uncheckedToChecked:this._animationClasses.uncheckedToIndeterminate;case s.Checked:return c===s.Unchecked?this._animationClasses.checkedToUnchecked:this._animationClasses.checkedToIndeterminate;case s.Indeterminate:return c===s.Checked?this._animationClasses.indeterminateToChecked:this._animationClasses.indeterminateToUnchecked}return``}_syncIndeterminate(e){let c=this._inputElement;c&&(c.nativeElement.indeterminate=e)}_onInputClick(){this._handleInputClick()}_preventBubblingFromLabel(e){e.target&&this._inputElement&&e.target!==this._inputElement.nativeElement&&e.stopPropagation()}static ɵfac=function(c){return new(c||n)};static ɵcmp=(function(){let e=[`input`];return Xn({type:n,selectors:[[`mat-checkbox`]],viewQuery:function(d,o){if(d&1&&by(e,5),d&2){let f;Sy(f=Ty())&&(o._inputElement=f.first)}},hostAttrs:[1,`mat-mdc-checkbox`],hostVars:16,hostBindings:function(d,o){d&2&&(wy(`id`,o.id),Jn(`tabindex`,null)(`aria-label`,null)(`aria-labelledby`,null),Zd(o.color?`mat-`+o.color:`mat-accent`),La(`_mat-animation-noopable`,o._animationsDisabled)(`mdc-checkbox--disabled`,o.disabled)(`mat-mdc-checkbox-disabled`,o.disabled)(`mat-mdc-checkbox-checked`,o.checked)(`mat-mdc-checkbox-disabled-interactive`,o.disabledInteractive))},inputs:{ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],ariaDescribedby:[0,`aria-describedby`,`ariaDescribedby`],ariaExpanded:[2,`aria-expanded`,`ariaExpanded`,er],ariaControls:[0,`aria-controls`,`ariaControls`],ariaOwns:[0,`aria-owns`,`ariaOwns`],id:`id`,required:[2,`required`,`required`,er],labelPosition:`labelPosition`,name:`name`,value:`value`,disableRipple:[2,`disableRipple`,`disableRipple`,er],tabIndex:[2,`tabIndex`,`tabIndex`,l=>l==null?void 0:AT(l)],color:`color`,disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,er],checked:[2,`checked`,`checked`,er],disabled:[2,`disabled`,`disabled`,er],indeterminate:[2,`indeterminate`,`indeterminate`,er]},outputs:{change:`change`,indeterminateChange:`indeterminateChange`},exportAs:[`matCheckbox`],features:[zy([{provide:Rn,useExisting:Ss(()=>n),multi:!0},{provide:We$1,useExisting:n,multi:!0}]),Zn],ngContentSelectors:[`*`],decls:15,vars:23,consts:[[`checkbox`,``],[`input`,``],[`label`,``],[`mat-internal-form-field`,``,3,`click`,`labelPosition`,`for`],[1,`mdc-checkbox`],[`aria-hidden`,`true`,1,`mat-mdc-checkbox-touch-target`],[`type`,`checkbox`,1,`mdc-checkbox__native-control`,3,`blur`,`click`,`change`,`checked`,`indeterminate`,`disabled`,`id`,`required`,`tabIndex`],[`aria-hidden`,`true`,1,`mdc-checkbox__ripple`],[`aria-hidden`,`true`,1,`mdc-checkbox__background`],[`focusable`,`false`,`viewBox`,`0 0 24 24`,1,`mdc-checkbox__checkmark`],[`fill`,`none`,`d`,`M1.73,12.91 8.1,19.28 22.79,4.59`,1,`mdc-checkbox__checkmark-path`],[1,`mdc-checkbox__mixedmark`],[`mat-ripple`,``,`aria-hidden`,`true`,1,`mat-mdc-checkbox-ripple`,`mat-focus-indicator`,3,`matRippleTrigger`,`matRippleDisabled`,`matRippleCentered`],[1,`mat-internal-form-field-label`,`mdc-label`]],template:function(d,o){if(d&1&&(Wd(),Ea(0,`label`,3),Pa(`click`,function(E){return o._preventBubblingFromLabel(E)}),Ea(1,`span`,4,0),ka(3,`span`,5),Ea(4,`input`,6,1),Pa(`blur`,function(){return o._onBlur()})(`click`,function(){return o._onInputClick()})(`change`,function(E){return o._onInteractionEvent(E)}),Vd(),ka(6,`span`,7),Ea(7,`span`,8),Mp(),Ea(8,`svg`,9),ka(9,`path`,10),Vd(),Np(),ka(10,`span`,11),Vd(),ka(11,`span`,12),Vd(),Ea(12,`span`,13,2),qd(14),Vd()()),d&2){let f=mS(2);vy(`labelPosition`,o.labelPosition)(`for`,o.inputId),fC(4),La(`mdc-checkbox--selected`,o.checked),vy(`checked`,o.checked)(`indeterminate`,o.indeterminate)(`disabled`,o.disabled&&!o.disabledInteractive)(`id`,o.inputId)(`required`,o.required)(`tabIndex`,o.disabled&&!o.disabledInteractive?-1:o.tabIndex),Jn(`aria-label`,o.ariaLabel||null)(`aria-labelledby`,o.ariaLabelledby)(`aria-describedby`,o.ariaDescribedby)(`aria-checked`,o.indeterminate?`mixed`:null)(`aria-controls`,o.ariaControls)(`aria-disabled`,o.disabled&&o.disabledInteractive?!0:null)(`aria-expanded`,o.ariaExpanded)(`aria-owns`,o.ariaOwns)(`name`,o.name)(`value`,o.value),fC(7),vy(`matRippleTrigger`,f)(`matRippleDisabled`,o.disableRipple||o.disabled)(`matRippleCentered`,!0)}},dependencies:[ys,Ae],styles:[`.mdc-checkbox {
  display: inline-block;
  position: relative;
  flex: 0 0 18px;
  box-sizing: content-box;
  width: 18px;
  height: 18px;
  line-height: 0;
  white-space: nowrap;
  cursor: pointer;
  vertical-align: bottom;
  padding: calc((var(--%NS%mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  margin: calc((var(--%NS%mat-checkbox-state-layer-size, 40px) - var(--%NS%mat-checkbox-state-layer-size, 40px)) / 2);
}
.mdc-checkbox:hover > .mdc-checkbox__ripple {
  opacity: var(--%NS%mat-checkbox-unselected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
  background-color: var(--%NS%mat-checkbox-unselected-hover-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mdc-checkbox:hover > .mat-mdc-checkbox-ripple > .mat-ripple-element {
  background-color: var(--%NS%mat-checkbox-unselected-hover-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus + .mdc-checkbox__ripple {
  opacity: var(--%NS%mat-checkbox-unselected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
  background-color: var(--%NS%mat-checkbox-unselected-focus-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--%NS%mat-checkbox-unselected-focus-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  opacity: var(--%NS%mat-checkbox-unselected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
  background-color: var(--%NS%mat-checkbox-unselected-pressed-state-layer-color, var(--%NS%mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--%NS%mat-checkbox-unselected-pressed-state-layer-color, var(--%NS%mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--%NS%mat-checkbox-selected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
  background-color: var(--%NS%mat-checkbox-selected-hover-state-layer-color, var(--%NS%mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--%NS%mat-checkbox-selected-hover-state-layer-color, var(--%NS%mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked + .mdc-checkbox__ripple {
  opacity: var(--%NS%mat-checkbox-selected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
  background-color: var(--%NS%mat-checkbox-selected-focus-state-layer-color, var(--%NS%mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--%NS%mat-checkbox-selected-focus-state-layer-color, var(--%NS%mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--%NS%mat-checkbox-selected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
  background-color: var(--%NS%mat-checkbox-selected-pressed-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--%NS%mat-checkbox-selected-pressed-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  background-color: var(--%NS%mat-checkbox-unselected-hover-state-layer-color, var(--%NS%mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 1;
  width: var(--%NS%mat-checkbox-state-layer-size, 40px);
  height: var(--%NS%mat-checkbox-state-layer-size, 40px);
  top: calc((var(--%NS%mat-checkbox-state-layer-size, 40px) - var(--%NS%mat-checkbox-state-layer-size, 40px)) / 2);
  right: calc((var(--%NS%mat-checkbox-state-layer-size, 40px) - var(--%NS%mat-checkbox-state-layer-size, 40px)) / 2);
  left: calc((var(--%NS%mat-checkbox-state-layer-size, 40px) - var(--%NS%mat-checkbox-state-layer-size, 40px)) / 2);
}

.mdc-checkbox--disabled {
  cursor: default;
  pointer-events: none;
}

.mdc-checkbox__background {
  display: inline-flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 2px;
  background-color: transparent;
  pointer-events: none;
  will-change: background-color, border-color;
  transition: background-color 90ms cubic-bezier(0.4, 0, 0.6, 1), border-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
  -webkit-print-color-adjust: exact;
  color-adjust: exact;
  border-color: var(--%NS%mat-checkbox-unselected-icon-color, var(--%NS%mat-sys-on-surface-variant));
  top: calc((var(--%NS%mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  left: calc((var(--%NS%mat-checkbox-state-layer-size, 40px) - 18px) / 2);
}

.mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:enabled:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--%NS%mat-checkbox-selected-icon-color, var(--%NS%mat-sys-primary));
  background-color: var(--%NS%mat-checkbox-selected-icon-color, var(--%NS%mat-sys-primary));
}

.mdc-checkbox--disabled .mdc-checkbox__background {
  border-color: var(--%NS%mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--%NS%mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}
@media (forced-colors: active) {
  .mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
  .mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--%NS%mat-checkbox-unselected-hover-icon-color, var(--%NS%mat-sys-on-surface));
  background-color: transparent;
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--%NS%mat-checkbox-selected-hover-icon-color, var(--%NS%mat-sys-primary));
  background-color: var(--%NS%mat-checkbox-selected-hover-icon-color, var(--%NS%mat-sys-primary));
}

.mdc-checkbox__native-control:focus:focus:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--%NS%mat-checkbox-unselected-focus-icon-color, var(--%NS%mat-sys-on-surface));
}

.mdc-checkbox__native-control:focus:focus:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--%NS%mat-checkbox-selected-focus-icon-color, var(--%NS%mat-sys-primary));
  background-color: var(--%NS%mat-checkbox-selected-focus-icon-color, var(--%NS%mat-sys-primary));
}

.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
  border-color: var(--%NS%mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
    border-color: GrayText;
  }
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--%NS%mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}

.mdc-checkbox__checkmark {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 180ms cubic-bezier(0.4, 0, 0.6, 1);
  color: var(--%NS%mat-checkbox-selected-checkmark-color, var(--%NS%mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__checkmark {
    color: CanvasText;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
  color: var(--%NS%mat-checkbox-disabled-selected-checkmark-color, var(--%NS%mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
    color: GrayText;
  }
}

.mdc-checkbox__checkmark-path {
  transition: stroke-dashoffset 180ms cubic-bezier(0.4, 0, 0.6, 1);
  stroke: currentColor;
  stroke-width: 3.12px;
  stroke-dashoffset: 29.7833385;
  stroke-dasharray: 29.7833385;
}

.mdc-checkbox__mixedmark {
  width: 100%;
  height: 0;
  transform: scaleX(0) rotate(0deg);
  border-width: 1px;
  border-style: solid;
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
  border-color: var(--%NS%mat-checkbox-selected-checkmark-color, var(--%NS%mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__mixedmark {
    margin: 0 1px;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
  border-color: var(--%NS%mat-checkbox-disabled-selected-checkmark-color, var(--%NS%mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
    border-color: GrayText;
  }
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__background,
.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__background,
.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__background,
.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__background {
  animation-duration: 180ms;
  animation-timing-function: linear;
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-unchecked-checked-checkmark-path 180ms linear;
  transition: none;
}

.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-unchecked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-checked-unchecked-checkmark-path 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__checkmark {
  animation: mdc-checkbox-checked-indeterminate-checkmark 90ms linear;
  transition: none;
}
.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-checked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__checkmark {
  animation: mdc-checkbox-indeterminate-checked-checkmark 500ms linear;
  transition: none;
}
.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-checked-mixedmark 500ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-unchecked-mixedmark 300ms linear;
  transition: none;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path {
  stroke-dashoffset: 0;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transition: opacity 180ms cubic-bezier(0, 0, 0.2, 1), transform 180ms cubic-bezier(0, 0, 0.2, 1);
  opacity: 1;
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(-45deg);
}

.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(0deg);
  opacity: 1;
}

@keyframes mdc-checkbox-unchecked-checked-checkmark-path {
  0%, 50% {
    stroke-dashoffset: 29.7833385;
  }
  50% {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  100% {
    stroke-dashoffset: 0;
  }
}
@keyframes mdc-checkbox-unchecked-indeterminate-mixedmark {
  0%, 68.2% {
    transform: scaleX(0);
  }
  68.2% {
    animation-timing-function: cubic-bezier(0, 0, 0, 1);
  }
  100% {
    transform: scaleX(1);
  }
}
@keyframes mdc-checkbox-checked-unchecked-checkmark-path {
  from {
    animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    opacity: 1;
    stroke-dashoffset: 0;
  }
  to {
    opacity: 0;
    stroke-dashoffset: -29.7833385;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-checkmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(45deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-checkmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(45deg);
    opacity: 0;
  }
  to {
    transform: rotate(360deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(-45deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(315deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-unchecked-mixedmark {
  0% {
    animation-timing-function: linear;
    transform: scaleX(1);
    opacity: 1;
  }
  32.8%, 100% {
    transform: scaleX(0);
    opacity: 0;
  }
}
.mat-mdc-checkbox {
  display: inline-block;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-touch-target,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__native-control,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__ripple,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-ripple::before,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-checkbox label {
  cursor: pointer;
}
.mat-mdc-checkbox .mat-internal-form-field {
  color: var(--%NS%mat-checkbox-label-text-color, var(--%NS%mat-sys-on-surface));
  font-family: var(--%NS%mat-checkbox-label-text-font, var(--%NS%mat-sys-body-medium-font));
  line-height: var(--%NS%mat-checkbox-label-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-checkbox-label-text-size, var(--%NS%mat-sys-body-medium-size));
  letter-spacing: var(--%NS%mat-checkbox-label-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
  font-weight: var(--%NS%mat-checkbox-label-text-weight, var(--%NS%mat-sys-body-medium-weight));
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive input {
  cursor: default;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled label {
  cursor: default;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled .mat-internal-form-field-label {
  color: var(--%NS%mat-checkbox-disabled-label-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mat-mdc-checkbox.mat-mdc-checkbox-disabled .mat-internal-form-field-label {
    color: GrayText;
  }
}
.mat-mdc-checkbox .mat-internal-form-field-label:empty {
  display: none;
}
.mat-mdc-checkbox .mdc-checkbox__ripple {
  opacity: 0;
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple,
.mdc-checkbox__ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-checkbox .mat-mdc-checkbox-ripple:not(:empty),
.mdc-checkbox__ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-mdc-checkbox-ripple .mat-ripple-element {
  opacity: 0.1;
}

.mat-mdc-checkbox-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--%NS%mat-checkbox-touch-target-size, 48px);
  width: var(--%NS%mat-checkbox-touch-target-size, 48px);
  transform: translate(-50%, -50%);
  display: var(--%NS%mat-checkbox-touch-target-display, block);
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple::before {
  border-radius: 50%;
}

.mdc-checkbox__native-control:focus-visible ~ .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2})})()}return n})();var Fe=(()=>{class n{static ɵfac=function(c){return new(c||n)};static ɵmod=jt({type:n});static ɵinj=lt({imports:[D,zD]})}return n})();var Ge=(n,r)=>r.version;function qe(n,r){if(n&1&&(FS(0,` Bieżący plik `),Ea(1,`span`,2),FS(2,`release.json`),Vd(),FS(3)),n&2){let e=fS();fC(3),Qd(` (wersja `,e.config.version(),`) nie odpowiada żadnemu opublikowanemu wydaniu: zbudowano go poleceniem build-release. `)}}function $e(n,r){n&1&&ka(0,`mat-progress-bar`,17)}function Xe(n,r){if(n&1&&(Ea(0,`app-notice`,18)(1,`p`,26),FS(2),Vd()()),n&2){let e=fS();fC(2),Fy(e.actionError())}}function Ue(n,r){if(n&1&&(Ea(0,`app-notice`)(1,`p`),FS(2),Vd()()),n&2){let e=fS();fC(2),Fy(e.message())}}function He(n,r){n&1&&ka(0,`mat-progress-bar`,19)}function We(n,r){if(n&1&&(Ea(0,`app-notice`,18),FS(1),Vd()),n&2){let e=fS();fC(),Fy(e.error())}}function Ze(n,r){if(n&1){let e=uS();Ea(0,`button`,30),Pa(`click`,function(){mp(e);let l=fS().$implicit,d=fS();return yp(d.activate(l.version))}),ka(1,`mat-icon`,31),FS(2,`Aktywuj `),Vd()}if(n&2){let e=fS().$implicit,c=fS();vy(`disabled`,c.busy()),Jn(`aria-label`,`Aktywuj wydanie `+e.version)}}function Qe(n,r){if(n&1&&(Ea(0,`tr`)(1,`td`,2),FS(2),Vd(),Ea(3,`td`),FS(4),Vd(),Ea(5,`td`),FS(6),Vd(),Ea(7,`td`),FS(8),Vd(),Ea(9,`td`),FS(10),Vd(),Ea(11,`td`,27),FS(12),Vd(),Ea(13,`td`,28),Kb(14,Ze,3,2,`button`,29),Vd()()),n&2){let e=r.$implicit,c=fS();La(`active`,e.active),fC(2),Fy(e.version),fC(2),Fy(e.active?`aktywne`:`archiwalne`),fC(2),Fy(c.date(e.createdAt)),fC(2),Fy(e.author||`—`),fC(2),Fy(e.summary||`—`),fC(2),Fy(e.sha256.slice(0,12)),fC(2),Jb(e.active?-1:14)}}function Ke(n,r){n&1&&(Ea(0,`tr`)(1,`td`,32),FS(2,`Brak opublikowanych wydań.`),Vd()())}function Ye(n,r){if(n&1&&Kb(0,Ke,3,0,`tr`),n&2){let e=fS();Jb(e.loading()?-1:0)}}function Je(n,r=/* @__PURE__ */ new Date){let e=d=>String(d).padStart(2,`0`),c=`${r.getFullYear()}.${e(r.getMonth()+1)}.${e(r.getDate())}-dev.`,l=n.filter(d=>d.startsWith(c)).map(d=>Number(d.slice(c.length))).filter(d=>Number.isInteger(d));return c+(Math.max(0,...l)+1)}var je=`Silnik zacznie używać tej konfiguracji od razu: przetwarzanie w aplikacji i CLI (run.sh) czytają engine/config/release.json.`;var Oe=class n{config=p(L);http=p(Ja);releases=X([]);loading=X(!0);error=X(null);date=g;version=X(``);author=X(``);summary=X(``);activateNow=X(!0);busy=X(!1);actionError=X(null);message=X(null);canPublish=Jd(()=>!this.busy()&&this.version().trim().length>0);constructor(){this.load()}async publish(){let r=this.version().trim(),e=this.activateNow();e&&!confirm(`Opublikowa\u0107 i aktywowa\u0107 wydanie ${r}? ${je}`)||await this.run(async()=>{let c=await QD(this.http.post(`/api/releases`,{version:r,summary:this.summary().trim(),author:this.author().trim(),activate:e}));this.summary.set(``),this.version.set(``),this.message.set(c.status===`active`?`Opublikowano i aktywowano wydanie ${c.version}.`:`Opublikowano wydanie ${c.version}.`)},`Nie udało się opublikować wydania.`)}async activate(r){confirm(`Aktywowa\u0107 wydanie ${r}? ${je}`)&&await this.run(async()=>{let e=await QD(this.http.post(`/api/releases/${encodeURIComponent(r)}/activate`,{}));this.message.set(`Aktywne wydanie: ${e.version}.`)},`Nie udało się aktywować wydania.`)}async run(r$1,e){this.busy.set(!0),this.actionError.set(null),this.message.set(null);try{await r$1(),await Promise.all([this.load(),this.config.load()])}catch(c){this.actionError.set(r(c,e))}finally{this.busy.set(!1)}}async load(){try{let r=await QD(this.http.get(`/api/releases`));this.releases.set(r.map(e=>({version:e.version,active:e.status===`active`,author:e.author,createdAt:e.created_at,summary:e.summary,sha256:e.sha256}))),this.version()||this.version.set(Je(r.map(e=>e.version))),this.error.set(null)}catch(r$2){this.error.set(r(r$2,`Nie udało się wczytać wydań.`))}finally{this.loading.set(!1)}}static ɵfac=function(e){return new(e||n)};static ɵcmp=Xn({type:n,selectors:[[`app-releases-page`]],decls:72,vars:12,consts:[[1,`page`],[`heading`,`Wydania konfiguracji`,`description`,`Publikacja tworzy niezmienny snapshot konfiguracji z plików YAML. Każdy wynik zapisuje w śladzie, którym wydaniem powstał.`],[1,`mono`],[`aria-labelledby`,`publish-heading`,1,`card`,`stack`],[`id`,`publish-heading`],[1,`muted`],[1,`form-row`],[1,`version`],[`matInput`,``,`maxlength`,`64`,`autocomplete`,`off`,`required`,``,3,`input`,`value`],[1,`author`],[`matInput`,``,`maxlength`,`100`,`autocomplete`,`off`,3,`input`,`value`],[1,`summary`],[`matInput`,``,`maxlength`,`500`,`autocomplete`,`off`,3,`input`,`value`],[3,`change`,`checked`],[1,`row`],[`mat-flat-button`,``,`type`,`button`,3,`click`,`disabled`],[`svgIcon`,`save`,`aria-hidden`,`true`],[`mode`,`indeterminate`,`aria-label`,`Zapisywanie wydania`],[`tone`,`warning`],[`mode`,`indeterminate`,`aria-label`,`Wczytywanie wydań`],[`aria-label`,`Lista wydań`,1,`card`,`card--flush`],[1,`table-wrap`],[1,`app-table`],[`scope`,`col`],[1,`visually-hidden`],[3,`active`],[1,`pre`],[1,`mono`,`small`],[1,`actions`],[`mat-stroked-button`,``,`type`,`button`,3,`disabled`],[`mat-stroked-button`,``,`type`,`button`,3,`click`,`disabled`],[`svgIcon`,`task_alt`,`aria-hidden`,`true`],[`colspan`,`7`,1,`muted`]],template:function(e,c){e&1&&(Ea(0,`div`,0),ka(1,`app-page-header`,1),Ea(2,`app-notice`),FS(3,` Aktywne wydanie jest w pliku `),Ea(4,`span`,2),FS(5),Vd(),FS(6,`, z którego korzysta CLI uruchamiane przez oceniających i ta aplikacja. Publikować i aktywować można tutaj albo poleceniami `),Ea(7,`span`,2),FS(8,`python backend/manage.py publish --version …`),Vd(),FS(9,` i `),Ea(10,`span`,2),FS(11,`activate --version …`),Vd(),FS(12,`. Wycofanie zmian to aktywacja poprzedniego wydania. `),Kb(13,qe,4,1),Vd(),Ea(14,`section`,3)(15,`h2`,4),FS(16,`Opublikuj konfigurację roboczą`),Vd(),Ea(17,`p`,5),FS(18,` Snapshot bieżących plików `),Ea(19,`span`,2),FS(20,`config/seed/*.yaml`),Vd(),FS(21,`, sprawdzony modelem konfiguracji silnika. Wersji nie można użyć drugi raz. `),Vd(),Ea(22,`div`,6)(23,`mat-form-field`,7)(24,`mat-label`),FS(25,`Wersja`),Vd(),Ea(26,`input`,8),Pa(`input`,function(d){return c.version.set(d.target.value)}),Vd()(),Ea(27,`mat-form-field`,9)(28,`mat-label`),FS(29,`Autor`),Vd(),Ea(30,`input`,10),Pa(`input`,function(d){return c.author.set(d.target.value)}),Vd(),Ea(31,`mat-hint`),FS(32,`Puste: użytkownik systemu`),Vd()()(),Ea(33,`mat-form-field`,11)(34,`mat-label`),FS(35,`Opis zmian`),Vd(),Ea(36,`input`,12),Pa(`input`,function(d){return c.summary.set(d.target.value)}),Vd()(),Ea(37,`mat-checkbox`,13),Pa(`change`,function(d){return c.activateNow.set(d.checked)}),FS(38,` Od razu aktywuj (silnik zacznie go używać) `),Vd(),Ea(39,`div`,14)(40,`button`,15),Pa(`click`,function(){return c.publish()}),ka(41,`mat-icon`,16),FS(42,`Opublikuj `),Vd()()(),Kb(43,$e,1,0,`mat-progress-bar`,17),Kb(44,Xe,3,1,`app-notice`,18),Kb(45,Ue,3,1,`app-notice`),Kb(46,He,1,0,`mat-progress-bar`,19)(47,We,2,1,`app-notice`,18),Ea(48,`section`,20)(49,`div`,21)(50,`table`,22)(51,`thead`)(52,`tr`)(53,`th`,23),FS(54,`Wersja`),Vd(),Ea(55,`th`,23),FS(56,`Status`),Vd(),Ea(57,`th`,23),FS(58,`Data`),Vd(),Ea(59,`th`,23),FS(60,`Autor`),Vd(),Ea(61,`th`,23),FS(62,`Opis zmian`),Vd(),Ea(63,`th`,23),FS(64,`SHA-256`),Vd(),Ea(65,`th`,23)(66,`span`,24),FS(67,`Akcje`),Vd()()()(),Ea(68,`tbody`),nS(69,Qe,15,9,`tr`,25,Ge,!1,Ye,1,1),Vd()()()()()),e&2&&(fC(5),Fy(c.config.source()),fC(8),Jb(c.config.version()&&!c.config.publishedVersion()?13:-1),fC(13),vy(`value`,c.version()),fC(4),vy(`value`,c.author()),fC(6),vy(`value`,c.summary()),fC(),vy(`checked`,c.activateNow()),fC(3),vy(`disabled`,!c.canPublish()),fC(3),Jb(c.busy()?43:-1),fC(),Jb(c.actionError()?44:-1),fC(),Jb(c.message()?45:-1),fC(),Jb(c.loading()?46:c.error()?47:-1),fC(23),rS(c.releases()))},dependencies:[Dt,At,Fe,D,io,bn,Xe$1,Qe$1,vG,yG,je$1,qe$1,j,L$1,O,u],styles:[`tr.active[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{font-weight:700}.small[_ngcontent-%COMP%]{font-size:.8125rem}.form-row[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:12px}.version[_ngcontent-%COMP%], .author[_ngcontent-%COMP%]{flex:1 1 240px;max-width:360px}.summary[_ngcontent-%COMP%]{max-width:732px}.actions[_ngcontent-%COMP%]{text-align:right;white-space:nowrap}.pre[_ngcontent-%COMP%]{white-space:pre-wrap;overflow-wrap:anywhere}`]})};export{Oe as ReleasesPage};