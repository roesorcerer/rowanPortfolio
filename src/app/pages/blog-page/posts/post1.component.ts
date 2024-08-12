import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../blog.service';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';

@Component({
  selector: 'app-post1',
  templateUrl: './post1.component.html',
  styleUrls: ['./post1.component.css']
})
export class Post1Component implements OnInit {
  post: any;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.blogService.getPosts().subscribe(posts => {
        this.post = posts.find(p => p.id === id);
        if (this.post) {
          this.loadMarkdownContent(this.post.markdownFile);
        }
      });
    } else {
      console.error('Post ID is null');
    }
  }

  loadMarkdownContent(markdownFile: string): void {
    this.http.get(`assests/posts/${markdownFile}`, { responseType: 'text' }).subscribe(markdown => {
      this.post.content = marked(markdown);
    });
  }
}