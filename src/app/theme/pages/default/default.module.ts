import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../layouts/layout.module';
import { DefaultRoutingModule } from './default-routing.module';
import { DefaultComponent } from './default.component';

import { HttpClientModule } from "@angular/common/http"

import { IndexComponent } from "./index/index.component";
import { ProfileComponent } from './profile/profile.component';


import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DefaultComponent,
    IndexComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule, LayoutModule, DefaultRoutingModule, HttpClientModule, FormsModule
  ]
})
export class DefaultModule { }
