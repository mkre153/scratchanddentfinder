/**
 * ScratchAndDentFinder City Coverage
 *
 * Baseline (Apify v1): 35 cities (see data/baselines/apify-v1-cities.ts)
 * Remaining: 138 cities (133 original + 5 Phase 2 additions)
 * Total intentional coverage: 173 cities
 *
 * NOTE: This is NOT a "Top 200" list. It is the curated coverage target.
 *
 * FORMAT: "City, ST" (exact names, state abbreviations)
 * SOURCE: US Census Bureau population estimates, curated for appliance market density
 *
 * IMPORTANT: This is the source of truth for background ingestion.
 * The data-miner MUST import from this file - never maintain a separate copy.
 *
 * BASELINE (35 cities - scraped via Apify, DO NOT RE-SCRAPE):
 * See: data/baselines/apify-v1-cities.ts
 */

export const scratchAndDentRemainingCities = [
  // ============================================================================
  // ALABAMA (4 cities)
  // ============================================================================
  "Birmingham, AL",
  "Huntsville, AL",
  "Mobile, AL",
  "Montgomery, AL",

  // ============================================================================
  // ALASKA (1 city)
  // ============================================================================
  "Anchorage, AK",

  // ============================================================================
  // ARIZONA (4 cities) - Phoenix already configured
  // ============================================================================
  "Chandler, AZ",
  "Gilbert, AZ",
  "Mesa, AZ",
  "Tucson, AZ",

  // ============================================================================
  // ARKANSAS (1 city)
  // ============================================================================
  "Little Rock, AR",

  // ============================================================================
  // CALIFORNIA (19 cities) - LA, SF, Sacramento already configured
  // ============================================================================
  "Anaheim, CA",
  "Bakersfield, CA",
  "Chula Vista, CA",
  "Fremont, CA",
  "Fresno, CA",
  "Irvine, CA",
  "Long Beach, CA",
  "Modesto, CA",
  "Moreno Valley, CA",
  "Oakland, CA",
  "Oxnard, CA",
  "Riverside, CA",
  "San Bernardino, CA",
  "San Diego, CA",
  "San Jose, CA",
  "Santa Ana, CA",
  "Santa Clarita, CA",
  "Santa Rosa, CA",
  "Stockton, CA",

  // ============================================================================
  // COLORADO (3 cities) - Denver already configured
  // ============================================================================
  "Aurora, CO",
  "Colorado Springs, CO",
  "Fort Collins, CO",

  // ============================================================================
  // CONNECTICUT (3 cities)
  // ============================================================================
  "Bridgeport, CT",
  "Hartford, CT",
  "New Haven, CT",

  // ============================================================================
  // DELAWARE (2 cities) - PHASE 2 ADDITION FOR 50-STATE COVERAGE
  // ============================================================================
  "Wilmington, DE",
  "Dover, DE",

  // ============================================================================
  // FLORIDA (9 cities) - Jacksonville, Miami, Orlando, Tampa already configured
  // ============================================================================
  "Cape Coral, FL",
  "Fort Lauderdale, FL",
  "Hialeah, FL",
  "Hollywood, FL",
  "Pembroke Pines, FL",
  "Port St. Lucie, FL",
  "St. Petersburg, FL",
  "Tallahassee, FL",
  "West Palm Beach, FL",

  // ============================================================================
  // GEORGIA (2 cities) - Atlanta already configured
  // ============================================================================
  "Augusta, GA",
  "Savannah, GA",

  // ============================================================================
  // HAWAII (1 city)
  // ============================================================================
  "Honolulu, HI",

  // ============================================================================
  // IDAHO (1 city)
  // ============================================================================
  "Boise, ID",

  // ============================================================================
  // ILLINOIS (2 cities) - Chicago already configured
  // ============================================================================
  "Aurora, IL",
  "Rockford, IL",

  // ============================================================================
  // INDIANA (1 city) - Indianapolis already configured
  // ============================================================================
  "Fort Wayne, IN",

  // ============================================================================
  // IOWA (1 city)
  // ============================================================================
  "Des Moines, IA",

  // ============================================================================
  // KANSAS (3 cities)
  // ============================================================================
  "Kansas City, KS",
  "Olathe, KS",
  "Wichita, KS",

  // ============================================================================
  // KENTUCKY (1 city) - Louisville already configured
  // ============================================================================
  "Lexington, KY",

  // ============================================================================
  // LOUISIANA (3 cities)
  // ============================================================================
  "Baton Rouge, LA",
  "New Orleans, LA",
  "Shreveport, LA",

  // ============================================================================
  // MAINE (1 city)
  // ============================================================================
  "Portland, ME",

  // ============================================================================
  // MARYLAND (0 cities) - Baltimore already configured
  // ============================================================================

  // ============================================================================
  // MASSACHUSETTS (2 cities) - Boston already configured
  // ============================================================================
  "Springfield, MA",
  "Worcester, MA",

  // ============================================================================
  // MICHIGAN (2 cities) - Detroit already configured
  // ============================================================================
  "Grand Rapids, MI",
  "Warren, MI",

  // ============================================================================
  // MINNESOTA (1 city) - Minneapolis already configured
  // ============================================================================
  "Saint Paul, MN",

  // ============================================================================
  // MISSISSIPPI (1 city)
  // ============================================================================
  "Jackson, MS",

  // ============================================================================
  // MISSOURI (0 cities) - Kansas City, St. Louis already configured
  // ============================================================================

  // ============================================================================
  // MONTANA (3 cities) - PHASE 2 ADDITION FOR 50-STATE COVERAGE
  // ============================================================================
  "Billings, MT",
  "Missoula, MT",
  "Great Falls, MT",

  // ============================================================================
  // NEBRASKA (2 cities)
  // ============================================================================
  "Lincoln, NE",
  "Omaha, NE",

  // ============================================================================
  // NEVADA (3 cities) - Las Vegas already configured
  // ============================================================================
  "Henderson, NV",
  "North Las Vegas, NV",
  "Reno, NV",

  // ============================================================================
  // NEW HAMPSHIRE (1 city)
  // ============================================================================
  "Manchester, NH",

  // ============================================================================
  // NEW JERSEY (4 cities)
  // ============================================================================
  "Elizabeth, NJ",
  "Jersey City, NJ",
  "Newark, NJ",
  "Paterson, NJ",

  // ============================================================================
  // NEW MEXICO (1 city)
  // ============================================================================
  "Albuquerque, NM",

  // ============================================================================
  // NEW YORK (3 cities) - New York City already configured
  // ============================================================================
  "Buffalo, NY",
  "Rochester, NY",
  "Yonkers, NY",

  // ============================================================================
  // NORTH CAROLINA (5 cities) - Charlotte, Raleigh already configured
  // ============================================================================
  "Durham, NC",
  "Fayetteville, NC",
  "Greensboro, NC",
  "High Point, NC",
  "Winston-Salem, NC",

  // ============================================================================
  // NORTH DAKOTA (1 city)
  // ============================================================================
  "Fargo, ND",

  // ============================================================================
  // OHIO (5 cities) - Columbus already configured
  // ============================================================================
  "Akron, OH",
  "Cincinnati, OH",
  "Cleveland, OH",
  "Dayton, OH",
  "Toledo, OH",

  // ============================================================================
  // OKLAHOMA (2 cities) - Oklahoma City already configured
  // ============================================================================
  "Norman, OK",
  "Tulsa, OK",

  // ============================================================================
  // OREGON (2 cities) - Portland already configured
  // ============================================================================
  "Eugene, OR",
  "Salem, OR",

  // ============================================================================
  // PENNSYLVANIA (2 cities) - Philadelphia already configured
  // ============================================================================
  "Allentown, PA",
  "Pittsburgh, PA",

  // ============================================================================
  // RHODE ISLAND (1 city)
  // ============================================================================
  "Providence, RI",

  // ============================================================================
  // SOUTH CAROLINA (3 cities)
  // ============================================================================
  "Charleston, SC",
  "Columbia, SC",
  "North Charleston, SC",

  // ============================================================================
  // SOUTH DAKOTA (1 city)
  // ============================================================================
  "Sioux Falls, SD",

  // ============================================================================
  // TENNESSEE (3 cities) - Nashville already configured
  // ============================================================================
  "Chattanooga, TN",
  "Knoxville, TN",
  "Memphis, TN",

  // ============================================================================
  // TEXAS (14 cities) - Austin, Dallas, Houston, San Antonio already configured
  // ============================================================================
  "Amarillo, TX",
  "Arlington, TX",
  "Brownsville, TX",
  "Corpus Christi, TX",
  "El Paso, TX",
  "Fort Worth, TX",
  "Frisco, TX",
  "Garland, TX",
  "Grand Prairie, TX",
  "Irving, TX",
  "Laredo, TX",
  "Lubbock, TX",
  "McKinney, TX",
  "Plano, TX",

  // ============================================================================
  // UTAH (2 cities) - Salt Lake City already configured
  // ============================================================================
  "Provo, UT",
  "West Valley City, UT",

  // ============================================================================
  // VERMONT (1 city)
  // ============================================================================
  "Burlington, VT",

  // ============================================================================
  // VIRGINIA (5 cities)
  // ============================================================================
  "Alexandria, VA",
  "Chesapeake, VA",
  "Norfolk, VA",
  "Richmond, VA",
  "Virginia Beach, VA",

  // ============================================================================
  // WASHINGTON (3 cities) - Seattle already configured
  // ============================================================================
  "Spokane, WA",
  "Tacoma, WA",
  "Vancouver, WA",

  // ============================================================================
  // WEST VIRGINIA (1 city)
  // ============================================================================
  "Charleston, WV",

  // ============================================================================
  // WISCONSIN (1 city) - Milwaukee already configured
  // ============================================================================
  "Madison, WI",

  // ============================================================================
  // WYOMING (1 city)
  // ============================================================================
  "Cheyenne, WY",
] as const;

