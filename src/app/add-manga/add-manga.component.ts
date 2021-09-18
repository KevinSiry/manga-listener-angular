import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface SearchElement {
  name: string;
  lastChapter: number,
  tag: string,
  icon: string
}

@Component({
  selector: 'app-add-manga',
  templateUrl: './add-manga.component.html',
  styleUrls: ['./add-manga.component.css']
})
export class AddMangaComponent implements OnInit {
  dataSource: any;
  elementData: SearchElement[] = []
  searchValue: string = "";
  mangas = JSON.parse(localStorage.getItem('mangas'));

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  loadMangas() {
    this.elementData = [];
    if (this.searchValue.length >= 3) {
      const url = `${environment.apiUri}mangas?search=${this.searchValue}`
      this.httpClient.get<SearchElement>(url).subscribe(data => {
        for (let element in data) {
          this.elementData.push({
            name: data[element].name,
            lastChapter: data[element].lastChapter,
            tag: data[element].tag,
            icon: this.isMangaAlreadyAdded(data[element].tag) ? 'done' : 'add'
          });
        }
        this.dataSource = new MatTableDataSource(this.elementData);
      }, error => {
        console.log(error);
        localStorage.clear();
        this.router.navigate(['login']);
      });
    }
  }

  isMangaAlreadyAdded(tag: string) {
    if (this.mangas.includes(tag)) {
      return true;
    }
    return false;
  }

  addManga(name: string, tag: string) {
    const url = `${environment.apiUri}manga?username=${localStorage.getItem('username')}`;
    this.httpClient.post(url, { tag: tag }).subscribe(data => {
      this.openSnackBar(`${name} a bien été ajouté à votre liste.`)
      this.searchValue = "";
      this.dataSource = new MatTableDataSource([]);
    }, error => {
      console.log(error);
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  displayedColumns: string[] = ['name', 'lastChapter', 'addManga'];
}
