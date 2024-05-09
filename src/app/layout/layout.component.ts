import { Component, AfterViewInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements AfterViewInit {
  ngAfterViewInit() {
    $("#text-rotater").textrotator({
      animation: "fade",
      separator: ",",
      speed: 2000
    });
  }
}
