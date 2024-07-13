import { getProducts } from "@/actions/productActions";
import { DEFAULT_PAGE_SIZE } from "../../../constant";
import PaginationSection from "@/components/PaginationSection";
import SortBy from "@/components/SortBy";
import Filter from "@/components/Filter";
import ProductTable from "@/components/ProductTable";
import { Suspense } from "react";
import { getCategories } from "@/actions/categoryActions";
import { getBrands } from "@/actions/brandActions";

export default async function Products({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    sortBy,
    brand,
    priceRangeTo,
    gender,
    discount,
    occasion,
    category,
  } = searchParams as any;

  // Retrieves a list of products from the server based on the given filters.
  // @returns {Promise<{ products: Product[], lastPage: number, numOfResultsOnCurPage: number }>} An object containing the products, the last page number, and the number of products on the current page.
  const { products, lastPage, numOfResultsOnCurPage } = await getProducts(
    // Convert the page and pageSize to numbers
    +page,
    +pageSize,
    sortBy,
    brand,
    priceRangeTo,
    gender,
    discount,
    occasion,
    category
  );

  // Retrieve a list of brands from the server
  // @returns {Promise<Brand[]>} An array of brands.
  const brands = await getBrands();

  // Retrieve a list of categories from the server
  // @returns {Promise<Category[]>} An array of categories.
  const categories = await getCategories();

  return (
    <div className="pb-20 pt-8">
      <h1 className="text-4xl mb-8">Product List</h1>
      <div className="mb-8">
        <SortBy />
        <div className="mt-4">
          <Filter categories={categories} brands={brands} />
        </div>
      </div>

      <h1 className="text-lg font-bold mb-4">Products</h1>
      <Suspense
        fallback={<p className="text-gray-300 text-2xl">Loading Products...</p>}
      >
        <ProductTable
          products={products}
          numOfResultsOnCurPage={numOfResultsOnCurPage}
        />
      </Suspense>
      {products.length > 0 && (
        <PaginationSection
          lastPage={lastPage}
          pageNo={+page}
          pageSize={+pageSize}
        />
      )}
    </div>
  );
}
