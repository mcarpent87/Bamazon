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

  // connect to the mysql server and sql database, then run the startPrompt function to start the inquirer prompt options
connection.connect(function(err) {
    if (err) throw err;
    console.log("Welcome Bamazon Manager!")
    console.log("You are now connected to the Bamazon database as id " + connection.threadId);
    startPrompt();
});

//This function is run first, it gives the manager that is logged in five different options to choose from. 
function startPrompt() {
inquirer.prompt([{
    type: "list",
    name: "selections",
    message: "What would you like to do?",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product","End Session"]
  }]).then(function(ans){
     switch(ans.selections){
      case "View Products for Sale": viewProducts();
      break;
      case "View Low Inventory": viewLowInventory();
      break;
      case "Add to Inventory": addToInventory();
      break;
      case "Add New Product": addNewProduct();
      break;
      case "End Session": console.log('You have logged out, goodbye!');
    }
  });
}


//Display bamazon inventory
function viewProducts() {
    console.log("----------Products for Sale----------".green.bold);
    connection.query('SELECT * FROM inventory', function (err, res) {
        if (err) throw err; 

        //Color table to display inventory
        var table = new Table ({
              head: ["Product ID".cyan.bold, "Product Name".cyan.bold, "Department Name".cyan.bold, "Price ($)".cyan.bold, "Quantity".cyan.bold],
              colWidths: [12, 75, 20, 12, 12],
            });

  // Style the table headings and loop through bamazon inventory to populate the table
  for (var i = 0; i < res.length; i++) {
      table.push(
          [res[i].id, res[i].product_name, res[i].department_name, parseFloat(res[i].price).toFixed(2), res[i].stock_quantity]
      );    
  }

  console.log(table.toString());
  startPrompt();
    });
}

//Manager can view low inventory when products have < 5 QTY left in stock 
function viewLowInventory() {
    console.log('----------Items with Low Inventory----------'.green.bold);
    connection.query('SELECT * FROM inventory WHERE stock_quantity < 5', function (err, res) {
        if (err) throw err; 

        //Color table to display inventory
        var table = new Table ({
              head: ["Product ID".cyan.bold, "Product Name".cyan.bold, "Department Name".cyan.bold, "Price ($)".cyan.bold, "Quantity".cyan.bold],
              colWidths: [12, 75, 20, 12, 12],
            });

  // Style the table headings and loop through bamazon inventory to populate the table
  for (var i = 0; i < res.length; i++) {
      table.push(
          [res[i].id, res[i].product_name, res[i].department_name, parseFloat(res[i].price).toFixed(2), res[i].stock_quantity]
      );    
  }

  console.log(table.toString());
  startPrompt();
    });
}

//Prompts manager to add quantity to existing item in the inventory 
function addToInventory(){
    console.log('-----------Adding to Inventory-----------'.green.bold);
  
    connection.query('SELECT * FROM inventory', function(err, res){
    if(err) throw err;
    var itemArray = [];
    //pushes each item into an itemArray
    for(var i=0; i<res.length; i++){
      itemArray.push(res[i].product_name);
    }
  
    inquirer.prompt([{
      type: "list",
      name: "product",
      choices: itemArray,
      message: "Which item would you like to add inventory?"
    }, {
      type: "input",
      name: "qty",
      message: "How much would you like to add?",
      validate: function(value){
        if(isNaN(value) === false){return true;}
        else{return false;}
      }
      }]).then(function(ans){
        var currentQty;
        for(var i=0; i<res.length; i++){
          if(res[i].product_name === ans.product){
            currentQty = res[i].stock_quantity;
          }
        }
        connection.query('UPDATE inventory SET ? WHERE ?', [
          {stock_quantity: currentQty + parseInt(ans.qty)},
          {product_name: ans.product}
          ], function(err, res){
            if(err) throw err;
            console.log('The quantity was updated.');
            startPrompt();
          });
        })
    });
}

//Function allows the manager to add a new product to the inventory
function addNewProduct() {
console.log("----------Add New Product----------".green.bold);

//Ask the manager to fill in all necessary information to fill columns in table
inquirer.prompt([{

    type: "input",
    name: "inputName",
    message: "Enter the name of the new product:",
},
{
    type: "input",
    name: "inputDepartment",
    message: "Enter the department name for the new product:",
},
{
    type: "input",
    name: "inputPrice",
    message: "Enter the price of the new product:",
},
{
    type: "input",
    name: "inputStock",
    message: "Enter the stock quantity of the new product:",
}

]).then(function(newItem) {

//connect to database, insert column data with input from user
connection.query("INSERT INTO inventory SET ?", {
product_name: newItem.inputName,
department_name: newItem.inputDepartment,
price: newItem.inputPrice,
stock_quantity: newItem.inputStock
}, function(err, res) {});
startPrompt();
});
}
  


