import { Injectable } from '@angular/core';
import { QueryList } from '@services/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class QueryService {
  public defaultQuery = {
    page: 1,
    page_size: 10,
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  activeQueryList(): QueryList {
    return { ...(this.route.snapshot.queryParams || {}) };
  }

  activeQueryListWithoutDefault() {
    const { page, page_size, ...query } = this.activeQueryList();

    return query;
  }
  activeQueryWithDefaut() {
    const query = this.activeQueryList();
    return Object.keys(query).length == 0 ? this.defaultQuery : query;
  }

  generatorHttpParamsWithDefault() {
    return this.requestHttpParams(this.activeQueryWithDefaut());
  }
  requestHttpParams(object: { [p: string]: any }): HttpParams {
    return this.generatorHttpParams(object);
  }

  generatorHttpParams(object: { [p: string]: any }): HttpParams {
    let params = new HttpParams();
    for (let [key, value] of Object.entries(object)) {
      if (value === null || value === undefined || value === '') continue;
      if (key === 'transports') {
        (Array.isArray(value) ? value : [value]).forEach((elem) => {
          if (elem !== null && elem !== undefined && elem !== '') params = params.append(`transports[]`, elem.toString());
        });
      } else {
        params = params.append(key, value.toString());
      }
    }
    return params;
  }
  generatorCustomQuery(e: any) {
    let query = { ...this.activeQueryList() };
    Object.entries(e).forEach(([name, value]) => {
      if (value === null || value === undefined) {
        delete query[name];
      } else {
        query[name] = value;
      }
    });
    return query;
  }

  updateCustomQuery = (e: any, func?: Function) => {
    const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    return this.router
      .navigate([], {
        queryParams: this.generatorCustomQuery(e),
      })
      .then(() => {
        if (typeof window !== 'undefined') setTimeout(() => window.scrollTo(scrollX, scrollY), 0);
        if (func) func();
      });
  };
  clearFilter = (func: Function) => {
    return this.router
      .navigate([], {
        queryParams: this.defaultQuery,
      })
      .then(() => {
        if (func) func();
      });
  };
  clearFilterWithOutDefault = (func: Function) => {
    return this.router
      .navigate([], {
        queryParams: {},
      })
      .then(() => {
        if (func) func();
      });
  };
}
