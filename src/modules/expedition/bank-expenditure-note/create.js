import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Dialog } from '../../../components/dialog/dialog';
import { Router } from 'aurelia-router';
import { AzureService } from './service';
import { activationStrategy } from 'aurelia-router';

import SupplierLoader from '../../../loader/supplier-loader';
import BankLoader from '../../../loader/account-banks-loader';

import CurrencyLoader from '../../../loader/garment-currency-loader';

import Service from './service';

@inject(Router, Service, Dialog)
export class Create {
    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    formOptions = {
        cancelText: 'Kembali',
        saveText: 'Simpan',
    };

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
        this.data = {};
        if (!this.IDR || this.sameCurrency) {
            this.collection = {
                columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', ''],
            };
        }
        else {
            this.collection = {
                columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', ''],
            };
        }
        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency
        };

    }

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    onCheckAll(event) {
        for (var item of this.UPOResults) {
            item.Select = event.detail.target.checked;
        }
    }

    saveCallback(event) {
        this.data.Details = this.UPOResults.filter((detail) => detail.Select);
        if (this.data.CurrencyRate == "") {
            this.data.CurrencyRate = 0;
        }
        var dataPrep = this.data;
        this.dialog.prompt("Apakah anda yakin akan menyimpan data?", "Simpan Data")
            .then(response => {
                if (response == "ok") {
                    this.service.create(this.data)
                        .then(result => {
                            alert('Data berhasil dibuat');
                            this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
                        })
                        .catch(e => {
                            this.error = e;
                        });
                }
            });
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get bankLoader() {
        return BankLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    @bindable selectedSupplier;
    async selectedSupplierChanged(newVal, oldVal) {
        this.data.Supplier = newVal;
        if (newVal) {
            if (this.selectedBank && this.selectedBank.Currency.Code) {
                var currency= this.data.CurrencyCode ? this.data.CurrencyCode : this.selectedBank.Currency.Code;
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: JSON.stringify({ "Position": 7, "SupplierCode": newVal.code, "Currency": currency, "IsPaid": false }) //CASHIER DIVISION
                };

                this.UPOResults = await this.service.searchAllByPosition(arg)
                    .then((result) => {
                        let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

                        return resultData;
                    });
            }
        } else {
            if (this.selectedBank && this.selectedBank.Currency.Code) {
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: JSON.stringify({ "Position": 7, "Currency": this.selectedBank.Currency.Code, "IsPaid": false }) //CASHIER DIVISION
                };

                this.UPOResults = await this.service.searchAllByPosition(arg)
                    .then((result) => {
                        let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

                        return resultData;
                    });
            }
        }
        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency
        };
    }

    @computedFrom("selectedBank && selectedSupplier")
    get isExistBankAndSupplier() {
        if (this.selectedBank && this.selectedSupplier)
            return true;
        else
            return false;
    }

    @bindable selectedBank;
    // isExistBankAndSupplier = false;
    UPOResults = [];
    currency = "";
    async selectedBankChanged(newVal) {
        this.data.Bank = newVal;
        this.IDR = false;
        if (newVal) {

            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: this.selectedSupplier && this.selectedSupplier.code ? JSON.stringify({ "Position": 7, "SupplierCode": this.selectedSupplier.code, "Currency": newVal.Currency.Code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": newVal.Currency.Code, "IsPaid": false }) //CASHIER DIVISION
                };

                this.UPOResults = await this.service.searchAllByPosition(arg)
                    .then((result) => {
                        let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

                        return resultData;
                    });
            }


            // this.isExistBankAndSupplier = true;
            this.currency = newVal.Currency.Code;
            if (this.currency == "IDR") {
                this.IDR = true;
            }
            if (!this.IDR || this.sameCurrency) {
                this.collection = {
                    columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', ''],
                };
            }
            else {
                this.collection = {
                    columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', ''],
                };
            }
            this.collectionOptions = {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency
            };
        } else {
            this.currency = "";
            this.UPOResults = [];
            this.data.CurrencyCode = "";
            this.data.CurrencyId = 0;
            this.data.CurrencyRate = 0;
            this.data.Supplier = null;
            this.selectedCurrency = null;
            this.selectedSupplier = null;
        }
        this.data.CurrencyCode = "";
        this.data.CurrencyId = 0;
        this.data.CurrencyRate = 0;
        //this.data.Supplier=null;
        this.selectedCurrency = null;
        this.selectedSupplier = null;
    }

    @bindable selectedCurrency;
    async selectedCurrencyChanged(newVal) {
        this.sameCurrency = false;
        this.data.CurrencyRate = 0;
        if (newVal) {
            this.data.CurrencyCode = newVal.code;
            this.data.CurrencyId = newVal.Id;
            if (newVal.code == "IDR") {
                this.sameCurrency = true;
                this.data.CurrencyRate = 1;
            }
            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: this.selectedSupplier && this.selectedSupplier.code ? JSON.stringify({ "Position": 7, "SupplierCode": this.selectedSupplier.code, "Currency": newVal.code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": newVal.code, "IsPaid": false }) //CASHIER DIVISION
                };

                this.UPOResults = await this.service.searchAllByPosition(arg)
                    .then((result) => {
                        let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

                        return resultData;
                    });
            }

            if (!this.IDR || this.sameCurrency) {
                this.collection = {
                    columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', ''],
                };
            }
            else {
                this.collection = {
                    columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', ''],
                };
            }
            this.collectionOptions = {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency
            };
        }
        else {
            this.data.CurrencyCode = null;
            this.data.CurrencyId = 0;
            this.sameCurrency = false;
            this.data.CurrencyRate = 0;
        }
    }

    async rateChanged(e) {
        this.collectionOptions = {
            IDR: this.IDR,
            rate: parseFloat(e.srcElement.value),
            SameCurrency: this.sameCurrency
        };
        this.data.CurrencyRate = parseFloat(e.srcElement.value);
        if (this.selectedBank && this.selectedBank.Currency.Code && this.selectedSupplier) {
            let arg = {
                page: 1,
                size: Number.MAX_SAFE_INTEGER,
                filter: JSON.stringify({ "Position": 7, "SupplierCode": this.selectedSupplier.code, "Currency": this.selectedBank.Currency.Code, "IsPaid": false }) //CASHIER DIVISION
            };

            this.UPOResults = await this.service.searchAllByPosition(arg)
                .then((result) => {
                    let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

                    return resultData;
                });
        }
    }

    get grandTotal() {
        let result = 0;
        let viewResult = 0;
        if (this.UPOResults && this.UPOResults.length > 0) {
            for (let detail of this.UPOResults) {
                if (detail.Select) {
                    result += detail.TotalPaid;
                    viewResult += (detail.TotalPaid * this.data.CurrencyRate);
                }

            }
        }
        // console.log(result);
        this.data.GrandTotal = result;
        if (this.IDR)
            return viewResult
        else
            return result;
    }

    bankView(bank) {
        return bank.AccountName ? `${bank.AccountName} - A/C : ${bank.AccountNumber}` : '';
    }

    currencyView(currency) {
        return `${currency.code}`;
    }
}
