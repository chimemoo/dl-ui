import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const resource = 'reports/garment-disposition-purchase/list-user';

module.exports = function (keyword, filter) {

    var config = Container.instance.get(Config);
    var endpoint = config.getEndpoint("purchasing-azure");

    return endpoint.find(resource, { keyword: keyword, filter: JSON.stringify(filter), size: 10 })
        .then(results => {
            console.log("list user :",results)
            return results.data.Data;
        });
}
