//@ts-nocheck
"use server";

import { sql } from "kysely";
import { DEFAULT_PAGE_SIZE } from "../../constant";
import { db } from "../../db";
import { InsertProducts, UpdateProducts } from "@/types";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/utils/authOptions";
import { cache } from "react";

/**
 * Retrieves a list of products from the server based on the given filters.
 *
 * @param {number} page - The page number to retrieve. Defaults to 1.
 * @param {number} pageSize - The number of products to retrieve per page. Defaults to DEFAULT_PAGE_SIZE.
 * @param {string} sortBy - The column and order to sort the products by. Defaults to an empty string.
 * @param {string} brand - A comma-separated string of brand IDs to filter by. Defaults to an empty string.
 * @param {string} priceRangeTo - The maximum price of the products to filter by. Defaults to "2000".
 * @param {string} gender - The gender of the products to filter by. Defaults to an empty string.
 * @param {string} discount - The discount range of the products to filter by. Defaults to an empty string.
 * @param {string} occasion - The occasion of the products to filter by. Defaults to an empty string.
 * @param {string} category - The category of the products to filter by. Defaults to an empty string.
 * @returns {Promise<{ products: Product[], lastPage: number, numOfResultsOnCurPage: number }>} An object containing the products, the last page number, and the number of products on the current page.
 */
export async function getProducts(
  pageNo = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  sortByInput = "",
  brand = "",
  priceRangeTo = "2000",
  gender = "",
  discount = "",
  occasion = "",
  category = ""
) {
  try {
    let result;

    // Construct the DB query to select products and concatenate category IDs
    let dbQuery = db
      .selectFrom("products")
      .selectAll(
        "products",
        sql`GROUP_CONCAT(product_categories.category_id ORDER BY  product_categories.id SEPARATOR ',') AS categories`
      )
      ?.leftJoin(
        "product_categories",
        "products.id",
        "product_categories.product_id"
      )
      ?.groupBy("products.id");
    // Parse the sortByInput into a column and order
    const [sortBy, sortOrder] = sortByInput?.split("-");

    // Get the distinct products from the database
    result = dbQuery.distinct();

    // Sort the products by the given column and order
    if (sortBy && sortOrder) {
      result = result.orderBy(
        sortBy !== "" ? sortBy : "id",
        sortOrder ?? "asc"
      );
    }

    // Filter the products by price
    if (priceRangeTo) {
      result = result.where("price", "<=", priceRangeTo);
    }

    // Filter the products by gender
    if (gender) {
      result = result.where("gender", "=", gender);
    }

    // Filter the products by discount
    if (discount) {
      const [lowerLimit, upperLimit] = discount.split("-");
      result = result.where("discount", "<=", upperLimit);
      result = result.where("discount", ">=", lowerLimit);
    }

    //Filter the products by category
    if (category && category.length > 0) {
      result = result.where("category_id", "in", category.split(","));
    }

    // Filter the products by brand
    if (brand && brand.length > 0) {
      const brands = brand.split(",");
      const likeStrings = [];
      for (const brandId of brands) {
        // The brands column contains a JSON array of brand IDs, so we need to filter by each possible combination of the brand ID and the delimiter
        likeStrings.push(`[${brandId}]`);
        likeStrings.push(`[${brandId},%]`);
        likeStrings.push(`[%,${brandId}]`);
        likeStrings.push(`[%,${brandId},%]`);
      }

      result = result.where((eb) =>
        eb.or(likeStrings.map((like) => eb("brands", "like", like)))
      );
    }

    // Filter the products by occasion
    if (occasion && occasion.length > 0) {
      const occasions = occasion.split(",");
      const likeStrings = [];
      for (const occ of occasions) {
        // The occasion column contains a JSON array of occasion IDs, so we need to filter by each possible combination of the occasion ID and the delimiter
        likeStrings.push(`${occ}`);
        likeStrings.push(`${occ},%`);
        likeStrings.push(`%${occ},%`);
        likeStrings.push(`%,${occ}`);
      }

      result = result.where((eb) =>
        eb.or(likeStrings.map((like) => eb("occasion", "like", like)))
      );
    }

    // Execute the query and get the products
    let products = await result.execute();

    // Get the total count of products
    const count = products.length;
    // Get the last page number
    const lastPage = Math.ceil(count / pageSize);
    // Get the products for the current page
    products = products.slice((pageNo - 1) * pageSize, pageNo * pageSize);
    // Get the number of products on the current page
    const numOfResultsOnCurPage = products.length;

    // Return the results
    return { products, count, lastPage, numOfResultsOnCurPage };
  } catch (error) {
    throw error;
  }
}

/**
 * Saves a new product to the database, including its categories.
 *
 * @param {Object} payload - The payload containing the product details.
 * @param {string} payload.name - The name of the product.
 * @param {string} payload.description - The description of the product.
 * @param {number} payload.price - The price of the product.
 * @param {number} payload.rating - The rating of the product.
 * @param {number} payload.old_price - The old_price of the product.
 * @param {number} payload.discount - The discount of the product.
 * @param {string} payload.image_url - The image URL of the product.
 * @param {string} payload.brand - The brand of the product.
 * @param {string} payload.occasion - The occasion of the product.
 * @param {Array<number>} payload.categories - The categories of the product.
 * @returns {Promise<Object>} The saved product and its categories.
 * @throws {Error} If the product could not be saved.
 */
