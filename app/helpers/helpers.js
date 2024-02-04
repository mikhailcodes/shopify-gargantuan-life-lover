
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";



export const createAutomaticDiscount = async (params, request) => {
  const { admin } = await authenticate.admin(request);
  const { functionId, id } = params;
  const formData = await request.formData();

  const discountTitle = formData.get("discountTitle");
  const discountValue = formData.get("discountValue");
  const shippingMethod = formData.get("shippingMethod");

  try {
    const shippingDiscountInput = {
      functionId,
      title: discountTitle,
      startsAt: "2022-01-01T00:00:00Z",
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
            shippingMethod: shippingMethod
          }),
        },
      ],
    };

    const response = await admin.graphql(
      `mutation createAutomaticDiscount($input: 
        DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $input) {
          automaticAppDiscount {
            title
            startsAt
          }
          userErrors {
            message
            field
            extraInfo
            code
          }
        }
      }`,
      {
        variables: {
          input: shippingDiscountInput,
        },
      }
    );

    const responseJson = await response.json();
    return json({ responseJson });
  } catch (error) {
    throw new Error(error.message);
  }

}

export const getAutomaticDiscountData = async (params, request) => {
  const { functionId, id } = params;
  const { admin } = await authenticate.admin(request);
  const gid = `gid://shopify/DiscountAutomaticNode/${id}`;

  try {
    const response = await admin.graphql(
      `query getShippingDiscount($id: ID!) {
        automaticDiscountNode(id: $id) {
          id
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
    const shippingDiscount = responseJson.data.automaticDiscountNode;
    const metafieldValue = JSON.parse(shippingDiscount.metafield.value);
    const metafieldId = shippingDiscount.metafield.id;
    const { title, discountValue, shippingMethod } = metafieldValue;

    return {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        functionId: functionId,
        startsAt: "2022-01-01T00:00:00",
        discountValue: discountValue,
        shippingMethod: shippingMethod,
        metafieldId: metafieldId
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export const updateAutomaticDiscount = async (params, request) => {
  try {
    const { functionId, id } = params;
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();

    const discountTitle = formData.get("discountTitle");
    const discountValue = formData.get("discountValue");
    const shippingMethod = formData.get("shippingMethod");
    const metafieldId = formData.get("metafieldId");

    const shippingDiscountInput = {
      title: discountTitle,
      startsAt: "2022-01-01T00:00:00Z",
      metafields: [
        {
          id: metafieldId,
          type: "json",
          value: JSON.stringify({
            title: discountTitle,
            functionId: functionId,
            startsAt: "2022-01-01T00:00:00",
            discountValue: discountValue,
            shippingMethod: shippingMethod
          }),
        },
      ],
    };

    const response = await admin.graphql(
      `mutation discountAutomaticAppUpdate($id: ID!, $automaticAppDiscount: DiscountAutomaticAppInput!) {
        discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $automaticAppDiscount) {
          automaticAppDiscount {
            discountId
              title
              startsAt
              endsAt
              status
            }
            userErrors {
                message
            }
        }
      }`,
      {
        variables: {
          id: `gid://shopify/DiscountAutomaticNode/${id}`,
          automaticAppDiscount: shippingDiscountInput,
        },
      }
    );

    const responseJson = await response.json();
    return json({ responseJson });
  } catch (error) {
    console.log('this is the response', error)

    throw new Error(error.message);
  }
}