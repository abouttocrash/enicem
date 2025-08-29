import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { gsap } from 'gsap';
import { WaveSnacku } from './wave-snack.component';
@Injectable({
  providedIn: 'root'
})
export class WaveSnack {
  public loading = true;
  icon$: BehaviorSubject<string> = new BehaviorSubject<string>('info');  
  public showsToast$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public toastMessage$: BehaviorSubject<string> = new BehaviorSubject<string>('');  
  private vcr!:ViewContainerRef
  private componentRef!: ComponentRef<WaveSnacku>
  private rotateTween!: gsap.core.Tween | undefined
  constructor() { }
  setViewContainerRef(vcr: ViewContainerRef) {
    this.vcr = vcr;
  }
  showSnack(msg:string){
    
    setTimeout(() => {
      this.icon$.next("info")
     
      if(!this.componentRef)
        this.componentRef = this.vcr.createComponent(WaveSnacku);
      this.showIcon()
      this.getIcon().classList.remove("error-icon")
      this.getIcon().classList.remove("success-icon")
      gsap.to(".snack", { y: -24,duration:.2 })
      if(!this.rotateTween)
        this.rotateTween = gsap.to(".progress", { rotation: 360,repeat:-1})
     
      this.toastMessage$.next(msg);    
      this.showsToast$.next(true);   
    },);
    
  }
  dismissSnack(): void {
   setTimeout(() => {
    gsap.to(".snack", { y: 70,duration:.2})
    this.showsToast$.next(false);
   },);
    
    
  }
  errorState(msg:string){
    this.hideIcon()
    this.toastMessage$.next(msg)
    this.icon$.next("emergency_home")
    this.getIcon().classList.add("error-icon")
  }
  successState(msg:string){
    
    this.hideIcon()
    this.toastMessage$.next(msg)
    this.icon$.next("check")
    this.getIcon().classList.add("success-icon")
  }
 

  private showIcon(){
    const matIcon = document.getElementById("loading-snack") as HTMLElement
    matIcon.style.removeProperty('display');
  }
  private hideIcon(){
    this.loading = false
    const matIcon = document.getElementById("loading-snack") as HTMLElement
    matIcon.style.display = "none"
  }

  getIcon(){
    return document.getElementById("icon-snack") as HTMLElement
  }

  timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
