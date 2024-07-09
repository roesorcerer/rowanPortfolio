import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from './blog.service';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.css']
})

export class BlogPageComponent implements OnInit {
  post: any;
  posts: any[] = [];
  isSinglePostView: boolean = false;

    constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) { }

ngOnInit(): void {
    const postIdParam = this.route.snapshot.paramMap.get('id');
    const postId = postIdParam ? +postIdParam : null;

    if (postId !== null && !isNaN(postId)) {
      this.isSinglePostView = true;
      this.fetchPost(postId);
    } else {
      this.isSinglePostView = false;
      this.fetchPosts();
    }
  }

  fetchPost(postId: number): void {
    this.blogService.getPost(postId).subscribe(data => {
      this.post = data;
      console.log('Fetched post:', this.post);
    }, error => {
      console.error('Error fetching post data:', error);
    });
  }

  fetchPosts(): void {
    this.blogService.getPosts().subscribe(data => {
      this.posts = data;
      console.log('Fetched posts:', this.posts);
    }, error => {
      console.error('Error fetching posts data:', error);
    });
  }
}