import { Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ThumbsDownComponent } from '@carbon/icons-angular';

@Component({
  selector: 'app-runlog-line',
  templateUrl: './runlog-line.component.html',
  styleUrls: ['./runlog-line.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RunlogLineComponent implements OnInit {

  @Input() line;

  @Input() ignoreCaps;

  element;

  @Input() searchText: string;

  constructor(el: ElementRef) { 
    this.element = el;
  }

  highlight(){

    let annotation: string = 'g'
    
    if(this.ignoreCaps === false){
      annotation = 'gi';
    }

    if(this.searchText != null && this.ignoreCaps === false){
      this.searchText = this.searchText.replace(/\s+/g, '');
    }

    if(!this.searchText){
      return this.line.content;
    }

    return this.line.content.replace(new RegExp(this.searchText, annotation), match=>{
      return '<mark>' + match + '</mark>';
    })


  }

  ngOnInit(): void {
  }

}
