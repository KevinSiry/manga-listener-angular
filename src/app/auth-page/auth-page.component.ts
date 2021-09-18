import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent implements OnInit {
  hide = true;
  httpCode: number;

  signupForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl()
  });

  constructor(private httpClient: HttpClient, private router: Router) { }

  ngOnInit(): void {
    if (localStorage.getItem('token') != null){
      this.router.navigate(['dashboard']);
    }
  }

  onSubmit() {
    const authUrl = `${environment.apiUri}user/login/`
    const body = { username: this.username, password: this.password };
    this.httpClient.post<any>(authUrl, body).subscribe(data => {
      this.httpCode = data.status;
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      localStorage.setItem('staff', data.isStaff)
      this.router.navigate(['dashboard']);
    }, error => {
      this.httpCode = error.status;
    });
  }

  goRegister() {
    console.log('test');
    this.router.navigate(['register']);
  }

  get username() {
    return this.signupForm.get('username').value;
  }

  get password() {
    return this.signupForm.get('password').value;
  }

}
