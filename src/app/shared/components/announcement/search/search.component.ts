import {Component, Input, OnInit} from '@angular/core';
import {CheckboxModule} from "primeng/checkbox";
import {FormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {TransportsService} from "../../../../core/services/transports/transports.service";
import {QueryService} from "../../../../core/services/query/query.service";
import {Router} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {HttpParams} from "@angular/common/http";
import {FilterForm} from "../../../../core/interfaces/common.interface";
import {MultiSelectModule} from "primeng/multiselect";

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CheckboxModule,
    AutoCompleteModule,
    FormsModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  @Input() getData!: Function;
  @Input() loading!: boolean;
  @Input() url: string | undefined;
  public transports: any[] | undefined = [];
  public selectedCities: any = []

  constructor(
    private transportsService: TransportsService,
    private queryService: QueryService,
    private router: Router
  ) {
  }
  async onClear() {
    let query: any = {...this.queryService.activeQueryList()}
    if (query['transports']) query.transports = []

    this.queryService.updateCustomQuery(query, this.getData).then(() => {
    })
  }
  onChange(event: any) {
    let query: any = {...this.queryService.activeQueryList()}
    if (query['transports'])
      query.transports = query.transports.filter((elem: string) => elem !== event.itemValue.ri)
    this.queryService.updateCustomQuery(query, this.getData).then(() => {
    })
  }

  ngOnInit() {
    if (typeof window !== 'undefined')
      this.transportsService.get().subscribe((response) => {
        this.transports = response;
        let query: any = {...this.queryService.activeQueryList()}
        if(query?.transports) {
          query?.transports.forEach((elem: string) => {
            this.selectedCities.push(this.transports?.find((item: any) => item.ri === elem))
          })
          this.selectedCities = [...this.selectedCities]
        }
      });


  }
  filterSend() {
    let params = new HttpParams();

    let query = {...this.queryService.activeQueryList()};
    query['transports'] = this.selectedCities.map((elem: any) => elem.ri);
 if(this.url) {
   this.router.navigate([this.url], {
     queryParams: query,
   }).then(() => this.getData())
 } else {
   this.router.navigate([], {
     queryParams: query,
   }).then(() => this.getData())
 }

  }

}
