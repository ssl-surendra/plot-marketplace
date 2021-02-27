import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderNavComponent } from './header-nav/header-nav.component';


@NgModule({
  declarations: [HeaderNavComponent],
  exports: [HeaderNavComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class LayoutModule { }
