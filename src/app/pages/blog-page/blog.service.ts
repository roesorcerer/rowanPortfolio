import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private postsUrl = 'assets/posts.json';  // URL to JSON file or API endpoint

  constructor(private http: HttpClient) { }

  getPosts(): Observable<any[]> {
    console.log('Fetching posts from:', this.postsUrl);
    return this.http.get<any[]>(this.postsUrl);
  }

  getPost(id: number): Observable<any> {
    return this.getPosts().pipe(
      map(posts => posts.find(post => post.id === id))
    );
  }
}
