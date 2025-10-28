import { Injectable } from '@angular/core';
type Theme = {
  icon:string,
  tooltip:string,
  mode: "LIGHT" | "DARK",
  color:string
}
@Injectable({
  providedIn: 'root'
})
export class StylesService {
  isMobile = false;
  private readonly modes:Theme[] = [
    {
      icon:"light_mode",
      tooltip:"Light mode",
      mode:"DARK",
      color:"#f6bd60"
    },
    {
      icon:"dark_mode",
      tooltip:"Dark mode",
      mode:"LIGHT",
      color:"#4a4e69"
    },
  ]
  currentMode = this.modes[0]
  constructor() {
    const storageMode = JSON.parse(localStorage.getItem("mode")!) as Theme
    if(storageMode == null)
      this.currentMode = this.modes[1]
    else
      this.currentMode = storageMode
      this.checkDevice()
  }

  checkDevice(){
    var ua = navigator.userAgent;
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua))
      this.isMobile = true

    else
      this.isMobile = false

  }

  changeMode(){
     this.currentMode = this.currentMode.mode == "LIGHT" ? this.modes[0]:this.modes[1]
     this.setMode()
  }

  setMode(){
    const classList = document.querySelector("body")!.classList
   
    
    if(this.currentMode.mode == "LIGHT"){
      classList.remove("theme-dark")
      classList.add("theme-light")
    }
    else{
      classList.remove("theme-light")
      classList.add("theme-dark")
    }
    localStorage.setItem("mode",JSON.stringify(this.currentMode))
  }
}