import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeatSelectComponent } from './seat-select/seat-select.component';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'seat-select', component: SeatSelectComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
