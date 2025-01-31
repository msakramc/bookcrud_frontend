import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface BookApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BookData[]; // results is an array of BookData
}

export interface BookData {
  id?: string;
  bookTitle: string;
  bookAuthor: string;
  bookYear: string;
  favId: string;
}

export interface FavData {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://127.0.0.1:8000/api/books/';
  private favapiUrl = 'http://127.0.0.1:8000/api/fav/';

  constructor(private http: HttpClient) {}

  getBooks(selectedFavouriteFilter: string, search: string, page: number): Observable<BookApiResponse> {
    const params = new HttpParams().set('favId', selectedFavouriteFilter).set('search', search).set('page', page);
    return this.http.get<BookApiResponse>(this.apiUrl,  { params });
  }

  addBook(book: BookData): Observable<boolean> {
    return this.http.post<BookApiResponse>(this.apiUrl, book).pipe(
      map(() => true), // Return true if successful
      catchError(() => of(false)) // Return false if an error occurs
    );
  }

  updateBook(id: string, book: BookData): Observable<boolean> {
    return this.http.post<BookApiResponse>(`${this.apiUrl}${id}/`, book).pipe(
      map(() => true), // Return true if successful
      catchError(() => of(false)) // Return false if an error occurs
    );;;
  }

  deleteBook(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      map(() => true), // Return true if successful
      catchError(() => of(false)) // Return false if an error occurs
    );
  }
  
  getFav(): Observable<FavData[]> {
    return this.http.get<FavData[]>(this.favapiUrl);
  }

  updateBookFav(id: string, favId: string): Observable<boolean> {
    const params = new HttpParams().set('favId', favId); 
    return this.http.post<void>(`${this.apiUrl}${id}/`, {}, { params }).pipe(
      map(() => true), // Return true if successful
      catchError(() => of(false)) // Return false if an error occurs
    );
  }

  deleteFav(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.favapiUrl}${id}/`).pipe(
      map(() => true), // Return true if successful
      catchError(() => of(false)) // Return false if an error occurs
    );
  }

  updateFav(id: string, fav: FavData): Observable<boolean> {
    return this.http.post<FavData>(`${this.favapiUrl}${id}/`, fav).pipe(
      map(() => true), // Return true if successful
      catchError(() => of(false)) // Return false if an error occurs
    );
  }

  addFav(fav: FavData): Observable<boolean> {
    return this.http.post<FavData>(this.favapiUrl, fav).pipe(
      map(() => true), // Return true if successful
      catchError(() => of(false)) // Return false if an error occurs
    );
  }
}
