import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent implements OnInit {
  hide = true;
  hideRepeat = true;
  httpCode = 0;

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    passwordRepeat: new FormControl('', [Validators.required])
  },
    {
      validators: [this.MatchPassword],
      updateOn: 'blur',
    });

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const authUrl = `${environment.apiUri}register`;
    const body = {
      'username': this.username,
      'email': this.email,
      'password': this.password
    }
    this.httpClient.post<any>(authUrl, body, { observe: 'response' }).subscribe(data => {
      this.httpCode = data.status;
    }, error => {
      this.httpCode = error.status;
    });
  }

  MatchPassword(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('password');
    const repeat = formGroup.get('passwordRepeat')

    if (!password || !repeat) {
      return null;
    }

    if (!password.value || !repeat.value) {
      return null;
    }

    if (password.value != repeat.value) {
      return { noMatch: true };
    }

    return null;
  }

  get username() {
    return this.registerForm.get('username').value;
  }

  get email() {
    return this.registerForm.get('email').value;
  }

  get password() {
    return this.registerForm.get('password').value;
  }

  get passwordRepeat() {
    return this.registerForm.get('passwordRepeat').value;
  }

}
