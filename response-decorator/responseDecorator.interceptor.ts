import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ControllerResponse, Links, Response } from './responses.interface';
import { configService } from '../../config.service';

@Injectable()
export class ResponseDecorator<T>
  implements NestInterceptor<T, Promise<Response>>
{
  /**
   * This interceptor is called after returning response from every controller,
   * and is responsible about:
   *  - putting received data from controller into the response
   *  - generating pagination info, based on total value
   *  - message translation
   *
   * @param context
   * @param next
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<unknown>> {
    return next.handle().pipe(
      map(async (controllerResponse: ControllerResponse): Promise<any> => {
        // Extract request and response from the context
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        // Extract some values from controller's response
        const { data, total } = controllerResponse;

        // Set the http-status
        const httpStatus = controllerResponse.httpStatus || HttpStatus.OK;

        // Init the status
        const status =
          httpStatus >= 200 && httpStatus < 400 ? 'success' : 'fail';

        // Init the message
        const message = controllerResponse.message || 'OK';

        // Generate pagination if total is more than 0
        let links = undefined;
        let page = undefined;
        let limit = undefined;
        if (total) {
          const pagination = ResponseDecorator.generateLinks(request, total);
          links = pagination.links;
          page = pagination.page;
          limit = pagination.limit;
        }

        // Modify the response
        response.statusCode = httpStatus;

        // Return response
        return {
          status,
          message,
          data,
          total,
          page,
          limit,
          links,
        };
      }),
    );
  }

  /**
   * Generate links for pagination
   *
   * @param request
   * @param total
   */
  private static generateLinks(
    request: Request,
    total,
  ): {
    links: Links;
    page: number;
    limit: number;
  } {
    let url = configService.get<string>('SERVICE_URL') + request.url;

    // Check the question mark
    if (!url.endsWith('?') && (url.match(/\?/g) || []).length < 1) {
      url += '?';
    }

    // Initial the limit value
    let limit = +request.query.limit;
    if (!limit || limit < 1) {
      limit = +configService.get<number>('DEFAULT_PAGINATION_LIMIT');
      url = url + `&limit=${limit}`;
    }

    // Initial the page value
    let currentPage = +request.query.page;
    if (!currentPage || limit < 1) {
      currentPage = 1;
      url = url + `&page=${currentPage}`;
    }

    // Remove unused question mark from the end of url
    if (url.endsWith('?')) {
      url = url.slice(0, -1);
    }

    // Calculate other page-numbers
    const lastPageNumber = Math.ceil(total / limit);
    const nextPageNumber =
      currentPage < lastPageNumber ? currentPage + 1 : undefined;
    const prevPageNumber = currentPage > 1 ? currentPage - 1 : undefined;

    // Generate the links
    const links: Links = {
      current: url,
      last: url.replace(/page=[^d]/, `page=${lastPageNumber}`),
      first: url.replace(/page=[^d]/, `page=${1}`),
    };

    if (prevPageNumber) {
      links.prev = url.replace(/page=[^d]/, `page=${prevPageNumber}`);
    }
    if (nextPageNumber) {
      links.next = url.replace(/page=[^d]/, `page=${nextPageNumber}`);
    }

    return {
      links,
      page: currentPage,
      limit,
    };
  }
}
