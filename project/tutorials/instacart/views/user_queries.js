const viewDescriptor = {
  views: {
    departments: {
      map: function (doc) {
        if (doc.department_id && doc.department_name) {
          /* eslint-disable */
          emit(doc.department_id, doc.department_name)
          /* eslint-enable */
        }
      }
    }
  }
}
module.exports = { viewDescriptor }
