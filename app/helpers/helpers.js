
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";


const createDiscountData = async (formData) => {
    const { admin } = await authenticate.admin(request);

    const discountTitle = formData.get("discountTitle");
    const discountValue = formData.get("discountValue");
    const customerTag = formData.get("discountValue");
    const shippingMethod = formData.get("shippingMethod");

    const shippingDiscountInput = {
        functionId,
        title: discountTitle,
        enabled: true,
        metafields: [
            {
                namespace: "$app:shipping-discount",
                key: "shipping-discount-test",
                type: "json",
                value: JSON.stringify({
                    title: discountTitle,
                    functionId: functionId,
                    startsAt: "2022-01-01T00:00:00",
                    discountValue: discountValue,
                    customerTag: customerTag,
                    shippingMethod: shippingMethod
                }),
            },
        ],
    };

    const response = await admin.graphql(`
      mutation createDiscountData($input: shippingDiscountInput!) {
        shippingDiscountCreate(shippingDiscountInput: $input) {
            discountNode {
            id
          }
          userErrors {
            message
          }
        }
      }`,
        {
            variables: {
                input: shippingDiscountInput,
            },
        })

    const responseJson = await response.json();
    const errors = responseJson.data.shippingDiscountCreate?.userErrors;
    return json({ errors });
}

export const createAutomaticDiscount = async (params, request) => {
    const { admin } = await authenticate.admin(request);
    const { functionId, id } = params;
    const formData = await request.formData();

    const discountTitle = formData.get("discountTitle");

    const response = await admin.graphql(
        `mutation MyMutation {
          discountAutomaticAppCreate(
            automaticAppDiscount: {
              title: "${discountTitle}",
              functionId: "${functionId}",
              startsAt: "2022-01-01T00:00:00",
            }) 
          { 
            automaticAppDiscount {
              discountId
              title
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

    if (responseJson.data?.automaticAppDiscount?.userErrors?.length > 0) {
        createDiscountData(formData, request, functionId)
    }

    return json({ responseJson });

}

export const getAutomaticDiscountData = async (params, request) => {
    const { admin } = await authenticate.admin(request);
    const gid = `gid://shopify/ShippingDiscount/${id}`;

    const response = await admin.graphql(
        `query getShippingDiscount($id: ID!) {
            discountNode(id: $id) {
              id
              title
              enabled
              metafield(namespace: "$app:shipping-discount", key: "shipping-discount-test") {
                id
                value
              }
            }
          }`,
        {
            variables: {
                id: gid,
            },
        }
    );

    const responseJson = await response.json();
    const shippingDiscount = responseJson.data.discountNode;
    const metafieldValue = JSON.parse(shippingDiscount.metafield.value);
    const { title, discountValue, customerTag, shippingMethod } = metafieldValue;

    return {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            functionId: functionId,
            startsAt: "2022-01-01T00:00:00",
            discountValue: discountValue,
            customerTag: customerTag,
            shippingMethod: shippingMethod
        }),
    };
}

export const updateAutomaticDiscount = async (params, request) => {
}