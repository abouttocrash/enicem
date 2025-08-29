import { Component, ElementRef, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { WaveSnack } from './wave-snack-service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'wave-snack',
  standalone: true,
  imports: [MatIconModule,CommonModule],
  templateUrl: './wave-snack.component.html',
  styleUrl: './wave-snack.component.scss'
})
export class WaveSnacku {
  snack = viewChild<ElementRef<HTMLDivElement>>("snack")
  constructor(public s:WaveSnack){}
  ngAfterViewInit(){
  }

  
  close(){
    this.s.dismissSnack()
  }
}
