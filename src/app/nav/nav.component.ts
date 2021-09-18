import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  users: string;
  staff: boolean;

  constructor(private router: Router, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.users = localStorage.getItem('username');
    this.staff = JSON.parse(localStorage.getItem('staff'));
    if (localStorage.getItem('token') == null){
      localStorage.clear();
      this.router.navigate(['login']);
    }
  }

  logout() {
    const authUrl = `${environment.apiUri}user/logout/`
    this.httpClient.get<any>(authUrl).subscribe(data => {
      localStorage.clear();
      this.router.navigate(['login']);
    }, error => {
      console.log(error);
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }

  updateAllMangas() {
    const url = `${environment.apiUri}mangas-update?username=${localStorage.getItem('username')}`;
    this.httpClient.get(url).subscribe(data => {
      window.location.reload();
    }, error => {
      console.log(error);
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }
}
