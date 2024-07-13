"use client";
import { basicSchema } from "@/schemas/product";
import { getCategories } from "@/actions/categoryActions";
import { getBrands } from "@/actions/brandActions";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { occasionOptions } from "../../../../constant";
import Select from "react-select";
import { saveProduct } from "@/actions/productActions";
import { toast } from "react-toastify";
import { IOption } from "@/types";

function AddProduct() {
  const [brandsOption, setBrandsOption] = useState([]);
  const [categoriesOption, setCategoriesOption] = useState([]);
  const [occasionOption, setOccasionOption] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Indicates whether an image is currently being uploaded.
   */
  const [imageUploading, setImageUploading] = useState(false);

  const router = useRouter();

  /**
   * The Formik hook for handling form state and validation.
   */
  const {
    values: product, // The current form values
    errors, // The validation errors
    touched, // Indicates whether a form field has been touched
    isSubmitting, // Indicates whether the form is currently being submitted
    handleChange, // The function to handle form field changes
    handleBlur, // The function to handle form field blur events
    handleSubmit, // The function to handle form submission
    setValues, // The function to set form values
    resetForm,
  }: any = useFormik({
    /**
     * The initial form values.
     */
    initialValues: {
      name: "",
      description: "",
      old_price: "",
      discount: "",
      rating: 0,
      colors: "",
      brands: null,
      categories: null,
      gender: "men",
      occasion: null,
      image_url: "",
    },

    /**
     * The Yup validation schema for form fields.
     */
    validationSchema: basicSchema,

    /**
     * The function to handle form submission.
     * @param {Object} values - The form values.
     */
    onSubmit: async (values: any, actions) => {
      const payload = {
        name: values.name,
        description: values.description,
        old_price: values.old_price,
        discount: values.discount,
        rating: values.rating,
        colors: values.colors,
        brands:
          "[" +
          values.brands?.map((brand: IOption) => brand.value)?.toString() +
          "]",
        categories: values.categories?.map(
          (category: IOption) => category.value
        ),
        gender: values.gender,
        occasion: values.occasion
          ?.map((occasion: IOption) => occasion.value)
          ?.toString(),
        image_url: values.image_url,
        price: values.old_price - (values.old_price * values.discount) / 100,
      };

      /**
       * The response from the server after saving the product.
       */
      const res = await saveProduct(payload);

      if (res?.message === "success") {
        toast.success("Product added successfully");
        router.push("/products");
      } else {
        toast.error(res?.error);
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    (async function () {
      const brands = await getBrands();
      const brandsOption = brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
      }));

      const categories = await getCategories();
      const categoriesOption = categories.map((category) => ({
        value: category.id,
        label: category.name,
      }));
      const occasionOption = occasionOptions.map((item) => {
        return {
          value: item,
          label: item,
        };
      });

      setBrandsOption(brandsOption as any);
      setCategoriesOption(categoriesOption as any);
      setOccasionOption(occasionOption as any);
      setLoading(false);
    })();
  }, [setValues]);

  function handleChangeSelect(selectedOptions) {
    if (selectedOptions.length === 0) {
      setValues({
        ...product,
        brands: null,
      });
      return;
    }
    setValues({
      ...product,
      brands: selectedOptions,
    });
  }
  function handleOccasion(selectedOptions) {
    if (selectedOptions.length === 0) {
      setValues({
        ...product,
        occasion: null,
      });
      return;
    }
    setValues({
      ...product,
      occasion: selectedOptions,
    });
  }
  function handleCategories(selectedOptions) {
    if (selectedOptions.length === 0) {
      setValues({
        ...product,
        categories: null,
      });
      return;
    }
    setValues({
      ...product,
      categories: selectedOptions,
    });
  }

  /**
   * Handles file input for image upload.
   * Appends the selected image to a FormData object and sends it to the imgbb API
   * for uploading. Once the upload is complete, updates the product's image_url state.
   *
   * @param {Event} e - The file input event.
   */
  async function handleFileInput(e) {
    // Get the selected file from the input event
    const file = e.target.files[0];

    // Create a new FormData object and append the selected file to it
    const formData = new FormData();
    formData.append("image", file, file.name);

    // Set up the request options for the imgbb API
    const requestOptions: any = {
      method: "POST",
      body: formData,
      redirect: "follow",
    };

    // Set the imageUploading state to true to indicate that the image is being uploaded
    setImageUploading(true);

    // Send the FormData to the imgbb API for uploading
    fetch(
      "https://api.imgbb.com/1/upload?key=0a09791000b6da5b5c0e4d921547c9a2",
      requestOptions
    )
      .then((result) => result.json()) // Parse the response as JSON
      .then((result: any) => {
        // Update the product's image_url state with the URL of the uploaded image
        setValues({
          ...product,
          image_url: result?.data?.display_url,
        });
      })
      .catch((error) => console.error(error)) // Log any errors that occur during the upload
      .finally(() => setImageUploading(false)); // Set the imageUploading state to false once the upload is complete
  }

  function handleColorPicker(e) {
    setValues({
      ...product,
      colors: product.colors
        ? `${product.colors},${e.target.value}`
        : e.target.value,
    });
  }

  if (loading) return <h2 className="text-lg">Loading...</h2>;

  return (
    <div className="w-1/3 text-white">
      <h1 className="mb-8 text-xl">Add Product details</h1>
      {isSubmitting && <p className="text-lg text-yellow-200">Submitting...</p>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name: </label>
          <input
            type="text"
            name="name"
            id="name"
            value={product.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="Enter name"
          />
          {errors.name && touched.name && (
            <p className="error">{errors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="description">Product description: </label>
          <textarea
            className="text-black"
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={5}
            cols={30}
            disabled={isSubmitting}
            placeholder="Enter description"
          />
          {errors.description && touched.description && (
            <p className="error">{errors.description}</p>
          )}
        </div>
        <div>
          <label htmlFor="description" id="price">
            Product old price:{" "}
          </label>
          <input
            type="number"
            name="old_price"
            placeholder="Enter old price"
            value={product.old_price}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            step={0.1}
          />
          {errors.old_price && touched.old_price && (
            <p className="error">{errors.old_price}</p>
          )}
        </div>
        <div>
          <label htmlFor="discount">Product Discount: </label>
          <input
            type="number"
            name="discount"
            id="discount"
            value={product.discount}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            step={0.1}
            placeholder="Enter product discount"
          />
          {errors.discount && touched.discount && (
            <p className="error">{errors.discount}</p>
          )}
        </div>
        <div></div>
        <div>
          <div className="flex gap-4">
            <label htmlFor="colors">Product colors: </label>
            <input
              type="text"
              name="colors"
              id="colors"
              placeholder="Enter product colors"
              onChange={handleChange}
              disabled={isSubmitting}
              onBlur={handleBlur}
              value={product.colors}
            />
            <input type="color" id="colors" onBlur={handleColorPicker} />
          </div>
          {errors.colors && touched.colors && (
            <p className="error">{errors.colors}</p>
          )}
        </div>
        <div>
          <label htmlFor="rating">Product Rating: </label>
          <input
            type="number"
            className="text-black"
            name="rating"
            id="rating"
            min={0}
            max={5}
            value={product.rating}
            disabled={isSubmitting}
            onBlur={handleBlur}
            onChange={handleChange}
          ></input>
          {errors.rating && touched.rating && (
            <p className="error">{errors.rating}</p>
          )}
        </div>
        <div>
          <label htmlFor="gender">Product Gender: </label>
          <select
            className="text-black"
            name="gender"
            id="gender"
            value={product.gender}
            disabled={isSubmitting}
            onBlur={handleBlur}
            onChange={handleChange}
          >
            {["men", "boy", "women", "girl"].map((gender, i) => {
              return (
                <option key={i} value={gender}>
                  {gender}
                </option>
              );
            })}
          </select>
          {errors.gender && touched.gender && (
            <p className="error">{errors.gender}</p>
          )}
        </div>

        <div>
          <label htmlFor="brands">Brands</label>
          <Select
            className="flex-1 text-black"
            options={brandsOption}
            isMulti
            name="brands"
            onChange={handleChangeSelect}
            onBlur={handleBlur}
            value={product.brands}
            isDisabled={isSubmitting}
          />
          {errors.brands && touched.brands && (
            <p className="error">{String(errors.brands)}</p>
          )}
        </div>

        <div className=" flex  items-center gap-4 mb-4">
          <span>Occasion</span>
          <Select
            className="flex-1 text-black"
            options={occasionOption}
            isMulti
            name="occasion"
            onChange={handleOccasion}
            onBlur={handleBlur}
            isDisabled={isSubmitting}
            value={product.occasion}
          />
          {errors.occasion && touched.occasion && (
            <p className="error">{String(errors.occasion)}</p>
          )}
        </div>
        <div className=" flex items-center gap-4 mb-4">
          <span>Choose Categories</span>
          <Select
            className="flex-1 text-black"
            options={categoriesOption}
            isMulti
            name="categories"
            onChange={handleCategories}
            onBlur={handleBlur}
            isDisabled={isSubmitting}
            value={product.categories}
          />
          {errors.categories && touched.categories && (
            <p className="error">{String(errors.categories)}</p>
          )}
        </div>
        <div className=" flex  items-center gap-4 mb-4">
          <label htmlFor="image_url">Upload an image</label>
          <input
            className="text-white"
            type="file"
            name="image_url"
            id="image_url"
            onChange={handleFileInput}
            onBlur={handleBlur}
            disabled={isSubmitting}
            accept="image/*"
          />
        </div>
        {product?.image_url && (
          <div className="flex items-center gap-4 mb-4">
            <img
              src={product?.image_url}
              alt="preview image"
              style={{ height: "300px", width: "300px", objectFit: "inherit" }}
            />
          </div>
        )}
        <button
          disabled={
            isSubmitting ||
            Object.values(product)?.length < 1 ||
            Object.values(errors)?.length > 0 ||
            imageUploading
          }
          type="submit"
          className="w-1/2 p-4 bg-white text-black"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
