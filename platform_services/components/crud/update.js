/**
    Update Service-Catalog by SERVICE_ID
  @module: update.js
  @description: CRUD functions for service catalog
    @author: Sunil Fernandes
    @version: 1.0
**/

const utils = require("../utils.js")(); //Import the utils module.


module.exports = (service_id, update_data, onComplete) => {
    // initialize docCLient
    var docClient = utils.initDocClient();

    var params = {
        TableName: global.services_table,
        Key: {
            "SERVICE_ID": service_id
        }
    };

    // var unchangeable_keys_list = ['service', 'domain', 'type', 'created_by', 'runtime', 'region']; //these fields cant be changed
    // var keys_list = ['description', 'email', 'slack_channel', 'tags', 'repository'];
    var keys_list = global.config.service_update_fields;

    var update_exp = "";
    var attributeValues = {};

    // Generate filter string
    keys_list.forEach(function(key) {
        var key_name = utils.getDatabaseKeyName(key);

        if (update_data[key] !== undefined) {
            update_exp = update_exp + key_name + " = :" + key_name + ", ";
            attributeValues[(":" + key_name)] = update_data[key];
        }
    });

    if (update_exp !== "") {
        params.UpdateExpression = "set " + update_exp.substring(0, update_exp.length - 2);
        params.ExpressionAttributeValues = attributeValues;
        params.ReturnValues = "ALL_NEW";

        docClient.update(params, function(err, data) {
            if (err) {
                // database error
                onComplete({
                    "result": "databaseError",
                    "message": "Error Updating Item  " + err.message
                }, null);
            } else {
                var service = utils.formatService(data.Attributes);
                onComplete(null, service);
            }
        });
    } else {
        onComplete(null, null);
    }
};
