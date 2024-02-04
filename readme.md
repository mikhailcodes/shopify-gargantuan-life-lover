# Shipping Discount Extension Readme

## Overview
This repository contains a Shopify Shipping Discount Function that offers a 50% discount on the shipping method named `Express` when the customer is tagged as `VIP` and it's their first order with the store.

## Installation
To install this extension, follow the steps below:
1. Use the Shopify CLI to generate a base Shipping Discount (Javascript) template.
## Configuration
You can configure the discount, shipping method name, and customer tag by leveraging input variables. Refer to the [input variables documentation](https://shopify.dev/docs/apps/functions/input-output/variables-queries) for more information.

## Usage
Once installed and configured, the shipping discount function will automatically apply the 50% discount to the `Express` shipping method for first-time customers tagged as `VIP`.

## Testing
Test cases have been included to ensure the proper functioning of the shipping discount function. Refer to the [testing and debugging documentation](https://shopify.dev/docs/apps/functions/testing-and-debugging) for details on running the tests.

## Documentation
The `readme.md` file contains important information for developers working with this extension. It includes details on installation, configuration, and testing, as well as any limitations or considerations to be aware of.

## Limitations
This extension currently applies the discount to all orders, including both one-time purchases and subscription products. Limitations and considerations regarding this behavior are documented in the `readme.md` file.

For any further inquiries or support, please contact via email.
