import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const uri = 'http://localhost:9090/graphql'; // <-- add the URL of the GraphQL server here

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {

  /* Configured default header to intercept the requests */
  const auth = setContext((operation, context) => {
    /* To send headers for custom requests */
    if (operation.operationName === 'FetchPosts') {
      /* Read from local storage */
      const token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmJkZDM5ZmJmYWZiZThiYzVlMzUyNjciLCJlbWFpbCI6ImFtYW5AZ21haWwuY29tIiwiaWF0IjoxNjU2NzY1NjkyLCJleHAiOjE2NTY4NTIwOTJ9.gQ6IRMNRI1lpMUuHPN8583r2vrIFKP9bd3uLs247dOY`;

      if (token === null) {
        return {};
      } else {
        return {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          }
        };
      }
    } else {
      return {};
    }
  });

  const http = httpLink.create({ uri });

  /* Handled Error thrown by graphql server, "AFTERWARE" */
  const error = onError(({ networkError, operation, graphQLErrors }) => {

    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );

    console.log('NETWORK ERROR ==== ', networkError);
    console.log('EXECUTED OPERATION ==== ', operation);
    // if (networkError?.status === '') {
    // Logout the user
    // }

  });

  /* Apollo link act as a middleware or you can say a interceptor */
  const link = error.concat(ApolloLink.from([auth, http])); // concatenated all the middlewares
  const cache = new InMemoryCache();

  return {
    link,
    cache
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule { }
