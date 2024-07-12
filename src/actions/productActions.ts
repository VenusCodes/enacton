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
 * Gets a list of products that match the given filters.
 * @param pageNo The page number to retrieve. Defaults to 1.
 * @param pageSize The number of products to retrieve per page. Defaults to 20.
 * @param sortByInput The column and order to sort the products by. Defaults to an empty string.
 * @param brand A comma-separated string of brand IDs to filter by. Defaults to an empty string.
 * @param priceRangeTo The maximum price of the products to filter by. Defaults to 2000.
 * @param gender The gender of the products to filter by. Defaults to an empty string.
 * @param discount The discount range of the products to filter by. Defaults to an empty string.
 * @param occasion The occasion of the products to filter by. Defaults to an empty string.
 * @param category The category of the products to filter by. Defaults to an empty string.
 * @returns An object containing the products, the total count of products, the last page number, and the number of products on the current page.
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
    let dbQuery = db.selectFrom("products").selectAll("products");

    // Parse the sortByInput into a column and order
    const [sortBy, sortOrder] = sortByInput?.split("-");

    // Get the distinct products from the database
    result = dbQuery.distinct();

    // Filter the products by categories
    if (category) {
      //
    }

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
