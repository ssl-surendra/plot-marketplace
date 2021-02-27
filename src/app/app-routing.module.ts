import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThemeComponent } from './theme/theme.component';
const routes: Routes = [
  {
    path: "",
    component: ThemeComponent,
    children: [
      {
        path: '',
        loadChildren: () => import("./theme/pages/default/default.module").then((m) => m.DefaultModule)
      },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