/**
 * Type for a single remaining city
 */
export type RemainingCity = (typeof scratchAndDentRemainingCities)[number];

/**
 * Total count of remaining cities
 */
export const REMAINING_CITIES_COUNT = scratchAndDentRemainingCities.length;

/**
 * Cities already configured (for reference - DO NOT SCRAPE)
 */
export const alreadyConfiguredCities = [
  "Atlanta, GA",
  "Austin, TX",
  "Baltimore, MD",
  "Boston, MA",
  "Charlotte, NC",
  "Chicago, IL",
  "Columbus, OH",
  "Dallas, TX",
  "Denver, CO",
  "Detroit, MI",
  "Houston, TX",
  "Indianapolis, IN",
  "Jacksonville, FL",
  "Kansas City, MO",
  "Las Vegas, NV",
  "Los Angeles, CA",
  "Louisville, KY",
  "Miami, FL",
  "Milwaukee, WI",
  "Minneapolis, MN",
  "Nashville, TN",
  "New York, NY",
  "Oklahoma City, OK",
  "Orlando, FL",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "Portland, OR",
  "Raleigh, NC",
  "Sacramento, CA",
  "Salt Lake City, UT",
  "San Antonio, TX",
  "San Francisco, CA",
  "Seattle, WA",
  "St. Louis, MO",
  "Tampa, FL",
] as const;

/**
 * Full list of all 200 cities (for verification)
 */
export const ALL_TOP_200_CITIES = [
  ...alreadyConfiguredCities,
  ...scratchAndDentRemainingCities,
] as const;
