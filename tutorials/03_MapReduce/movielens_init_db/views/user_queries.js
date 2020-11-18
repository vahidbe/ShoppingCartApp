const viewDescriptor = {
  views: {
    movies_per_category: {
      map: function (doc) {
        if (doc.category && doc.movieId) {
          emit(doc.category, 1)
        }
      },
      reduce: function (key, values) {
        return sum(values)
      }
    }
  }
}
module.exports = { viewDescriptor }
