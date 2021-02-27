import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: '.wrapper',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, AfterViewInit {

  constructor() {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

}
