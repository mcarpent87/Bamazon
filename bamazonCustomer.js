//Dependencies that are required 
var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");
var Table = require("cli-table");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazon"
  });

  // connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    console.log("--------------------".green.bold);
    console.log("Welcome to Bamazon!".green.bold);
    console.log("--------------------".green.bold);
    console.log("You are now connected to the Bamazon database as id ".blue.bold + connection.threadId);

//Call main function
    bamazon();
  });


  //Display bamazon inventory
  function bamazon() {
      connection.query('SELECT * FROM inventory', function (err, res) {
          if (err) throw err; 


          //Color table to display inventory
          var table = new Table ({
                head: ["Product ID".cyan.bold, "Product Name".cyan.bold, "Department Name".cyan.bold, "Price ($)".cyan.bold, "Quantity".cyan.bold],
                colWidths: [12, 75, 20, 12, 18],
              });

    // Style the table headings and loop through bamazon inventory to populate the table
    for (var i = 0; i < res.length; i++) {
        table.push(
            [res[i].id, res[i].product_name, res[i].department_name, parseFloat(res[i].price).toFixed(2), res[i].stock_quantity]
        );    
    }

    console.log(table.toString());

//Prompt users input using inquire
    inquirer.prompt([
        {
            type: "number",
            message: "Please input the ID of the product that you would like to purchase".yellow,
            name: "id"
        },
        {
            type: "number",
            message: "What quantity of this item would you like to buy?".yellow,
            name: "quantity"
        },
    ])
//Function for ordering
    .then(function (cart) {
        var quantity = cart.quantity
        var itemID = cart.id;

        connection.query('SELECT * FROM inventory WHERE id=' + itemID, function (err, selectedItem) {
            if (err) throw err;        
        
    //This verifies that the item is in stock and the quantity meets what the buyer wants
    if (selectedItem[0].stock_quantity - quantity >=0) {
        console.log("--------------------------------------------------------------------------------------------".green.bold);
        console.log ("This item is in stock!".magenta.bold);
        console.log("--------------------------------------------------------------------------------------------".green.bold);
        console.log ("Bamazon has a sufficient quantity of ".green + selectedItem[0].product_name.yellow + " to fill your order".green.bold);

    //Calculate total sale including taxes and shipping
    console.log("--------------------------------------------------------------------------------------------".green.bold);
    console.log("Thank you for your purchase! Your order will be a total of ".green + "$".green + (cart.quantity * selectedItem[0].price).toFixed(2).green + ".".green);
    console.log("--------------------------------------------------------------------------------------------".green.bold);
    console.log("Thanks for shopping with us!".magenta);
    console.log("--------------------------------------------------------------------------------------------".green.bold);
    //Query to remove the purchased item from the inventory
    connection.query('UPDATE inventory SET stock_quantity=? WHERE id=?', [selectedItem[0].stock_quantity - quantity, itemID],
    function (err, inventory) {
        if (err) throw err;
    }); 

    //Ask user if they would like to purchase another item
        inquirer.prompt([{
            type: "confirm", 
            name: "reply",
            message: "Would you like to purchase another item today?"
        }]).then(function(ans){
            if(ans.reply){
                bamazon();
            } else{
                console.log("------------------------------".green.bold);
                console.log("Thank you! Come again!".green.bold)
                console.log("------------------------------".green.bold);
            }
        })
    }

    
// Low inventory warning
else {
    console.log("INSUFFICIENT INVENTORY ALERT: \nBamazon only has ".red + selectedItem[0].stock_quantity + " " + selectedItem[0].product_name.cyan + " in stock at this moment. \nPlease make another selection or reduce your quantity.".red, "\nThank you for shopping at Bamazon!".magenta);

    bamazon();
}
    
        });
    });
});
} 
        
    
