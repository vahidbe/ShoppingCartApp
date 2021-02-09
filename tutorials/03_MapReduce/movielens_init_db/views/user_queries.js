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
    },
    rating_average_per_category: {
      map: function (doc) {
        if (doc.category && doc.movieId && doc.rating) {
          emit(doc.category, {count:1, rating:doc.rating})
        }
      },
      reduce: function (keys, values, rereduce) {
        var count = 0
        var rating = 0
        values.forEach((value) => {
          rating = (rating * count + value.rating * value.count) / (count + value.count)
          count = count + value.count
        })
        if (rereduce) 
          return rating
        else
          return {count:count, rating:rating}
      }
    }
  }
}
module.exports = { viewDescriptor }
