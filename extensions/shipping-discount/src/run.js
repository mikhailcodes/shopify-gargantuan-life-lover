// @ts-check


/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );

  const { numberOfOrders } = input?.cart?.buyerIdentity?.customer;
  const deliveryGroups = input?.cart?.deliveryGroups;
  const { shippingMethod, discountValue, customerTag } = configuration;


  if (numberOfOrders <= 1) {
    const expressDeliveryOption = findExpressDelivery(deliveryGroups, shippingMethod);
    const expressHandle = expressDeliveryOption ? expressDeliveryOption.handle : null;

    if (expressDeliveryOption) {
      return {
        discounts: [
          {
            message: "Shipping discount",
            targets: [
              {
                deliveryOption: {
                  handle: expressHandle
                }
              }
            ],
            value: {
              percentage: {
                value: discountValue
              }
            },
          }
        ],
      }
    }
  }


  return EMPTY_DISCOUNT;
};

function hasAnyTag(tags, value) {
  return tags.includes(value);
}


function findExpressDelivery(deliveryGroups, shippingMethod) {
  !shippingMethod ? shippingMethod = "Express" : shippingMethod; // default to "Express" if no shipping method is provided for testing

  for (const group of deliveryGroups) {
    for (const option of group.deliveryOptions) {
      if (option.title === shippingMethod) {
        return option;
      }
    }
  }
  return null;
}