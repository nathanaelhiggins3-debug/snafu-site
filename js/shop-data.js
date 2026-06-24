/* ============================================================
   SNAFU — Shop inventory
   ONE source of truth for the 1/1 pieces. Both the Shop grid
   (shop/index.html) and the detail page (shop/item.html)
   read from this list.

   TO ADD A PIECE: copy one { ... } block, change the values.
   - id:      unique slug, used in the URL (?id=...). No spaces.
   - status:  "AVAILABLE" or "SOLD" or "RESERVED"
   - price:   a string. Use "—" for sold/POA.
   ============================================================ */

window.SNAFU_SHOP = [
  {
    id: "raf-bomber-01",
    name: "Bomber, Re-cut",
    year: "c. 2003",
    origin: "Antwerp",
    status: "AVAILABLE",
    price: "$2,400",
    tags: ["Outerwear", "Shop", "1 of 1"],
    note: "Deconstructed military bomber, re-cut and re-lined by hand.",
    details:
      "A single-copy reconstruction: an early-2000s military bomber taken apart and " +
      "rebuilt with an asymmetric front and a salvaged silk lining. No two exist. " +
      "Wears heavy, moves light.",
    specs: {
      Condition: "Excellent / worn twice",
      Size: "Fits M–L",
      Material: "Nylon shell, silk lining",
      Provenance: "Private collection, Antwerp"
    }
  },
  {
    id: "denim-trucker-02",
    name: "Trucker, Bleached",
    year: "c. 1996",
    origin: "Los Angeles",
    status: "AVAILABLE",
    price: "$680",
    tags: ["Denim", "Vintage", "1 of 1"],
    note: "Hand-bleached selvedge trucker with repaired chain-stitch hem.",
    details:
      "Sun-bleached over a real LA summer, not a machine. Original selvedge denim with " +
      "honest fade lines and a chain-stitched repair at the hem. One piece, as found and finished.",
    specs: {
      Condition: "Good / visible wear",
      Size: "Medium",
      Material: "100% cotton selvedge denim",
      Provenance: "Found, Rose Bowl"
    }
  },
  {
    id: "knit-cardigan-03",
    name: "Cardigan, Hand-Knit",
    year: "Unknown",
    origin: "Scotland",
    status: "SOLD",
    price: "—",
    tags: ["Knitwear", "Shop", "1 of 1"],
    note: "Aran-pattern hand-knit, undyed wool, single maker.",
    details:
      "A dense Aran cardigan in undyed wool, knit by a single hand. Irregular, warm, and " +
      "exactly one of one. Gone to a good home — kept here as part of the record.",
    specs: {
      Condition: "Very good",
      Size: "Oversized L",
      Material: "Undyed virgin wool",
      Provenance: "Estate, Hebrides"
    }
  },
  {
    id: "leather-boots-04",
    name: "Boots, Resoled",
    year: "c. 1989",
    origin: "Northampton",
    status: "RESERVED",
    price: "$1,150",
    tags: ["Footwear", "Vintage", "1 of 1"],
    note: "Goodyear-welted leather boots, resoled in red rubber.",
    details:
      "English-made leather boots, decades old, resoled in a single run of red rubber as " +
      "a quiet SNAFU signature. Broken in, not worn out. Currently on hold.",
    specs: {
      Condition: "Good / resoled",
      Size: "UK 9 / US 10",
      Material: "Full-grain leather, rubber sole",
      Provenance: "Northampton workshop"
    }
  },
  {
    id: "silk-scarf-05",
    name: "Scarf, Over-printed",
    year: "c. 1970s",
    origin: "Como",
    status: "AVAILABLE",
    price: "$320",
    tags: ["Accessory", "Shop", "1 of 1"],
    note: "Vintage silk twill, over-printed with a single redaction mark.",
    details:
      "A 1970s Como silk scarf, over-printed by hand with one redaction-red bar — the only " +
      "intervention. Equal parts heirloom and statement.",
    specs: {
      Condition: "Excellent",
      Size: "90 × 90 cm",
      Material: "100% silk twill",
      Provenance: "Deadstock, Como"
    }
  },
  {
    id: "wool-trouser-06",
    name: "Trouser, Patched",
    year: "c. 1950s",
    origin: "Naples",
    status: "AVAILABLE",
    price: "$540",
    tags: ["Tailoring", "Vintage", "1 of 1"],
    note: "Mid-century wool trouser with visible sashiko patching.",
    details:
      "High-rise Neapolitan wool trousers, mended with visible sashiko stitching across one " +
      "knee. The repair is the point — wear it loud.",
    specs: {
      Condition: "Good / mended",
      Size: "32 waist",
      Material: "Worsted wool",
      Provenance: "Tailor's estate, Naples"
    }
  }
];
