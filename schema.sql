-- Drops the programming_db if it already exists --
DROP DATABASE IF EXISTS bamazon;
-- Create a database called programming_db --
CREATE DATABASE bamazon;

CREATE TABLE inventory (
id INTEGER (11) AUTO_INCREMENT NOT NULL,
product_name VARCHAR (100),
department_name VARCHAR (50),
price DECIMAL(10,2) NULL,
stock_quantity INTEGER(100),
PRIMARY KEY (id) );
