  import {Component, Input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {CheckboxModule} from "primeng/checkbox";
import {FormsModule} from "@angular/forms";
import {InputNumberModule} from "primeng/inputnumber";
import {ButtonModule} from "primeng/button";
import {SliderModule} from "primeng/slider";
import {FilterForm} from "@services/interfaces";
import {QueryService} from "@services/query";

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    CheckboxModule,
    InputNumberModule,
    ButtonModule,
    SliderModule,
    NgIf
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent implements OnInit {
  public sliderValue: number[] = [0, 4000000];
  public tab: number = 1;
  public filterForm: FilterForm = {
    conditioner: false,
    partnership: false,
    washing_machine: false,
    need_people_count: 1,
    total_price__gte: 0,
    total_price__lte: 4000000,
    room_count: 1,
  };
  public tabOptions = [
    {
      name: "Ixtiyoriy sozlash",
      id: 1,
    },
    {
      name: "Oila uchun",
      id: 2,
    },
    {
      name: "Komandirovka",
      id: 3,
    },
  ];
  @Input() filterAction!: Function
  @Input() clearFilterAction!: Function;
  @Input() loading!: boolean;
  @Input() close: Function | undefined;

  constructor(private queryService: QueryService) {
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      let query = this.queryService.activeQueryList()
      for (let item in this.filterForm) {
        this.filterForm[item as keyof FilterForm] = typeof query[item] === 'string' && JSON.parse(query[item]) || this.filterForm[item as keyof FilterForm]
      }
      this.sliderValue[0] = Number(this.filterForm.total_price__gte);
      this.sliderValue[1] = Number(this.filterForm.total_price__lte);
    }

  }

  closeBottomSheet() {
    if (this.close !== undefined)
      this.close()
  }

  filterSend() {
    this.filterForm.total_price__gte = this.sliderValue[0];
    this.filterForm.total_price__lte = this.sliderValue[1];
    this.filterAction(this.filterForm)
  }

  clearFilter() {
    this.clearFilterAction()
    this.filterForm = {
      conditioner: false,
      partnership: false,
      washing_machine: false,
      need_people_count: 1,
      total_price__gte: 0,
      total_price__lte: 4000000,
      room_count: 1,
    };
    this.sliderValue = [0, 4000000];
  }
}
