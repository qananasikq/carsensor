function escapeForRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function applyRange(field, fromValue, toValue, filter) {
  const from = toNumber(fromValue);
  const to = toNumber(toValue);

  if (from === null && to === null) return;

  filter[field] = {};
  if (from !== null) filter[field].$gte = from;
  if (to !== null) filter[field].$lte = to;
}

function buildCarsQuery(query) {
  const filter = {};

  if (query.id) {
    filter._id = query.id;
  }

  if (query.brand) {
    filter.brand = { $regex: escapeForRegex(query.brand), $options: "i" };
  }

  if (query.model) {
    filter.model = { $regex: escapeForRegex(query.model), $options: "i" };
  }

  if (query.region) {
    filter.region = { $regex: escapeForRegex(query.region), $options: "i" };
  }

  if (query.search) {
    const searchRegex = { $regex: escapeForRegex(query.search), $options: "i" };
    filter.$or = [
      { title: searchRegex },
      { brand: searchRegex },
      { model: searchRegex },
      { seller: searchRegex },
      { color: searchRegex }
    ];
  }

  applyRange("price", query.priceFrom, query.priceTo, filter);
  applyRange("year", query.yearFrom, query.yearTo, filter);
  applyRange("mileage", query.mileageFrom, query.mileageTo, filter);

  const allowedSortFields = ["scrapedAt", "price", "year", "mileage", "brand", "model"];
  const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : "scrapedAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return {
    filter,
    sort: { [sortBy]: sortOrder }
  };
}

module.exports = { buildCarsQuery };
