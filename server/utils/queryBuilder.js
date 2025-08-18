/**
 * A utility class to build a MongoDB query object from request query parameters.
 */
class QueryBuilder {
  /**
   * @param {object} queryParams - The request query parameters (req.query).
   */
  constructor(queryParams) {
    this.queryParams = queryParams;
    this.query = {};
  }

  /**
   * Builds and returns the complete MongoDB query object.
   * @returns {object} The constructed MongoDB query.
   */
  build() {
    this.buildSearchQuery();
    this.buildStreetQuery();
    this.buildMemberFilters();
    return this.query;
  }

  buildSearchQuery() {
    if (this.queryParams.search) {
      this.query.$or = [
        { number: { $regex: this.queryParams.search, $options: 'i' } },
        { street: { $regex: this.queryParams.search, $options: 'i' } },
        { 'members.name': { $regex: this.queryParams.search, $options: 'i' } },
      ];
    }
  }

  buildStreetQuery() {
    if (this.queryParams.street) {
      this.query.street = this.queryParams.street;
    }
  }

  buildMemberFilters() {
    const {
      occupation,
      dawat,
      education,
      quran,
      maktab,
      gender,
      minAge,
      maxAge,
      dawatCountKey,
      dawatCountTimes,
    } = this.queryParams;

    const hasMemberFilters =
      occupation ||
      dawat ||
      education ||
      quran ||
      maktab ||
      gender ||
      minAge ||
      maxAge ||
      dawatCountKey ||
      dawatCountTimes;

    if (hasMemberFilters) {
      this.query['members'] = { $elemMatch: {} };
      const elemMatch = this.query['members'].$elemMatch;

      if (occupation) elemMatch.occupation = occupation;
      if (education) elemMatch.education = education;
      if (quran) elemMatch.quran = quran;
      if (gender) elemMatch.gender = gender;

      if (maktab) {
        elemMatch.age = { $lt: 14 };
        elemMatch.maktab = maktab;
      }

      if (minAge || maxAge) {
        elemMatch.age = elemMatch.age || {};
        if (minAge) elemMatch.age.$gte = parseInt(minAge);
        if (maxAge) elemMatch.age.$lte = parseInt(maxAge);
      }

      if (dawat) {
        elemMatch.dawat = dawat;
      }

      if (dawatCountKey && dawatCountTimes) {
        elemMatch[`dawatCounts.${dawatCountKey}`] = parseInt(dawatCountTimes);
      }
    }
  }
}

module.exports = QueryBuilder;
