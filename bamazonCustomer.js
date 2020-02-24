var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Ai20160929@",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    StartBuy();
})

function StartBuy() {
    connection.query("select * from products", function(err, items) {
        if (err) throw err;
        console.log(items);
        inquirer.prompt([
            {
                type: "list",
                name: "productID",
                choices: function() {
                    var productid = [];
                    for (var i = 0; i < items.length; i++) {
                        productid.push(items[i].item_id);
                    }
                    return productid;
                },
                message: "The ID of the product you want to buy:"
            },
            {
                type: "input",
                name: "quantity",
                message: "How many of this product you want to buy:"
            }
        ]).then(function(request) {
            var chosenproduct;
            for (var i = 0; i < items.length; i++) {
                if (request.productID === items[i].item_id) {
                    chosenproduct = items[i];
                }
            };
            if (parseInt(request.quantity) > chosenproduct.stock_quantity) {
                console.log("Insufficient quantity!");
                StartBuy();
            } else {
                var RemainQty = chosenproduct.stock_quantity - parseInt(request.quantity);
                connection.query(
                    "update products set ? where ?",
                    [
                        {
                            stock_quantity: RemainQty
                        },
                        {
                            item_id: chosenproduct.item_id
                        }
                    ],
                    function(err, result) {
                        if (err) throw err;
                        console.log(result.affectedRows + " product is updated.");
                        var totalCost = parseInt(request.quantity) * chosenproduct.price;
                        console.log("Dear customer, your total cost is: " + totalCost +
                        "\nThe remain quantity for " + chosenproduct.product_name + " is " +
                        RemainQty);
                        connection.end();
                    }
                );
            }
        })
    });
}