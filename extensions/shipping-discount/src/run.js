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

  const { hasAnyTag, numberOfOrders } = input?.cart?.buyerIdentity?.customer;
  const deliveryGroups = input?.cart?.deliveryGroups;

  if (hasAnyTag && numberOfOrders <= 1) {
    const expressDeliveryOption = findExpressDelivery(deliveryGroups);
    const expressHandle = expressDeliveryOption ? expressDeliveryOption.handle : null;

    if (expressDeliveryOption) {
      return {
        discounts: [
          {
            message: "You have a discount",
            targets: [
              {
                deliveryOption: {
                  handle: expressHandle
                }
              }
            ],
            value: {
              percentage: {
                value: 50
              }
            },
          }
        ],
      }
    }
  }


  return EMPTY_DISCOUNT;
};


function findExpressDelivery(deliveryGroups) {
  for (const group of deliveryGroups) {
    for (const option of group.deliveryOptions) {
      if (option.title === "Express") {
        return option;
      }
    }
  }
  return null;
}