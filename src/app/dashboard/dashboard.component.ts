import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface MangaElement {
  name: string;
  completion: number;
  currentChapter: number;
  lastChapter: number;
  tag: string;
  url: string;
  favorite: boolean;
}

export interface StatElement {
  mangasFinished: number,
  mangasOnGoing: number,
  chaptersRead: number,
  chaptersUnread: number
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  allData:[];
  elementData: MangaElement[] = []
  dataSource: any;
  allMangas: boolean = false;
  isChecked = true;
  lastUpdate: any = null;
  userStats: StatElement = <StatElement>{};

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    if (localStorage.getItem('token') == null) {
      localStorage.clear();
      this.router.navigate(['login']);
    }
    this.loadMangas(this.allMangas);
    this.getLastUpdate();
  }

  loadMangas(all: boolean) {
    const url = `${environment.apiUri}mangas-user?username=${localStorage.getItem('username')}`
    this.httpClient.get<any>(url).subscribe(data => {
      this.allData = data;
      this.fillTable(all, data);
      this.getUserStats();
    }, error => {
      console.log(error);
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }

  fillTable(all: boolean, data: any) {
    this.elementData = [];
    let mangaTags = [];
    localStorage.setItem('mangas', JSON.stringify(mangaTags));
    for (let element in data) {
      let currentChapter: number = data[element].lastRead;
      let lastChapter: number = data[element]['manga'].lastChapter;
      mangaTags.push(data[element]['manga'].tag);
      if (!all && currentChapter >= lastChapter) { continue; }

      this.elementData.push({
        name: data[element]['manga'].name,
        completion: Math.trunc((currentChapter / lastChapter) * 100),
        currentChapter: (data[element].lastRead == null) ? 0 : data[element].lastRead,
        lastChapter: data[element]['manga'].lastChapter,
        tag: data[element]['manga'].tag,
        url: this.getLink(data[element]['manga'].tag, data[element].url),
        favorite: data[element].favorite
      })
    }
    localStorage.setItem('mangas', JSON.stringify(mangaTags));
    this.dataSource = new MatTableDataSource(this.elementData);
    this.dataSource.sort = this.sort;
  }

  checkboxUpdate() {
    this.fillTable(!this.isChecked, this.allData);
  }

  deleteManga(name: string, tag: string){
    const url = `${environment.apiUri}mangas-user/${tag}?username=${localStorage.getItem('username')}`;
    this.httpClient.delete(url).subscribe(data => {
      this.loadMangas(!this.isChecked);
      this.openSnackBar(`${name} a bien été retiré de votre liste.`);
    }, error => {
      console.log(error);
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }

  favManga(tag: string, favorite: boolean){
    const url = `${environment.apiUri}mangas-user/${tag}?username=${localStorage.getItem('username')}`;
    this.httpClient.patch(url, { 'favorite': !favorite }).subscribe(data => {
      this.loadMangas(!this.isChecked);
    }, error => {
      console.log(error);
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }

  getLink(tag: string, url: string) {
    if (url) {
      return url;
    }
    return `http://fanfox.net/manga/${tag}/`;
  }

  getLastUpdate() {
    const url = `${environment.apiUri}last_update`;
    this.httpClient.get(url).subscribe(data => {
      this.lastUpdate = data;
    }, error => {
      console.log(error);
    });
  }

  updateLastRead(tag: string, newValue: any) {
    const url = `${environment.apiUri}mangas-user/${tag}?username=${localStorage.getItem('username')}`;
    this.httpClient.patch(url, { 'last_read': newValue }).subscribe(data => {
      this.loadMangas(!this.isChecked);
    }, error => {
      console.log(error);
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  getUserStats() {
    let data: any = this.allData;
    let totalChapters: number = 0;
    let chaptersRead: number = 0;
    this.userStats = <StatElement>{
      mangasFinished: 0,
      mangasOnGoing: 0,
      chaptersRead: 0,
      chaptersUnread: 0
    };
    for (let element in this.allData) {
      if (data[element].lastRead >= data[element]['manga'].lastChapter) {
        this.userStats.mangasFinished++;
      }
      totalChapters += data[element]['manga'].lastChapter;
      chaptersRead += data[element].lastRead;
    }
    this.userStats.mangasOnGoing = data.length - this.userStats.mangasFinished;
    this.userStats.chaptersRead = Math.trunc(chaptersRead);
    this.userStats.chaptersUnread = Math.trunc(totalChapters - chaptersRead);
  }

  displayedColumns: string[] = ['favorite', 'name', 'completion', 'currentChapter', 'lastChapter', 'deleteManga'];
}
