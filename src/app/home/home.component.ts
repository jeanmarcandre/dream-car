import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onLogin(): void {
    // Renvoie vers la page dashboard grace a la methode interne "navigate"
    this.router.navigate(['/admin/dashboard']);
    // this.router.navigateByUrl('/admin/dashboard');
  }

}
