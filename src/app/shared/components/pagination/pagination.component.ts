import { Component, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryService } from '@services/query';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [PaginatorModule, NgIf],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent implements OnInit {
  public first: number = 0;
  public page: number = 0;
  public rows: number = 10;
  @Input() getData?: Function;
  @Input() totalPage!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private queryService: QueryService,
  ) {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => this.generateParametries());
  }

  ngOnInit() {
    if (typeof window !== 'undefined') this.firstPaginationQuery().then(() => {});
  }
  async firstPaginationQuery() {
    const activeQuery = {
      page: this.page + 1,
      page_size: this.rows,
      ...this.queryService.activeQueryList(),
    };
    if (!this.route.snapshot.queryParams['page'] || !this.route.snapshot.queryParams['page_size']) {
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: activeQuery,
      });
    }
    this.generateParametries();
  }

  generateParametries() {
    const { page, page_size } = this.route.snapshot.queryParams;
    this.page = Math.max((Number(page) || 1) - 1, 0);
    this.rows = Number(page_size) || this.queryService.defaultQuery.page_size;
    this.first = this.page * this.rows;
  }

  changePaginationQuery() {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.page + 1, page_size: this.rows },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        this.invokeFunction();
      });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first !== undefined ? event.first : 1;
    this.page = event.page !== undefined ? event.page : 1;
    this.rows = event.rows !== undefined ? event.rows : 10;
    this.changePaginationQuery();
  }

  invokeFunction = () => {
    if (this.getData) this.getData();
  };
}
