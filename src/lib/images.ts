export const IMAGES = {
  executive: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHwhzjVDyN8xNjuXQX1ndItr_Shk1lNrZVWynj2rq-EMBbn3b-fR3Fd8PG2AV6U9XUOyNXW7mUUsdm0v-shO_r_pPA9m_fFmXFwrVcVxjvUQU_Hh-itsgzDxIe-OoNKnRVD2wk08vo3HtfAzxNYMECld5YGruTX428Htgs4OSRuEQgz2YoIGyYObGezBtJiXRiouV61Ld5PFjQ3ItzM8wW18n3J9IDeOK6YeGhzfByHTq4zypFrSOSmt5j3cLbJvkyeKreDkPGEcZL=w2048",
    alt: "Sophisticated tech executive in a minimalist executive office with emerald accents",
    placeholder: "Executive",
    width: 2048,
    height: 1365,
  },
  servers: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgdrYwLDixnbYD_JY1JODfOgxSGqft3grvXu9W7bfGCZt3VcpQIqgjW2v1HKz5W8FvKcuBWCAf5Db5lCXOfdQ8kKUs1V_DSSqVXi5oGJJDKVP1KSzkrePkNrsJz-OiH2ZWGa_34bnj4YhP67Bx0Mt1hNuGzgN4PEcrJw8XvmC4fidBn6QJcW1Q_z5_z3iDsyxAvPeJr4l57KauuTH_V7Xs2ZcCB0Yl3wwZq1vtN-XnKIWGCTWvlqqrym4tx0PtYD3JAtEFFlIJaPvK=w2048",
    alt: "High-end server architecture in a dark data center with emerald status lights",
    placeholder: "Infrastructure",
    width: 2048,
    height: 1365,
  },
  financial: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt3xNZmMxY0mljEvHpgzoLLk83ns7xxY0-bIDmPpHEuC94KF5-bUgJr2ePNmqotR9Wo8YvmYIn6qKDcqOIHm96EMnLfv7fBcpPegMyz3o3GlkaFlVZ6ha6E19u8gpSOf__S31BMLvNGCYbx00S2vHUMG32A-A0tIS9hF3LahKBw3RlEvkyqw5IFy86MmmPmbN1GFlvsce3jACzs8LmX93TOBSrF_ALPdDTTuBnr1W4jSCjK2NHusfmsrIScgBq5Lm3EOJCryDwflY7=w2048",
    alt: "Abstract visualization of complex financial data with emerald and white light structures",
    placeholder: "Analytics",
    width: 2048,
    height: 1365,
  },
  commandCenter: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4-xS0Zrw1YwnIRRm1H0JSqQLPzrYyVzvQ_GtX2B2ed2jnuG3AbFniEFqh-gGqMRJ_G93YCfgqVwSWZ06_Ec5JRvXowj5Xdf1zyinDrG9ip9BAtWF9u41uO8D4ZTNkw4GEO1z5nAdH7nz18Rg7xQemX8ZXWeaW5LuKWmqszsdfgwy8u40wstWykyhymkTThZBFu52Pcc6GE3lQ8O8YAFoFUfx6FsqQKUMSLa66KF4Ckw043NSrXIctn9yxtBzLAfmBqYcpqOW4dxPy=w2048",
    alt: "Futuristic global command center with holographic displays in emerald and white",
    placeholder: "Command",
    width: 2048,
    height: 1365,
  },
  headshot: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwVRVVkM6AqrOciQcgq4q-O6OrUzQgp-0kA0jOQtY_V9YBsIe3zENVlUR7Way2Lj7Cr2YmKB7FBa-tqfNoAbwcx8VAbW6cZg3NCHChQmDNThtpDCTMyAknMjJ4Czw-rQFV46qizwhKXiiT-qPZmTpN9ZXpNbWFATtOtd33b5hkE7NFw85P-XCJ82BHGb4md1aOJk8GFkocdCBc1ROdjDhiQ4M48gwl5XFZelv7EsHp5KVA61jQLj-3lodzP8RTWzXk_yHi5_h5PCDF=w1024",
    alt: "Professional corporate headshot in minimalist studio with moody lighting",
    placeholder: "Profile",
    width: 1024,
    height: 1024,
  },
  skyline: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3cl8tMfiaE1hk-27wUS_JA98_6bqlyax6fw3GRHUByEeK28rcsN7qAsbjOqFAO4DLfnRfZzGtN1ID5M3HsoX0wDla2YprS0VE8TTHaFD4s5Wfqok_xscLQze8NBc0-XUB16THPzyyT47uTsMcO1BiIsQiG4yphfZtkDm291YICPkpERroQ8aJCyIrakJe9JHRrsk3E1jQLtKCU4R5sFmcRfMQNFK4kh6kB0XtWI44aget81Ui954iAiyw-3FK7Ldrur4DuQjSpmWW=w2048",
    alt: "Futuristic urban skyline at dusk with emerald ambient lighting and clean architecture",
    placeholder: "Vision",
    width: 2048,
    height: 1365,
  },
} as const;

export type ImageKey = keyof typeof IMAGES;
