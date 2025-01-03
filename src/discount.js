import React, { useState, useEffect } from 'react';
import axios from 'axios';

const shopifyStoreUrl = 'https://freezepix.myshopify.com';
const accessToken = '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';

export const fetchDiscountCodes = async () => {
  try {
    const response = await axios.get(`${shopifyStoreUrl}/admin/api/2024-01/price_rules.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    const priceRules = response.data.price_rules;
    const discountCodes = [];

    for (const rule of priceRules) {
      const codeResponse = await axios.get(
        `${shopifyStoreUrl}/admin/api/2024-01/price_rules/${rule.id}/discount_codes.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      codeResponse.data.discount_codes.forEach(code => {
        discountCodes.push({
          code: code.code,
          value: rule.value,
          valueType: rule.value_type,
          title: rule.title
        });
      });
    }

    return discountCodes;
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return [];
  }
};