import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultComponent } from './default.component';

import { IndexComponent } from './index/index.component';
import { ProfileComponent } from './profile/profile.component';
import { AssetComponent } from './asset/asset.component';


const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [
      {
        path: "market",
        component: IndexComponent
      },
      {
        path: "account",
        component: ProfileComponent
      },
      {
        path: "account/:id",
        component: ProfileComponent
      },
      {
        path: "asset/:id",
        component: AssetComponent
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
