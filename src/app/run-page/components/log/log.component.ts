import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  @Input() set runlog(input: string){
    var logArray = input.split('\n');
    var i = 0;
    for(let line in logArray){
      this.lines.push({"num":this.pad(i+1), "content": logArray[line].trim()});
      i++
    }
  };

  @Input() ignoreCaps:boolean;

  @Input() searchText:string;

  newLog: string;

  lines: {}[] = [];

  constructor() { }

  ngOnInit(): void {

  }

  pad(number){
    if(number <= 99999){number = ("0000" + number).slice(-5);}
    return number;
  }

  ngOnChanges(changes: SimpleChanges){
    console.log(this.ignoreCaps);
  }

}
