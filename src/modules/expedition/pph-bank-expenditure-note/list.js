import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';
import numeral from 'numeral';

@inject(Router, Service)
export class List {
    context = ["Rincian", "Cetak PDF"];
    columns = [
        { field: "No", title: "No Bukti Pengeluaran Bank" },
        {
            field: "Date",
            title: "Tanggal",
            formatter: function(value, data, index) {
                return moment.utc(value).local().format('DD MMM YYYY');
            },
        },
        { field: "BankAccountName", title: "Bank" },
        { field: "IncomeTaxName", title: "Pasal PPH" },
        { field: "IncomeTaxRate", title: "Rate PPH (%)" },
        {
            field: "TotalIncomeTax",
            title: "Total PPH",
            formatter: function(value, data, index) {
                return numeral(value).format('0,000.00');
            },
        },
        {
            field: "TotalDPP",
            title: "Total DPP",
            formatter: function(value, data, index) {
                return numeral(value).format('0,000.00');
            },
        },
        { field: "Currency", title: "Mata Uang" },
        { field: "UnitPaymentOrderList", title: "No SPB", sortable: false, width: '200px' }
    ];

    loader = (info) => {
        let order = {};
        if (info.sort)
            order[info.sort] = info.order;

        let arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order
        };

        return this.service.search(arg)
            .then(result => {
                for (let data of result.data) {
                    data.UnitPaymentOrderList = data.Items.map((item) => {
                        return "- " + item.UnitPaymentOrderNo;
                    });
                    data.UnitPaymentOrderList = data.UnitPaymentOrderList.join("<br>");
                }

                return {
                    total: result.info.total,
                    data: result.data
                }
            });
    }

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.buyerId = "";
        this.buyers = [];
    }

    contextCallback(event) {
        let arg = event.detail;
        let data = arg.data;
        switch (arg.name) {
            case "Rincian":
                this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "Cetak PDF":
                this.service.getPdfById(data.Id);
                break;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}