const log = require('debug')('recommendation-d')

// Makes a copy of the matrix
// args : matrix: a 2D matrix
// returns : 
//        newMatrix: a deep copy of matrix
//   
function deepCopy(matrix) {
    var newMatrix = []
    for (var i = 0; i < matrix.length; i++) {
        newMatrix[i] = new Array(matrix[0].length)
        for (var j = 0; j < matrix[0].length; j++) {
            newMatrix[i][j] = matrix[i][j]
        }
    }
    return newMatrix
}

// Returns a copy of the input matrix transposed
// args : orginalMatrix: a 2D matrix
// returns : 
//        matrix: a deep copy of orginalMatrix transposed
// 
function transpose(orginalMatrix) {
    var matrix = deepCopy(orginalMatrix)
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

// Normalizes each vector of the matrix
// args : scoreMatrix: a 2D matrix
// returns : 
//        scoreMatrix: the original scoreMatrix with all its lines normalized so that the sum
//          of all the elements of a line is 1
// 
function normalize(scoreMatrix) {
    for (var i = 0; i < scoreMatrix.length; i++) {
        var line_sum = sum(scoreMatrix[i])
        for (var j = 0; j < scoreMatrix[0].length; j++) {
            scoreMatrix[i][j] = scoreMatrix[i][j] / line_sum
        }
    }
    return scoreMatrix
}

// Returns the k nearest elements to a using their similirities from the similarityMatrix
// args : a: an idex of the lines of the similarityMatrix
//        similarityMatrix: a square and symetric matrix that contains the similarity between each
//          pair of users (or items if this is an item similarity matrix)
//        k: the number of users (or items) that will be returned
// returns : 
//        closest: the k closest elements to a according to the similarityMatrix
// 
function getKNearest(a, similarityMatrix, k) {
    var closest = new Array(similarityMatrix.length)
    for (var i = 0; i < closest.length; i++) {
        closest[i] = i
    }
    closest.sort((i, j) => {
        return similarityMatrix[a][j] - similarityMatrix[a][i]
    })
    return closest.slice(0, k)
}

// Returns the number of elements of the scores related to a and b that are both higher than 0
// This essentially computes the number of items that both a and b bought if the lines of the scoreMatrix are users,
// and the number of users that rated both the items a and b if the lines of the scoreMatrix are items
// args : a: an index of the lines of the scoreMatrix representing a user or an item
//        b: another index of the lines of the scoreMatrix representing a user or an item
//        scoreMatrix: a matrix containing a score for each pair of user and item (whether the lines represent users 
//          or items)
// returns : 
//        sum: the number of elements of the scorematrix that are not zero for both a and b at the same time
// 
function commonItems(a, b, scoreMatrix) {
    var sum = 0
    for (var i = 0; i < scoreMatrix[a].length; i++) {
        sum += scoreMatrix[a][i] > 0 && scoreMatrix[b][i] > 0
    }
    return sum
}

// Returns the norm of a vector
// args : vector: a 1D vector of scores
// returns : 
//        res: the norm of vector
// 
function norm(vector) {
    var sum = 0
    for (var i = 0; i < vector.length; i++) {
        sum += Math.pow(vector[i], 2)
    }
    const res = Math.sqrt(sum)
    return res
}

// Returns the Cosine Similarity between elements a and b of the scoreMatrix
// This essentially computes the cosine distance between the vectors scoreMatrix[a]
// and scoreMatrix[b]
// args : a: an index of the lines of the scoreMatrix representing a user or an item
//        b: another index of the lines of the scoreMatrix representing a user or an item
//        scoreMatrix: a matrix containing a score for each pair of user and item (whether the lines represent users 
//          or items)
// returns : 
//        dist: the cosine distance between the users (or items if the lines of the scoreMatrix are representing items)
//
function distance(a, b, scoreMatrix) {
    const a_norm = norm(scoreMatrix[a])
    const b_norm = norm(scoreMatrix[b])
    var sum = 0
    for (var i = 0; i < scoreMatrix[a].length; i++) {
        sum += scoreMatrix[a][i] * scoreMatrix[b][i]
    }
    if (a_norm === 0 || b_norm === 0) {
        return 0
    }
    const dist = sum / (a_norm * b_norm)
    return dist
}

// Builds (and returns) the similarityMatrix from the scoreMatrix
// The similarityMatrix is a symmetric matrix that contains the distance between
// each user if the lines of scoreMatrix represent users (or item if the lines 
// of scoreMatrix represent items) and the other users (or items respectively)
// args : scoreMatrix: a matrix containing a score for each pair of user and item (whether the lines represent users 
//          or items)
// returns : 
//        matrix: a square and symetric matrix that contains the similarity between each
//          pair of users (or items if this is an item similarity matrix)
//
function buildSimilarityMatrix(scoreMatrix) {
    const nUsers = scoreMatrix.length

    var matrix = []
    for (var i = 0; i < nUsers; i++) {
        matrix[i] = new Array(nUsers)
    }
    for (var i = 0; i < nUsers; i++) {
        for (var j = 0; j < i; j++) {
            const similarity = distance(i, j, scoreMatrix)
            matrix[i][j] = similarity
            matrix[j][i] = similarity
        }
        matrix[i][i] = 0
    }
    return matrix
}

// Returns the mean value of a vector (or 1 if its size is 0)
// args : vector: a 1D vector of scores
// returns : 
//        res: the mean of the elements of vector
//
function mean(vector) {
    var sum = 0
    var count = 0
    for (var i = 0; i < vector.length; i++) {
        if (vector[i] !== 0) {
            sum += vector[i]
            count++
        }
    }
    if (count > 0) {
        const res = sum / count
        return res
    }
    else 
        return 1
}

// Returns the sum of the elements of the vector (or 1 if its size is 0)
// args : vector: a 1D vector of scores
// returns : 
//        res: the sum of the elements of vector
//
function sum(vector) {
    var sum = 0
    for (var i = 0; i < vector.length; i++) {
        sum += vector[i]
    }
    if (sum > 0)
        return sum
    else 
        return 1
}

// Returns all items with a value 0 in the scoreMatrix for the target user in
// the order of their predicted score that would be given by the target user
// The scores are first computed using a k-nearest-neighbor algorithm and are
// based on the k nearest users of the target user using the Cosine Similarity
// to compare them
// This is based on the scoreMatrix with users as lines and items as columns
// The list of ids of the items is then sorted on their score and filtered to 
// remove all items that are already present in the scoreMatrix for the target
// user then returned
// args : target_user: the user for which we want to make products recommendations
//        scoreMatrix: a matrix containing a score for given to all items for each
//          user as its lines (lines represent users and colums represent items)
//        k: the number of nearest neighbors that we want to consider for the prediction
// returns : 
//        items: a list of ids of items with the highest scores (computed 
//          using the KNN and the cosine similarity function), excluding the
//          items that have already been added in the cart before
//
function knn(target_user, scoreMatrix, k=7) {
    const nItems = scoreMatrix[0].length
    const normalized_scoreMatrix = normalize(deepCopy(scoreMatrix))

    const similarityMatrix = buildSimilarityMatrix(normalized_scoreMatrix)
    const kNearest = getKNearest(target_user, similarityMatrix, k)
    const target_user_mean = mean(scoreMatrix[target_user])
    log("==============\nScore matrix: ")
    log(scoreMatrix)
    log("==============\nNormalized matrix: ")
    log(normalized_scoreMatrix)
    log("==============\nSimilarity matrix: ")
    log(similarityMatrix)
    log("==============\nKnearest matrix: ")
    log(kNearest)

    var scores = new Array(nItems)
    for (var item = 0; item < nItems; item++) {
        var num = 0
        var den = 0
        kNearest.forEach((user) => {
            const user_mean = mean(scoreMatrix[user])
            num += similarityMatrix[target_user][user] * (scoreMatrix[user][item] - user_mean)
            den += similarityMatrix[target_user][user]
        })
        if (den === 0) {
            scores[item] = null
        } else {
            scores[item] = target_user_mean + (num / den)
        }
    }

    log(scores)
    var items = []
    for (var i = 0; i < nItems; i++) {
        items[i] = i
    }
    items.sort((a, b) => {
        return scores[b] - scores[a]
    })

    return items.filter(id => scoreMatrix[target_user][id] === 0)
}

// Returns a list of the ids of items that are the closest to the target item
// excluding the target item
// This is computed using a Cosine Similarity to compare items and is based on
// the scoreMatrix with users as lines and items as columns
// args : target_item: the item for which we want to recommend similar items
//        scoreMatrix: a matrix containing a score for given to all items for each
//          user as its lines (lines represent users and colums represent items)
// returns : 
//        items: a list of ids of items that are the most similar to the target_item 
//          according to the cosine similarity function excluding the target_item itself
//
function closestItems(target_item, scoreMatrix) {
    const nItems = scoreMatrix[0].length
    log("==============\nScore matrix: ")
    log(scoreMatrix)
    const normalized_scoreMatrix = transpose(normalize(deepCopy(scoreMatrix)))
    log("==============\nNormalized matrix: ")
    log(normalized_scoreMatrix)

    const similarityMatrix = buildSimilarityMatrix(normalized_scoreMatrix)
    log("==============\nSimilarity matrix: ")
    log(similarityMatrix)
    const kNearest = getKNearest(target_item, similarityMatrix, nItems)
    log("==============\nKnearest matrix: ")
    log(kNearest)

    var items = []
    for (var i = 0; i < nItems; i++) {
        items[i] = i
    }
    items.sort((a, b) => {
        return similarityMatrix[target_item][b] - similarityMatrix[target_item][a]
    })

    return items.filter(id => parseInt(id, 10) !== parseInt(target_item, 10))
}

// Returns true if the target_user has items in common with any other user 
// of the scoreMatrix (see commonItems)
// args : target_user: the user for which we want to check if he has common items with other users
//        scoreMatrix: a matrix containing a score for given to all items for each
//          user as its lines (lines represent users and colums represent items)
// returns : 
//        bool: true if target_user has items in common with at least one other user, false otherwise
//
function hasCommonItems(target_user, scoreMatrix) {
    if (scoreMatrix.length === 0) {
        return false
    }
    for (var i = 0; i < scoreMatrix.length; i++) {
        if (target_user !== i && commonItems(target_user, i, scoreMatrix) > 0) {
            return true
        }
    }
    return false
}

// Returns true if the target_item has users in common with any other item 
// of the scoreMatrix (see commonItems)
// args : target_item: the item for which we want to check if he has common users with other items
//        scoreMatrix: a matrix containing a score for given to all items for each
//          user as its lines (lines represent users and colums represent items)
// returns : 
//        bool: true if target_item has users in common with at least one other item, false otherwise
//
function hasCommonUsers(target_item, scoreMatrix) {
    if (scoreMatrix.length === 0) {
        return false
    }
	const matrix = transpose(scoreMatrix)
    for (var i = 0; i < matrix.length; i++) {
        if (target_item !== i && commonItems(target_item, i, matrix) > 0) {
            return true
        }
    }
    return false
}

module.exports = {
    knn,
    closestItems,
    hasCommonItems,
    hasCommonUsers
}
