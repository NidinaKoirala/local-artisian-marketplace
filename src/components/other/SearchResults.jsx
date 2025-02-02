import React from 'react'

const SearchResults = () => {
  return (
    <div>
      // Function to normalize values (Min-Max scaling between 0 and 1)
function normalize(value, min, max) {
    return min === max ? 0 : (value - min) / (max - min);
}

// Function to calculate ranking score
function calculateRankingScore(product, minMaxValues) {
    const { minSales, maxSales, minWishlist, maxWishlist, minViews, maxViews,
            minRating, maxRating, minReviews, maxReviews, minResponse, maxResponse,
            minQuality, maxQuality, minDesc, maxDesc, minPrice, maxPrice,
            minUpdate, maxUpdate } = minMaxValues;

    // Normalize values
    const popularity = (normalize(product.sales_count, minSales, maxSales) * 0.5 +
                        normalize(product.wishlist_count, minWishlist, maxWishlist) * 0.3 +
                        normalize(product.views_count, minViews, maxViews) * 0.2);

    const feedback = (normalize(product.average_rating, minRating, maxRating) * 0.6 +
                      normalize(product.review_count, minReviews, maxReviews) * 0.4);

    const quality = (normalize(product.image_quality, minQuality, maxQuality) * 0.6 +
                     normalize(product.description_quality, minDesc, maxDesc) * 0.4);

    const freshness = normalize(product.last_updated, minUpdate, maxUpdate);

    const trust = (product.seller_verified * 0.6 + normalize(product.return_policy_score, 0, 1) * 0.4);

    // Final Ranking Score Calculation
    return (0.3 * popularity) + (0.25 * feedback) + (0.2 * quality) + (0.15 * freshness) + (0.1 * trust);
}

// Function to rank products
function rankProducts(products) {
    // Compute min-max values for normalization
    const minMaxValues = {
        minSales: Math.min(...products.map(p => p.sales_count)),
        maxSales: Math.max(...products.map(p => p.sales_count)),
        minWishlist: Math.min(...products.map(p => p.wishlist_count)),
        maxWishlist: Math.max(...products.map(p => p.wishlist_count)),
        minViews: Math.min(...products.map(p => p.views_count)),
        maxViews: Math.max(...products.map(p => p.views_count)),
        minRating: Math.min(...products.map(p => p.average_rating)),
        maxRating: Math.max(...products.map(p => p.average_rating)),
        minReviews: Math.min(...products.map(p => p.review_count)),
        maxReviews: Math.max(...products.map(p => p.review_count)),
        minResponse: Math.min(...products.map(p => p.response_time)),
        maxResponse: Math.max(...products.map(p => p.response_time)),
        minQuality: Math.min(...products.map(p => p.image_quality)),
        maxQuality: Math.max(...products.map(p => p.image_quality)),
        minDesc: Math.min(...products.map(p => p.description_quality)),
        maxDesc: Math.max(...products.map(p => p.description_quality)),
        minPrice: Math.min(...products.map(p => p.pricing_score)),
        maxPrice: Math.max(...products.map(p => p.pricing_score)),
        minUpdate: Math.min(...products.map(p => p.last_updated)),
        maxUpdate: Math.max(...products.map(p => p.last_updated))
    };

    // Calculate ranking score for each product
    products.forEach(product => {
        product.ranking_score = calculateRankingScore(product, minMaxValues);
    });

    // Sort products by ranking score in descending order
    return products.sort((a, b) => b.ranking_score - a.ranking_score);
}

// Example Data
const products = [
    { sales_count: 50, wishlist_count: 20, views_count: 500, average_rating: 4.5,
      review_count: 30, response_time: 2, image_quality: 9, description_quality: 8,
      pricing_score: 0.7, last_updated: new Date("2025-01-20").getTime(),
      seller_verified: 1, return_policy_score: 0.8 },

    { sales_count: 30, wishlist_count: 40, views_count: 400, average_rating: 4.2,
      review_count: 25, response_time: 3, image_quality: 8, description_quality: 7,
      pricing_score: 0.9, last_updated: new Date("2025-01-18").getTime(),
      seller_verified: 1, return_policy_score: 0.7 },

    { sales_count: 80, wishlist_count: 35, views_count: 700, average_rating: 4.8,
      review_count: 50, response_time: 1, image_quality: 10, description_quality: 9,
      pricing_score: 0.6, last_updated: new Date("2025-01-22").getTime(),
      seller_verified: 1, return_policy_score: 0.9 }
];

// Get ranked products
const rankedProducts = rankProducts(products);

// Print ranking results
console.log("Ranked Products:");
rankedProducts.forEach((product, index) => {
    console.log(`Rank ${index + 1}: Score ${product.ranking_score.toFixed(4)}, Sales ${product.sales_count}, Rating ${product.average_rating}`);
});

    </div>
  )
}

export default SearchResults