export async function saveProduct(payload) {
  try {
    // Create a copy of the payload and remove the categories field
    const saveProductPayload = JSON.parse(JSON.stringify(payload));
    delete saveProductPayload.categories;

    // Insert the product into the database and get its ID
    const product = await db
      .insertInto("products")
      .values(saveProductPayload)
      .executeTakeFirst();
    // Get the ID of the inserted product
    const productId = product.insertId;

    // Insert the product's categories into the database
    await db
      .insertInto("product_categories")
      .values(
        payload.categories?.map((category: number) => ({
          product_id: productId,
          category_id: category,
        }))
      )
      .execute();

    // Return the saved product and its categories
    return { product, categories: payload.categories };
  } catch (error) {
    // If the product could not be saved, return an error object
    return { error: "Could not save the product" };
  }
}

/**
 * Updates a product and its categories in the database.
 *
 * This function first updates the product's details excluding its categories and id.
 * Then, it deletes the existing product categories from the database and inserts the new ones.
 *
 * @param {Object} payload - The product data to update.
 * @param {number} payload.id - The ID of the product to update.
 * @param {string} payload.name - The name of the product.
 * @param {string} payload.description - The description of the product.
 * @param {number} payload.price - The price of the product.
 * @param {number} payload.rating - The rating of the product.
 * @param {number} payload.old_price - The old_price of the product.
 * @param {number} payload.discount - The discount of the product.
 * @param {string} payload.image_url - The image URL of the product.
 * @param {string} payload.brand - The brand of the product.
 * @param {string} payload.occasion - The occasion of the product.
 * @param {Array<number>} payload.categories - The categories of the product.
 * @returns {Promise<Object>} The saved product and its categories.
 * @throws {Error} If the product could not be saved.
 */
export async function updateProduct(payload) {
  try {
    // Create a deep copy of the payload to safely modify it
    const updateProductPayload = JSON.parse(JSON.stringify(payload));

    // Remove categories and id from the product payload as they're handled separately
    delete updateProductPayload.categories;
    delete updateProductPayload.id;

    // Update the product details in the 'products' table
    await db
      .updateTable("products")
      .set(updateProductPayload)
      .where("id", "=", payload.id)
      .executeTakeFirst();

    // Delete the product's current categories to replace them with the new ones
    await db
      .deleteFrom("product_categories")
      .where("product_id", "=", payload.id)
      .execute();

    // Insert the new categories for the product
    await db
      .insertInto("product_categories")
      .values(
        payload.categories?.map((category: number) => ({
          product_id: payload.id,
          category_id: category,
        }))
      )
      .execute();
  } catch (error) {
    // Return an error message if the update operation fails
    return { error: "Could not update the product" };
  }
}

export const getProduct = cache(async function getProduct(productId: number) {
  // console.log("run");
  try {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("id", "=", productId)
      .execute();

    return product;
  } catch (error) {
    return { error: "Could not find the product" };
  }
});

export async function createProduct() {}
async function enableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 1`.execute(db);
}

async function disableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 0`.execute(db);
}

export async function deleteProduct(productId: number) {
  try {
    await disableForeignKeyChecks();
    await db
      .deleteFrom("product_categories")
      .where("product_categories.product_id", "=", productId)
      .execute();
    await db
      .deleteFrom("reviews")
      .where("reviews.product_id", "=", productId)
      .execute();

    await db
      .deleteFrom("comments")
      .where("comments.product_id", "=", productId)
      .execute();

    await db.deleteFrom("products").where("id", "=", productId).execute();

    await enableForeignKeyChecks();
    revalidatePath("/products");
    return { message: "success" };
  } catch (error) {
    return { error: "Something went wrong, Cannot delete the product" };
  }
}

export async function MapBrandIdsToName(brandsId) {
  const brandsMap = new Map();
  try {
    for (let i = 0; i < brandsId.length; i++) {
      const brandId = brandsId.at(i);
      const brand = await db
        .selectFrom("brands")
        .select("name")
        .where("id", "=", +brandId)
        .executeTakeFirst();
      brandsMap.set(brandId, brand?.name);
    }
    return brandsMap;
  } catch (error) {
    throw error;
  }
}

export async function getAllProductCategories(products: any) {
  try {
    const productsId = products.map((product) => product.id);
    const categoriesMap = new Map();

    for (let i = 0; i < productsId.length; i++) {
      const productId = productsId.at(i);
      const categories = await db
        .selectFrom("product_categories")
        .innerJoin(
          "categories",
          "categories.id",
          "product_categories.category_id"
        )
        .select("categories.name")
        .where("product_categories.product_id", "=", productId)
        .execute();
      categoriesMap.set(productId, categories);
    }
    return categoriesMap;
  } catch (error) {
    throw error;
  }
}

export async function getProductCategories(productId: number) {
  try {
    const categories = await db
      .selectFrom("product_categories")
      .innerJoin(
        "categories",
        "categories.id",
        "product_categories.category_id"
      )
      .select(["categories.id", "categories.name"])
      .where("product_categories.product_id", "=", productId)
      .execute();

    return categories;
  } catch (error) {
    throw error;
  }
}
