library(rjson)

ratings <- read.csv("ratings_small.csv", header=T)
movies 	<- read.csv("movies_small.csv", header=T)

result <- lapply(1:(length(movies$movieId)), function(row){
	categories <- strsplit(toString(movies[row, 3]), "\\|")
	id <- movies[row, 1]
	rating  <- head(subset(ratings, movieId == id), n=1)$rating
	rating <- ifelse(length(rating) == 1, rating, 0)
	# c(id, rating, )
	# TODO get one category in a random way
	df <- data.frame(
		movieId=id, rating=rating, category=categories[[1]][1]
	)
	toJSON(df)
})

result <- unlist(result)
write.table(
	result, file = "output.json",
	row.names=F, col.names=F
)
