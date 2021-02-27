import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultComponent } from './default.component';

import { IndexComponent } from './index/index.component';


const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [
      {
        path: "market",
        component: IndexComponent
      },
      { path: '', redirectTo: 'market', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DefaultRoutingModule { }
