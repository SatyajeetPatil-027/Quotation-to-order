USE quotation_db;

-- Empty every table (the safety check is switched off for a moment,
-- because tables linked by foreign keys can't be emptied in any order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE orders;
TRUNCATE TABLE quotation_items;
TRUNCATE TABLE quotations;
TRUNCATE TABLE customers;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;

-- Sample customers
INSERT INTO customers (name, company, email, phone) VALUES
('Rahul Sharma', 'Sharma Traders', 'rahul@sharma.com', '9876543210'),
('Priya Patil', 'Patil Enterprises', 'priya@patil.com', '9822012345'),
('Amit Desai', 'Desai Electronics', 'amit@desai.com', '9890098765');

-- Sample products
INSERT INTO products (name, price) VALUES
('Laptop', 50000),
('Mobile', 12000),
('Microwave', 25000),
('Mouse', 500);