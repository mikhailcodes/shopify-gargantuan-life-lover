import { useState, useEffect } from "react";
import { TextField, Page, FormLayout } from "@shopify/polaris";
import {
  useSubmit,
  useNavigation,
  Form,
  useActionData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ params, request }) => {
  const { functionId, id } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const customerTag = formData.get("customerTag");
  const method = formData.get("method");

  const discountInput = {
    title: "50% off shipping",
    functionId: `${functionId}`,
    startsAt: "2022-01-01T00:00:00",
  };

  const response = await admin.graphql(
    `mutation MyMutation {
      discountAutomaticAppCreate(
        automaticAppDiscount: {
          title: "50% off shipping",
          functionId: "${functionId}",
          startsAt: "2022-01-01T00:00:00",
        }) 
      { 
        automaticAppDiscount {
          discountId
        }
        userErrors {
          message
          field
          extraInfo
          code
        }
      }
    }`
  );

  const responseJson = await response.json();
  const errors = responseJson.data.automaticAppDiscount?.userErrors;
  return json({ errors });
};

export default function NewDiscount() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  const isLoading = navigation.state === "submitting";

  const [customerTag, setCustomerTag] = useState("");
  const [method, setMethod] = useState("");

  const handleSubmit = () => {
    submit({ customerTag, method }, { method: "post" });
  };

  return (
    <Page
      title="Create a new discount"
      backAction={{
        content: "Delivery customizations",
        onAction: () => open("shopify:admin/discounts", "_top"),
      }}
      primaryAction={{
        content: "Save",
        loading: isLoading,
        onAction: handleSubmit,
      }}
    >
      <Form method="post">
        <FormLayout>
          <FormLayout.Group>
            <TextField
              name="customerTag"
              type="text"
              label="Customer Tag (trigger)"
              value={customerTag}
              onChange={setCustomerTag}
              disabled={isLoading}
              requiredIndicator
              autoComplete="on"
            />
            <TextField
              name="method_name"
              type="text"
              label="Shipping method name"
              value={method}
              onChange={setMethod}
              disabled={isLoading}
              requiredIndicator
              autoComplete="off"
            />
          </FormLayout.Group>
        </FormLayout>
      </Form>
    </Page>
  );
}
