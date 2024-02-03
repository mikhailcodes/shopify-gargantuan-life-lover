import { useState, useEffect, useCallback } from "react";
import { TextField, Page, FormLayout, Layout, Banner } from "@shopify/polaris";
import {
  useSubmit,
  useNavigation,
  Form,
  useActionData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  createAutomaticDiscount,
  getAutomaticDiscountData,
  updateAutomaticDiscount,
} from "../helpers/helpers";

export const loader = async ({ params, request }) => {
  // On load we want to check if the app metafields/data are already created
  if (id == "new") {
    return {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "",
        functionId: "",
        startsAt: "2022-01-01T00:00:00",
        discountValue: "",
        customerTag: "",
        shippingMethod: "",
      }),
    };
  }

  const { id } = params;
  const createDiscount = await getAutomaticDiscountData(id, request);
  return createDiscount;
};

export const action = async ({ params, request }) => {
  // On submit we want to create or update the app metafields and data
  const { id } = params;
  const errors = [];
  let createDiscount = {};

  createDiscount =
    id == "new"
      ? await createAutomaticDiscount(params, request)
      : await updateAutomaticDiscount(request);

  errors = createDiscount.data?.automaticAppDiscount?.userErrors;
  return json({ errors });
};

export default function NewDiscount() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  const loaderData = useLoaderData();

  const isLoading = navigation.state === "submitting";
  const [formErrors, setFormErrors] = useState(false);

  const [formValues, setFormValues] = useState({
    discountTitle: loaderData.title,
    discountValue: loaderData.discountValue,
    customerTag: loaderData.customerTag,
    shippingMethod: loaderData.shippingMethod,
  });

  const updateFormValues = (newValues) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
  };

  // Handle submit + simple form validation
  const handleSubmit = () => {
    if (
      !formValues.discountTitle ||
      !formValues.discountValue ||
      !formValues.shippingMethod
    ) {
      setFormErrors(true);
    } else {
      submit(formValues, { method: "post" });
    }
  };

  useEffect(() => {
    if (actionData?.errors.length === 0) {
      open("shopify:admin/discounts", "_top");
    }
  }, [actionData?.errors]);

  return (
    <Page
      title="Welcome Gil!"
      subtitle="Just wanted to say thank you for the opportunity to do this test!"
      backAction={{
        content: "Delivery customizations",
        onAction: () => open("shopify:admin/discounts", "_top"),
      }}
      primaryAction={{
        content: "Create discount",
        loading: isLoading,
        onAction: handleSubmit,
      }}
    >
      {actionData?.errors && <ErrorBanner errors={actionData?.errors} />}

      <Layout.Section>
        <Banner
          title="Welcome to Mikhail's shipping discount test!"
          info="info"
        >
          <p style={{ marginBottom: "20px" }}>
            Fill in the details below to create and customize your shipping
            discount.
          </p>

          <FormBlock
            formValues={formValues}
            updateFormValues={updateFormValues}
            isLoading={isLoading}
            formErrors={formErrors}
          />
        </Banner>
      </Layout.Section>
    </Page>
  );
}

const FormBlock = ({ formValues, updateFormValues, isLoading, formErrors }) => {
  const { discountTitle, shippingMethod, customerTag, discountValue } =
    formValues;

  const setDiscountTitle = (value) => {
    updateFormValues({ discountTitle: value });
  };

  const setShippingMethod = (value) => {
    updateFormValues({ shippingMethod: value });
  };

  const setCustomerTag = (value) => {
    updateFormValues({ customerTag: value });
  };

  const setDiscountValue = (value) => {
    updateFormValues({ discountValue: value });
  };

  return (
    <Form method="post">
      <FormLayout>
        <FormLayout.Group>
          <TextField
            label="Discount title"
            type="text"
            value={discountTitle}
            onChange={setDiscountTitle}
            disabled={isLoading}
            requiredIndicator
            name="discountTitle"
            helpText="This won't be displayed to customer."
            error={
              !discountTitle & formErrors ? "Discount title is required" : null
            }
          />

          <TextField
            name="method_name"
            type="text"
            label="Target Shipping Method"
            value={shippingMethod}
            onChange={setShippingMethod}
            disabled={isLoading}
            requiredIndicator
            autoComplete="off"
            helpText="This enables the target for the shipping discount"
            error={
              !shippingMethod & formErrors
                ? "Shipping method is required"
                : null
            }
          />
        </FormLayout.Group>

        <FormLayout.Group>
          <TextField
            name="customerTag"
            type="text"
            label="Specify customer tag (optional)"
            value={customerTag}
            onChange={setCustomerTag}
            disabled={isLoading}
            autoComplete="on"
            helpText="Reserves discount for specifically tagged customers."
          />
          <TextField
            name="discountValue"
            type="number"
            label="Specify the discount value"
            value={discountValue}
            onChange={setDiscountValue}
            disabled={isLoading}
            requiredIndicator
            suffix="%"
            helpText="Calculated as a percentage. E.g. 50% off shipping."
            error={
              !discountValue & formErrors ? "Discount value is required" : null
            }
          />
        </FormLayout.Group>
      </FormLayout>
    </Form>
  );
};

const ErrorBanner = ({ errors }) => {
  return (
    <Layout.Section>
      <Banner
        title="There was an error creating the customization."
        status="critical"
      >
        <ul>
          {errors.map((error, index) => {
            return <li key={`${index}`}>{error.message}</li>;
          })}
        </ul>
      </Banner>
    </Layout.Section>
  );
};