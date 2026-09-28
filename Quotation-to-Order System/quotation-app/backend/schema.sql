CREATE DATABASE quotation_db;
USE quotation_db;

-- 1. Customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20)
);

-- 2. Products
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- 3. Quotations
CREATE TABLE quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('Draft','Pending Approval','Approved','Sent',
              'Accepted','Converted to Order','Rejected') DEFAULT 'Draft',
  created_by ENUM('Salesperson','Manager') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Helper table: the product lines of each quotation
CREATE TABLE quotation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 4. Orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);