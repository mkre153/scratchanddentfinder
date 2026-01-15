/**
 * Remaining Cities to Data Mine
 *
 * COMPUTED: TOP_200_US_CITIES − APIFY_V1_CITIES
 * This is NOT hand-curated. It is a deterministic result.
 *
 * SOURCE: data/reference/top-200-us-cities.ts (200 cities)
 * MINUS: data/baselines/apify-v1-cities.ts (35 cities)
 * RESULT: 165 cities to scrape
 *
 * Sorted: State (alphabetical) → City (alphabetical)
 * Format: "City, ST"
 *
 * Generated: 2026-01-14
 */

export const REMAINING_TO_DATAMINE = [
  // AK (1)
  "Anchorage, AK",

  // AL (4)
  "Birmingham, AL",
  "Huntsville, AL",
  "Mobile, AL",
  "Montgomery, AL",

  // AR (1)
  "Little Rock, AR",

  // AZ (9)
  "Chandler, AZ",
  "Gilbert, AZ",
  "Glendale, AZ",
  "Mesa, AZ",
  "Peoria, AZ",
  "Scottsdale, AZ",
  "Surprise, AZ",
  "Tempe, AZ",
  "Tucson, AZ",

  // CA (38)
  "Anaheim, CA",
  "Bakersfield, CA",
  "Chula Vista, CA",
  "Corona, CA",
  "Elk Grove, CA",
  "Escondido, CA",
  "Fontana, CA",
  "Fremont, CA",
  "Fresno, CA",
  "Garden Grove, CA",
  "Hayward, CA",
  "Huntington Beach, CA",
  "Irvine, CA",
  "Lancaster, CA",
  "Long Beach, CA",
  "Modesto, CA",
  "Moreno Valley, CA",
  "Oakland, CA",
  "Oceanside, CA",
  "Ontario, CA",
  "Oxnard, CA",
  "Palmdale, CA",
  "Pasadena, CA",
  "Pomona, CA",
  "Rancho Cucamonga, CA",
  "Riverside, CA",
  "Roseville, CA",
  "Salinas, CA",
  "San Bernardino, CA",
  "San Diego, CA",
  "San Jose, CA",
  "Santa Ana, CA",
  "Santa Clarita, CA",
  "Santa Rosa, CA",
  "Stockton, CA",
  "Sunnyvale, CA",
  "Torrance, CA",
  "Visalia, CA",

  // CO (5)
  "Aurora, CO",
  "Colorado Springs, CO",
  "Fort Collins, CO",
  "Lakewood, CO",
  "Thornton, CO",

  // CT (1)
  "Bridgeport, CT",

  // FL (8)
  "Cape Coral, FL",
  "Fort Lauderdale, FL",
  "Hialeah, FL",
  "Hollywood, FL",
  "Pembroke Pines, FL",
  "Port St. Lucie, FL",
  "St. Petersburg, FL",
  "Tallahassee, FL",

  // GA (4)
  "Augusta, GA",
  "Columbus, GA",
  "Macon, GA",
  "Savannah, GA",

  // HI (1)
  "Honolulu, HI",

  // IA (1)
  "Des Moines, IA",

  // ID (1)
  "Boise, ID",

  // IL (3)
  "Joliet, IL",
  "Naperville, IL",
  "Rockford, IL",

  // IN (1)
  "Fort Wayne, IN",

  // KS (4)
  "Kansas City, KS",
  "Olathe, KS",
  "Overland Park, KS",
  "Wichita, KS",

  // KY (1)
  "Lexington, KY",

  // LA (3)
  "Baton Rouge, LA",
  "New Orleans, LA",
  "Shreveport, LA",

  // MA (2)
  "Springfield, MA",
  "Worcester, MA",

  // MI (3)
  "Grand Rapids, MI",
  "Sterling Heights, MI",
  "Warren, MI",

  // MN (1)
  "Saint Paul, MN",

  // MO (1)
  "Springfield, MO",

  // MS (1)
  "Jackson, MS",

  // NC (5)
  "Cary, NC",
  "Durham, NC",
  "Fayetteville, NC",
  "Greensboro, NC",
  "Winston-Salem, NC",

  // ND (1)
  "Fargo, ND",

  // NE (2)
  "Lincoln, NE",
  "Omaha, NE",

  // NJ (3)
  "Jersey City, NJ",
  "Newark, NJ",
  "Paterson, NJ",

  // NM (1)
  "Albuquerque, NM",

  // NV (3)
  "Henderson, NV",
  "North Las Vegas, NV",
  "Reno, NV",

  // NY (3)
  "Buffalo, NY",
  "Rochester, NY",
  "Yonkers, NY",

  // OH (5)
  "Akron, OH",
  "Cincinnati, OH",
  "Cleveland, OH",
  "Dayton, OH",
  "Toledo, OH",

  // OK (1)
  "Tulsa, OK",

  // OR (2)
  "Eugene, OR",
  "Salem, OR",

  // PA (1)
  "Pittsburgh, PA",

  // RI (1)
  "Providence, RI",

  // SC (2)
  "Charleston, SC",
  "Columbia, SC",

  // SD (1)
  "Sioux Falls, SD",

  // TN (5)
  "Chattanooga, TN",
  "Clarksville, TN",
  "Knoxville, TN",
  "Memphis, TN",
  "Murfreesboro, TN",

  // TX (23)
  "Amarillo, TX",
  "Arlington, TX",
  "Brownsville, TX",
  "Carrollton, TX",
  "Corpus Christi, TX",
  "Denton, TX",
  "El Paso, TX",
  "Fort Worth, TX",
  "Frisco, TX",
  "Garland, TX",
  "Grand Prairie, TX",
  "Irving, TX",
  "Killeen, TX",
  "Laredo, TX",
  "Lubbock, TX",
  "McAllen, TX",
  "McKinney, TX",
  "Mesquite, TX",
  "Midland, TX",
  "Pasadena, TX",
  "Plano, TX",
  "Round Rock, TX",
  "Waco, TX",

  // UT (1)
  "West Valley City, UT",

  // VA (6)
  "Alexandria, VA",
  "Chesapeake, VA",
  "Newport News, VA",
  "Norfolk, VA",
  "Richmond, VA",
  "Virginia Beach, VA",

  // WA (4)
  "Bellevue, WA",
  "Spokane, WA",
  "Tacoma, WA",
  "Vancouver, WA",

  // WI (1)
  "Madison, WI",

] as const;

/**
 * Type for validation
 */
export type RemainingCity = (typeof REMAINING_TO_DATAMINE)[number];

/**
 * Count verification (must be 165)
 */
export const REMAINING_COUNT = REMAINING_TO_DATAMINE.length;

