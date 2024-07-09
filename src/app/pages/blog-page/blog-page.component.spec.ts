import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { BlogPageComponent } from './blog-page.component';
import { BlogService } from './blog.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BlogPageComponent', () => {
  let component: BlogPageComponent;
  let fixture: ComponentFixture<BlogPageComponent>;
  let blogService: BlogService;
  let mockActivatedRoute: { snapshot: any; };

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => null // Initially testing for the list view
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ BlogPageComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [
        BlogService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPageComponent);
    component = fixture.componentInstance;
    blogService = TestBed.inject(BlogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and display a list of posts', () => {
    spyOn(blogService, 'getPosts').and.returnValue(of([
      { id: 1, title: 'Test Post 1', date: '2024-01-01', category: 'Category 1', excerpt: 'Excerpt 1' },
      { id: 2, title: 'Test Post 2', date: '2024-01-02', category: 'Category 2', excerpt: 'Excerpt 2' }
    ]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.posts.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.col-md-6').length).toBe(2);
  });

  it('should fetch and display a single post when ID is present', () => {
    mockActivatedRoute.snapshot.paramMap.get = (key: string) => '1';
    spyOn(blogService, 'getPost').and.returnValue(of({
      id: 1, title: 'Test Post 1', date: '2024-01-01', category: 'Category 1', content: 'Content 1'
    }));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.post).toBeTruthy();
    expect(component.post.id).toBe(1);
    expect(fixture.nativeElement.querySelector('.col-md-12')).toBeTruthy();
  });
});
