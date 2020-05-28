import { inject, bindable, computedFrom } from 'aurelia-framework'
var ProductionOrderLoader = require('../../../../loader/production-order-azure-loader');
var DOSalesLoader = require('../../../../loader/do-sales-loader');
export class CartItem {
    @bindable product;

    remarks = [];
    activate(context) {

        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;
        this.contextOptions = context.context.options;
        this.destinationArea = this.contextOptions.destinationArea;
        this.isSales = this.contextOptions.isSales;
        if (this.data.qty && !this.data.previousBalance) {
            this.data.previousBalance = this.data.qty;
        }
        // if(this.data.deliveryOrderSales){
        //     this.selectedDOSales = {};
        //     this.selectedDOSales.Id = this.data.deliveryOrderSales.id;
        //     this.selectedDOSales.DoNO = this.data.deliveryOrderSales.no;
        // }
        if (this.data.productionOrder && this.data.productionOrder.id) {
            this.selectedProductionOrder = {};
            this.selectedProductionOrder.Id = this.data.productionOrder.id;
            this.selectedProductionOrder.OrderNo = this.data.productionOrder.no;
            this.selectedProductionOrder.OrderType = {};
            this.selectedProductionOrder.OrderType.Name = this.data.productionOrder.type;
            this.selectedProductionOrder.OrderQuantity = this.data.productionOrder.orderQuantity;
            this.selectedProductionOrder.Construction = this.data.construction;
            this.selectedProductionOrder.Buyer = {};
            this.selectedProductionOrder.Buyer.Id = this.data.buyerId;
            this.selectedProductionOrder.Buyer.Name = this.data.buyer;
            this.selectedProductionOrder.PackingInstruction = this.data.packingInstruction;
            this.selectedProductionOrder.Details = [];
            this.selectedProductionOrder.Details.push({});
            this.selectedProductionOrder.Details[0].ColorRequest = this.data.color;
            this.selectedProductionOrder.DesignCode = this.data.motif;
            this.selectedProductionOrder.Uom = {};
            this.selectedProductionOrder.Uom.Unit = this.data.uomUnit;
            if (this.selectedProductionOrder.OrderNo.charAt(0) === 'P') {
                this.data.unit = "PRINTING"
            } else {
                this.data.unit = "DYEING"
            }
        }
    }

    changeCheckBox() {
        this.context.context.options.checkedAll = this.context.context.items.reduce((acc, curr) => acc && curr.data.IsSave, true);
    }

    controlOptions = {
        control: {
            length: 12
        }
    };

    get productionOrderLoader() {
        return ProductionOrderLoader;
    }

    get doSalesLoader() {
        return DOSalesLoader;
    }

    @bindable selectedProductionOrder;
    selectedProductionOrderChanged(newValue, oldValue) {
        if (this.selectedProductionOrder && this.selectedProductionOrder.Id) {
            this.data.productionOrder = {};
            this.data.productionOrder.id = this.selectedProductionOrder.Id;
            this.data.productionOrder.no = this.selectedProductionOrder.OrderNo;
            this.data.productionOrder.type = this.selectedProductionOrder.OrderType.Name;
            this.data.productionOrder.orderQuantity = this.selectedProductionOrder.OrderQuantity;
            if (this.selectedProductionOrder.Construction) {
                this.data.construction = this.selectedProductionOrder.Construction;
            } else {
                this.data.construction = `${this.selectedProductionOrder.Material.Name} / ${this.selectedProductionOrder.MaterialConstruction.Name} / ${this.selectedProductionOrder.MaterialWidth}`
            }
            this.data.buyerId = this.selectedProductionOrder.Buyer.Id;
            this.data.buyer = this.selectedProductionOrder.Buyer.Name;
            this.data.packingInstruction = this.selectedProductionOrder.PackingInstruction;
            this.data.color = this.selectedProductionOrder.Details[0].ColorRequest;
            this.data.motif = this.selectedProductionOrder.DesignCode;
            this.data.uomUnit = this.selectedProductionOrder.Uom.Unit;
            if (this.selectedProductionOrder.OrderNo.charAt(0) === 'P') {
                this.data.unit = "PRINTING"
            } else {
                this.data.unit = "DYEING"
            }
        }
        else {
            this.data.productionOrder = {};
        }
    }

    // @bindable selectedDOSales;
    // selectedDOSalesChanged(n, o) {
    //     if (this.selectedDOSales) {
    //         this.data.deliveryOrderSales = {};
    //         this.data.deliveryOrderSales.id = this.selectedDOSales.Id;
    //         this.data.deliveryOrderSales.no = this.selectedDOSales.DoNO;
    //     }
    // }
}