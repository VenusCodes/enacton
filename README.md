## Project Overview

The task involves developing a web application that allows users to browse through a list of products categorized by various parameters. Users should have the capability to sort and filter products based on criteria such as categories, price range, gender, occasion, and discount. Furthermore, the application should empower users to seamlessly edit and delete their selected products, with these modifications being promptly reflected in the user interface.

## Github Repo:

https://github.com/VenusCodes/enacton

### Video Explanation

https://uploadvideos.online/en/YSX0BguiuCB6lBY/watch

OR

https://uploadnow.io/f/syZbKbg

### I am not sure of the video platforms above , please let me know if they get deleted / taken down.

### Setting Up the Project

To set up the project locally, follow these steps:

1. Clone the repository and navigate to the project folder.
2. Import the product_database.sql file in to your MySQL database (you can use phpMyAdmin).
3. Update the .env file with your own MySQL credentials.
4. Run `npm install --force`.
5. Start the project using `npm run dev`.
6. Access the NextJS website at http://localhost:3000.
7. Setup the database, You would need mysql and workbench for the database. You can get it from here: https://dev.mysql.com/downloads/installer. To Import data in do refer to this document: https://dev.mysql.com/doc/workbench/en/wb-admin-export-import-management.html

### Requirements

#### Project Setup

1. **Project Setup**: Ensure proper project setup as per the provided instructions.

#### Pagination for products

2. **Main Section**: Display a paginated list of product in the main section.

#### Product Sorting and Filtering

3. **[x] Product Sorting**: Implement options for sorting products based on price, creation date (created_at), and rating.
4. **[x] Brand Filter**: Enable product filtering by the chosen brand and emphasize the selected brands within the respective tab.
5. **[x] Category Filter**: Allow product filtering by the selected category and highlight the chosen category within its designated tab.
6. **[x] Price Range Filter**: Provide the ability to filter products based on the selected price range and highlight the chosen range within its dedicated tab.
7. **[x] Occasion Filter**: Enable product filtering based on the selected occasion and highlight the chosen occasion within its specific tab.
8. **[x] Discount Filter**: Implement product filtering based on the selected discount and highlight the chosen discount within its dedicated tab.
9. **[x] URL Parameters**: Store all filter and sort options in the URL parameters to replicate the user's browsing state when sharing URLs.

#### Product Operations (Create/Edit/Delete)

10. **[x] Create Product**: Allow users to crete product.
11. **[x] Edit Product**: Allow users to modify specific product details.
12. **[x] Delete Product**: Provide the functionality to remove a particular product from the list.
