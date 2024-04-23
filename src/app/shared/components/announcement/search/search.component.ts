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
  public transports: any[] | undefined = [];
  public filteredList!: any[]
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
    console.log(this.selectedCities)
    let params = new HttpParams();

    let query = {...this.queryService.activeQueryList()};
    query['transports'] = this.selectedCities.map((elem: any) => elem.ri);

    this.router.navigate([], {
      queryParams: query,
    }).then(() => this.getData())
  }


  // const formData = {
  //   params: {
  //     url: `https://uz.easyway.info/ajax/en/tashkent/routes`,
  //   },
  // };

  // __GET_ALL_LOCATICONS (formBusData: any)  {
  //    // loadingBus.value = true;
  //   this.transportsService.getAll(formBusData).subscribe((res) => {
  //      console.log(res);
  //     const locations = Object.values(res?.routes);
  //     let allLocations = locations;
  //     let types: any = {
  //       Bus: "BUS",
  //       Marshrutka: "MARSHUTKA",
  //       Subway: "METRO",
  //     };
  //     let formatTransports =  allLocations.map((elem: any) => {
  //       return {
  //         name: elem?.rn,
  //         type: types[elem?.tn],
  //         ri: elem.ri
  //       };
  //     });
  //     console.log("all",formatTransports);
  //     Promise.all([...formatTransports.map((trans) => this.__PORT_TRANSPORTS(trans))]);
  //
  //    });
  // const locations = Object.values(busData?.data?.routes);
  // allLocations = locations;
  // let types = {
  //   Bus: "BUS",
  //   Marshrutka: "MARSHUTKA",
  //   Subway: "METRO",
  // };
  // formatTransports = await allLocations.map((elem) => {
  //   return {
  //     name: elem.rn,
  //     type: types[elem.tn],
  //     ri: elem.ri
  //   };
  // });
  // console.log(formatTransports);

  // };
  //  __PORT_TRANSPORTS  (formData: any)  {
  // this.transportsService.postAll(formData).subscribe((res) => {
  //   console.log(res)
  // });

// };
}
