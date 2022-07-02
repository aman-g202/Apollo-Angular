import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { gql } from '@apollo/client/core'
import { Apollo } from 'apollo-angular';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-apollo-client';
  loading: boolean = false;
  error: any = '';
  posts: any[] = [];
  token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmJkZDM5ZmJmYWZiZThiYzVlMzUyNjciLCJlbWFpbCI6ImFtYW5AZ21haWwuY29tIiwiaWF0IjoxNjU2NzY1NjkyLCJleHAiOjE2NTY4NTIwOTJ9.gQ6IRMNRI1lpMUuHPN8583r2vrIFKP9bd3uLs247dOY`;

  POST_FIELDS = gql`
    fragment POST_FIELDS on Post {
      _id
      title
      content
      creator {
        _id
        name
        email
      }
      imageUrl
      updatedAt
    }
  `;

  constructor(private _apolloClient: Apollo) {
    this.fetchPosts();
  }

  fetchPosts = () => {
    this.loading = true;
    this._apolloClient.watchQuery<any>({
      query: gql`
        query FetchPosts($page: Int = 1) {
          posts(page: $page) {
            posts {
              ...POST_FIELDS
            }
            totalPosts
          }
        }
        ${this.POST_FIELDS}
      `,
      variables: {
        page: 1,
      },
      context: {
        headers: new HttpHeaders().set("Authorization", this.token), // Passed additional custom header
      },
    }).valueChanges.subscribe({
      next: (result: any) => {
        this.posts = result?.data?.posts.posts;
        this.loading = result.loading;
        this.error = result.error;
        console.log('Logging Fetch Posts Query----', this.posts, this.loading, this.error);
      }
    });
  };

}
