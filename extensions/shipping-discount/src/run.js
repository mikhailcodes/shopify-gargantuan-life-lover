// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

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

  if (hasAnyTag == true && numberOfOrders <= 1) {
    const hasExpressDelivery = deliveryGroups.some(group => {
      return group.deliveryOptions.some(option => option.title === 'Express');
    });

    if (hasExpressDelivery) {
      const targets = deliveryGroups.map(deliveryGroup => ({ deliveryGroup })); // In the event of multiple delivery groups, we want to target only the ones that have express delivery
      return {
        discounts: [
          {
            message: "You have a discount",
            targets,
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