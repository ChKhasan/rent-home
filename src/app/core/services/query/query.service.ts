import {Injectable} from '@angular/core';
import {QueryList} from "../../interfaces/common.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  public defaultQuery = {
    page: 1,
    page_size: 10
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  activeQueryList() {
    let query: QueryList = {};
    this.route.queryParams.subscribe(params => {
      query = params || {}
    });
    return query
  }

  activeQueryWithDefaut() {
    return Object.keys(this.activeQueryList()).length == 0 ? this.defaultQuery : this.activeQueryList()
  }

  generatorHttpParamsWithDefault() {
    return this.generatorHttpParams(this.activeQueryWithDefaut())
  }
  generatorHttpParams(object: { [p: string]: any }): HttpParams {
    let params = new HttpParams();
    for (let [key, value] of Object.entries(object)) {
      if (key === 'transports') {
        if (typeof value === 'string') {
          params = params.append(`transports[]`, value);
        } else if (Array.isArray(value)) {
          value.forEach(elem => {
            params = params.append(`transports[]`, elem.toString());
          });
        }
      } else {
        params = params.append(key, value.toString());
      }
    }
    return params;
  }
  generatorCustomQuery(e: any) {
    let query = {...this.activeQueryList()};
    Object.entries(e).forEach(([name, value]) => {
      query[name] = value;
    });
    return query
  }

  updateCustomQuery = (e: any, func?: Function) => {
    return new Promise<void>((resolve, reject) => {
      this.router.navigate([], {
        queryParams: this.generatorCustomQuery(e),
      }).then(() => {
        if (func) {
          func();
        }
        resolve();
      }).catch(err => {
        reject(err);
      });
    })
  }
  clearFilter = (func: Function) => {
    return new Promise((resolve, reject) => {
      this.router.navigate([], {
        queryParams: this.defaultQuery,
      }).then(() => {
        if (func) {
          func();
        }
      })
    })
  }
  clearFilterWithOutDefault = (func: Function) => {
    return new Promise((resolve, reject) => {
      this.router.navigate([], {
        queryParams: {},
      }).then(() => {
        func();
      })
    })
  }
}
