import axios from 'axios' // we use this library as HTTP client
// you can overwrite the URI of the authentication microservice
// with this environment variable
const url_rec = process.env.REACT_APP_RECOMMENDATION_SERVICE_URL

// The RecommendationService interface regroups all calls to the Recommendation microservice in the back-end
// that could be done from the front-end
class RecommendationService {

    // Set the handlers to update the state of the shopping cart application asynchronously
    setHandlers (setRecommendationsUser, setRecommendationsItem, setBestSellers) {
      this.setRecommendationsUser = setRecommendationsUser
      this.setRecommendationsItem = setRecommendationsItem
      this.setBestSellers = setBestSellers
    }
    
    // Fetches the user recommendations of the logged user
    // GET /user/:username/:role/:token
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    fetchRecommendationsForUser (username, role, token) {
        axios.get(`${url_rec}/user/${username}/${role}/${token}`)
            .then((res) => {
                var products = res.data.output
                this.setRecommendationsUser(products)
            })
            .catch((error) => {
                console.error(error.message)
            })
    }

    // Fetches the best-seller recommendations
    // GET /best
    fetchBestSellers () {
        axios.get(`${url_rec}/best`)
            .then((res) => {
                var products = res.data.output
                this.setBestSellers(products)
            })
            .catch((error) => {
                console.error(error.message)
            })
    }

    // Fetches the item recommendations of the product with id "id"
    // GET /item/:id
    // id is the id of the product for which we want to get recommendations
    fetchRecommendationsForItem (id) {
        axios.get(`${url_rec}/item/${id}`)
            .then((res) => {
                var products = res.data.output
                this.setRecommendationsItem(products)
            })
            .catch((error) => {
                console.error(error.message)
            })
    }
  }
  
  export default RecommendationService  